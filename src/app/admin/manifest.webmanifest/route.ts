import { NextResponse } from "next/server";
import { requireTenantAdmin } from "@/lib/require-admin";
import { getStoreSettings } from "@/lib/settings";

// No es el archivo especial app/manifest.ts de Next (ese solo funciona en
// la raíz de app/) — es un Route Handler común que arma el mismo JSON a
// mano, servido en /admin/manifest.webmanifest. Pasa por el gate de auth
// de /admin en src/proxy.ts, pero eso no rompe nada: el <link rel="manifest">
// solo se renderiza dentro del layout admin, que ya exige sesión.
export async function GET() {
  const { tenant } = await requireTenantAdmin();
  const { storeName } = await getStoreSettings(tenant.id);

  const manifest = {
    name: `${storeName} — Panel`,
    short_name: storeName,
    start_url: "/admin",
    scope: "/admin/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/admin/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/admin/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/admin/icon/512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
