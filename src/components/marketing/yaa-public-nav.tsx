"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function YaaPublicNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-[#030712]/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" onClick={close} className="flex shrink-0 items-center" aria-label="YAA, inicio">
          <Image src="/yaa-logo-clean.svg" alt="YAA" width={835} height={478} priority className="h-9 w-auto object-contain md:h-12" />
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold text-white lg:flex">
          <Link href="/#funcionalidades" className="border-b-2 border-transparent py-2 transition-colors hover:border-[#ff5a36] hover:text-[#ff5a36]">Funcionalidades</Link>
          <Link href="/#clientes" className="border-b-2 border-transparent py-2 transition-colors hover:border-[#ff5a36] hover:text-[#ff5a36]">Clientes</Link>
          <Link href="/#precios" className="border-b-2 border-transparent py-2 transition-colors hover:border-[#ff5a36] hover:text-[#ff5a36]">Precios</Link>
          <Link href="/#socios" className="border-b-2 border-transparent py-2 transition-colors hover:border-[#ff5a36] hover:text-[#ff5a36]">Socios</Link>
          <Link href="/#contacto" className="border-b-2 border-transparent py-2 transition-colors hover:border-[#ff5a36] hover:text-[#ff5a36]">Contacto</Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <Link href="/#funcionalidades" className="yaa-btn yaa-btn-secondary py-2! px-4! text-sm">Conocer YAA</Link>
          <Link href="/registro" className="yaa-btn yaa-btn-primary py-2! px-5! text-sm">Probar 10 días gratis</Link>
        </div>

        <button onClick={() => setOpen((value) => !value)} aria-label={open ? "Cerrar menú" : "Abrir menú"} className="-mr-2 shrink-0 p-2 text-white lg:hidden">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#030712]/98 backdrop-blur-lg lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link href="/#funcionalidades" onClick={close} className="rounded-lg px-3 py-3 font-semibold text-white transition-colors hover:bg-white/5 hover:text-[#ff5a36]">Funcionalidades</Link>
            <Link href="/#clientes" onClick={close} className="rounded-lg px-3 py-3 font-semibold text-white transition-colors hover:bg-white/5 hover:text-[#ff5a36]">Clientes</Link>
            <Link href="/#precios" onClick={close} className="rounded-lg px-3 py-3 font-semibold text-white transition-colors hover:bg-white/5 hover:text-[#ff5a36]">Precios</Link>
            <Link href="/#socios" onClick={close} className="rounded-lg px-3 py-3 font-semibold text-white transition-colors hover:bg-white/5 hover:text-[#ff5a36]">Socios</Link>
            <Link href="/#contacto" onClick={close} className="rounded-lg px-3 py-3 font-semibold text-white transition-colors hover:bg-white/5 hover:text-[#ff5a36]">Contacto</Link>
            <div className="my-2 h-px bg-white/10" />
            <Link href="/registro" onClick={close} className="yaa-btn yaa-btn-primary w-full justify-center">Probar 10 días gratis</Link>
          </nav>
        </div>
      )}

      <div className="h-px w-full bg-white/5" />
    </header>
  );
}
