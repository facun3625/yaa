"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Guarda el código de un revendedor que la persona trajo consigo (por
// /registro?ref=CODIGO) mientras todavía se está registrando — se consume
// recién cuando de verdad crea la tienda (ver registro/datos/actions.ts).
// No valida el código acá a propósito: si es inválido o de un revendedor
// dado de baja, en ese momento simplemente no queda asociado a nadie, no
// hace falta bloquear ni avisar nada acá.
export async function savePendingReferralCode(code: string) {
  const session = await auth();
  if (!session?.user) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { pendingReferralCode: code },
  }).catch(() => {});
}
