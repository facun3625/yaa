import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";

function getSubdomain(host: string, rootDomain: string): string | null {
  const cleanHost = host.split(":")[0];
  const cleanRoot = rootDomain.split(":")[0];
  if (cleanHost === cleanRoot || cleanHost === `www.${cleanRoot}`) return null;
  if (!cleanHost.endsWith(`.${cleanRoot}`)) return null;
  const subdomain = cleanHost.slice(0, -(`.${cleanRoot}`.length));
  if (!subdomain || subdomain === "www") return null;
  return subdomain;
}

function isRootHost(host: string, rootDomain: string): boolean {
  const cleanHost = host.split(":")[0];
  const cleanRoot = rootDomain.split(":")[0];
  return cleanHost === cleanRoot || cleanHost === `www.${cleanRoot}`;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") ?? "";
  const subdomain = getSubdomain(host, ROOT_DOMAIN);

  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-tenant-subdomain", subdomain);
  } else if (host && !isRootHost(host, ROOT_DOMAIN)) {
    // No matchea ni subdominio ni el dominio raíz — puede ser un dominio
    // propio de una tienda (ej: pedidos.mimarca.com). getCurrentTenant()
    // resuelve esto contra Tenant.customDomain, solo si está verificado.
    requestHeaders.set("x-tenant-domain", host.split(":")[0]);
  }
  requestHeaders.set("x-pathname", pathname);

  const isAdminRoute = pathname.startsWith("/admin");
  const isPlatformRoute = pathname.startsWith("/platform") && pathname !== "/platform/login";

  if (!isAdminRoute && !isPlatformRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const user = req.auth?.user;
  if (!user) {
    const loginPath = isPlatformRoute ? "/platform/login" : "/login";
    const loginUrl = new URL(loginPath, req.nextUrl.origin);
    if (!isPlatformRoute) loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPlatformRoute && user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
  if (isAdminRoute && user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
