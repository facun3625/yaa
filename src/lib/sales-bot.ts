import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { FAQ_CATEGORIES } from "@/lib/faq-content";

// Modelo gratuito de Gemini con el cupo diario más generoso del free tier
// (ver aistudio.google.com/rate-limit para los límites vigentes en la
// cuenta) — alcanza de sobra para un bot de preguntas de la landing.
const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type ChatMessage = { role: "user" | "model"; text: string };

async function buildSystemPrompt(): Promise<string> {
  const plans = await prisma.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } });

  const plansText = plans.length
    ? plans
        .map((p) => {
          const parts = [`- ${p.name}: ${formatPrice(Number(p.priceMonthly))}/mes`];
          if (p.priceAnnual) parts.push(`(o ${formatPrice(Number(p.priceAnnual))}/año)`);
          if (p.trialDays > 0) parts.push(`— ${p.trialDays} días de prueba gratis, sin pedir tarjeta`);
          if (p.maxProducts) parts.push(`— hasta ${p.maxProducts} productos`);
          if (p.maxOrdersPerMonth) parts.push(`— hasta ${p.maxOrdersPerMonth} pedidos por mes`);
          if (p.allowCustomDomain) parts.push("— permite dominio propio");
          if (p.description) parts.push(`— ${p.description}`);
          return parts.join(" ");
        })
        .join("\n")
    : "No hay planes activos cargados todavía — si preguntan por precios, sugerí escribir a hola@yaa.com.ar.";

  const faqText = FAQ_CATEGORIES.map(
    (c) => `## ${c.title}\n` + c.questions.map(([q, a]) => `P: ${q}\nR: ${a}`).join("\n\n"),
  ).join("\n\n");

  return `Sos el asistente de ventas de YAA, una plataforma de pedidos online para negocios de cercanía (gastronomía, pastelerías, productores por encargo, comercios y servicios locales). Hablás con alguien que está evaluando si crear su tienda en YAA. Tu objetivo es responder sus dudas con precisión y, cuando tenga sentido, invitarlo a probar la demo o crear su tienda.

REGLAS ESTRICTAS:
- Respondé solo con la información de este mensaje (planes y preguntas frecuentes de abajo). Si no tenés el dato, decilo con honestidad y sugerí escribir a hola@yaa.com.ar — nunca inventes precios, funciones, plazos ni promesas.
- Sé breve: 2 a 4 oraciones por respuesta, salvo que pidan más detalle.
- Tono cercano y directo, en español rioplatense, sin tecnicismos ni relleno.
- Si preguntan algo que no tiene nada que ver con YAA, redirigí amablemente hacia temas de YAA.
- Cuando corresponda, invitá a probar la demo en /demo o a crear la tienda en /registro — sin insistir en cada respuesta.

PLANES ACTUALES:
${plansText}

PREGUNTAS FRECUENTES YA PUBLICADAS EN EL SITIO:
${faqText}`;
}

// Google usa lo que se manda en el tier gratis para mejorar sus modelos —
// aceptable acá porque no se pide ni se comparte ningún dato personal real
// del visitante (nombre, tienda, etc.), solo su pregunta.
export async function askSalesBot(history: ChatMessage[]): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error("Falta configurar GEMINI_API_KEY");

  const systemInstruction = await buildSystemPrompt();

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini respondió ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("Gemini no devolvió una respuesta");
  return text.trim();
}
