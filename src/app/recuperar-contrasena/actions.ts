"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/tenant";
import { sendMail } from "@/lib/mailer";
import { getStoreSettings } from "@/lib/settings";
import { passwordResetEmail } from "@/lib/email-templates";
import { createPasswordResetToken } from "@/lib/password-reset";

export async function requestPasswordReset(rawEmail: string) {
  const tenant = await getCurrentTenant();
  if (!tenant) throw new Error("Tienda no encontrada");

  const email = rawEmail.trim().toLowerCase();
  if (!email) throw new Error("Ingresá tu email");

  const user = await prisma.user.findUnique({ where: { tenantId_email: { tenantId: tenant.id, email } } });
  // Mismo resultado exista o no la cuenta — no queremos que este form sirva
  // para averiguar qué emails están registrados.
  if (!user) return;

  const token = await createPasswordResetToken(tenant.id, email);
  const [storeSettings, hdrs] = await Promise.all([getStoreSettings(tenant.id), headers()]);
  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  const resetUrl = `${protocol}://${host}/restablecer-contrasena?email=${encodeURIComponent(email)}&token=${token}`;

  try {
    await sendMail({
      tenantId: tenant.id,
      to: email,
      subject: `Restablecer tu contraseña — ${storeSettings.storeName}`,
      html: passwordResetEmail({ storeName: storeSettings.storeName, resetUrl }),
      type: "PASSWORD_RESET",
    });
  } catch (e) {
    console.error("No se pudo enviar el mail de recuperación de contraseña", e);
  }
}
