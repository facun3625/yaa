import Image from "next/image";
import { ArrowRight, BarChart3, Bot, CalendarDays, Check, ClipboardList, Handshake, Headphones, PackageOpen, Pizza, ShieldCheck, Sparkles, Store, Truck, Utensils, Zap } from "lucide-react";
import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";
import { YaaReveal } from "@/components/marketing/yaa-reveal";
import { YaaFaqList } from "@/components/marketing/yaa-faq-list";

const contactHref = "mailto:hola@yaa.com.ar?subject=Quiero%20mi%20tienda%20online%20con%20YAA";
const signupHref = "/registro";

const features = [
  { icon: Store, title: "Tu menú, con tu identidad", description: "Mostrá productos, categorías, fotos, gustos, tamaños, adicionales y precios en un espacio propio para tu negocio." },
  { icon: ClipboardList, title: "Todos los pedidos en orden", description: "Recibí ventas, revisá pagos y seguí cada pedido desde que ingresa hasta que se entrega." },
  { icon: PackageOpen, title: "Stock que se adapta a vos", description: "Trabajá con stock individual, compartido entre productos o sin límite, según cómo vendas." },
  { icon: CalendarDays, title: "Vendé todos los días o por fecha", description: "Configurá horarios semanales o abrí ventas puntuales con fecha, cupos y cierre de pedidos." },
  { icon: Truck, title: "Delivery, retiro y pagos", description: "Ofrecé entrega a domicilio o retiro y cobrá en efectivo, por transferencia, Mercado Pago o Payway." },
  { icon: BarChart3, title: "Números para decidir mejor", description: "Consultá ventas, productos destacados, costos y resultados por período o fecha de entrega." },
];

const plans = [
  {
    name: "Esencial",
    description: "Para empezar a recibir pedidos online de forma profesional.",
    monthly: "$ 14.900",
    yearly: "$ 149.000 al año",
    featured: false,
    features: ["Tienda y pedidos ilimitados", "1 usuario administrador", "Catálogo con fotos y variantes", "Efectivo, transferencia, Mercado Pago y Payway", "Delivery, retiro y gestión de clientes"],
  },
  {
    name: "Negocio",
    description: "Para organizar una operación que ya está creciendo.",
    monthly: "$ 24.900",
    yearly: "$ 249.000 al año",
    featured: true,
    features: ["Todo lo incluido en Esencial", "Hasta 3 administradores", "Stock individual y compartido", "Ventas programadas y cupos", "Cupones, puntos y estadísticas"],
  },
  {
    name: "Pro",
    description: "Para negocios con más equipo, servicios y automatización.",
    monthly: "$ 39.900",
    yearly: "$ 399.000 al año",
    featured: false,
    features: ["Todo lo incluido en Negocio", "Administradores ilimitados", "Servicios y presupuestos", "Costos y resultados avanzados", "Avisos por email y Telegram"],
  },
];

const portfolio = [
  {
    icon: Pizza,
    business: "Pizzería y rotisería",
    title: "Menos mensajes, pedidos más claros",
    description: "Un catálogo con gustos, tamaños y stock organizado para recibir cada pedido con toda la información necesaria.",
    result: "Pedidos centralizados",
  },
  {
    icon: Sparkles,
    business: "Pastelería por encargo",
    title: "Ventas por encargo, sin planillas",
    description: "Fechas de entrega, cupos y cierre automático para producir solamente lo que se vendió.",
    result: "Producción planificada",
  },
  {
    icon: Utensils,
    business: "Comercio de cercanía",
    title: "Una tienda que trabaja todos los días",
    description: "Horarios semanales, delivery, retiro y distintos medios de pago desde un único panel.",
    result: "Operación más simple",
  },
];

