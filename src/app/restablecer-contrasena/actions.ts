"use server";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/tenant";
import { consumePasswordResetToken } from "@/lib/password-reset";

export async function resetPassword(rawEmail: string, token: string, newPassword: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Tienda no encontrada");

  const email = rawEmail.trim().toLowerCase();
  if (newPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres");
  }
  if (!email || !token) {
    throw new Error("Link inválido");
  }

  const valid = await consumePasswordResetToken(tenant.id, email, token);
  if (!valid) {
    throw new Error("El link venció o ya se usó — pedí uno nuevo");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { tenantId_email: { tenantId: tenant.id, email } }, data: { passwordHash } });
}
