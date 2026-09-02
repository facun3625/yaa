import type { Metadata } from "next";
import { ArrowRight, CreditCard, Headphones, PackageCheck, Settings, Store, Truck } from "lucide-react";

import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";
import { YaaFaqList } from "@/components/marketing/yaa-faq-list";
import { YaaReveal } from "@/components/marketing/yaa-reveal";

export const metadata: Metadata = {
  title: "Preguntas frecuentes · YAA",
  description: "Respuestas sobre tiendas YAA, pedidos, delivery, pagos, planes y puesta en marcha.",
};

const categories = [
  {
    icon: Store,
    title: "Sobre YAA",
    questions: [
      ["¿Qué es YAA?", "YAA es una plataforma de pedidos online creada originalmente para gastronomía y negocios de cercanía. Te permite publicar un menú o catálogo, recibir pedidos y organizar pagos, preparación, retiro y delivery desde un solo lugar."],
      ["¿Es un marketplace o una aplicación de delivery?", "No. YAA te da una tienda propia con la identidad y el enlace de tu negocio. Tus clientes son tuyos, la relación comercial es directa y YAA no se queda con un porcentaje de cada venta."],
      ["¿Sirve solamente para gastronomía?", "Nació para gastronomía, pero también funciona muy bien para pastelerías, productores por encargo, comercios y servicios locales que venden dentro de una ciudad o zona cercana."],
      ["¿Es adecuado para un e-commerce con miles de productos y envíos nacionales?", "Ese no es su objetivo principal. YAA está pensado para operaciones cercanas y manejables, donde importan los horarios, cupos, fechas, preparación, retiro y entrega local."],
      ["¿Mis clientes tienen que descargar una aplicación?", "No. Entran a tu tienda desde un enlace usando el navegador de su celular o computadora."],
    ],
  },
  {
    icon: PackageCheck,
    title: "Catálogo y pedidos",
    questions: [
      ["¿Qué puedo publicar?", "Podés cargar categorías, productos, fotografías, descripciones, precios, gustos, tamaños, variantes y adicionales según la forma de vender de tu negocio."],
      ["¿Puedo controlar el stock?", "Sí. Podés trabajar con stock individual, stock compartido entre productos o disponibilidad sin límite, según tu operación."],
      ["¿Puedo vender solamente algunos días?", "Sí. Podés configurar horarios semanales o ventas puntuales con fecha de entrega, cupos y cierre de pedidos."],
      ["¿Cómo me entero cuando entra un pedido?", "El pedido aparece en el panel con los datos necesarios para gestionarlo. Según la configuración disponible, también podés recibir avisos por los canales habilitados."],
      ["¿Puedo cambiar el estado de un pedido?", "Sí. Podés acompañarlo durante las distintas etapas de preparación, entrega o retiro y mantener organizada la operación."],
    ],
  },
  {
    icon: Truck,
    title: "Retiro y delivery",
    questions: [
      ["¿Puedo ofrecer retiro por el local?", "Sí. Podés habilitar retiro para que el cliente elija esa opción al realizar el pedido."],
      ["¿YAA realiza las entregas?", "No. YAA organiza la información del pedido y la modalidad de entrega; la logística queda a cargo del negocio o del servicio de reparto que decida utilizar."],
      ["¿Puedo trabajar solamente en mi zona?", "Sí. YAA está especialmente pensado para ventas locales y entregas cercanas. Vos definís cómo recibe o entrega los pedidos tu negocio."],
      ["¿Puedo combinar retiro y delivery?", "Sí. Podés ofrecer ambas alternativas para que cada cliente seleccione la más conveniente."],
    ],
  },
  {
    icon: CreditCard,
    title: "Cobros y comisiones",
    questions: [
      ["¿Qué medios de pago puedo ofrecer?", "Podés informar u ofrecer efectivo, transferencia, Mercado Pago o Payway, según la configuración y las cuentas que utilice tu negocio."],
      ["¿YAA cobra una comisión por cada pedido?", "No. YAA cobra una suscripción fija y no descuenta un porcentaje de tus ventas."],
      ["¿Mercado Pago o Payway pueden cobrarme comisiones?", "Sí. Los proveedores de pago pueden aplicar sus propias tarifas, plazos y condiciones. Esos cargos son independientes de la suscripción de YAA."],
      ["¿El dinero de mis ventas pasa por YAA?", "La forma de acreditación depende del medio de pago elegido. Cuando utilizás una cuenta propia de un proveedor, los fondos se gestionan bajo las condiciones acordadas entre tu negocio y ese proveedor."],
    ],
  },
  {
    icon: Settings,
    title: "Planes y puesta en marcha",
    questions: [
      ["¿Necesito instalar algo?", "No. YAA funciona online y se puede administrar desde computadora, tablet o celular."],
      ["¿Necesito conocimientos técnicos?", "No. La configuración está pensada para que puedas hacerla desde el panel. Si necesitás ayuda con la puesta en marcha, podés comunicarte con nosotros."],
      ["¿Puedo probar YAA antes de contratar?", "Los planes o promociones que incluyan un período de prueba muestran su duración durante el alta. Si un plan no lo incluye, también se informa antes de confirmarlo."],
      ["¿Puedo cambiar de plan?", "Sí. Podés elegir un plan diferente cuando cambien las necesidades de tu negocio, sujeto a las condiciones vigentes."],
      ["¿Qué diferencia hay entre el pago mensual y anual?", "El mensual se renueva cada mes. Con la modalidad anual abonás el período completo y obtenés el beneficio informado en la página de precios."],
    ],
  },
  {
    icon: Headphones,
    title: "Soporte y cuenta",
    questions: [
      ["¿Dónde ingreso para administrar mi tienda?", "Podés usar la opción Iniciar sesión del menú e ingresar con los datos de tu cuenta."],
      ["¿Qué hago si olvidé mi contraseña?", "Desde la pantalla de ingreso podés iniciar el proceso de recuperación de contraseña."],
      ["¿Puedo usar mi propia marca?", "Sí. La tienda está pensada para mostrar la identidad, productos e información de tu negocio."],
      ["¿Cómo contacto al equipo de YAA?", "Podés escribirnos a hola@yaa.com.ar. Contanos el nombre de tu negocio y tu consulta para que podamos orientarte mejor."],
      ["¿Dónde encuentro las condiciones legales?", "Los Términos de uso y la Política de privacidad están disponibles desde el pie de todas las páginas públicas."],
    ],
  },
];

export default function FrequentlyAskedQuestionsPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#1d1713]">
      <YaaPublicNav />

      <section className="bg-[#ff5a36] px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-black uppercase tracking-[.2em] text-white/75">Centro de ayuda</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-.04em] md:text-6xl">Preguntas frecuentes</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">Todo lo que necesitás saber antes de crear tu tienda y comenzar a recibir pedidos con YAA.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <div className="space-y-14">
          {categories.map(({ icon: Icon, title, questions }, index) => (
            <YaaReveal key={title} direction={index % 2 === 0 ? "left" : "right"}>
            <section id={title.toLowerCase().replaceAll(" ", "-")} className="scroll-mt-24">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-[#ff5a36]/10 text-[#e84220]"><Icon className="size-5" /></span>
                <h2 className="text-2xl font-black tracking-tight">{title}</h2>
              </div>
              <YaaFaqList items={questions} />
            </section></YaaReveal>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-[#0d3b3b] p-8 text-white md:flex md:items-center md:justify-between md:gap-10 md:p-10">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-[#ffb19f]">¿Te quedó alguna duda?</p><h2 className="mt-3 text-2xl font-black">Hablemos sobre tu negocio.</h2><p className="mt-2 text-sm text-white/60">Te ayudamos a entender si YAA se adapta a tu forma de vender.</p></div>
          <a href="mailto:hola@yaa.com.ar?subject=Tengo%20una%20consulta%20sobre%20YAA" className="mt-6 inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#ff5a36] px-6 font-bold text-white transition hover:-translate-y-0.5 md:mt-0">Escribinos <ArrowRight className="size-4" /></a>
        </div>
      </section>

      <YaaPublicFooter />
    </main>
  );
}
