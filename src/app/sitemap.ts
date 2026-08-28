import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://yaa.com.ar", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://yaa.com.ar/revendedores", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://yaa.com.ar/preguntas-frecuentes", lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: "https://yaa.com.ar/terminos", lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: "https://yaa.com.ar/privacidad", lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
