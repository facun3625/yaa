"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireTenantAdmin } from "@/lib/require-admin";
import { saveUploadedFile, saveFaviconWithRoundedCorners } from "@/lib/storage";
import { sendMail } from "@/lib/mailer";
import { getStoreSettings, getOrderEmailMessage, getTelegramSettings } from "@/lib/settings";
import { orderConfirmationEmail, SAMPLE_ORDER_EMAIL_DATA } from "@/lib/email-templates";
import { toWhatsAppLink, toInstagramLink } from "@/lib/social-links";
import { sendTelegram } from "@/lib/telegram";
import { generateDomainToken, verificationRecordName, verifyDomainTxtRecord } from "@/lib/custom-domain";

const settingsSchema = z.object({
  storeName: z.string().min(1, "Ingresá el nombre del negocio"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  addToCartLabel: z.string().optional(),
});

async function saveTextSetting(tenantId: string, value: string | undefined, key: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    await prisma.settings.deleteMany({ where: { tenantId, key } });
    return;
  }
  await prisma.settings.upsert({
    where: { tenantId_key: { tenantId, key } },
    update: { value: trimmed },
    create: { tenantId, key, value: trimmed },
  });
}

async function saveImageSetting(tenantId: string, file: File | null, key: string) {
  if (!file || file.size === 0) return;
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen");
  }
  const url = await saveUploadedFile(file, "branding");
  await prisma.settings.upsert({
    where: { tenantId_key: { tenantId, key } },
    update: { value: url },
    create: { tenantId, key, value: url },
  });
}

async function saveFaviconSetting(tenantId: string, file: File | null, key: string) {
  if (!file || file.size === 0) return;
  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen");
  }
  const url = await saveFaviconWithRoundedCorners(file, "branding");
  await prisma.settings.upsert({
    where: { tenantId_key: { tenantId, key } },
    update: { value: url },
    create: { tenantId, key, value: url },
  });
}

export async function updateStoreSettings(formData: FormData) {
  const { tenant } = await requireTenantAdmin();

  const parsed = settingsSchema.parse({
    storeName: formData.get("storeName"),
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    instagram: formData.get("instagram") || undefined,
    addToCartLabel: formData.get("addToCartLabel") || undefined,
  });

  await prisma.settings.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: "store_name" } },
    update: { value: parsed.storeName },
    create: { tenantId: tenant.id, key: "store_name", value: parsed.storeName },
  });

  await Promise.all([
    saveTextSetting(tenant.id, parsed.address, "store_address"),
    saveTextSetting(tenant.id, parsed.phone, "store_phone"),
    saveTextSetting(tenant.id, parsed.email, "store_email"),
    saveTextSetting(tenant.id, parsed.whatsapp, "store_whatsapp"),
    saveTextSetting(tenant.id, parsed.instagram, "store_instagram"),
    saveTextSetting(tenant.id, parsed.addToCartLabel, "store_add_to_cart_label"),
  ]);

  await saveImageSetting(tenant.id, formData.get("logo") as File | null, "store_logo_url");
  await saveImageSetting(tenant.id, formData.get("cover") as File | null, "store_cover_url");
  await saveFaviconSetting(tenant.id, formData.get("favicon") as File | null, "store_favicon_url");

  revalidatePath("/", "layout");
}

export async function removeStoreImage(key: "store_logo_url" | "store_cover_url" | "store_favicon_url") {
  const { tenant } = await requireTenantAdmin();
  await prisma.settings.deleteMany({ where: { tenantId: tenant.id, key } });
  revalidatePath("/", "layout");
}

// ---------- Editor de texto enriquecido (compartido) ----------

export async function uploadRichTextImage(formData: FormData) {
  await requireTenantAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Elegí una imagen");
  if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen");
  return saveUploadedFile(file, "content");
}

// ---------- Sobre nosotros ----------

export async function updateAboutText(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  await saveTextSetting(tenant.id, String(formData.get("text") ?? ""), "about_text");
  await saveTextSetting(
    tenant.id,
    formData.get("columns") === "true" ? "true" : undefined,
    "about_text_columns",
  );
  revalidatePath("/sobre-nosotros");
  revalidatePath("/admin/configuracion");
}

export async function updatePopupConfig(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  const enabled = formData.get("enabled") === "true";
  const frequency = String(formData.get("frequency") ?? "ONCE");
  const html = String(formData.get("html") ?? "");

  await Promise.all([
    saveTextSetting(tenant.id, String(enabled), "popup_enabled"),
    saveTextSetting(tenant.id, frequency, "popup_frequency"),
    saveTextSetting(tenant.id, html, "popup_html"),
    saveTextSetting(tenant.id, String(Date.now()), "popup_version"),
  ]);
  revalidatePath("/");
  revalidatePath("/admin/configuracion");
}

