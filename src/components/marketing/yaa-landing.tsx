import Image from "next/image";
import { ArrowRight, BarChart3, Bot, CalendarDays, Check, ClipboardList, Handshake, PackageOpen, Pizza, Sparkles, Store, Truck, Utensils } from "lucide-react";
import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";
import { YaaReveal } from "@/components/marketing/yaa-reveal";

const contactHref = "mailto:hola@yaa.com.ar?subject=Quiero%20mi%20tienda%20online%20con%20YAA";
const signupHref = "/registro";

const features = [
  { icon: Store, title: "Tu tienda, con tu identidad", description: "Mostrá productos, categorías, fotos, sabores, tamaños y precios en un espacio propio para tu negocio." },
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
    business: "Pizzería",
    title: "Menos mensajes, pedidos más claros",
    description: "Un catálogo con gustos, tamaños y stock organizado para recibir cada pedido con toda la información necesaria.",
    result: "Pedidos centralizados",
  },
  {
    icon: Sparkles,
    business: "Emprendimiento",
    title: "Ventas por encargo, sin planillas",
    description: "Fechas de entrega, cupos y cierre automático para producir solamente lo que se vendió.",
    result: "Producción planificada",
  },
  {
    icon: Utensils,
    business: "Gastronomía",
    title: "Una tienda que trabaja todos los días",
    description: "Horarios semanales, delivery, retiro y distintos medios de pago desde un único panel.",
    result: "Operación más simple",
  },
];

