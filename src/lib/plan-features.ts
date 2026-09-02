// La descripción de un plan es texto libre, una prestación por línea (ver
// comentario en el schema y en /platform/planes) — esto la convierte en una
// lista de características. Si el plan no tiene descripción cargada, cae a
// una lista genérica armada con sus límites.
export function planFeatureLines(
  description: string | null | undefined,
  fallback: string[],
): string[] {
  const written = description?.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) ?? [];
  return written.length ? written : fallback;
}
