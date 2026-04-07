import { destinations } from "@/src/lib/data/destinations"

import {
  type TravelInsightsDestinationSeason,
  type TravelInsightsPayload,
  type TravelInsightsRange,
  type TravelInsightsMostLikelyDestination,
  TRAVEL_INSIGHTS_PERIOD_OPTIONS,
} from "@/lib/admin/travel-insights"
import { buildAvailableMonths, resolveMetricsWindowWithMonth } from "@/lib/metrics/service"

function round(value: number): number {
  return Number(value.toFixed(2))
}

function monthLabel(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("es-MX", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function resolveDemoInsightsFactor(range: TravelInsightsRange, selectedMonth?: string | null) {
  const monthSeed = selectedMonth ? Number(selectedMonth.replace("-", "")) % 9 : 0
  switch (range) {
    case "7d":
      return 0.88 + monthSeed * 0.01
    case "14d":
      return 0.96 + monthSeed * 0.015
    case "30d":
      return 1.04 + monthSeed * 0.02
    case "90d":
      return 1.12 + monthSeed * 0.025
    case "365d":
      return 1.24 + monthSeed * 0.03
    case "month":
      return selectedMonth ? 1.08 + monthSeed * 0.02 : 1.0
  }
}

function buildSeasonality() {
  const currentYear = new Date().getUTCFullYear()

  return destinations.map((destination, index) => {
    const monthly = Array.from({ length: 6 }, (_, monthOffset) => {
      const monthIndex = (monthOffset + index) % 12
      const count = 4 + ((index + monthOffset) % 7) + (monthOffset % 3)
      return {
        month: `${currentYear}-${String(monthIndex + 1).padStart(2, "0")}`,
        label: monthLabel(currentYear, monthIndex),
        count,
      }
    })

    const sortedByCount = [...monthly].sort((left, right) => right.count - left.count || left.month.localeCompare(right.month))
    const low = [...monthly].sort((left, right) => left.count - right.count || left.month.localeCompare(right.month))[0]
    const peak = sortedByCount[0]

    return {
      destinationSlug: destination.slug,
      destinationName: destination.name,
      country: destination.country,
      reservations: monthly.reduce((sum, item) => sum + item.count, 0),
      peakMonth: peak?.label ?? "Sin datos",
      peakCount: peak?.count ?? 0,
      lowMonth: low?.label ?? "Sin datos",
      lowCount: low?.count ?? 0,
      monthly,
    } satisfies TravelInsightsDestinationSeason
  })
}

function buildMostLikelyDestination(
  seasonality: TravelInsightsDestinationSeason[],
): TravelInsightsMostLikelyDestination {
  const top = seasonality
    .map((entry, index) => ({
      ...entry,
      score: entry.reservations * 6 + (seasonality.length - index) * 2 + (index % 5) * 1.5,
      pageViews: 180 + index * 11,
      avgTimeOnPage: 62 + index * 3,
      avgScrollDepth: 54 + (index % 4) * 7,
      conversions: 6 + (index % 4),
      reason: `${entry.reservations} reservas · ${180 + index * 11} vistas · ${54 + (index % 4) * 7}% scroll promedio`,
    }))
    .sort((left, right) => right.score - left.score)[0]

  return {
    destinationSlug: top.destinationSlug,
    destinationName: top.destinationName,
    country: top.country,
    score: round(top.score),
    reservations: top.reservations,
    pageViews: top.pageViews,
    avgTimeOnPage: top.avgTimeOnPage,
    avgScrollDepth: top.avgScrollDepth,
    conversions: top.conversions,
    reason: top.reason,
  }
}

export function getDemoTravelInsightsPayload(range: string | null | undefined, selectedMonth?: string | null): TravelInsightsPayload {
  const allowed = ["7d", "14d", "30d", "90d", "365d", "month"] as const
  const selected = allowed.includes((range ?? "30d") as (typeof allowed)[number]) ? (range as TravelInsightsRange) : "30d"
  const window = resolveMetricsWindowWithMonth(selected, selectedMonth)
  const factor = resolveDemoInsightsFactor(selected, selectedMonth)
  const seasonality = buildSeasonality()
  const topClient = {
    userId: "demo-user-1",
    name: "Valeria Ortega",
    email: "valeria.ortega@example.com",
    country: "México",
    reservations: Math.max(3, Math.round(6 * factor)),
    peopleCount: Math.max(8, Math.round(18 * factor)),
    lastReservationAt: new Date().toISOString(),
  }
  const topOriginCountry = {
    country: "México",
    reservations: Math.max(8, Math.round(18 * factor)),
    clients: Math.max(4, Math.round(9 * factor)),
  }
  const passiveAnalytics = {
    topPages: [
      { path: "/destinations/cancun-riviera-maya", label: "cancun-riviera-maya", views: Math.round(128 * factor), avgTimeOnPage: Math.round(84 * factor), avgScrollDepth: Math.min(96, Math.round(72 * factor)), destinationSlug: "cancun-riviera-maya" },
      { path: "/destinations/machu-picchu", label: "machu-picchu", views: Math.round(112 * factor), avgTimeOnPage: Math.round(79 * factor), avgScrollDepth: Math.min(96, Math.round(68 * factor)), destinationSlug: "machu-picchu" },
      { path: "/blog/cancun-riviera-maya", label: "blog/cancun-riviera-maya", views: Math.round(95 * factor), avgTimeOnPage: Math.round(102 * factor), avgScrollDepth: Math.min(96, Math.round(74 * factor)), destinationSlug: "cancun-riviera-maya" },
      { path: "/packages", label: "packages", views: Math.round(88 * factor), avgTimeOnPage: Math.round(57 * factor), avgScrollDepth: Math.min(96, Math.round(46 * factor)), destinationSlug: null },
      { path: "/destinations/salar-uyuni", label: "salar-uyuni", views: Math.round(76 * factor), avgTimeOnPage: Math.round(91 * factor), avgScrollDepth: Math.min(96, Math.round(65 * factor)), destinationSlug: "salar-uyuni" },
    ],
    topReferrers: [
      { referrer: "instagram.com", views: 84 },
      { referrer: "google / organic", views: 73 },
      { referrer: "tiktok.com", views: 58 },
      { referrer: "Directo", views: 41 },
      { referrer: "newsletter", views: 24 },
    ],
    topCountries: [
      { country: "México", views: Math.round(164 * factor) },
      { country: "Canadá", views: Math.round(78 * factor) },
      { country: "Estados Unidos", views: Math.round(62 * factor) },
      { country: "Colombia", views: Math.round(47 * factor) },
      { country: "Chile", views: Math.round(31 * factor) },
    ],
    conversions: [
      { event: "view_package", count: Math.round(42 * factor), value: 0 },
      { event: "checkout_start", count: Math.round(16 * factor), value: 0 },
      { event: "booking_confirmed", count: Math.round(11 * factor), value: Math.round(24850 * factor) },
      { event: "reservation_created", count: Math.round(24 * factor), value: Math.round(14280 * factor) },
    ],
  }

  const mostLikelyDestination = buildMostLikelyDestination(seasonality)
  const reservationsByDestination = seasonality.slice(0, 8).map((entry) => ({
    label: entry.destinationName,
    value: Math.round(entry.reservations * factor),
    secondary: Math.round(entry.peakCount * factor),
  }))
  const seasonalDistribution = seasonality[0]?.monthly.map((month) => ({ label: month.label, value: Math.round(month.count * factor) })) ?? []
  const passivePages = passiveAnalytics.topPages.map((page) => ({ label: page.label, value: page.views }))
  const topCountries = passiveAnalytics.topCountries.map((entry) => ({ label: entry.country, value: entry.views }))

  return {
    range: selected,
    rangeLabel: window.rangeLabel,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    selectedMonth: selectedMonth ?? null,
    hasData: true,
    topClient,
    topOriginCountry,
    mostLikelyDestination,
    destinationSeasonality: seasonality,
    passiveAnalytics,
    charts: {
      reservationsByDestination,
      seasonalDistribution,
      passivePages,
      topCountries,
    },
    availablePeriods: TRAVEL_INSIGHTS_PERIOD_OPTIONS,
    availableMonths: buildAvailableMonths(3),
  }
}
