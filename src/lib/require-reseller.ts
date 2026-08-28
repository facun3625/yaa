import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Igual razón que requireOnboardingUser: la sesión es JWT y no se refresca
// sola. Alguien recién promovido de CUSTOMER a RESELLER (o dado de baja)
// puede tener un token viejo que no lo refleja todavía, así que acá también
// se reverifica siempre contra la base.
export async function requireReseller() {
  const session = await auth();
  if (!session?.user) redirect("/registro");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "RESELLER" || !user.referralCode) redirect("/registro");

  return { ...session, user: { ...session.user, id: user.id }, reseller: user };
}
