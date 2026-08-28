import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/revendedores", "/terminos", "/privacidad"],
      disallow: ["/admin/", "/platform/", "/registro/", "/socios", "/api/"],
    },
    sitemap: "https://yaa.com.ar/sitemap.xml",
  };
}
