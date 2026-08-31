"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, StoreIcon, BadgeDollarSignIcon, UserIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const sections = [
  { href: "/socios", label: "Resumen", icon: LayoutDashboardIcon },
  { href: "/socios/tiendas", label: "Tiendas referidas", icon: StoreIcon },
  { href: "/socios/comisiones", label: "Comisiones", icon: BadgeDollarSignIcon },
  { href: "/socios/perfil", label: "Perfil", icon: UserIcon },
];

export function SociosSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col text-sidebar-foreground">
      <div className="flex items-center px-4 py-4">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-7 w-auto object-contain" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {sections.map((s) => {
          const active = s.href === "/socios" ? pathname === "/socios" : pathname.startsWith(s.href);
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {s.label}
            </Link>
          );
        })}
      </nav>

      {/* Ser socio no impide tener tu propia tienda además — ver
      lib/require-reseller.ts. Directo a elegir plan, no a /registro/elegir:
      clickear esto ACÁ, desde su propio panel, ya deja clara la intención —
      mostrarle nuevamente "¿qué querés hacer?" sería preguntarle algo que
      acaba de contestar. requireOnboardingUser() en /registro/plan igual lo
      deja pasar (sigue siendo CUSTOMER, sin tenant). */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <Link
          href="/registro/plan"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <PlusIcon className="size-4 shrink-0" />
          Crear mi tienda
        </Link>
      </div>
    </div>
  );
}
