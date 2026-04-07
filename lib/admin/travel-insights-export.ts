import * as XLSX from "xlsx"

import type { TravelInsightsPayload } from "@/lib/admin/travel-insights"

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value)
  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function toCsv(rows: Array<Record<string, string | number | boolean | null | undefined>>): string {
  if (!rows.length) return ""

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const lines = [headers.map(escapeCsv).join(",")]

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","))
  }

  return `${lines.join("\n")}\n`
}

export function buildTravelInsightsExportRows(data: TravelInsightsPayload) {
  const summary = [
    {
      label: "topClient",
      value: data.topClient?.name ?? "N/A",
      country: data.topClient?.country ?? "N/A",
      reservations: data.topClient?.reservations ?? 0,
      peopleCount: data.topClient?.peopleCount ?? 0,
      lastReservationAt: data.topClient?.lastReservationAt ?? "",
    },
    {
      label: "topOriginCountry",
      value: data.topOriginCountry?.country ?? "N/A",
      reservations: data.topOriginCountry?.reservations ?? 0,
      clients: data.topOriginCountry?.clients ?? 0,
    },
    {
      label: "mostLikelyDestination",
      value: data.mostLikelyDestination?.destinationName ?? "N/A",
      score: data.mostLikelyDestination?.score ?? 0,
      pageViews: data.mostLikelyDestination?.pageViews ?? 0,
      avgScrollDepth: data.mostLikelyDestination?.avgScrollDepth ?? 0,
      reason: data.mostLikelyDestination?.reason ?? "",
    },
  ]

  const reservationsByDestination = data.destinationSeasonality.map((entry) => ({
    destination: entry.destinationName,
    country: entry.country,
    reservations: entry.reservations,
    peakMonth: entry.peakMonth,
    peakCount: entry.peakCount,
    lowMonth: entry.lowMonth,
    lowCount: entry.lowCount,
  }))

  const seasonalMonthly = data.destinationSeasonality.flatMap((entry) =>
    entry.monthly.map((month) => ({
      destination: entry.destinationName,
      month: month.label,
      count: month.count,
    })),
  )

  const passivePages = data.passiveAnalytics.topPages.map((page) => ({
    path: page.path,
    label: page.label,
    views: page.views,
    avgTimeOnPage: page.avgTimeOnPage,
    avgScrollDepth: page.avgScrollDepth,
  }))

  const passiveReferrers = data.passiveAnalytics.topReferrers.map((entry) => ({
    referrer: entry.referrer,
    views: entry.views,
  }))

  const passiveCountries = data.passiveAnalytics.topCountries.map((entry) => ({
    country: entry.country,
    views: entry.views,
  }))

  const passiveConversions = data.passiveAnalytics.conversions.map((entry) => ({
    event: entry.event,
    count: entry.count,
    value: entry.value,
  }))

  return {
    summary,
    reservationsByDestination,
    seasonalMonthly,
    passivePages,
    passiveReferrers,
    passiveCountries,
    passiveConversions,
  }
}

export function buildTravelInsightsCsv(data: TravelInsightsPayload): string {
  const rows = buildTravelInsightsExportRows(data)
  const sections = [
    ["summary", rows.summary],
    ["reservations-by-destination", rows.reservationsByDestination],
    ["seasonal-monthly", rows.seasonalMonthly],
    ["passive-pages", rows.passivePages],
    ["passive-referrers", rows.passiveReferrers],
    ["passive-countries", rows.passiveCountries],
    ["passive-conversions", rows.passiveConversions],
  ] as const

  return sections.map(([title, sectionRows]) => `# ${title}\n${toCsv(sectionRows)}\n`).join("\n")
}

export function buildTravelInsightsWorkbook(data: TravelInsightsPayload): XLSX.WorkBook {
  const rows = buildTravelInsightsExportRows(data)
  const workbook = XLSX.utils.book_new()

  const sheets: Array<[string, Array<Record<string, string | number | boolean | null | undefined>>]> = [
    ["Summary", rows.summary],
    ["Destinations", rows.reservationsByDestination],
    ["SeasonalMonthly", rows.seasonalMonthly],
    ["PassivePages", rows.passivePages],
    ["Referrers", rows.passiveReferrers],
    ["Countries", rows.passiveCountries],
    ["Conversions", rows.passiveConversions],
  ]

  for (const [name, sheetRows] of sheets) {
    const sheet = XLSX.utils.json_to_sheet(sheetRows)
    XLSX.utils.book_append_sheet(workbook, sheet, name)
  }

  return workbook
}

