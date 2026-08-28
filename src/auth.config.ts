import type { NextAuthConfig, DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      tenantId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: Role;
    tenantId?: string | null;
  }
}

// Config compartida entre el runtime completo (auth.ts) y el middleware,
// que corre en Edge y no puede cargar Prisma/bcrypt.
export default {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.role = (user as { role?: Role }).role ?? "CUSTOMER";
        token.tenantId = (user as { tenantId?: string | null }).tenantId ?? null;
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.image) token.picture = session.image;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role ?? "CUSTOMER";
        session.user.tenantId = token.tenantId ?? null;
        if (token.picture) session.user.image = token.picture;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
