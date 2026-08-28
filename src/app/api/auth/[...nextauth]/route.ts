import { NextRequest } from "next/server";

import { handlers } from "@/auth";

// Next.js entrega `req.url` con el host aplastado al del servidor
// (http://localhost:3010) aunque el navegador haya pedido
// tienda1.yaa.com.ar — los headers `host`/`x-forwarded-host` sí traen el
// host real. Auth.js arma toda su identidad a partir de `req.url`, así que
// sin esto cree que TODAS las tiendas son el dominio raíz, y entonces:
//   - da por hecho que ya está en el redirect proxy, y no guarda el origen
//     dentro del `state` firmado;
//   - al volver de Google no tiene a dónde rebotar, procesa el callback en
//     el dominio raíz y busca ahí las cookies de state/PKCE, que el
//     navegador dejó en el subdominio → "InvalidCheck: state value could
//     not be parsed".
// Reponiendo el host real, cada tienda vuelve a ser su propio origen: el
// login arranca y termina en el mismo dominio (sea subdominio o dominio
// propio de un cliente) y Google sigue teniendo un único redirect URI.
function withRealHost(handler: (req: NextRequest) => Promise<Response>) {
  return (req: NextRequest) => {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (!host) return handler(req);

    const url = new URL(req.url);
    if (url.host === host) return handler(req);

    url.host = host;
    url.protocol = req.headers.get("x-forwarded-proto") ?? url.protocol;
    return handler(new NextRequest(url, req));
  };
}

export const GET = withRealHost(handlers.GET);
export const POST = withRealHost(handlers.POST);
