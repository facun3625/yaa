import { prisma } from "@/lib/prisma";
import { parseDevice, parseBrowser, parseOs, DEVICE_LABELS } from "@/lib/user-agent";
import { parseTrafficSource } from "@/lib/traffic-source";

export type SiteVisitStats = {
  totalVisits: number;
  uniqueVisitors: number;
  byPage: { label: string; value: number }[];
  bySource: { label: string; value: number }[];
  byDevice: { label: string; value: number }[];
  byBrowser: { label: string; value: number }[];
  byOs: { label: string; value: number }[];
};

function tally(items: string[]): { label: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
}

// Todo se parsea acá, no al guardar — así una mejora futura al parser de
// user-agent/referrer aplica retroactivamente a los datos ya guardados.
export async function getSiteVisitStats(range: { from: Date; to: Date }): Promise<SiteVisitStats> {
  const visits = await prisma.siteVisit.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { path: true, referrer: true, userAgent: true, visitorId: true },
  });

  const uniqueVisitorIds = new Set(visits.map((v) => v.visitorId).filter((v): v is string => Boolean(v)));

  return {
    totalVisits: visits.length,
    uniqueVisitors: uniqueVisitorIds.size,
    byPage: tally(visits.map((v) => v.path)),
    bySource: tally(visits.map((v) => parseTrafficSource(v.referrer))),
    byDevice: tally(visits.map((v) => DEVICE_LABELS[parseDevice(v.userAgent)])),
    byBrowser: tally(visits.map((v) => parseBrowser(v.userAgent))),
    byOs: tally(visits.map((v) => parseOs(v.userAgent))),
  };
}
