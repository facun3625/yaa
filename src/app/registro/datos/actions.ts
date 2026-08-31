"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireOnboardingUser } from "@/lib/require-onboarding";

const RESERVED_SUBDOMAINS = new Set(["www", "app", "admin", "api", "platform", "mail", "ftp", "login", "registro"]);

const subdomainSchema = z
  .string()
  .min(2, "Mínimo 2 caracteres")
  .max(40, "Máximo 40 caracteres")
  .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones")
  .refine((v) => !RESERVED_SUBDOMAINS.has(v), "Ese subdominio no está disponible");

const datosSchema = z.object({
  subdomain: subdomainSchema,
  storeName: z.string().min(1, "Ingresá el nombre del negocio"),
  // Solo obligatorio si el usuario no tiene contraseña todavía (se registró
  // con Google) — ver comentario más abajo sobre por qué hace falta.
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  // Todo esto es opcional a propósito — no queremos sumarle fricción al
  // alta pidiendo datos que se pueden completar después. Teléfono es del
  // dueño (User.phone); ciudad/provincia son de la tienda, de cara al
  // público (Settings, igual que la dirección); rubro y "cómo nos
  // conociste" son para la plataforma, no se le muestran a nadie más.
  phone: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  businessCategory: z.string().optional(),
  referralSource: z.string().optional(),
});

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

export async function createTenantFromOnboarding(formData: FormData) {
  const session = await requireOnboardingUser();

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.pendingPlanId || !user.onboardingPaidAt) {
    redirect("/registro/plan");
  }

  const parsed = datosSchema.parse({
    subdomain: (formData.get("subdomain") as string)?.trim().toLowerCase(),
    storeName: formData.get("storeName"),
    password: formData.get("password") || undefined,
    phone: formData.get("phone") || undefined,
    city: formData.get("city") || undefined,
    province: formData.get("province") || undefined,
    businessCategory: formData.get("businessCategory") || undefined,
    referralSource: formData.get("referralSource") || undefined,
  });

  const existing = await prisma.tenant.findUnique({ where: { subdomain: parsed.subdomain } });
  if (existing) throw new Error("Ya existe una tienda con ese subdominio");

  const passwordHash = parsed.password ? await bcrypt.hash(parsed.password, 10) : undefined;

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  // Si llegó con el código de un revendedor (por /registro?ref=CODIGO o
  // tipeado a mano), acá es donde se fija de verdad la atribución — recién
  // cuando la tienda se crea de verdad, no antes. Un código inválido o de
  // un revendedor dado de baja simplemente no asocia nada, no bloquea el
  // alta.
  // Sin filtro de role a propósito: ser revendedor es tener un código, no
  // un rol — puede ser alguien sin tienda todavía (CUSTOMER) o admin de su
  // propia tienda que ADEMÁS reparte su código (ver lib/require-reseller.ts).
  const reseller = user.pendingReferralCode
    ? await prisma.user.findFirst({
        where: { referralCode: user.pendingReferralCode, resellerDeactivatedAt: null },
      })
    : null;

  const tenant = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        subdomain: parsed.subdomain,
        planId: user.pendingPlanId,
        billingStatus: "ACTIVE",
        nextBillingDate,
        referredByResellerId: reseller?.id,
        businessCategory: parsed.businessCategory,
        referralSource: parsed.referralSource,
      },
    });
    await tx.settings.create({
      data: { tenantId: tenant.id, key: "store_name", value: parsed.storeName },
    });
    const extraSettings = [
      parsed.city ? { key: "store_city", value: parsed.city } : null,
      parsed.province ? { key: "store_province", value: parsed.province } : null,
    ].filter((s) => s !== null);
    if (extraSettings.length > 0) {
      await tx.settings.createMany({
        data: extraSettings.map((s) => ({ tenantId: tenant.id, key: s.key, value: s.value })),
      });
    }
    await tx.paymentMethodConfig.createMany({
      data: [
        { tenantId: tenant.id, type: "CASH_ON_DELIVERY", enabled: true },
        { tenantId: tenant.id, type: "TRANSFER", enabled: false },
        { tenantId: tenant.id, type: "MERCADOPAGO", enabled: false },
      ],
    });
    await tx.fulfillmentMethodConfig.createMany({
      data: [
        { tenantId: tenant.id, type: "DELIVERY", enabled: true },
        { tenantId: tenant.id, type: "PICKUP", enabled: false },
      ],
    });

    // El usuario que se registró en yaa.com.ar pasa a ser el admin de esta
    // tienda — mismo User, ya no "pendiente" (tenantId null). Sus cuentas de
    // Google (si entró por ahí) se re-scopean a este tenant para que el
    // login funcione igual en el subdominio nuevo.
    await tx.user.update({
      where: { id: user.id },
      data: {
        tenantId: tenant.id,
        role: "ADMIN",
        pendingPlanId: null,
        onboardingPaidAt: null,
        pendingReferralCode: null,
        ...(passwordHash ? { passwordHash } : {}),
        ...(parsed.phone ? { phone: parsed.phone } : {}),
      },
    });
    await tx.account.updateMany({
      where: { userId: user.id, tenantId: null },
      data: { tenantId: tenant.id },
    });

    return tenant;
  });

  // Token de un solo uso para entrar directo al panel de la tienda nueva
  // sin pedirle de nuevo el email/contraseña que recién escribió — el
  // cookie de sesión de yaa.com.ar no puede viajar solo al subdominio
  // nuevo (dominios distintos para el navegador), así que esto reemplaza
  // ese re-login manual por un solo click. Vive 5 minutos, se usa una vez
  // (ver auth.ts, scope "magic-token").
  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: `onboarding:${user.id}`, token, expires: new Date(Date.now() + 5 * 60 * 1000) },
  });

  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  redirect(`${protocol}://${tenant.subdomain}.${ROOT_DOMAIN}/login?onboarded=1&callbackUrl=%2Fadmin&token=${token}`);
}