export async function addAboutMedia(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Elegí un archivo");

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) throw new Error("El archivo debe ser una imagen o un video");

  const url = await saveUploadedFile(file, "about");
  const last = await prisma.aboutMedia.findFirst({
    where: { tenantId: tenant.id },
    orderBy: { order: "desc" },
  });
  await prisma.aboutMedia.create({
    data: {
      tenantId: tenant.id,
      type: isImage ? "IMAGE" : "VIDEO",
      url,
      order: (last?.order ?? -1) + 1,
    },
  });
  revalidatePath("/sobre-nosotros");
  revalidatePath("/admin/configuracion");
}

export async function deleteAboutMedia(id: string) {
  const { tenant } = await requireTenantAdmin();
  await prisma.aboutMedia.delete({ where: { id, tenantId: tenant.id } });
  revalidatePath("/sobre-nosotros");
  revalidatePath("/admin/configuracion");
}

// ---------- SMTP (mail de confirmación de pedido) ----------

const smtpSchema = z.object({
  host: z.string().min(1, "Ingresá el host"),
  port: z.coerce.number().int().positive(),
  user: z.string().min(1, "Ingresá el usuario"),
  pass: z.string().optional(),
  from: z.string().optional(),
  secure: z.boolean(),
});

export async function updateSmtpSettings(formData: FormData) {
  const { tenant } = await requireTenantAdmin();

  const parsed = smtpSchema.parse({
    host: formData.get("host"),
    port: formData.get("port") || "587",
    user: formData.get("user"),
    pass: formData.get("pass") || undefined,
    from: formData.get("from") || undefined,
    secure: formData.get("secure") === "true",
  });

  // La contraseña se deja vacía en el form si ya hay una guardada — un
  // campo vacío significa "no la cambies", no "borrala".
  const existingPass = (
    await prisma.settings.findUnique({ where: { tenantId_key: { tenantId: tenant.id, key: "smtp_pass" } } })
  )?.value;
  if (!parsed.pass && !existingPass) {
    throw new Error("Ingresá la contraseña");
  }

  await Promise.all([
    saveTextSetting(tenant.id, parsed.host, "smtp_host"),
    saveTextSetting(tenant.id, String(parsed.port), "smtp_port"),
    saveTextSetting(tenant.id, parsed.user, "smtp_user"),
    saveTextSetting(tenant.id, parsed.from, "smtp_from"),
    saveTextSetting(tenant.id, String(parsed.secure), "smtp_secure"),
    parsed.pass ? saveTextSetting(tenant.id, parsed.pass, "smtp_pass") : Promise.resolve(),
  ]);

  revalidatePath("/admin/configuracion");
}

