// Crea (o recrea desde cero) el pool de tiendas demo — "Pizzería Demo",
// idéntica en cada copia — para mostrarle el panel y la tienda a cualquier
// prospecto sin usar datos reales. Son varias copias (DEMO_SUBDOMAINS) y no
// una sola porque la clave de acceso es pública: con un solo tenant, dos
// visitas simultáneas se pisan entre sí (ver /demo, que reparte a quien
// entra hacia la copia libre hace más tiempo). Re-ejecutable: cada copia que
// ya exista se borra entera primero (mismo orden que deleteTenant en
// platform/tiendas/[tenantId]/actions.ts) y se vuelve a armar de cero.
//
// Uso: npx tsx --env-file=.env scripts/seed-demo-pizzeria.ts
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { logGroupStockMovement } from "@/lib/stock-movements";
import { awardPointsForOrder } from "@/lib/points";
import { DEMO_SUBDOMAINS, DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/demo";

const ADMIN_EMAIL = DEMO_ADMIN_EMAIL;
const ADMIN_PASSWORD = DEMO_ADMIN_PASSWORD;
const CUSTOMER_EMAIL = "cliente@demo.yaa.com.ar";

// Fotos propias del dueño, en public/demo-photos/ (versionadas en git —
// viajan solas al deploy, a diferencia de /public/uploads que es gitignored).
const PHOTOS = {
  margarita: "/demo-photos/Margarita.png",
  muzzarela: "/demo-photos/Muzarela.png",
  napolitana: "/demo-photos/napolitana.png",
  roque: "/demo-photos/Roque.png",
  empanada: "/demo-photos/empanada.jpg",
  coca: "/demo-photos/coca.jpg",
  cerveza: "/demo-photos/ceveza.jpg",
  hamburguesa: "/demo-photos/hamburguesa.jpg",
  lomito: "/demo-photos/lomito.jpg",
  cover: "/demo-photos/cover.jpg",
};

const GUEST_NAMES = [
  { name: "Martina Gómez", phone: "1122334455", address: "Av. Rivadavia 3450, CABA" },
  { name: "Lucas Fernández", phone: "1133445566", address: "Calle 50 N°876, La Plata" },
  { name: "Sofía Ramírez", phone: "1144556677", address: "Av. Cabildo 2100, CABA" },
  { name: "Tomás Ibáñez", phone: "1155667788", address: "San Martín 640, Vicente López" },
];

async function deleteExistingDemoTenant(tenantId: string) {
  // Mismo orden que deleteTenant (platform/tiendas/[tenantId]/actions.ts):
  // primero lo que referencia pedidos/productos, después productos y
  // catálogo, al final el tenant y sus usuarios.
  await prisma.$transaction(async (tx) => {
    await tx.pointsLedger.deleteMany({ where: { user: { tenantId } } });
    await tx.couponRedemption.deleteMany({ where: { coupon: { tenantId } } });
    await tx.order.deleteMany({ where: { tenantId } });
    await tx.coupon.deleteMany({ where: { tenantId } });
    await tx.pointsRule.deleteMany({ where: { tenantId } });
    await tx.stockMovement.deleteMany({ where: { tenantId } });
    await tx.pickupSlot.deleteMany({ where: { tenantId } });
    await tx.fulfillmentMethodConfig.deleteMany({ where: { tenantId } });
    await tx.paymentMethodConfig.deleteMany({ where: { tenantId } });
    await tx.weeklyScheduleRule.deleteMany({ where: { tenantId } });
    await tx.storeClosure.deleteMany({ where: { tenantId } });
    await tx.deliveryDate.deleteMany({ where: { tenantId } });
    await tx.serviceInquiry.deleteMany({ where: { tenantId } });
    await tx.service.deleteMany({ where: { tenantId } });
    await tx.product.deleteMany({ where: { tenantId } });
    await tx.productCategory.deleteMany({ where: { tenantId } });
    await tx.stockGroup.deleteMany({ where: { tenantId } });
    await tx.emailLog.deleteMany({ where: { tenantId } });
    await tx.whatsappLog.deleteMany({ where: { tenantId } });
    await tx.aboutMedia.deleteMany({ where: { tenantId } });
    await tx.settings.deleteMany({ where: { tenantId } });
    await tx.resellerCommission.deleteMany({ where: { tenantId } });
    await tx.billingPayment.deleteMany({ where: { tenantId } });
    await tx.promotionRedemption.deleteMany({ where: { tenantId } });
    await tx.user.deleteMany({ where: { tenantId } });
    await tx.tenant.delete({ where: { id: tenantId } });
  });
}

// Los últimos N días (la demo está abierta los 7 días, ver más abajo)
// contados hacia atrás desde ayer, más viejo primero. No incluye hoy — hoy
// lo genera solo ensureTodayDeliveryDate() cuando alguien visita la tienda.
function pastDays(count: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);
  cursor.setDate(cursor.getDate() - 1);
  for (let i = 0; i < count; i++) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() - 1);
  }
  return days.reverse();
}

