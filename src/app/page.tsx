import { StoreHero } from "@/components/catalog/store-hero";
import { StoreFooter } from "@/components/catalog/store-footer";
import { WelcomePopup } from "@/components/catalog/welcome-popup";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/tenant";
import { Catalog } from "@/components/catalog/catalog";
import { expireStaleDates } from "@/lib/schedule";
import { getPopupConfig } from "@/lib/popup";
import { resolveScheduledSalesAvailability, resolveWeeklyAvailability, type OpenSale } from "@/lib/availability";
import { getRemainingForVariants } from "@/lib/stock";
import { YaaLanding } from "@/components/marketing/yaa-landing";
import { canTenantReceiveOrders } from "@/lib/billing-status";
import { getResellerSettings, getCommissionTiers } from "@/lib/reseller-commission";

const saleDateFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});
const cutoffTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const cutoffFullFormatter = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function isSameCalendarDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function cutoffLabel(deliveryDate: Date, cutoffAt: Date) {
  return isSameCalendarDay(deliveryDate, cutoffAt)
    ? `hasta las ${cutoffTimeFormatter.format(cutoffAt)} hs del mismo día`
    : `hasta el ${cutoffFullFormatter.format(cutoffAt)} hs`;
}

type Resolved = {
  readOnly: boolean;
  readOnlyReason: "closed" | "soldout";
  nextOpenDateLabel: string | null;
  statusBanner: { icon: "open" | "calendar"; text: string } | null;
  openDates: { id: string; date: string }[];
  selectedDateId: string | null;
};

