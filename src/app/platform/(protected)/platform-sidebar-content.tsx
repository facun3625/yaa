"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, StoreIcon, CreditCardIcon, PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const sections = [
  { href: "/platform", label: "Resumen", icon: LayoutDashboardIcon },
  { href: "/platform/tiendas", label: "Tiendas", icon: StoreIcon },
  { href: "/platform/planes", label: "Planes", icon: CreditCardIcon },
];

export function PlatformSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-full flex-col text-sidebar-foreground">
      <div className="flex items-center px-4 py-4">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-7 w-auto object-contain" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {sections.map((s) => {
          const active = s.href === "/platform" ? pathname === "/platform" : pathname.startsWith(s.href);
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

      <div className="border-t border-sidebar-border px-3 py-3">
        <Link
          href="/platform/nueva"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <PlusIcon className="size-4 shrink-0" />
          Nueva tienda
        </Link>
      </div>
    </div>
  );
}
