import { Montserrat } from "next/font/google";
import { SessionProvider } from "next-auth/react";

import { AdminThemeRoot } from "@/components/admin/admin-theme-root";
import { requireReseller } from "@/lib/require-reseller";
import { SociosSidebarContent } from "./socios-sidebar-content";
import { SociosTopbar } from "./socios-topbar";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default async function SociosLayout({ children }: { children: React.ReactNode }) {
  await requireReseller();

  return (
    <SessionProvider>
      <AdminThemeRoot fontFamily={montserrat.style.fontFamily}>
        <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
          <SociosSidebarContent />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <SociosTopbar />
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </AdminThemeRoot>
    </SessionProvider>
  );
}
