import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import { tenantAwareAdapter } from "@/lib/auth-adapter";

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "localhost:3010";
const IS_LOCAL = ROOT_DOMAIN.startsWith("localhost");

// Las cookies de state/PKCE/nonce van HOST-ONLY a propósito (sin `domain`
// compartido). Aunque Google siempre vuelve a ROOT_DOMAIN por
// redirectProxyUrl, esas cookies nunca se leen ahí: el proxy saca el
// origen del `state` firmado que viaja en el query string (@auth/core
// lib/actions/callback/index.js) y rebota el navegador al dominio donde
// arrancó el login, que es el único que las lee. O sea, ida y vuelta al
// mismo origen. Forzar `domain: .rootdomain` acá rompía dos casos: en
// local Chromium descarta `Domain=.localhost`, y un dominio propio de
// cliente (tiendacliente.com) no puede setear cookies de otro sitio.
export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  // El subdominio lo pone el middleware (proxy.ts) en todo request, incluido
  // este — así sabemos desde qué tienda arrancó el login sin depender de
  // next/headers (acá no siempre corre dentro de un request de verdad).
  const subdomain = req?.headers.get("x-tenant-subdomain") ?? null;
  const customDomain = req?.headers.get("x-tenant-domain") ?? null;
  const tenant = subdomain
    ? await prisma.tenant.findUnique({ where: { subdomain } })
    : customDomain
      ? await prisma.tenant.findFirst({ where: { customDomain, customDomainVerified: true } })
      : null;

  return {
    ...authConfig,
    // tenantId null es un universo válido (yaa.com.ar sin tienda todavía:
    // super admin, o alguien registrándose en /registro) — nunca "sin
    // adapter", así Google también puede crear/vincular cuentas ahí.
    adapter: tenantAwareAdapter(tenant?.id ?? null),
    // Si Google falla (cuenta ya vinculada de otra forma, etc.), Auth.js
    // redirige a pages.signIn con el error en el query string. /login
    // necesita un tenant real y tira 404 en el dominio raíz — para el
    // registro público (sin subdominio) hay que volver a /registro en su
    // lugar, o el error queda invisible detrás de un 404.
    pages: { ...authConfig.pages, signIn: tenant ? "/login" : "/registro" },
    // Todo el ida y vuelta con Google pasa siempre por ROOT_DOMAIN — un único
    // redirect URI para registrar en Google Cloud Console, sin importar
    // desde qué subdominio de tienda arrancó el login. Auth.js arma un
    // estado firmado para volver al subdominio original una vez que Google
    // confirma.
    redirectProxyUrl: `${IS_LOCAL ? "http" : "https"}://${ROOT_DOMAIN}/api/auth`,
    trustHost: true,
    session: { strategy: "jwt" },
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Contraseña", type: "password" },
          tenantId: { label: "Tenant", type: "text" },
          scope: { label: "Scope", type: "text" },
          token: { label: "Token", type: "text" },
        },
        authorize: async (credentials) => {
          const scope = credentials?.scope as string | undefined;

          // Login automático de un solo uso justo después de crear la
          // tienda en /registro/datos — evita pedirle la contraseña de
          // nuevo apenas la acaba de escribir, y no depende de que Google
          // ande entre subdominios (ver auth-adapter.ts y el comentario de
          // sharedOAuthCookieOptions más arriba).
          if (scope === "magic-token") {
            const token = credentials?.token as string | undefined;
            if (!token) return null;
            const record = await prisma.verificationToken.findUnique({ where: { token } });
            if (!record || record.expires < new Date() || !record.identifier.startsWith("onboarding:")) return null;
            await prisma.verificationToken
              .delete({ where: { identifier_token: { identifier: record.identifier, token } } })
              .catch(() => {});
            const userId = record.identifier.slice("onboarding:".length);
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.tenantId) return null;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              role: user.role,
              tenantId: user.tenantId,
            };
          }

          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;
          const credentialsTenantId = (credentials?.tenantId as string | undefined) || null;
          if (!email || !password) return null;

          const user = scope === "platform"
            ? await prisma.user.findFirst({
                where: { email, tenantId: null, role: "SUPER_ADMIN" },
              })
            : credentialsTenantId
              ? await prisma.user.findUnique({
                  where: { tenantId_email: { tenantId: credentialsTenantId, email } },
                })
              : scope === "onboarding"
                // Alguien registrándose en yaa.com.ar, todavía sin tienda —
                // ver /registro y lib/require-onboarding.ts.
                ? await prisma.user.findFirst({
                    where: { email, tenantId: null, role: "CUSTOMER" },
                  })
                : null;
          if (!user?.passwordHash) return null;

          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            tenantId: user.tenantId,
          };
        },
      }),
    ],
  };
});
