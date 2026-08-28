import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Check, Link2, Store, TrendingUp, Users } from "lucide-react";

import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";

export const metadata: Metadata = {
  title: "Socios comerciales · YAA",
  description: "Recomendá YAA, ayudá a más negocios a vender online y construí un ingreso recurrente.",
};

const applyHref = "mailto:hola@yaa.com.ar?subject=Quiero%20ser%20socio%20comercial%20de%20YAA";

const steps = [
  { icon: Users, number: "01", title: "Sumate como socio", text: "Contanos quién sos, dónde trabajás y qué experiencia tenés acompañando negocios." },
  { icon: Link2, number: "02", title: "Compartí YAA", text: "Presentá la solución con tu enlace y código personal. Cada cliente referido queda asociado a vos." },
  { icon: Store, number: "03", title: "El negocio empieza", text: "El cliente crea su tienda y prueba el sistema durante 10 días, sin instalaciones ni técnicos." },
  { icon: BadgeDollarSign, number: "04", title: "Construí tu ingreso", text: "Cuando se suscribe, recibís un bono de activación y una comisión en cada renovación." },
];

export default function ResellersPage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#1d1713]">
      <YaaPublicNav />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-20 md:pb-28 md:pt-28 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="mb-4 text-xs font-black uppercase tracking-[.2em] text-[#e84220]">Socios comerciales YAA</p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.06] tracking-[-.045em] md:text-6xl">Tu próxima venta puede convertirse en un ingreso recurrente.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-black/55">Ayudá a comercios y emprendimientos a vender online. YAA se ocupa de la plataforma; vos construís relaciones, una cartera de clientes y un negocio propio.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={applyHref} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a36] px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#e84220]">Quiero ser socio <ArrowRight className="size-[18px]" /></a>
              <Link href="#modelo" className="inline-flex h-12 items-center rounded-xl border border-black/15 bg-white px-6 font-bold transition hover:border-black/30">Conocer el modelo</Link>
            </div>
          </div>

          <div className="rotate-2 rounded-3xl bg-[#0d3b3b] p-8 text-white shadow-[0_24px_60px_rgba(13,59,59,.18)] lg:p-10">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#ffb19f]">Tu cartera activa</p>
            <p className="mt-5 text-7xl font-black tracking-[-.06em]">15%</p>
            <p className="mt-1 font-bold">en cada renovación</p>
            <div className="my-7 h-px bg-white/15" />
            <p className="text-sm leading-relaxed text-white/60">El porcentaje puede crecer hasta el 25% a medida que sumás clientes activos.</p>
          </div>
        </div>
      </section>

      <section id="modelo" className="scroll-mt-20 bg-[#ff5a36] py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-white/70">El modelo</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Ganás al comenzar. Seguís ganando si el cliente continúa.</h2>
            <p className="mt-4 leading-relaxed text-white/75">No es un premio aislado por recomendar un enlace. Es una relación comercial que recompensa la activación, la permanencia y el crecimiento de tu cartera.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl bg-white p-6 text-[#1d1713]"><p className="text-xs font-black uppercase tracking-wider text-[#e84220]">Activación</p><h3 className="mt-4 text-3xl font-black">Un mes de bono</h3><p className="mt-3 text-sm leading-relaxed text-black/55">Cuando el cliente completa 60 días pagos, recibís un bono equivalente a un mes de su plan.</p></article>
            <article className="rounded-2xl bg-[#0d3b3b] p-6 text-white"><p className="text-xs font-black uppercase tracking-wider text-[#ffb19f]">Recurrencia</p><h3 className="mt-4 text-3xl font-black">15% inicial</h3><p className="mt-3 text-sm leading-relaxed text-white/60">Cobrás sobre cada suscripción confirmada, sea mensual o anual.</p></article>
            <article className="rounded-2xl bg-[#ffd85a] p-6 text-[#1d1713]"><p className="text-xs font-black uppercase tracking-wider text-black/50">Crecimiento</p><h3 className="mt-4 text-3xl font-black">Hasta 25%</h3><p className="mt-3 text-sm leading-relaxed text-black/55">Pasás al 20% con 15 clientes activos y al 25% cuando llegás a 40.</p></article>
          </div>
        </div>
      </section>

      <section id="condiciones" className="scroll-mt-20 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#e84220]">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Simple de explicar. Claro para cobrar.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, number, title, text }) => (
              <article key={number} className="rounded-2xl border border-black/8 bg-[#f5f0e8] p-6">
                <div className="flex items-center justify-between"><Icon className="size-5 text-[#e84220]" /><span className="text-xs font-black text-black/25">{number}</span></div>
                <h3 className="mt-8 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/50">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0d3b3b] py-24 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#ffb19f]">Una oportunidad real</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">No instalás nada. No mantenés servidores. No resolvés problemas técnicos.</h2>
            <p className="mt-5 leading-relaxed text-white/60">El negocio crea su cuenta, configura su tienda y empieza a recibir pedidos. Tu rol es encontrar oportunidades, mostrar el valor de YAA y acompañar la decisión comercial.</p>
          </div>
          <div className="rounded-2xl bg-white p-7 text-[#1d1713]">
            <h3 className="font-black">Herramientas para vender mejor</h3>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {["Código y enlace personal", "Material comercial", "Cuenta para demostraciones", "Prospectos protegidos", "Comisiones transparentes", "Capacitación y soporte"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-black/60"><Check className="mt-0.5 size-4 shrink-0 text-[#e84220]" />{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f0e8] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-8 rounded-3xl border border-black/10 bg-[#ffd85a] p-8 md:flex-row md:items-center md:p-10">
            <div>
              <div className="flex items-center gap-2 text-black/55"><TrendingUp className="size-5" /><span className="text-xs font-black uppercase tracking-[.16em]">Primeros socios YAA</span></div>
              <h2 className="mt-4 text-3xl font-black tracking-tight">Empezá a construir tu cartera.</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/55">Estamos seleccionando a quienes van a participar del programa inicial y ayudarnos a perfeccionarlo.</p>
            </div>
            <a href={applyHref} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[#1d1713] px-6 font-bold text-white transition hover:-translate-y-0.5 hover:bg-black">Quiero postularme <ArrowRight className="size-4" /></a>
          </div>
        </div>
      </section>

      <YaaPublicFooter />
    </main>
  );
}
