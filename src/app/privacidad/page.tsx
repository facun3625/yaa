import type { Metadata } from "next";
import { YaaPublicFooter } from "@/components/marketing/yaa-public-footer";
import { YaaPublicNav } from "@/components/marketing/yaa-public-nav";

export const metadata: Metadata = { title: "Privacidad · YAA", description: "Política de privacidad del servicio YAA." };

const sections = [
  ["Qué información tratamos", "Podemos tratar datos de registro y contacto, información del negocio, configuración de la tienda, actividad de la cuenta, datos técnicos y la información que se carga para gestionar pedidos y clientes."],
  ["Para qué la usamos", "Utilizamos la información para crear y administrar cuentas, prestar y mejorar el servicio, autenticar usuarios, procesar solicitudes, brindar soporte, prevenir fraude, cumplir obligaciones legales y enviar comunicaciones operativas."],
  ["Datos de clientes de cada tienda", "Cada comercio determina qué datos solicita a sus clientes y es responsable de informarles cómo los utiliza. YAA procesa esos datos para prestar la plataforma siguiendo las instrucciones del comercio y aplicando medidas razonables de seguridad."],
  ["Proveedores", "Podemos utilizar proveedores de infraestructura, autenticación, correo, analítica, soporte y cobros. Sólo compartimos la información necesaria para que presten sus servicios y exigimos que la protejan conforme a sus obligaciones."],
  ["Conservación y seguridad", "Conservamos la información durante el tiempo necesario para prestar el servicio, cumplir obligaciones y resolver reclamos. Aplicamos medidas técnicas y organizativas razonables, aunque ningún sistema conectado a internet puede garantizar seguridad absoluta."],
  ["Tus derechos", "Podés solicitar acceso, actualización, rectificación o eliminación de tus datos, sujeto a las excepciones y plazos de la normativa aplicable. También podés pedir información sobre el tratamiento realizado."],
  ["Cookies y tecnologías similares", "Usamos cookies necesarias para mantener sesiones, seguridad y preferencias. Cuando incorporemos mediciones no esenciales, informaremos su finalidad y las opciones disponibles."],
  ["Contacto", "Para consultas o para ejercer derechos vinculados con tus datos personales, escribinos a hola@yaa.com.ar. Podemos pedirte información adicional para verificar tu identidad antes de responder."],
];

export default function PrivacyPage() {
  return <main className="min-h-screen bg-[#f5f0e8] text-[#1d1713]"><YaaPublicNav /><article className="mx-auto max-w-3xl px-6 py-16 md:py-24"><p className="text-xs font-black uppercase tracking-[.18em] text-[#e84220]">Tu información</p><h1 className="mt-3 text-4xl font-black tracking-tight">Política de privacidad</h1><p className="mt-3 text-sm text-black/50">Última actualización: 28 de agosto de 2026</p><p className="mt-8 leading-relaxed text-black/65">Esta política explica de manera general cómo YAA trata la información relacionada con sus usuarios, tiendas y clientes.</p><div className="mt-10 space-y-9">{sections.map(([title, text]) => <section key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-3 leading-relaxed text-black/60">{text}</p></section>)}</div></article><YaaPublicFooter /></main>;
}
