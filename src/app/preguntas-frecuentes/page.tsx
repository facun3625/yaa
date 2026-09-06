import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";
import { YaaFaqList } from "@/components/marketing/yaa-faq-list";
import { YaaReveal } from "@/components/marketing/yaa-reveal";
import { FAQ_CATEGORIES } from "@/lib/faq-content";
import { trackSiteVisit } from "@/lib/site-visit";

export const metadata: Metadata = {
  title: "Preguntas frecuentes · YAA",
  description: "Respuestas sobre tiendas YAA, pedidos, delivery, pagos, planes y puesta en marcha.",
};

const categories = FAQ_CATEGORIES;

export default async function FrequentlyAskedQuestionsPage() {
  await trackSiteVisit("/preguntas-frecuentes");

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
