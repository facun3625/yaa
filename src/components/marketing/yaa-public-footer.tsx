import Image from "next/image";
import Link from "next/link";

export function YaaPublicFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#030712] text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <Image src="/yaa-logo-clean.svg" alt="YAA" width={835} height={478} className="h-6 w-auto object-contain" />
            <span className="text-sm text-[#9ca3af]">© {new Date().getFullYear()} YAA. Todos los derechos reservados.</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#9ca3af]">
          <Link href="/#funcionalidades" className="transition-colors hover:text-white">Funcionalidades</Link>
          <Link href="/#clientes" className="transition-colors hover:text-white">Para quién es</Link>
          <Link href="/#precios" className="transition-colors hover:text-white">Precios</Link>
          <Link href="/revendedores" className="transition-colors hover:text-white">Socios comerciales</Link>
          <Link href="/preguntas-frecuentes" className="transition-colors hover:text-white">Preguntas frecuentes</Link>
          <Link href="/terminos" className="transition-colors hover:text-white">Términos</Link>
          <Link href="/privacidad" className="transition-colors hover:text-white">Privacidad</Link>
          <Link href="/#contacto" className="transition-colors hover:text-white">Contacto</Link>
          <a href="mailto:hola@yaa.com.ar" className="transition-colors hover:text-white">hola@yaa.com.ar</a>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end border-t border-white/5 pt-6">
          <a href="https://kubbo.com.ar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs text-[#9ca3af] transition hover:text-white">
            <span>Desarrollo de</span>
            <Image src="/logo.png" alt="Kubbo" width={1767} height={631} className="h-5 w-auto object-contain" />
          </a>
        </div>
      </div>
    </footer>
  );
}
