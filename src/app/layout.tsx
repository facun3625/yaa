import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Barlow, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { MarketingSessionProvider } from "@/components/marketing/marketing-session-provider";
import { MarketingWhatsappWidget } from "@/components/marketing/marketing-whatsapp-widget";
import { StoreSettingsProvider } from "@/lib/store-settings-context";
import { getStoreSettings, getSeoSettings } from "@/lib/settings";
import { getCurrentTenant } from "@/lib/tenant";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { FloatingCartButton } from "@/components/floating-cart-button";
import { getPlatformMarketingSettings } from "@/lib/platform-billing";

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

  const [{ storeName, faviconUrl }, seo] = await Promise.all([
    getStoreSettings(tenant.id),
    getSeoSettings(tenant.id),
  ]);
  const title = seo.title || storeName;
  const description = seo.description || `Encargá tu comida en ${storeName}`;
  return {
    title,
    description,
    icons: faviconUrl ? { icon: faviconUrl } : undefined,
    // El resto de la metadata (OG, Twitter card) solo se completa si hay
    // imagen propia cargada — sin eso no hay nada mejor que mostrar que el
    // título y la descripción de arriba, así que no vale la pena armar el
    // bloque entero.
    ...(seo.ogImageUrl && {
      openGraph: {
        title,
        description,
        siteName: storeName,
        locale: "es_AR",
        type: "website",
        images: [{ url: seo.ogImageUrl }],
      },
      twitter: {
        card: "summary_large_image" as const,
        title,
        description,
        images: [seo.ogImageUrl],
      },
    }),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const htmlClassName = `${barlow.variable} ${geistMono.variable} h-full antialiased`;
  const pathname = (await headers()).get("x-pathname") ?? "";

  if (await isPlatformRoute()) {
    return (
      <html lang="es" className={htmlClassName}>
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    );
  }

  const tenant = await getCurrentTenant();

  if (!tenant) {
    const marketingSettings = await getPlatformMarketingSettings();
    return (
      <html lang="es" className={htmlClassName}>
        <body className="min-h-full">
          <MarketingSessionProvider>
            {children}
            {marketingSettings.whatsappEnabled && marketingSettings.whatsappNumber ? (
              <MarketingWhatsappWidget
                number={marketingSettings.whatsappNumber}
                message={marketingSettings.whatsappMessage}
              />
            ) : null}
          </MarketingSessionProvider>
        </body>
      </html>
    );
  }

  if (tenant.status === "SUSPENDED" && !pathname.startsWith("/admin")) {
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
