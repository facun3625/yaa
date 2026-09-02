import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

async function safeNext(value: string | null) {
  const protocol = ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  const fallback = `${protocol}://${ROOT_DOMAIN}`;
  if (!value) return fallback;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return fallback;
    const rootHost = ROOT_DOMAIN.split(":")[0];
    if (url.hostname === rootHost || url.hostname.endsWith(`.${rootHost}`)) return url.toString();

    const customTenant = await prisma.tenant.findFirst({
      where: { customDomain: url.hostname, customDomainVerified: true },
      select: { id: true },
    });
    return customTenant ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

// Se ejecuta una vez en cada host. Al responder desde ese mismo host el
// navegador acepta la expiración de sus cookies host-only; ningún dominio
// intenta borrar cookies ajenas.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(await safeNext(request.nextUrl.searchParams.get("next")));
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.includes("authjs.session-token") || cookie.name.includes("next-auth.session-token")) {
      response.cookies.delete(cookie.name);
    }
  }
  return response;
}
