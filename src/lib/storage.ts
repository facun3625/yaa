import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(file: File, folder: string): Promise<string> {
  const ext = path.extname(file.name) || guessExtension(file.type);
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOADS_ROOT, folder);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${folder}/${filename}`;
}

// El favicon se ve mejor recortado a un cuadrado con esquinas redondeadas
// (como el ícono de una app) en vez del cuadrado a filo que sube el admin —
// eso no se puede lograr con CSS porque la pestaña del navegador renderiza
// el archivo tal cual. Se recorta a cuadrado, se redondea con una máscara
// SVG y se exporta a PNG para conservar la transparencia en las esquinas.
export async function saveFaviconWithRoundedCorners(
  file: File,
  folder: string,
  radiusPercent = 25,
): Promise<string> {
  const size = 256;
  const radius = Math.round((size * radiusPercent) / 100);
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`,
  );

  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const rounded = await sharp(inputBuffer)
    .resize(size, size, { fit: "cover" })
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const filename = `${randomUUID()}.png`;
  const dir = path.join(UPLOADS_ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), rounded);

  return `/uploads/${folder}/${filename}`;
}

function guessExtension(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return ".jpg";
  }
}