async function seedOneDemoTenant(subdomain: string) {
  console.log(`\n=== ${subdomain} ===`);
  const existing = await prisma.tenant.findUnique({ where: { subdomain } });
  if (existing) {
    console.log(`Ya existía "${subdomain}" (${existing.id}) — borrando para recrear...`);
    await deleteExistingDemoTenant(existing.id);
  }

  const plan = await prisma.plan.findFirst({ where: { active: true }, orderBy: { order: "desc" } });
  if (!plan) console.warn("No hay ningún Plan activo — la demo queda sin plan asignado (funciones limitadas).");

  const [adminPasswordHash, customerPasswordHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 10),
    bcrypt.hash("Cliente1234!", 10),
  ]);

  console.log("Creando tenant...");
  const tenant = await prisma.tenant.create({
    data: {
      subdomain,
      status: "ACTIVE",
      orderingMode: "WEEKLY_HOURS",
      businessCategory: "Gastronomía",
      referralSource: "demo",
      planId: plan?.id ?? null,
      // Exenta de facturación para siempre: ACTIVE + nextBillingDate null no
      // matchea ninguna de las condiciones que el cron de
      // api/cron/billing/route.ts usa para suspender (todas exigen
      // nextBillingDate vencido, o TRIAL vencido).
      billingStatus: "ACTIVE",
      trialEndsAt: null,
      nextBillingDate: null,
      billingNotes: "Tienda de demostración — exenta de facturación.",
    },
  });

  await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: ADMIN_EMAIL,
      name: "Admin Demo",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  });

  // Cliente registrado para que Puntos tenga a alguien acumulando — la
  // mitad del historial de pedidos queda a su nombre, la otra mitad como
  // invitado, igual que pasaría en una tienda real.
  const customer = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: CUSTOMER_EMAIL,
      name: "Cliente Demo",
      role: "CUSTOMER",
      passwordHash: customerPasswordHash,
    },
  });

  console.log("Cargando datos de la tienda...");
  await prisma.settings.createMany({
    data: [
      { tenantId: tenant.id, key: "store_name", value: "Pizzería Demo" },
      { tenantId: tenant.id, key: "store_city", value: "Ciudad Autónoma de Buenos Aires" },
      { tenantId: tenant.id, key: "store_province", value: "Buenos Aires" },
      { tenantId: tenant.id, key: "store_address", value: "Av. Corrientes 1234, CABA" },
      { tenantId: tenant.id, key: "store_phone", value: "+541122223333" },
      { tenantId: tenant.id, key: "store_whatsapp", value: "+541122223333" },
      { tenantId: tenant.id, key: "store_email", value: "hola@pizzeriademo.com.ar" },
      { tenantId: tenant.id, key: "store_instagram", value: "pizzeriademo" },
      { tenantId: tenant.id, key: "store_cover_url", value: PHOTOS.cover },
    ],
  });

  await prisma.paymentMethodConfig.createMany({
    data: [
      { tenantId: tenant.id, type: "CASH_ON_DELIVERY", enabled: true },
      { tenantId: tenant.id, type: "TRANSFER", enabled: true },
      { tenantId: tenant.id, type: "MERCADOPAGO", enabled: false },
    ],
  });
  await prisma.fulfillmentMethodConfig.createMany({
    data: [
      { tenantId: tenant.id, type: "DELIVERY", enabled: true, config: { fee: 800 } },
      { tenantId: tenant.id, type: "PICKUP", enabled: true },
    ],
  });

  // Horario semanal: abierto los 7 días, todo el día — a propósito distinto
  // de una pizzería real (que cerraría al mediodía o un día de descanso):
  // esto es una demo de ventas, tiene que mostrar el catálogo funcionando
  // sin importar a qué hora entre el prospecto.
  for (let weekday = 0; weekday <= 6; weekday++) {
    await prisma.weeklyScheduleRule.create({
      data: {
        tenantId: tenant.id,
        weekday,
        enabled: true,
        windows: {
          create: [
            {
              order: 0,
              orderOpenTime: "00:00",
              orderCloseTime: "23:59",
              fulfillmentStart: "00:00",
              fulfillmentEnd: "23:59",
            },
          ],
        },
      },
    });
  }

  console.log("Armando catálogo y pozos de stock...");
  const baseChica = await prisma.stockGroup.create({
    data: { tenantId: tenant.id, name: "Bases chicas", isIndividual: false, defaultStockQuantity: 20 },
  });
  const baseMediana = await prisma.stockGroup.create({
    data: { tenantId: tenant.id, name: "Bases medianas", isIndividual: false, defaultStockQuantity: 30 },
  });
  const baseGrande = await prisma.stockGroup.create({
    data: { tenantId: tenant.id, name: "Bases grandes", isIndividual: false, defaultStockQuantity: 35 },
  });

  // "icon" es el nombre de un ícono Lucide de una lista fija (ver
  // src/lib/category-icons.ts), no un emoji libre — CategoryIcon.tsx cae al
  // ícono default (UtensilsCrossed) para cualquier valor que no matchee.
  const pizzas = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Pizzas", icon: "Pizza" } });
  const bebidas = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Bebidas", icon: "CupSoda" } });
  const sandwiches = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Sandwiches", icon: "Sandwich" } });
  const empanadasCat = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Empanadas", icon: "Croissant" } });

  type PizzaDef = { name: string; photo: string; prices: [number, number, number] };
  const pizzaDefs: PizzaDef[] = [
    { name: "Margarita", photo: PHOTOS.margarita, prices: [6800, 9200, 11800] },
    { name: "Muzzarella", photo: PHOTOS.muzzarela, prices: [6500, 8900, 11500] },
    { name: "Napolitana", photo: PHOTOS.napolitana, prices: [7200, 9800, 12500] },
    { name: "Roquefort", photo: PHOTOS.roque, prices: [8200, 11000, 14200] },
  ];
  for (const p of pizzaDefs) {
    await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: pizzas.id,
        name: p.name,
        active: true,
        images: { create: [{ url: p.photo, order: 0 }] },
        variants: {
          create: [
            { tamano: "Chica", price: p.prices[0], order: 0, stockGroupId: baseChica.id },
            { tamano: "Mediana", price: p.prices[1], order: 1, stockGroupId: baseMediana.id },
            { tamano: "Grande", price: p.prices[2], order: 2, stockGroupId: baseGrande.id },
          ],
        },
      },
    });
  }

  const empanadaFlavors = [
    { gusto: "Carne", price: 900 },
    { gusto: "Jamón y queso", price: 900 },
    { gusto: "Verdura", price: 850 },
    { gusto: "Humita", price: 850 },
  ];
  const empanadaPools = await Promise.all(
    empanadaFlavors.map((f) =>
      prisma.stockGroup.create({
        data: { tenantId: tenant.id, name: `Empanadas de ${f.gusto.toLowerCase()}`, isIndividual: true, defaultStockQuantity: 50 },
      }),
    ),
  );
  const empanadasProduct = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: empanadasCat.id,
      name: "Empanadas",
      active: true,
      images: { create: [{ url: PHOTOS.empanada, order: 0 }] },
      variants: {
        create: empanadaFlavors.map((f, i) => ({
          gusto: f.gusto,
          price: f.price,
          order: i,
          stockGroupId: empanadaPools[i].id,
        })),
      },
    },
    include: { variants: true },
  });
  const empanadaVariants = empanadasProduct.variants.map((v) => ({ id: v.id, price: Number(v.price), stockGroupId: v.stockGroupId }));

  const bebidaDefs = [
    { name: "Coca-Cola 500ml", photo: PHOTOS.coca, price: 1800 },
    { name: "Cerveza 1L", photo: PHOTOS.cerveza, price: 3200 },
  ];
  const bebidaVariants: { id: string; price: number }[] = [];
  for (const b of bebidaDefs) {
    // Bebidas: pozo individual "sin límite" (defaultStockQuantity null) —
    // no se trackea, casi nunca se agotan de verdad.
    const pool = await prisma.stockGroup.create({
      data: { tenantId: tenant.id, name: b.name, isIndividual: true, defaultStockQuantity: null },
    });
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: bebidas.id,
        name: b.name,
        active: true,
        images: { create: [{ url: b.photo, order: 0 }] },
        variants: { create: [{ price: b.price, order: 0, stockGroupId: pool.id }] },
      },
      include: { variants: true },
    });
    bebidaVariants.push({ id: product.variants[0].id, price: b.price });
  }

  // Sandwiches: pozo individual CON límite por cada tamaño — a diferencia de
  // las bebidas, sí se preparan en tanda y se pueden agotar en el día.
  const sandwichVariants: { id: string; price: number; stockGroupId: string }[] = [];
  const sandwichPools: Awaited<ReturnType<typeof prisma.stockGroup.create>>[] = [];

  const hamburguesaSizes: { tamano: string; price: number; defaultStock: number }[] = [
    { tamano: "Simple", price: 8000, defaultStock: 25 },
    { tamano: "Doble", price: 9500, defaultStock: 20 },
    { tamano: "Triple", price: 11500, defaultStock: 12 },
  ];
  const hamburguesaPools = await Promise.all(
    hamburguesaSizes.map((s) =>
      prisma.stockGroup.create({
        data: { tenantId: tenant.id, name: `Hamburguesa ${s.tamano.toLowerCase()}`, isIndividual: true, defaultStockQuantity: s.defaultStock },
      }),
    ),
  );
  sandwichPools.push(...hamburguesaPools);
  const hamburguesaProduct = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: sandwiches.id,
      name: "Hamburguesa Cheddar",
      active: true,
      images: { create: [{ url: PHOTOS.hamburguesa, order: 0 }] },
      variants: {
        create: hamburguesaSizes.map((s, i) => ({
          tamano: s.tamano,
          price: s.price,
          order: i,
          stockGroupId: hamburguesaPools[i].id,
        })),
      },
    },
    include: { variants: true },
  });
  for (const v of hamburguesaProduct.variants) {
    sandwichVariants.push({ id: v.id, price: Number(v.price), stockGroupId: v.stockGroupId });
  }

  const lomitoPool = await prisma.stockGroup.create({
    data: { tenantId: tenant.id, name: "Lomito completo", isIndividual: true, defaultStockQuantity: 25 },
  });
  sandwichPools.push(lomitoPool);
  const lomitoProduct = await prisma.product.create({
    data: {
      tenantId: tenant.id,
      categoryId: sandwiches.id,
      name: "Lomito completo",
      active: true,
      images: { create: [{ url: PHOTOS.lomito, order: 0 }] },
      variants: { create: [{ price: 11000, order: 0, stockGroupId: lomitoPool.id }] },
    },
    include: { variants: true },
  });
  sandwichVariants.push({ id: lomitoProduct.variants[0].id, price: 11000, stockGroupId: lomitoPool.id });

  // Todas las variantes reales de pizza (con su id, precio y pozo), para
  // armar pedidos de ejemplo abajo.
  const allPizzaVariants = await prisma.productVariant.findMany({
    where: { product: { tenantId: tenant.id, categoryId: pizzas.id } },
    select: { id: true, price: true, stockGroupId: true },
  });

  await prisma.pointsRule.create({
    data: { tenantId: tenant.id, pointsPerAmount: 0.01 }, // 1 punto cada $100
  });
  await prisma.coupon.create({
    data: {
      tenantId: tenant.id,
      code: "BIENVENIDA10",
      discountType: "PERCENT",
      discountValue: 10,
      pointsCost: 0,
      active: true,
    },
  });

  console.log("Generando historial de pedidos (últimos días hábiles)...");
  const historyDays = pastDays(9);
  const allPools = [baseChica, baseMediana, baseGrande, ...empanadaPools, ...sandwichPools];
  let guestIdx = 0;

  for (const day of historyDays) {
    const deliveryDate = await prisma.deliveryDate.create({
      data: { tenantId: tenant.id, date: day, status: "CLOSED", stockMode: "BY_GROUP" },
    });

    // Stock del día para cada pozo (mismo criterio que seedDefaultStock).
    for (const pool of allPools) {
      if (pool.defaultStockQuantity == null) continue;
      await prisma.stockGroupStock.create({
        data: { stockGroupId: pool.id, deliveryDateId: deliveryDate.id, quantityAvailable: pool.defaultStockQuantity },
      });
    }

    const ordersToday = 2 + Math.floor(Math.random() * 2); // 2 o 3
    for (let i = 0; i < ordersToday; i++) {
      const itemCount = 1 + Math.floor(Math.random() * 2); // 1 o 2 ítems
      const catalog = [...allPizzaVariants, ...empanadaVariants, ...bebidaVariants, ...sandwichVariants];
      const picks = Array.from({ length: itemCount }, () => {
        const pick = catalog[Math.floor(Math.random() * catalog.length)];
        return { variantId: pick.id, price: Number(pick.price), quantity: 1 + Math.floor(Math.random() * 2) };
      });
      const subtotal = picks.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const deliveryFee = 800;
      const total = subtotal + deliveryFee;

      const asCustomer = i % 2 === 0;
      const guest = GUEST_NAMES[guestIdx % GUEST_NAMES.length];
      guestIdx++;
      const createdAt = new Date(day);
      createdAt.setHours(19 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));

      await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            tenantId: tenant.id,
            userId: asCustomer ? customer.id : null,
            guestName: asCustomer ? null : guest.name,
            guestEmail: asCustomer ? null : `${guest.name.split(" ")[0].toLowerCase()}@example.com`,
            deliveryDateId: deliveryDate.id,
            fulfillmentType: "DELIVERY",
            deliveryAddress: guest.address,
            deliveryPhone: guest.phone,
            status: "DELIVERED",
            paymentMethod: "CASH_ON_DELIVERY",
            subtotal,
            deliveryFee,
            total,
            createdAt,
            items: { create: picks.map((p) => ({ productVariantId: p.variantId, quantity: p.quantity, unitPrice: p.price })) },
          },
        });

        // Bebidas no tienen fila de stock (pozo "sin límite" a propósito) —
        // no hay nada que descontar para esas, se saltean.
        const byGroup = new Map<string, number>();
        for (const p of picks) {
          const stockGroupId = [...allPizzaVariants, ...empanadaVariants, ...sandwichVariants].find(
            (v) => v.id === p.variantId,
          )?.stockGroupId;
          if (!stockGroupId) continue;
          byGroup.set(stockGroupId, (byGroup.get(stockGroupId) ?? 0) + p.quantity);
        }
        for (const [stockGroupId, quantity] of byGroup) {
          const before = await tx.stockGroupStock.findUnique({
            where: { stockGroupId_deliveryDateId: { stockGroupId, deliveryDateId: deliveryDate.id } },
          });
          if (!before) continue;
          await tx.stockGroupStock.update({
            where: { stockGroupId_deliveryDateId: { stockGroupId, deliveryDateId: deliveryDate.id } },
            data: { quantitySold: { increment: quantity } },
          });
          await logGroupStockMovement(tx, {
            tenantId: tenant.id,
            deliveryDateId: deliveryDate.id,
            stockGroupId,
            reason: "SALE",
            delta: -quantity,
            note: `Pedido ${created.id}`,
          });
        }

        if (asCustomer) await awardPointsForOrder(tx, created);
      });
    }
  }

  console.log(`Listo — https://${subdomain}.${process.env.ROOT_DOMAIN ?? "localhost:3010"}`);
}

async function main() {
  for (const subdomain of DEMO_SUBDOMAINS) {
    await seedOneDemoTenant(subdomain);
  }
  console.log(`\nTodo listo ✅ (${DEMO_SUBDOMAINS.length} copias)`);
  console.log(`Entrada única: https://${process.env.ROOT_DOMAIN ?? "localhost:3010"}/demo`);
  console.log(`Admin de cada copia: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Cliente demo (para ver Puntos): ${CUSTOMER_EMAIL} / Cliente1234!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
