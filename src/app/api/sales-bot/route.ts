import { NextRequest, NextResponse } from "next/server";

import { askSalesBot, type ChatMessage } from "@/lib/sales-bot";

// Ruta pública sin sesión (el chat vive en la landing, para quien todavía
// no tiene cuenta) — el rate limit por IP es lo único que evita que alguien
// abuse el cupo gratis de Gemini o, el día de mañana con un plan pago,
// genere costo mandando miles de mensajes.
const RATE_LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Demasiados mensajes seguidos — esperá un toque y volvé a intentar." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const rawMessages = Array.isArray(body?.messages) ? body.messages : null;
  if (!rawMessages || rawMessages.length === 0) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }

  // Recorta historial y largo de cada mensaje — ni la conversación crece sin
  // límite ni alguien puede mandar un texto gigante para gastar tokens.
  const history: ChatMessage[] = rawMessages.slice(-12).map((m: { role?: unknown; text?: unknown }) => ({
    role: m.role === "model" ? "model" : "user",
    text: String(m.text ?? "").slice(0, 1000),
  }));

  try {
    const reply = await askSalesBot(history);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("sales-bot error:", err);
    return NextResponse.json(
      { error: "No pudimos responder ahora mismo — escribinos a hola@yaa.com.ar." },
      { status: 500 },
    );
  }
}
