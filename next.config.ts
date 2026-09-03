import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración compartida por catálogo, servicios y consultas.
  images: {
    // Foto de perfil de Google (login con Google) — sin esto, next/image
    // rechaza cualquier URL externa que no esté en esta lista.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },
  // Next indexa public/ al arrancar: una foto subida después queda en 404
  // hasta el próximo reinicio. Los uploads se sirven entonces por una ruta
  // que lee del disco en cada request (api/uploads/[...path]) — este rewrite
  // mantiene intactas las URLs /uploads/... ya guardadas en la base.
  async rewrites() {
    return [{ source: "/uploads/:path*", destination: "/api/uploads/:path*" }];
  },
  experimental: {
    // Next 16 aplica además un buffer de 10 MB en proxy. Debe coincidir con
    // el límite de Server Actions o un multipart grande llega truncado y
    // Busboy responde "Unexpected end of form".
    proxyClientMaxBodySize: "20mb",
    // Default de Next es 1MB — una foto de celular (comprobante de
    // transferencia, foto de producto) lo pasa fácil. Tiene que ir de la
    // mano con el client_max_body_size de Nginx (ver README).
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
