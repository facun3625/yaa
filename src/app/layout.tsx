import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Barlow, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { StoreSettingsProvider } from "@/lib/store-settings-context";
import { getStoreSettings } from "@/lib/settings";
import { getCurrentTenant } from "@/lib/tenant";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { FloatingCartButton } from "@/components/floating-cart-button";

async function isPlatformRoute() {
  const pathname = (await headers()).get("x-pathname") ?? "";
  return pathname.startsWith("/platform");
}

const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  if (await isPlatformRoute()) {
    return {
      title: "YAA · Plataforma",
      icons: { icon: "/yaa-icon.svg" },
    };
  }

  const tenant = await getCurrentTenant();
  if (!tenant) {
    return {
      title: "YAA · Vendé más. Complicate menos.",
      description:
        "Pedidos online para gastronomía y negocios de cercanía, sin comisiones por venta.",
      icons: { icon: "/yaa-icon.svg" },
      metadataBase: new URL("https://yaa.com.ar"),
      alternates: { canonical: "/" },
      openGraph: {
        title: "YAA · Vendé más. Complicate menos.",
        description: "Tu menú online y todos tus pedidos en un solo lugar, sin comisiones por venta.",
        url: "/",
        siteName: "YAA",
        locale: "es_AR",
        type: "website",
        images: [{ url: "/yaa_mock.png", width: 1448, height: 1086, alt: "YAA, tu tienda online" }],
      },
      twitter: {
        card: "summary_large_image",
        title: "YAA · Vendé más. Complicate menos.",
        description: "Tu menú online y todos tus pedidos en un solo lugar, sin comisiones por venta.",
        images: ["/yaa_mock.png"],
      },
    };
  }

  const { storeName, faviconUrl } = await getStoreSettings(tenant.id);
  return {
    title: storeName,
    description: `Encargá tu comida en ${storeName}`,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const htmlClassName = `${barlow.variable} ${geistMono.variable} h-full antialiased`;

  if (await isPlatformRoute()) {
    return (
      <html lang="es" className={htmlClassName}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    );
  }

  const tenant = await getCurrentTenant();

  if (!tenant) {
    return (
      <html lang="es" className={htmlClassName}>
        <body className="min-h-full">{children}</body>
      </html>
    );
  }

  if (tenant.status === "SUSPENDED") {
    return (
      <html lang="es" className={htmlClassName}>
        <body className="flex min-h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <h1 className="text-xl font-semibold">Tienda no encontrada</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Esta tienda está temporalmente suspendida.
          </p>
        </body>
      </html>
    );
  }

  const storeSettings = await getStoreSettings(tenant.id);

  return (
    <html lang="es" className={htmlClassName}>
      <body className="min-h-full flex flex-col">
        <StoreSettingsProvider value={{ ...storeSettings, tenantId: tenant.id }}>
          <Providers>
            {children}
            <WhatsAppWidget />
            <FloatingCartButton />
          </Providers>
        </StoreSettingsProvider>
      </body>
    </html>
  );
}