export async function removeSmtpSettings() {
  const { tenant } = await requireTenantAdmin();
  await prisma.settings.deleteMany({
    where: { tenantId: tenant.id, key: { in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from", "smtp_secure"] } },
  });
  revalidatePath("/admin/configuracion");
}

export async function sendTestSmtpEmail() {
  const { session, tenant } = await requireTenantAdmin();
  const to = session.user.email;
  if (!to) throw new Error("Tu usuario admin no tiene email");

  await sendMail({
    tenantId: tenant.id,
    to,
    subject: "Mail de prueba",
    html: "<p>Si estás leyendo esto, el SMTP de la tienda está bien configurado.</p>",
    type: "TEST_SMTP",
  });
}

// ---------- Mensaje editable del mail de pedido ----------

export async function updateOrderEmailMessage(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  await saveTextSetting(tenant.id, String(formData.get("message") ?? ""), "order_email_message");
  revalidatePath("/admin/configuracion");
}

// `draftMessage` opcional: permite probar el texto que se está escribiendo
// en el editor antes de guardarlo. Sin eso, usa el mensaje ya guardado.
export async function sendTestOrderEmail(draftMessage?: string) {
  const { session, tenant } = await requireTenantAdmin();
  const to = session.user.email;
  if (!to) throw new Error("Tu usuario admin no tiene email");

  const [storeSettings, savedMessage, hdrs] = await Promise.all([
    getStoreSettings(tenant.id),
    getOrderEmailMessage(tenant.id),
    headers(),
  ]);
  const message = draftMessage !== undefined ? draftMessage : savedMessage;
  const host = hdrs.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https";
  const appUrl = `${protocol}://${host}`;

  await sendMail({
    tenantId: tenant.id,
    to,
    subject: `Recibimos tu pedido — ${storeSettings.storeName}`,
    html: orderConfirmationEmail({
      ...SAMPLE_ORDER_EMAIL_DATA,
      storeName: storeSettings.storeName,
      logoUrl: storeSettings.logoUrl,
      customMessage: message,
      orderUrl: "#",
      storeAddress: storeSettings.address,
      storePhone: storeSettings.phone,
      storeEmail: storeSettings.email,
      whatsappUrl: storeSettings.whatsapp ? toWhatsAppLink(storeSettings.whatsapp) : null,
      instagramUrl: storeSettings.instagram ? toInstagramLink(storeSettings.instagram) : null,
      appUrl,
    }),
    type: "TEST_ORDER",
  });
}

// ---------- Telegram (aviso de pedido nuevo al grupo del equipo) ----------

const telegramSchema = z.object({
  botToken: z.string().optional(),
  chatId: z.string().min(1, "Ingresá el chat ID"),
});

export async function updateTelegramSettings(formData: FormData) {
  const { tenant } = await requireTenantAdmin();

  const parsed = telegramSchema.parse({
    botToken: formData.get("botToken") || undefined,
    chatId: formData.get("chatId"),
  });

  // El token es secreto: si el campo vino vacío es porque ya estaba
  // cargado y no lo tocaron — no lo pisamos con "".
  const existingToken = (
    await prisma.settings.findUnique({ where: { tenantId_key: { tenantId: tenant.id, key: "telegram_bot_token" } } })
  )?.value;
  if (!parsed.botToken && !existingToken) {
    throw new Error("Ingresá el token del bot");
  }

  await Promise.all([
    saveTextSetting(tenant.id, parsed.chatId, "telegram_chat_id"),
    parsed.botToken ? saveTextSetting(tenant.id, parsed.botToken, "telegram_bot_token") : Promise.resolve(),
  ]);

  revalidatePath("/admin/configuracion");
}

export async function removeTelegramSettings() {
  const { tenant } = await requireTenantAdmin();
  await prisma.settings.deleteMany({ where: { tenantId: tenant.id, key: { in: ["telegram_bot_token", "telegram_chat_id"] } } });
  revalidatePath("/admin/configuracion");
}

export async function sendTestTelegram(draftToken: string, draftChatId: string) {
  const { tenant } = await requireTenantAdmin();
  const saved = await getTelegramSettings(tenant.id);
  const token = draftToken.trim() || saved.botToken || "";
  const chatId = draftChatId.trim() || saved.chatId || "";
  if (!token || !chatId) throw new Error("Faltan el token o el chat ID");

  const result = await sendTelegram(token, chatId, "✅ <b>Prueba</b>\nSi ves este mensaje, los avisos de pedidos están funcionando.");
  if (!result.ok) throw new Error(result.error ?? "No se pudo enviar");
}

// ---------- Dominio propio (solo tiendas con el plan habilitado) ----------

const domainSchema = z
  .string()
  .min(3, "Ingresá un dominio válido")
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, "Formato de dominio inválido (ej: pedidos.mimarca.com)");

async function assertCustomDomainAllowed(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, include: { plan: true } });
  if (!tenant?.plan?.allowCustomDomain) {
    throw new Error("Tu plan actual no incluye dominio propio");
  }
}

export async function setCustomDomain(formData: FormData) {
  const { tenant } = await requireTenantAdmin();
  await assertCustomDomainAllowed(tenant.id);

  const domain = domainSchema.parse(String(formData.get("domain") ?? "").trim().toLowerCase());

  const existing = await prisma.tenant.findUnique({ where: { customDomain: domain } });
  if (existing && existing.id !== tenant.id) {
    throw new Error("Ese dominio ya está en uso por otra tienda");
  }

  const token = generateDomainToken();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { customDomain: domain, customDomainToken: token, customDomainVerified: false },
  });
  revalidatePath("/admin/configuracion");
}

export async function verifyCustomDomain() {
  const { tenant: tenantSummary } = await requireTenantAdmin();
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantSummary.id } });
  if (!tenant?.customDomain || !tenant.customDomainToken) {
    throw new Error("Primero cargá un dominio");
  }

  const verified = await verifyDomainTxtRecord(tenant.customDomain, tenant.customDomainToken);
  if (!verified) {
    throw new Error(
      `No encontramos el registro TXT en ${verificationRecordName(tenant.customDomain)}. Puede tardar unos minutos en propagarse.`,
    );
  }

  await prisma.tenant.update({ where: { id: tenant.id }, data: { customDomainVerified: true } });
  revalidatePath("/admin/configuracion");
}

export async function removeCustomDomain() {
  const { tenant } = await requireTenantAdmin();
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { customDomain: null, customDomainToken: null, customDomainVerified: false },
  });
  revalidatePath("/admin/configuracion");
}

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

// El picker de planes vive en el dominio raíz (yaa.com.ar), no acá — y la
// sesión del admin es host-only en SU subdominio, no viaja sola hasta ahí
// (mismo motivo que el token de /registro/datos al crear la tienda). Este
// token de un solo uso es el pase de ida; la vuelta no necesita nada
// especial porque nunca tocamos la sesión de este subdominio, sigue viva
// cuando vuelva.
export async function startPlanChangeRequest() {
  const { tenant } = await requireTenantAdmin();

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { identifier: `plan-change:${tenant.id}`, token, expires: new Date(Date.now() + 10 * 60 * 1000) },
  });

  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  redirect(`${protocol}://${ROOT_DOMAIN}/cambiar-plan?token=${token}`);
}