async function resolveForStorefront(tenantId: string): Promise<Resolved> {
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } });

  if (tenant.orderingMode === "WEEKLY_HOURS") {
    const availability = await resolveWeeklyAvailability(tenantId);
    if (availability.open) {
      return {
        readOnly: false,
        readOnlyReason: "closed",
        nextOpenDateLabel: null,
        statusBanner: {
          icon: "open",
          text: `Abierto — pedí ahora. Cerramos a las ${availability.closesAt} hs. Entrega/retiro: ${availability.fulfillmentLabel}.`,
        },
        openDates: [{ id: availability.deliveryDateId, date: new Date().toISOString() }],
        selectedDateId: availability.deliveryDateId,
      };
    }
    return {
      readOnly: true,
      readOnlyReason: "closed",
      nextOpenDateLabel: availability.nextOpenLabel,
      statusBanner: null,
      openDates: [],
      selectedDateId: null,
    };
  }

  const availability = await resolveScheduledSalesAvailability(tenantId);
  if (availability.open) {
    const sales: OpenSale[] = availability.sales;
    const banner =
      sales.length === 1
        ? {
            icon: "calendar" as const,
            text: `Tomamos pedidos para el ${saleDateFormatter.format(sales[0].date)}.${
              sales[0].cutoffAt ? ` Pedidos ${cutoffLabel(sales[0].date, sales[0].cutoffAt)}.` : ""
            }`,
          }
        : null;
    return {
      readOnly: false,
      readOnlyReason: "closed",
      nextOpenDateLabel: null,
      statusBanner: banner,
      openDates: sales.map((s) => ({ id: s.id, date: s.date.toISOString() })),
      selectedDateId: sales[0].id,
    };
  }

  if (availability.previewDate) {
    return {
      readOnly: true,
      readOnlyReason: "closed",
      nextOpenDateLabel: availability.nextSaleLabel,
      statusBanner: null,
      openDates: [{ id: availability.previewDate.id, date: availability.previewDate.date.toISOString() }],
      selectedDateId: availability.previewDate.id,
    };
  }

  return {
    readOnly: true,
    readOnlyReason: availability.soldOut ? "soldout" : "closed",
    nextOpenDateLabel: availability.nextSaleLabel,
    statusBanner: null,
    openDates: [],
    selectedDateId: null,
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { fecha } = await searchParams;
  const tenant = await getCurrentTenant();
  if (!tenant) {
    const [publicPlans, resellerSettings, resellerTiers] = await Promise.all([
      prisma.plan.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      getResellerSettings(),
      getCommissionTiers(),
    ]);
    // Organization schema: lo que le permite a Google entender que "YAA" es
    // una marca (no una palabra suelta) — habilita el logo en el panel de
    // conocimiento y el buscador interno en los resultados. Sin sameAs a
    // propósito: no hay redes sociales reales todavía, e inventar links
    // rotos es peor que no tener la propiedad.
    const organizationJsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "YAA",
      url: "https://yaa.com.ar",
      logo: "https://yaa.com.ar/yaa-icon.svg",
      description: "Pedidos online para gastronomía y negocios de cercanía, sin comisiones por venta.",
    };
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <YaaLanding
          plans={publicPlans.map((plan) => ({
            id: plan.id,
            name: plan.name,
            priceMonthly: Number(plan.priceMonthly),
            priceAnnual: plan.priceAnnual === null ? null : Number(plan.priceAnnual),
            trialDays: plan.trialDays,
            description: plan.description,
            maxProducts: plan.maxProducts,
            maxOrdersPerMonth: plan.maxOrdersPerMonth,
            allowCustomDomain: plan.allowCustomDomain,
            featured: plan.featured,
          }))}
          resellerSettings={{
            activationBonusAmount: Number(resellerSettings.activationBonusAmount),
            activationBonusDays: resellerSettings.activationBonusDays,
          }}
          resellerTiers={resellerTiers.map((tier) => ({ minActiveStores: tier.minActiveStores, percent: Number(tier.percent) }))}
        />
      </>
    );
  }

  if (!canTenantReceiveOrders(tenant)) {
    return (
      <div className="flex flex-1 flex-col">
        <StoreHero />
        <main className="relative z-1 -mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-t-3xl bg-background px-6 py-16 text-center lg:-mt-32 lg:mx-auto lg:max-w-5xl lg:shadow-2xl xl:max-w-6xl 2xl:max-w-7xl">
          <h1 className="text-2xl font-semibold">Tienda temporalmente no disponible</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            En este momento no estamos recibiendo pedidos online. Volvé a intentarlo más tarde.
          </p>
        </main>
        <StoreFooter />
      </div>
    );
  }

  await expireStaleDates(tenant.id);
  const [resolved, popupConfig] = await Promise.all([
    resolveForStorefront(tenant.id),
    getPopupConfig(tenant.id),
  ]);
  const showPopup = popupConfig.enabled && !!popupConfig.html?.trim();

  const selectedDateId =
    (fecha && resolved.openDates.some((d) => d.id === fecha) ? fecha : resolved.selectedDateId) ?? null;

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, active: true, category: { active: true } },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: { where: { active: true }, orderBy: { order: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  const allVariantIds = products.flatMap((p) => p.variants.map((v) => v.id));
  const remainingByVariant = selectedDateId
    ? await getRemainingForVariants(tenant.id, selectedDateId, allVariantIds)
    : new Map<string, number>();

  const catalogProducts = products.map((p) => {
    // Pausa manual sin fecha, solo aplica en modo horario semanal.
    const soldOutToday = tenant.orderingMode === "WEEKLY_HOURS" && p.soldOutToday;
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      categoryIcon: p.category.icon,
      imageUrl: p.images[0]?.url ?? null,
      images: p.images.map((i) => i.url),
      contactToBuy: p.contactToBuy,
      featured: p.featured,
      tags: p.tags,
      variants: p.variants.map((v) => ({
        id: v.id,
        label: [v.gusto, v.tamano].filter(Boolean).join(" · ") || "Único",
        price: Number(v.price),
        remaining: soldOutToday ? 0 : (remainingByVariant.get(v.id) ?? 0),
        stockGroupId: v.stockGroupId,
      })),
    };
  });

  // Vacío de verdad (nada cargado) o realmente cerrado sin nada para
  // previsualizar — no confundir con "abierto pero sin stock" (sigue
  // mostrando la tienda con lo agotado marcado) ni con el modo de solo
  // mirar el menú antes de que abra el pedido (showCatalogBeforeOpen,
  // openDates trae la fecha aunque readOnly sea true).
  if (resolved.openDates.length === 0 || catalogProducts.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <StoreHero />
        <main className="relative z-1 -mt-6 flex flex-1 flex-col items-center justify-center gap-3 rounded-t-3xl bg-background px-6 py-16 text-center lg:-mt-32 lg:mx-auto lg:max-w-5xl lg:shadow-2xl xl:max-w-6xl 2xl:max-w-7xl">
          <h1 className="text-2xl font-semibold">
            {resolved.readOnlyReason === "soldout" ? "Se alcanzó el límite de pedidos" : "Todavía no hay pedidos abiertos"}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {resolved.nextOpenDateLabel
              ? `Abrimos ${resolved.nextOpenDateLabel}.`
              : "En cuanto abramos vas a poder ver el catálogo y hacer tu pedido acá."}
          </p>
        </main>
        <StoreFooter />
        {showPopup && (
          <WelcomePopup html={popupConfig.html!} frequency={popupConfig.frequency} version={popupConfig.version} />
        )}
      </div>
    );
  }

  const categories = Array.from(
    new Map(
      catalogProducts.map((p) => [p.categoryId, { name: p.categoryName, icon: p.categoryIcon }]),
    ).entries(),
  ).map(([id, { name, icon }]) => ({ id, name, icon }));

  return (
    <div className="flex flex-1 flex-col">
      <StoreHero />
      <Catalog
        deliveryDates={resolved.openDates}
        selectedDeliveryDateId={selectedDateId ?? ""}
        categories={categories}
        products={catalogProducts}
        readOnly={resolved.readOnly}
        readOnlyReason={resolved.readOnlyReason}
        nextOpenDateLabel={resolved.nextOpenDateLabel}
        statusBanner={resolved.statusBanner}
      />
      <StoreFooter />
      {showPopup && (
        <WelcomePopup html={popupConfig.html!} frequency={popupConfig.frequency} version={popupConfig.version} />
      )}
    </div>
  );
}