const faqs = [
  ["¿YAA cobra comisión por cada venta?", "No. Pagás el valor fijo de tu plan y todo lo que vendés queda en tu negocio. YAA no descuenta porcentajes por pedido."],
  ["¿Necesito instalar algo?", "No. Tu tienda y el panel funcionan online desde computadora, tablet o celular. No necesitás servidores, técnicos ni equipos especiales."],
  ["¿Cómo reciben los pedidos mis clientes?", "Compartís el enlace de tu tienda. Tus clientes eligen productos, entrega y forma de pago; vos recibís el pedido completo y lo gestionás desde el panel."],
  ["¿Puedo cobrar como trabajo actualmente?", "Sí. Podés ofrecer efectivo, transferencia, Mercado Pago o Payway y configurar delivery o retiro según tu operación."],
  ["¿Qué pasa cuando terminan los 10 días?", "Elegís si querés continuar con un plan. Antes de confirmar vas a ver claramente su precio y condiciones. No cobramos comisiones sobre tus ventas."],
  ["¿Me ayudan a poner la tienda en marcha?", "Sí. Te acompañamos para configurar lo esencial y que puedas publicar tu catálogo sin depender de conocimientos técnicos."],
];

export function YaaLanding() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#1d1713]">
      <YaaPublicNav />

      <section id="inicio" className="relative overflow-hidden scroll-mt-20 bg-[#030712] text-white">
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-16 md:pb-16 md:pt-20">
          <YaaReveal direction="left" className="lg:max-w-[47%]">
            <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Pedidos online para gastronomía y negocios de cercanía</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Vendé en tu zona sin perder tiempo ni margen.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/60">Publicá tu menú o catálogo, compartí tu enlace y recibí pedidos listos para preparar, retirar o entregar. Sin instalaciones y sin pagar una comisión por cada venta.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={signupHref} className="yaa-btn yaa-btn-primary h-12 px-6 text-base shadow-lg shadow-[#ff5a36]/20">Probar 10 días gratis <ArrowRight className="size-[18px]" /></a>
              <a href="#funcionalidades" className="yaa-btn yaa-btn-secondary h-12 px-6 text-base">Ver cómo funciona</a>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-white/50"><Check className="size-4 text-[#ff7658]" />10 días para probar · Sin instalaciones · Cancelás cuando quieras</p>

            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6">
              <div><p className="text-2xl font-extrabold">Tu menú</p><p className="mt-1 text-xs text-white/45">siempre disponible</p></div>
              <div><p className="text-2xl font-extrabold">Tu zona</p><p className="mt-1 text-xs text-white/45">retiro o delivery local</p></div>
              <div><p className="text-2xl font-extrabold">Tu margen</p><p className="mt-1 text-xs text-white/45">0% comisión de YAA</p></div>
            </div>
            </div>
          </YaaReveal>

          <YaaReveal direction="right" delay={120} className="mx-auto mt-10 w-full max-w-2xl lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-[53%] lg:-translate-y-1/2">
            <Image
              src="/yaa_mock.png"
              alt="Tienda YAA vista en computadora y celular"
              width={1448}
              height={1086}
              priority
              className="h-auto max-h-[430px] w-full object-contain"
            />
          </YaaReveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 md:py-16">
        <YaaReveal direction="left">
          <div className="grid gap-8 rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(29,23,19,.06)] md:grid-cols-[220px_1fr] md:items-center md:p-8">
          <div>
            <p className="text-5xl font-black tracking-tight text-[#ff5a36] md:text-6xl">0%</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-[.16em] text-[#1d1713]">de comisión</p>
          </div>
          <div className="md:border-l md:border-black/10 md:pl-8">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Cuanto más vendés, más te conviene.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-black/55">
              Pagás una suscripción fija y nada más. Sin comisión por pedido, sin sorpresas al cierre del mes y sin castigar el crecimiento de tu negocio.
            </p>
          </div>
          </div>
        </YaaReveal>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Cómo funciona</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Del menú a la entrega, todo conectado</h2>
          <p className="mt-4 leading-relaxed text-black/55">YAA nació para gastronomía: horarios, gustos, tamaños, stock, producción, retiro y delivery cercano. También se adapta a emprendimientos y comercios locales que trabajan con una operación similar.</p>
          <p className="mt-5 border-l-2 border-[#ff5a36] pl-4 text-base font-semibold text-black/75">Creá tu cuenta y empezá a vender. Sin instalaciones, sin técnicos y sin equipos especiales.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Armá tu menú o catálogo", "Cargá productos, gustos, tamaños, adicionales, fotos, precios y la identidad de tu negocio."],
            ["02", "Definí cómo entregás", "Elegí horarios, fechas, stock, cupos, delivery cercano, retiro y medios de pago."],
            ["03", "Compartí tu enlace", "Tus clientes entran desde cualquier dispositivo, compran y envían su pedido."],
            ["04", "Gestioná y analizá", "Actualizá estados, prepará entregas y entendé qué productos generan mejores resultados."],
          ].map(([number, title, text]) => (
            <YaaReveal key={number} direction="up" delay={(Number(number) - 1) * 90}>
              <article className="border-t border-black/10 pt-5">
                <span className="text-xs font-black text-[#ff5a36]">{number}</span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/50">{text}</p>
              </article>
            </YaaReveal>
          ))}
        </div>
      </section>

      <section className="bg-[#0d3b3b] py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <YaaReveal direction="left"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#ff9b84]">De los mensajes al control</p><h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">WhatsApp sirve para conversar. YAA, para tomar pedidos en orden.</h2><p className="mt-5 leading-relaxed text-white/65">Evitá repetir el menú, consultar gustos, completar direcciones y buscar comprobantes. Cada cliente arma su pedido y vos recibís toda la información lista para preparar.</p></div></YaaReveal>
            <YaaReveal direction="right" delay={100}><div className="overflow-hidden rounded-2xl border border-white/15 bg-white/5">
              {[["Por mensajes", "Con YAA"], ["Preguntas y precios enviados uno por uno", "Catálogo disponible todo el día"], ["Pedidos incompletos o mezclados", "Datos claros en cada pedido"], ["Stock y fechas difíciles de controlar", "Cupos, horarios y stock configurados"], ["Difícil saber qué se vendió", "Resultados y productos destacados"]].map(([before, after], index) => <div key={before} className={`grid grid-cols-2 gap-4 px-5 py-4 ${index ? "border-t border-white/10 text-sm" : "bg-white/10 text-xs font-black uppercase tracking-wider"}`}><span className={index ? "text-white/45" : "text-white/55"}>{before}</span><span className={index ? "font-semibold text-white" : "text-[#ffb19f]"}>{after}</span></div>)}
            </div></YaaReveal>
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="scroll-mt-20 bg-[#f5f3ef] py-24 text-[#151515]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 grid gap-6 md:grid-cols-[1fr_420px] md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#e84220]">Todo en un solo lugar</p>
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">No sólo recibas pedidos. Hacé que tu negocio funcione mejor.</h2>
            </div>
            <p className="text-sm leading-relaxed text-black/55">YAA conecta lo que ve tu cliente con lo que necesita tu cocina o equipo: menú, pedido, cobro, preparación, retiro o entrega y resultados.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }, index) => (
              <YaaReveal key={title} direction={index % 2 === 0 ? "left" : "right"} delay={(index % 4) * 70} className={index < 2 ? "lg:col-span-2" : "lg:col-span-1"}>
                <article className={`h-full rounded-2xl border border-black/8 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,.05)] ${index < 2 ? "lg:min-h-64 lg:p-8" : ""}`}>
                  <div className={`mb-5 flex items-center justify-center rounded-xl bg-[#ff5a36]/10 text-[#e84220] ${index < 2 ? "size-12" : "size-10"}`}><Icon className={index < 2 ? "size-6" : "size-5"} /></div>
                  <h3 className={`${index < 2 ? "text-2xl" : "text-lg"} font-extrabold tracking-tight`}>{title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-black/55">{description}</p>
                  {index === 0 && <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#e84220]">Tu marca · Tu enlace · Tus clientes</p>}
                  {index === 1 && <p className="mt-6 text-xs font-bold uppercase tracking-wider text-[#e84220]">Menos mensajes · Menos errores</p>}
                </article>
              </YaaReveal>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl bg-[#0d3b3b] px-6 py-5 text-sm text-white/75">
            {[
              "Clientes, cupones y puntos",
              "Servicios y presupuestos",
              "Avisos por email y Telegram",
              "Resumen de producción",
            ].map((item) => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-[#ff7658]" />{item}</span>)}
          </div>
        </div>
      </section>

      <section id="clientes" className="scroll-mt-20 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6"><div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Pensado para negocios cercanos</p>
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight">Nació para gastronomía. Se adapta a tu rubro.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-black/50">Ideal para quienes producen, venden y entregan en su ciudad o zona. No intenta ser un marketplace ni un e-commerce masivo con miles de productos y logística nacional.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {portfolio.map(({ icon: Icon, business, title, description, result }) => (
            <YaaReveal key={business} direction="up" delay={portfolio.findIndex((item) => item.business === business) * 100}>
              <article className="flex min-h-72 flex-col rounded-2xl border border-black/10 bg-[#f5f0e8] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff5a36]/10 text-[#ff7658]"><Icon className="size-5" /></div>
                  <span className="rounded-full border border-black/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black/40">Ejemplo de uso</span>
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[#ff7658]">{business}</p>
                <h3 className="mt-3 text-xl font-bold leading-snug">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-black/50">{description}</p>
                <div className="mt-auto border-t border-black/10 pt-5"><p className="flex items-center gap-2 text-sm font-semibold"><Check className="size-4 text-[#e84220]" />{result}</p></div>
              </article>
            </YaaReveal>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-black/10 bg-[#f5f0e8] px-6 py-5 text-center">
          <p className="text-sm font-semibold">¿No sabés si YAA sirve para tu negocio?</p>
          <a href={contactHref} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#ff7658] hover:text-[#ff5a36]">Contanos cómo vendés y te orientamos <ArrowRight className="size-4" /></a>
        </div></div>
      </section>

      <section id="precios" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Precios</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Elegí cómo querés hacer crecer tu negocio</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-black/50">Todos los planes incluyen 10 días de prueba y 0% de comisión por venta. En el pago anual abonás diez meses y usás YAA durante doce.</p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <YaaReveal key={plan.name} direction={plan.featured ? "up" : plans[0] === plan ? "left" : "right"} delay={plans.indexOf(plan) * 90}>
              <article className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-[0_14px_40px_rgba(29,23,19,.06)] ${plan.featured ? "border-[#ff5a36]" : "border-black/10"}`}>
                {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-[#ff5a36] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Más elegido</span>}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-black/45">{plan.description}</p>
                <div className="mt-5 flex items-end gap-1"><span className="text-3xl font-black tracking-tight">{plan.monthly}</span><span className="pb-1 text-xs text-black/45">/mes</span></div>
                <p className="mt-1 text-xs font-medium text-[#ff7658]">o {plan.yearly}</p>
                <ul className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-5">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs text-black/65"><Check className="mt-0.5 size-3.5 shrink-0 text-[#e84220]" />{feature}</li>)}
                </ul>
                <a href={signupHref} className={`yaa-btn mt-6 w-full justify-center ${plan.featured ? "yaa-btn-primary" : "border-black/15! bg-[#1d1713]! text-white hover:bg-black!"}`}>Probar 10 días gratis</a>
              </article>
            </YaaReveal>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-xl border border-black/10 bg-white p-5">
          <Bot className="mt-0.5 size-5 shrink-0 text-[#e84220]" />
          <div><p className="text-sm font-bold">Asistente con IA para tu tienda</p><p className="mt-1 text-sm leading-relaxed text-black/50">Próximamente como módulo adicional: entrenado con la información de cada negocio, con límites de uso y derivación a una persona cuando sea necesario.</p></div>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-black/45">YAA no descuenta porcentajes de tus ventas. Mercado Pago, Payway u otros proveedores pueden aplicar sus propios cargos según la modalidad que contrates con ellos.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {[
            [Zap, "Empezás sin instalaciones", "Creás tu cuenta, configurás lo esencial y compartís el enlace de tu tienda."],
            [Headphones, "Acompañamiento humano", "Te ayudamos a elegir el plan y resolver las dudas de la puesta en marcha."],
            [ShieldCheck, "Sin atarte a tus ventas", "Precio claro, 0% de comisión y libertad para crecer sin pagar más por vender más."],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Zap;
            return <div key={String(title)} className="rounded-xl border border-black/10 bg-white p-5"><FeatureIcon className="size-5 text-[#e84220]" /><p className="mt-4 text-sm font-bold">{String(title)}</p><p className="mt-2 text-xs leading-relaxed text-black/45">{String(text)}</p></div>;
          })}
        </div>
      </section>

      <section id="socios" className="relative scroll-mt-20 overflow-hidden bg-[#ff5a36] py-24 text-white md:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-24 select-none text-[18rem] font-black leading-none text-white/[.08] md:text-[28rem]">%</div>
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-10 inline-flex -rotate-1 items-center gap-2 rounded-full bg-[#ffd85a] px-5 py-2 text-xs font-black uppercase tracking-[.18em] text-[#1d1713] shadow-[5px_5px_0_#0d3b3b]"><Handshake className="size-4" />También podés ganar recomendando YAA</div>
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <YaaReveal direction="left"><div>
              <div className="text-sm font-black uppercase tracking-[.18em]">Programa de socios comerciales</div>
              <h2 className="mt-6 max-w-3xl text-5xl font-black leading-[.98] tracking-[-.05em] md:text-7xl">Convertí tus contactos en un ingreso recurrente.</h2>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/85">Presentá YAA a locales gastronómicos y negocios de cercanía. Ganás al activarlos y volvés a ganar cada vez que renuevan.</p>

              <div className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl bg-[#ffd85a] px-5 py-4 text-[#1d1713] shadow-[6px_6px_0_#0d3b3b]">
                <span className="text-3xl font-black">$74.700/mes</span>
                <span className="max-w-44 text-xs font-bold leading-snug">estimados con 15 clientes activos en Plan Negocio</span>
              </div>

              <div className="mt-10 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/30 bg-white/30 sm:grid-cols-3">
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">1 mes</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">de bono por activación</p></div>
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">15%</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">recurrente inicial</p></div>
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">25%</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">al crecer tu cartera</p></div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/revendedores" className="inline-flex h-14 items-center gap-2 rounded-xl bg-[#0d3b3b] px-7 text-base font-black text-white shadow-[5px_5px_0_rgba(255,255,255,.35)] transition hover:-translate-y-1">Quiero generar ingresos <ArrowRight className="size-[18px]" /></a>
                <a href="/revendedores#condiciones" className="inline-flex h-12 items-center rounded-xl border border-white/45 px-6 font-bold text-white transition hover:bg-white/10">Ver programa completo</a>
              </div>
            </div></YaaReveal>

            <YaaReveal direction="right" delay={120}><aside id="condiciones-socios" className="rounded-2xl bg-[#0d3b3b] p-6 text-white md:p-7">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#ff7658]">Condiciones principales</p>
              <h3 className="mt-3 text-xl font-extrabold">Claro desde el primer cliente</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {[
                  "15% sobre cada suscripción efectivamente cobrada.",
                  "20% desde 15 clientes activos y 25% desde 40.",
                  "Un mes de bono cuando el cliente completa 60 días pagos.",
                  "El pago anual genera comisión anual; el mensual, en cada renovación.",
                  "La atribución continúa mientras el cliente permanezca activo y pagado.",
                  "Descuentos, devoluciones, impuestos y contracargos no generan comisión.",
                  "No se permiten autorreferencias ni comisiones por reclutar vendedores.",
                ].map((term) => <li key={term} className="flex items-start gap-3 text-sm leading-relaxed text-white/65"><Check className="mt-0.5 size-4 shrink-0 text-[#ff7658]" />{term}</li>)}
              </ul>
              <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/35">Resumen comercial sujeto a los términos definitivos del programa y a la validación fiscal correspondiente.</p>
            </aside></YaaReveal>
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-24 pt-8">
        <div className="rounded-3xl bg-[#ffd85a] px-6 py-12 text-center md:px-12 md:py-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Hablemos</p>
            <h2 className="mx-auto max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">Tu tienda puede empezar acá.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-black/55">Contanos sobre tu negocio y te ayudamos a encontrar la mejor forma de llevarlo online.</p>
            <a href={contactHref} className="yaa-btn yaa-btn-primary mt-8 h-12 px-6">Escribinos <ArrowRight className="size-[18px]" /></a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Preguntas frecuentes</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Todo claro antes de empezar</h2>
        </div>
        <YaaFaqList items={faqs} />
        <div className="mt-7 text-center"><a href="/preguntas-frecuentes" className="inline-flex items-center gap-2 font-bold text-[#e84220] transition hover:text-[#ff5a36]">Ver todas las preguntas <ArrowRight className="size-4" /></a></div>
      </section>

      <YaaPublicFooter />
    </main>
  );
}
