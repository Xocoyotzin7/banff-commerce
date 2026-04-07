import { and, desc, gte, lte } from "drizzle-orm"

import { destinations } from "@/src/lib/data/destinations"
import { packages } from "@/src/lib/data/packages"
import { pageAnalytics, reservations, users } from "@/lib/db"
import { buildAvailableMonths, resolveMetricsWindowWithMonth } from "@/lib/metrics/service"
import type { NeonDb } from "@/lib/db/adapters/neon"
import type { MetricsRange } from "@/lib/metrics/types"

type DbRow = Record<string, unknown>

export type TravelInsightsRange = MetricsRange

export type TravelInsightsDestinationSeason = {
  destinationSlug: string
  destinationName: string
  country: string
  reservations: number
  peakMonth: string
  peakCount: number
  lowMonth: string
  lowCount: number
  monthly: Array<{ month: string; label: string; count: number }>
}

export type TravelInsightsTopClient = {
  userId: string
  name: string
  email: string | null
  country: string
  reservations: number
  peopleCount: number
  lastReservationAt: string | null
}

export type TravelInsightsOriginCountry = {
  country: string
  reservations: number
  clients: number
}

export type TravelInsightsMostLikelyDestination = {
  destinationSlug: string
  destinationName: string
  country: string
  score: number
  reservations: number
  pageViews: number
  avgTimeOnPage: number
  avgScrollDepth: number
  conversions: number
  reason: string
}

export type TravelInsightsPassivePage = {
  path: string
  label: string
  views: number
  avgTimeOnPage: number
  avgScrollDepth: number
  destinationSlug: string | null
}

export type TravelInsightsPassiveReferrer = {
  referrer: string
  views: number
}

export type TravelInsightsPassiveCountry = {
  country: string
  views: number
}

export type TravelInsightsPassiveConversion = {
  event: string
  count: number
  value: number
}

export type TravelInsightsPayload = {
  range: TravelInsightsRange
  rangeLabel: string
  since: string
  until: string
  selectedMonth?: string | null
  hasData: boolean
  topClient: TravelInsightsTopClient | null
  topOriginCountry: TravelInsightsOriginCountry | null
  mostLikelyDestination: TravelInsightsMostLikelyDestination | null
  destinationSeasonality: TravelInsightsDestinationSeason[]
  passiveAnalytics: {
    topPages: TravelInsightsPassivePage[]
    topReferrers: TravelInsightsPassiveReferrer[]
    topCountries: TravelInsightsPassiveCountry[]
    conversions: TravelInsightsPassiveConversion[]
  }
  charts: {
    reservationsByDestination: Array<{ label: string; value: number; secondary?: number }>
    seasonalDistribution: Array<{ label: string; value: number }>
    passivePages: Array<{ label: string; value: number }>
    topCountries: Array<{ label: string; value: number }>
  }
  availablePeriods: Array<{ value: TravelInsightsRange; label: string }>
  availableMonths?: Array<{ month: string; label: string }>
}

type ReservationRow = DbRow & {
  id?: string
  userId?: string | null
  reservationDate?: string | Date | null
  reservationTime?: string | null
  branchId?: string | null
  destinationSlug?: string | null
  packageId?: string | null
  peopleCount?: number | string | null
  status?: string | null
  createdAt?: string | Date | null
}

type UserRow = DbRow & {
  id?: string
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  clientId?: string | null
  country?: string | null
}

type AnalyticsRow = DbRow & {
  pagePath?: string | null
  pageType?: string | null
  destinationSlug?: string | null
  packageId?: string | null
  timeOnPage?: number | string | null
  scrollDepth?: number | string | null
  referrerUrl?: string | null
  userAgent?: string | null
  locale?: string | null
  country?: string | null
  conversionEvent?: string | null
  conversionValue?: number | string | null
  createdAt?: string | Date | null
}

type Snapshot = {
  reservations: ReservationRow[]
  users: UserRow[]
  analytics: AnalyticsRow[]
}

type DateWindow = {
  range: TravelInsightsRange
  rangeLabel: string
  since: Date
  until: Date
}

export const TRAVEL_INSIGHTS_PERIOD_OPTIONS: Array<{ value: TravelInsightsRange; label: string }> = [
  { value: "7d", label: "7 días" },
  { value: "14d", label: "14 días" },
  { value: "30d", label: "30 días" },
  { value: "90d", label: "90 días" },
  { value: "365d", label: "365 días" },
  { value: "month", label: "Mes actual" },
]

