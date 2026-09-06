import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  conversationId: z.string().min(1),
  name: z.string().trim().min(1, "Ingresá tu nombre"),
  phone: z.string().trim().min(6, "Ingresá un WhatsApp válido"),
});

// Deja el nombre/WhatsApp de quien pidió (o necesitó) hablar con un
// humano — ver needsHuman en askSalesBot. El equipo hace el seguimiento
// a mano desde /platform/chats, no hay ninguna automatización de contacto.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const conversation = await prisma.salesBotConversation.findUnique({ where: { id: parsed.data.conversationId } });
  if (!conversation) {
    return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
  }

  await prisma.salesBotConversation.update({
    where: { id: parsed.data.conversationId },
    data: { contactName: parsed.data.name, contactPhone: parsed.data.phone, needsHuman: true },
  });

  return NextResponse.json({ ok: true });
}