export function YaaLanding() {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <YaaPublicNav />

      <section id="inicio" className="relative overflow-hidden scroll-mt-20">
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-16 md:pb-16 md:pt-20">
          <YaaReveal direction="left" className="lg:max-w-[47%]">
            <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Una tienda online para tu negocio</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">Recibí pedidos online sin complicar tu día.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/55">YAA reúne tu catálogo, tus pedidos y tus clientes en un solo lugar. Una herramienta simple para vos y una compra fácil para tus clientes.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={signupHref} className="yaa-btn yaa-btn-primary h-12 px-6 text-base shadow-lg shadow-[#ff5a36]/20">Probar 10 días gratis <ArrowRight className="size-[18px]" /></a>
              <a href="#funcionalidades" className="yaa-btn yaa-btn-secondary h-12 px-6 text-base">Ver cómo funciona</a>
            </div>

            <div className="mt-14 flex flex-wrap gap-x-10 gap-y-6">
              <div><p className="text-2xl font-extrabold">Simple</p><p className="mt-1 text-xs text-white/45">sin instalaciones</p></div>
              <div><p className="text-2xl font-extrabold">Online</p><p className="mt-1 text-xs text-white/45">desde cualquier dispositivo</p></div>
              <div><p className="text-2xl font-extrabold">A tu manera</p><p className="mt-1 text-xs text-white/45">con tu identidad</p></div>
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

      <section className="mx-auto max-w-6xl px-6 py-8 md:py-10">
        <YaaReveal direction="left">
          <div className="yaa-card grid gap-8 border-[#ff5a36]/25! md:grid-cols-[220px_1fr] md:items-center md:p-8!">
          <div>
            <p className="text-5xl font-black tracking-tight text-[#ff5a36] md:text-6xl">0%</p>
            <p className="mt-1 text-sm font-bold uppercase tracking-[.16em] text-white">de comisión</p>
          </div>
          <div className="md:border-l md:border-white/10 md:pl-8">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Tus ventas son tuyas.</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-white/55">
              Pagás una suscripción fija y nada más. No cobramos un porcentaje por pedido ni una comisión sobre lo que vendés: cuanto más crece tu negocio, más aprovechás YAA.
            </p>
          </div>
          </div>
        </YaaReveal>
      </section>

      <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mb-10 max-w-3xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Cómo funciona</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Del catálogo a la entrega, todo conectado</h2>
          <p className="mt-4 leading-relaxed text-white/50">YAA no es solamente una vidriera. Es el lugar desde donde configurás cómo vender, recibís cada pedido y seguís el trabajo de tu negocio.</p>
          <p className="mt-5 border-l-2 border-[#ff5a36] pl-4 text-base font-semibold text-white/80">Creá tu cuenta y empezá a vender. Sin instalaciones, sin técnicos y sin equipos especiales.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["01", "Armá tu tienda", "Cargá productos, variantes, fotos, precios y la identidad visual de tu negocio."],
            ["02", "Definí cómo vendés", "Elegí horarios, fechas, stock, cupos, delivery, retiro y medios de pago."],
            ["03", "Compartí tu enlace", "Tus clientes entran desde cualquier dispositivo, compran y envían su pedido."],
            ["04", "Gestioná y analizá", "Actualizá estados, prepará entregas y entendé qué productos generan mejores resultados."],
          ].map(([number, title, text]) => (
            <YaaReveal key={number} direction="up" delay={(Number(number) - 1) * 90}>
              <article className="border-t border-white/10 pt-5">
                <span className="text-xs font-black text-[#ff5a36]">{number}</span>
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p>
              </article>
            </YaaReveal>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="scroll-mt-20 bg-[#f5f3ef] py-24 text-[#151515]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 grid gap-6 md:grid-cols-[1fr_420px] md:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#e84220]">Todo en un solo lugar</p>
              <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight md:text-4xl">No sólo recibas pedidos. Hacé que tu negocio funcione mejor.</h2>
            </div>
            <p className="text-sm leading-relaxed text-black/55">YAA conecta lo que ve tu cliente con lo que necesita tu equipo: catálogo, venta, cobro, preparación, entrega y resultados.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {features.map(({ icon: Icon, title, description }, index) => (
              <YaaReveal key={title} direction={index % 2 === 0 ? "left" : "right"} delay={(index % 3) * 90} className={index < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
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

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 rounded-xl bg-[#151515] px-6 py-5 text-sm text-white/65">
            {[
              "Clientes, cupones y puntos",
              "Servicios y presupuestos",
              "Avisos por email y Telegram",
              "Resumen de producción",
            ].map((item) => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-[#ff7658]" />{item}</span>)}
          </div>
        </div>
      </section>

      <section id="clientes" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Historias YAA</p>
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight">Una tienda para cada forma de vender</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/45">Ejemplos de cómo distintos negocios pueden organizar sus ventas con YAA. Próximamente vas a conocer sus historias reales.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {portfolio.map(({ icon: Icon, business, title, description, result }) => (
            <YaaReveal key={business} direction="up" delay={portfolio.findIndex((item) => item.business === business) * 100}>
              <article className="yaa-card flex min-h-72 flex-col p-6!">
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-[#ff5a36]/10 text-[#ff7658]"><Icon className="size-5" /></div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Caso demo</span>
                </div>
                <p className="mt-8 text-xs font-bold uppercase tracking-[.16em] text-[#ff7658]">{business}</p>
                <h3 className="mt-3 text-xl font-bold leading-snug">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{description}</p>
                <div className="mt-auto border-t border-white/5 pt-5"><p className="flex items-center gap-2 text-sm font-semibold"><Check className="size-4 text-[#ff7658]" />{result}</p></div>
              </article>
            </YaaReveal>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-white/15 px-6 py-5 text-center">
          <p className="text-sm text-white/55">¿Ya usás YAA? Queremos contar cómo transformaste la forma de vender.</p>
          <a href={contactHref} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#ff7658] hover:text-[#ff5a36]">Compartir mi historia <ArrowRight className="size-4" /></a>
        </div>
      </section>

      <section id="precios" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Precios</p>
          <h2 className="text-3xl font-extrabold tracking-tight">Elegí cómo querés hacer crecer tu negocio</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/50">Todos los planes incluyen 10 días gratis, pedidos ilimitados y 0% de comisión por venta. En el pago anual abonás diez meses y usás YAA durante doce.</p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <YaaReveal key={plan.name} direction={plan.featured ? "up" : plans[0] === plan ? "left" : "right"} delay={plans.indexOf(plan) * 90}>
              <article className={`yaa-card relative flex h-full flex-col p-6! ${plan.featured ? "border-[#ff5a36]/50!" : ""}`}>
                {plan.featured && <span className="absolute -top-3 left-6 rounded-full bg-[#ff5a36] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Más elegido</span>}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-xs leading-relaxed text-white/45">{plan.description}</p>
                <div className="mt-5 flex items-end gap-1"><span className="text-3xl font-black tracking-tight">{plan.monthly}</span><span className="pb-1 text-xs text-white/45">/mes</span></div>
                <p className="mt-1 text-xs font-medium text-[#ff7658]">o {plan.yearly}</p>
                <ul className="mt-6 flex flex-col gap-3 border-t border-white/5 pt-5">
                  {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-xs text-white/70"><Check className="mt-0.5 size-3.5 shrink-0 text-[#ff7658]" />{feature}</li>)}
                </ul>
                <a href={signupHref} className={`yaa-btn mt-6 w-full justify-center ${plan.featured ? "yaa-btn-primary" : "yaa-btn-secondary"}`}>Probar 10 días gratis</a>
              </article>
            </YaaReveal>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 rounded-xl border border-white/10 p-5">
          <Bot className="mt-0.5 size-5 shrink-0 text-[#ff7658]" />
          <div><p className="text-sm font-bold">Asistente con IA para tu tienda</p><p className="mt-1 text-sm leading-relaxed text-white/50">Próximamente como módulo adicional: entrenado con la información de cada negocio, con límites de uso y derivación a una persona cuando sea necesario.</p></div>
        </div>
      </section>

      <section id="socios" className="scroll-mt-20 bg-[#ff5a36] py-24 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-start">
            <YaaReveal direction="left"><div>
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[.18em]"><Handshake className="size-5" />Socios comerciales YAA</div>
              <h2 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-.04em] md:text-6xl">Vendé una vez. Construí un ingreso que crece con tu cartera.</h2>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/75">Recomendá YAA a negocios y emprendimientos. Cuando se convierten en clientes, ganás un bono de activación y una comisión en cada renovación.</p>

              <div className="mt-10 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/30 bg-white/30 sm:grid-cols-3">
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">1 mes</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">de bono por activación</p></div>
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">15%</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">recurrente inicial</p></div>
                <div className="bg-[#ff5a36] p-6"><p className="text-4xl font-black">25%</p><p className="mt-2 text-xs font-bold uppercase tracking-wider text-white/70">al crecer tu cartera</p></div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="/revendedores" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#170d09] px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-black">Quiero ser socio <ArrowRight className="size-[18px]" /></a>
                <a href="/revendedores#condiciones" className="inline-flex h-12 items-center rounded-xl border border-white/45 px-6 font-bold text-white transition hover:bg-white/10">Ver programa completo</a>
              </div>
            </div></YaaReveal>

            <YaaReveal direction="right" delay={120}><aside id="condiciones-socios" className="rounded-2xl bg-[#170d09] p-6 text-white md:p-7">
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
        <div className="rounded-2xl border border-white/10 bg-[#111827]/70 px-6 py-12 text-center md:px-12 md:py-14">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-[#ff5a36]">Hablemos</p>
            <h2 className="mx-auto max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">Tu tienda puede empezar acá.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/50">Contanos sobre tu negocio y te ayudamos a encontrar la mejor forma de llevarlo online.</p>
            <a href={contactHref} className="yaa-btn yaa-btn-primary mt-8 h-12 px-6">Escribinos <ArrowRight className="size-[18px]" /></a>
          </div>
        </div>
      </section>

      <YaaPublicFooter />
    </main>
  );
}
