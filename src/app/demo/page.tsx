import Image from "next/image";

import { DemoEmailForm } from "./demo-email-form";

// Entrada única para probar el producto: yaa.com.ar/demo. Antes de repartir
// a quien entra hacia una de las copias de prueba (ver actions.ts), pedimos
// un email — es el único dato de contacto que dejamos de alguien que solo
// está mirando, y sirve para hacer seguimiento después.
export default function DemoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 py-12 text-white">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-2xl bg-[#0b1220] p-7 text-center shadow-2xl ring-1 ring-white/10">
        <Image src="/yaa-logo-clean.svg" alt="yaa" width={835} height={478} className="h-8 w-auto object-contain" />

        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold">Probá YAA como admin</h1>
          <p className="text-sm leading-relaxed text-white/60">
            Te dejamos entrar directo al panel de una tienda de prueba, ya cargada con productos.
            Dejanos tu email antes de entrar.
          </p>
        </div>

        <DemoEmailForm />
      </div>
    </main>
  );
}
