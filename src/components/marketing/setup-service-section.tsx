"use client";

import { ArrowRight, HammerIcon } from "lucide-react";

import { formatPrice } from "@/lib/format";
import { useSalesChat } from "./sales-chat-widget";

export function SetupServiceSection({ price, steps }: { price: number; steps: string[] }) {
  const { openWithTopic } = useSalesChat();

  function handleClick() {
    openWithTopic(
      "SETUP_SERVICE",
      "¡Buenísimo! Armamos tu tienda por vos. Dejanos tu nombre y WhatsApp y coordinamos todo.",
    );
  }

  return (
    <section className="bg-[#0d3b3b] py-24 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-white/10">
          <HammerIcon className="size-6 text-[#ff7658]" />
        </span>
        <p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-[#ff7658]">¿No sabés armar tu tienda?</p>
        <h2 className="text-3xl font-extrabold tracking-tight">Contactanos y la armamos por vos</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
          En menos de 24 horas te entregamos tu tienda lista para recibir pedidos. Es un pago único, independiente de tu suscripción.
        </p>

        {steps.length > 0 && (
          <ol className="mx-auto mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <li key={i} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[#ff5a36] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{step}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          <p className="text-3xl font-extrabold">{formatPrice(price)}</p>
          <button type="button" onClick={handleClick} className="yaa-btn yaa-btn-primary h-12 px-6 text-base">
            Contactanos <ArrowRight className="size-[18px]" />
          </button>
        </div>
      </div>
    </section>
  );
}