const DESTINATION_LOOKUP = new Map(destinations.map((destination) => [destination.slug, destination]))
const PACKAGE_LOOKUP = new Map(packages.map((travelPackage) => [travelPackage.id, travelPackage]))

function toText(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (value instanceof Date) return value.toISOString()
  return ""
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

function round(value: number): number {
  return Number(value.toFixed(2))
}

function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthLabel(key: string): string {
  const [yearText, monthText] = key.split("-")
  const year = Number(yearText)
  const month = Number(monthText)
  if (!year || !month) return key
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("es-MX", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function dayLabel(value: Date): string {
  return value.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
}

function resolveRangeWindow(range: TravelInsightsRange): DateWindow {
  const now = new Date()

  if (range === "month") {
    const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
    return {
      range,
      rangeLabel: "Mes actual",
      since,
      until: now,
    }
  }

  const days = Number(range.replace("d", ""))
  const since = new Date(now)
  since.setUTCDate(since.getUTCDate() - days)

  const labels: Record<Exclude<TravelInsightsRange, "month">, string> = {
    "7d": "Últimos 7 días",
    "14d": "Últimos 14 días",
    "30d": "Últimos 30 días",
    "90d": "Últimos 90 días",
    "365d": "Últimos 365 días",
  }

  return {
    range,
    rangeLabel: labels[range as Exclude<TravelInsightsRange, "month">],
    since,
    until: now,
  }
}

function getRowDate(row: DbRow, keys: string[]): Date | null {
  for (const key of keys) {
    const value = row[key]
    const parsed = toDate(value)
    if (parsed) return parsed
  }
  return null
}

function getRowString(row: DbRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    const parsed = toText(value)
    if (parsed) return parsed
  }
  return ""
}

async function safeQuery<T>(label: string, query: Promise<T[]>): Promise<T[]> {
  try {
    return await query
  } catch (error) {
    console.warn(`[travel-insights] ${label} query failed`, error)
    return []
  }
}

function resolveDestinationFromReservation(row: ReservationRow) {
  const destinationSlug = getRowString(row, ["destinationSlug", "destination_slug"])
  if (destinationSlug && DESTINATION_LOOKUP.has(destinationSlug)) {
    const destination = DESTINATION_LOOKUP.get(destinationSlug)
    return { slug: destinationSlug, destination }
  }

  const packageId = getRowString(row, ["packageId", "package_id"])
  if (packageId && PACKAGE_LOOKUP.has(packageId)) {
    const travelPackage = PACKAGE_LOOKUP.get(packageId)
    const destination = travelPackage ? DESTINATION_LOOKUP.get(travelPackage.destinationId) : null
    return { slug: travelPackage?.destinationId ?? packageId, destination, packageId }
  }

  const branchId = getRowString(row, ["branchId", "branch_id"])
  if (branchId && DESTINATION_LOOKUP.has(branchId)) {
    return { slug: branchId, destination: DESTINATION_LOOKUP.get(branchId) }
  }

  return { slug: branchId || destinationSlug || packageId || "general", destination: null, packageId }
}

function buildTopClient(reservationsRows: ReservationRow[], usersRows: UserRow[]): TravelInsightsTopClient | null {
  const userMap = new Map(usersRows.map((user) => [getRowString(user, ["id"]), user]))
  const counts = new Map<
    string,
    {
      userId: string
      reservations: number
      peopleCount: number
      lastReservationAt: string | null
    }
  >()

  for (const reservation of reservationsRows) {
    const userId = getRowString(reservation, ["userId", "user_id"])
    if (!userId) continue

    const createdAt = getRowDate(reservation, ["reservationDate", "reservation_date", "createdAt", "created_at"])
    const entry = counts.get(userId) ?? {
      userId,
      reservations: 0,
      peopleCount: 0,
      lastReservationAt: null,
    }
    entry.reservations += 1
    entry.peopleCount += Math.max(0, Math.round(toNumber(reservation.peopleCount)))
    if (createdAt) {
      const nextValue = createdAt.toISOString()
      if (!entry.lastReservationAt || nextValue > entry.lastReservationAt) {
        entry.lastReservationAt = nextValue
      }
    }
    counts.set(userId, entry)
  }

  const top = Array.from(counts.values()).sort((left, right) => right.reservations - left.reservations || right.peopleCount - left.peopleCount)[0]
  if (!top) return null

  const user = userMap.get(top.userId)
  const name = `${getRowString(user ?? {}, ["firstName", "first_name"])} ${getRowString(user ?? {}, ["lastName", "last_name"])}`.trim()

  return {
    userId: top.userId,
    name: name || user?.clientId || top.userId.slice(0, 8),
    email: user?.email ?? null,
    country: user?.country?.trim() || "Sin dato",
    reservations: top.reservations,
    peopleCount: top.peopleCount,
    lastReservationAt: top.lastReservationAt,
  }
}

function buildOriginCountry(usersRows: UserRow[], reservationsRows: ReservationRow[]): TravelInsightsOriginCountry | null {
  const userMap = new Map(usersRows.map((user) => [getRowString(user, ["id"]), user]))
  const countryCounts = new Map<string, { reservations: number; clients: Set<string> }>()

  for (const reservation of reservationsRows) {
    const userId = getRowString(reservation, ["userId", "user_id"])
    if (!userId) continue
    const user = userMap.get(userId)
    const country = user?.country?.trim() || "Sin dato"
    const entry = countryCounts.get(country) ?? { reservations: 0, clients: new Set<string>() }
    entry.reservations += 1
    entry.clients.add(userId)
    countryCounts.set(country, entry)
  }

  const top = Array.from(countryCounts.entries()).sort((left, right) => right[1].reservations - left[1].reservations || right[1].clients.size - left[1].clients.size)[0]
  if (!top) return null

  return {
    country: top[0],
    reservations: top[1].reservations,
    clients: top[1].clients.size,
  }
}

function buildDestinationSeasonality(reservationsRows: ReservationRow[]) {
  const seasonalityMap = new Map<string, { destinationSlug: string; destinationName: string; country: string; monthly: Map<string, number> }>()

  for (const reservation of reservationsRows) {
    const date = getRowDate(reservation, ["reservationDate", "reservation_date", "createdAt", "created_at"])
    if (!date) continue

    const destination = resolveDestinationFromReservation(reservation)
    const slug = destination.slug
    const current = seasonalityMap.get(slug) ?? {
      destinationSlug: slug,
      destinationName: destination.destination?.name ?? slug,
      country: destination.destination?.country ?? "Sin dato",
      monthly: new Map<string, number>(),
    }

    const key = monthKey(date)
    current.monthly.set(key, (current.monthly.get(key) ?? 0) + 1)
    seasonalityMap.set(slug, current)
  }

  return Array.from(seasonalityMap.values())
    .map((entry) => {
      const monthly = Array.from(entry.monthly.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([month, count]) => ({ month, label: monthLabel(month), count }))
      const sortedByCount = [...monthly].sort((left, right) => right.count - left.count || left.month.localeCompare(right.month))
      const peak = sortedByCount[0]
      const low = [...monthly].sort((left, right) => left.count - right.count || left.month.localeCompare(right.month))[0]

      return {
        destinationSlug: entry.destinationSlug,
        destinationName: entry.destinationName,
        country: entry.country,
        reservations: monthly.reduce((sum, item) => sum + item.count, 0),
        peakMonth: peak?.label ?? "Sin datos",
        peakCount: peak?.count ?? 0,
        lowMonth: low?.label ?? "Sin datos",
        lowCount: low?.count ?? 0,
        monthly,
      } satisfies TravelInsightsDestinationSeason
    })
    .sort((left, right) => right.reservations - left.reservations || left.destinationName.localeCompare(right.destinationName))
}

function buildPassiveAnalytics(analyticsRows: AnalyticsRow[]) {
  const pageMap = new Map<
    string,
    {
      path: string
      destinationSlug: string | null
      views: number
      totalTime: number
      totalScroll: number
    }
  >()
  const referrerMap = new Map<string, number>()
  const countryMap = new Map<string, number>()
  const conversionMap = new Map<string, { count: number; value: number }>()

  for (const entry of analyticsRows) {
    const path = getRowString(entry, ["pagePath", "page_path"]) || "/"
    const explicitDestinationSlug = getRowString(entry, ["destinationSlug", "destination_slug"])
    const packageId = getRowString(entry, ["packageId", "package_id"])
    const destinationSlug = explicitDestinationSlug || (packageId ? getDestinationSlugFromPackageId(packageId) : null)

    const current = pageMap.get(path) ?? {
      path,
      destinationSlug,
      views: 0,
      totalTime: 0,
      totalScroll: 0,
    }
    current.views += 1
    current.totalTime += toNumber(entry.timeOnPage)
    current.totalScroll += clamp(toNumber(entry.scrollDepth), 0, 100)
    pageMap.set(path, current)

    const referrer = getRowString(entry, ["referrerUrl", "referrer_url"]) || "Directo"
    referrerMap.set(referrer, (referrerMap.get(referrer) ?? 0) + 1)

    const country = getRowString(entry, ["country"]) || "Sin dato"
    countryMap.set(country, (countryMap.get(country) ?? 0) + 1)

    const conversionEvent = getRowString(entry, ["conversionEvent", "conversion_event"])
    if (conversionEvent) {
      const currentConversion = conversionMap.get(conversionEvent) ?? { count: 0, value: 0 }
      currentConversion.count += 1
      currentConversion.value += toNumber(entry.conversionValue)
      conversionMap.set(conversionEvent, currentConversion)
    }
  }

  const topPages: TravelInsightsPassivePage[] = Array.from(pageMap.values())
    .sort((left, right) => right.views - left.views || left.path.localeCompare(right.path))
    .slice(0, 8)
    .map((entry) => ({
      path: entry.path,
      label: entry.destinationSlug ? entry.destinationSlug : entry.path.replace(/^\/+/, "") || "home",
      views: entry.views,
      avgTimeOnPage: round(entry.totalTime / Math.max(1, entry.views)),
      avgScrollDepth: round(entry.totalScroll / Math.max(1, entry.views)),
      destinationSlug: entry.destinationSlug,
    }))

  const topReferrers: TravelInsightsPassiveReferrer[] = Array.from(referrerMap.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 5)
    .map(([referrer, views]) => ({ referrer, views }))

  const topCountries: TravelInsightsPassiveCountry[] = Array.from(countryMap.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 6)
    .map(([country, views]) => ({ country, views }))

  const conversions: TravelInsightsPassiveConversion[] = Array.from(conversionMap.entries())
    .sort((left, right) => right[1].count - left[1].count || left[0].localeCompare(right[0]))
    .map(([event, value]) => ({ event, count: value.count, value: round(value.value) }))

  return {
    topPages,
    topReferrers,
    topCountries,
    conversions,
  }
}

function getDestinationSlugFromPackageId(packageId: string) {
  const travelPackage = PACKAGE_LOOKUP.get(packageId)
  return travelPackage?.destinationId ?? null
}

function buildReservationsByDestination(seasonality: TravelInsightsDestinationSeason[]) {
  return seasonality
    .slice(0, 8)
    .map((entry) => ({
      label: entry.destinationName,
      value: entry.reservations,
      secondary: entry.peakCount,
    }))
}

function buildSeasonalDistribution(seasonality: TravelInsightsDestinationSeason[]) {
  const first = seasonality[0]
  if (!first) return []

  return first.monthly.map((entry) => ({
    label: entry.label,
    value: entry.count,
  }))
}

function buildMostLikelyDestination(
  seasonality: TravelInsightsDestinationSeason[],
  analytics: ReturnType<typeof buildPassiveAnalytics>,
): TravelInsightsMostLikelyDestination | null {
  const analyticsByDestination = new Map<
    string,
    { pageViews: number; totalTime: number; totalScroll: number; conversions: number }
  >()

  for (const page of analytics.topPages) {
    if (!page.destinationSlug) continue
    const current = analyticsByDestination.get(page.destinationSlug) ?? {
      pageViews: 0,
      totalTime: 0,
      totalScroll: 0,
      conversions: 0,
    }
    current.pageViews += page.views
    current.totalTime += page.avgTimeOnPage * page.views
    current.totalScroll += page.avgScrollDepth * page.views
    analyticsByDestination.set(page.destinationSlug, current)
  }

  const conversionBoost = new Map<string, number>()
  for (const conversion of analytics.conversions) {
    if (conversion.event.includes("destination")) {
      const slug = conversion.event.split(":").at(-1)?.trim() ?? ""
      if (slug) {
        conversionBoost.set(slug, (conversionBoost.get(slug) ?? 0) + conversion.count)
      }
    }
  }

  const scored = seasonality.map((entry) => {
    const signal = analyticsByDestination.get(entry.destinationSlug) ?? {
      pageViews: 0,
      totalTime: 0,
      totalScroll: 0,
      conversions: 0,
    }

    const conversionCount = conversionBoost.get(entry.destinationSlug) ?? 0
    const score =
      entry.reservations * 6 +
      signal.pageViews * 2 +
      signal.totalTime * 0.03 +
      signal.totalScroll * 0.12 +
      conversionCount * 8

    return {
      ...entry,
      score,
      pageViews: signal.pageViews,
      avgTimeOnPage: signal.pageViews ? round(signal.totalTime / signal.pageViews) : 0,
      avgScrollDepth: signal.pageViews ? round(signal.totalScroll / signal.pageViews) : 0,
      conversions: conversionCount,
    }
  })

  const top = scored.sort((left, right) => right.score - left.score || right.reservations - left.reservations)[0]
  if (!top) return null

  const reasonParts = [
    `${top.reservations} reservas`,
    `${top.pageViews} vistas`,
    `${top.avgScrollDepth}% scroll promedio`,
  ]

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
    reason: reasonParts.join(" · "),
  }
}

async function fetchSnapshot(db: NeonDb, since: Date, until: Date): Promise<Snapshot> {
  const [reservationRows, userRows, analyticsRows] = await Promise.all([
    safeQuery(
      "reservations",
      db
        .select()
        .from(reservations)
        .where(and(gte(reservations.createdAt, since), lte(reservations.createdAt, until)))
        .orderBy(desc(reservations.createdAt)),
    ),
    safeQuery("users", db.select().from(users)),
    safeQuery(
      "analytics",
      db
        .select()
        .from(pageAnalytics)
        .where(and(gte(pageAnalytics.createdAt, since), lte(pageAnalytics.createdAt, until)))
        .orderBy(desc(pageAnalytics.createdAt)),
    ),
  ])

  return {
    reservations: reservationRows as ReservationRow[],
    users: userRows as UserRow[],
    analytics: analyticsRows as AnalyticsRow[],
  }
}

export async function getAdminTravelInsightsPayload(
  db: NeonDb,
  range: string | null | undefined,
  selectedMonth?: string | null,
): Promise<TravelInsightsPayload> {
  const allowed = ["7d", "14d", "30d", "90d", "365d", "month"] as const
  const selected = allowed.includes((range ?? "30d") as (typeof allowed)[number]) ? (range as TravelInsightsRange) : "30d"
  const window = resolveMetricsWindowWithMonth(selected, selectedMonth)
  const current = await fetchSnapshot(db, new Date(window.since), new Date(window.until))

  const topClient = buildTopClient(current.reservations, current.users)
  const topOriginCountry = buildOriginCountry(current.users, current.reservations)
  const destinationSeasonality = buildDestinationSeasonality(current.reservations)
  const passiveAnalytics = buildPassiveAnalytics(current.analytics)
  const mostLikelyDestination = buildMostLikelyDestination(destinationSeasonality, passiveAnalytics)

  const reservationsByDestination = buildReservationsByDestination(destinationSeasonality)
  const seasonalDistribution = buildSeasonalDistribution(destinationSeasonality)
  const passivePages = passiveAnalytics.topPages.map((page) => ({
    label: page.label,
    value: page.views,
  }))
  const topCountries = passiveAnalytics.topCountries.map((entry) => ({
    label: entry.country,
    value: entry.views,
  }))

  return {
    range: selected,
    rangeLabel: window.rangeLabel,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    hasData: current.reservations.length > 0 || current.analytics.length > 0,
    topClient,
    topOriginCountry,
    mostLikelyDestination,
    destinationSeasonality,
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

export function resolveAdminTravelInsightsWindow(range: string | null | undefined, selectedMonth?: string | null) {
  const normalized = (range ?? "30d") as TravelInsightsRange
  const allowed: TravelInsightsRange[] = ["7d", "14d", "30d", "90d", "365d", "month"]
  const selected = allowed.includes(normalized) ? normalized : "30d"
  return resolveMetricsWindowWithMonth(selected, selectedMonth)
}
