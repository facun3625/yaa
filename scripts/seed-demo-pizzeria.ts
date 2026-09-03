// Crea (o recrea desde cero) una tienda demo completa — "Pizzería Demo" —
// para mostrarle el panel y la tienda a cualquier prospecto sin usar datos
// reales. Re-ejecutable: si "demo" ya existe, la borra entera primero (mismo
// orden de borrado que deleteTenant en platform/tiendas/[tenantId]/actions.ts)
// y la vuelve a armar de cero.
//
// Uso: npx tsx --env-file=.env scripts/seed-demo-pizzeria.ts
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { logGroupStockMovement } from "@/lib/stock-movements";
import { awardPointsForOrder } from "@/lib/points";

const SUBDOMAIN = "demo";
const ADMIN_EMAIL = "demo@yaa.com.ar";
const ADMIN_PASSWORD = "Demo1234!";
const CUSTOMER_EMAIL = "cliente@demo.yaa.com.ar";

const img = (path: string) => `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}`;

const PHOTOS = {
  muzzarella: img("d/de/Margherita_pizza_on_plate.jpg/960px-Margherita_pizza_on_plate.jpg"),
  napolitana: img("4/46/Pizza-napoletana.jpg/960px-Pizza-napoletana.jpg"),
  fugazzeta: img("7/7e/Vegetarian_Pizza.jpg/960px-Vegetarian_Pizza.jpg"),
  especial: img("a/a1/Pizza_Tradici%C3%B3n_Napolitana.jpg/960px-Pizza_Tradici%C3%B3n_Napolitana.jpg"),
  empanadas: img("d/d6/Fried_Argentine_beef_empanadas.jpg/960px-Fried_Argentine_beef_empanadas.jpg"),
  cocaCola: img("a/ad/Mexican_Coca_Cola.jpg/960px-Mexican_Coca_Cola.jpg"),
  aguaConGas: img("7/7e/San_Pellegrino_bottle_for_sparkling_water_.jpg/960px-San_Pellegrino_bottle_for_sparkling_water_.jpg"),
  cerveza: img("1/11/Beer_bottles_2018_G1.jpg/960px-Beer_bottles_2018_G1.jpg"),
  tiramisu: img("0/0d/Tiramisu_dessert.jpg/960px-Tiramisu_dessert.jpg"),
  flan: img("4/43/Homemade_Flan.jpg/960px-Homemade_Flan.jpg"),
  helado: img("9/9c/A_Cup_of_Chocolate_Ice_Cream_from_dinner_meal.jpg/960px-A_Cup_of_Chocolate_Ice_Cream_from_dinner_meal.jpg"),
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

async function main() {
  const existing = await prisma.tenant.findUnique({ where: { subdomain: SUBDOMAIN } });
  if (existing) {
    console.log(`Ya existía "${SUBDOMAIN}" (${existing.id}) — borrando para recrear...`);
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
      subdomain: SUBDOMAIN,
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
      { tenantId: tenant.id, key: "store_cover_url", value: PHOTOS.napolitana },
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
  const postresPool = await prisma.stockGroup.create({
    data: { tenantId: tenant.id, name: "Postres del día", isIndividual: false, defaultStockQuantity: 20 },
  });

  const pizzas = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Pizzas", icon: "🍕" } });
  const empanadasCat = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Empanadas", icon: "🥟" } });
  const bebidas = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Bebidas", icon: "🥤" } });
  const postres = await prisma.productCategory.create({ data: { tenantId: tenant.id, name: "Postres", icon: "🍰" } });

  type PizzaDef = { name: string; photo: string; prices: [number, number, number] };
  const pizzaDefs: PizzaDef[] = [
    { name: "Muzzarella", photo: PHOTOS.muzzarella, prices: [6500, 8900, 11500] },
    { name: "Napolitana", photo: PHOTOS.napolitana, prices: [7200, 9800, 12500] },
    { name: "Fugazzeta", photo: PHOTOS.fugazzeta, prices: [7500, 10200, 13000] },
    { name: "Especial (jamón y morrones)", photo: PHOTOS.especial, prices: [7800, 10500, 13500] },
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
      images: { create: [{ url: PHOTOS.empanadas, order: 0 }] },
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
    { name: "Coca-Cola 500ml", photo: PHOTOS.cocaCola, price: 1800 },
    { name: "Agua con gas 500ml", photo: PHOTOS.aguaConGas, price: 1500 },
    { name: "Cerveza Rubia 1L", photo: PHOTOS.cerveza, price: 3200 },
  ];
  const bebidaVariants: { id: string; price: number }[] = [];
  for (const b of bebidaDefs) {
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

  const postreDefs = [
    { name: "Flan casero", photo: PHOTOS.flan, price: 2800 },
    { name: "Tiramisú", photo: PHOTOS.tiramisu, price: 3500 },
    { name: "Helado 1/4kg", photo: PHOTOS.helado, price: 3200 },
  ];
  const postreVariants: { id: string; price: number }[] = [];
  for (const p of postreDefs) {
    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: postres.id,
        name: p.name,
        active: true,
        images: { create: [{ url: p.photo, order: 0 }] },
        variants: { create: [{ price: p.price, order: 0, stockGroupId: postresPool.id }] },
      },
      include: { variants: true },
    });
    postreVariants.push({ id: product.variants[0].id, price: p.price });
  }

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
  const allPools = [baseChica, baseMediana, baseGrande, ...empanadaPools, postresPool];
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
      const catalog = [...allPizzaVariants, ...empanadaVariants, ...bebidaVariants, ...postreVariants];
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
          const stockGroupId =
            [...allPizzaVariants, ...empanadaVariants].find((v) => v.id === p.variantId)?.stockGroupId ??
            (postreVariants.some((v) => v.id === p.variantId) ? postresPool.id : null);
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

  console.log("\nListo ✅");
  console.log(`Tienda: https://${SUBDOMAIN}.${process.env.ROOT_DOMAIN ?? "localhost:3010"}`);
  console.log(`Admin:  https://${SUBDOMAIN}.${process.env.ROOT_DOMAIN ?? "localhost:3010"}/login`);
  console.log(`  usuario: ${ADMIN_EMAIL}`);
  console.log(`  clave:   ${ADMIN_PASSWORD}`);
  console.log(`Cliente demo (para ver Puntos): ${CUSTOMER_EMAIL} / Cliente1234!`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
