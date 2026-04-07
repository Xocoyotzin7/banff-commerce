import { and, asc, desc, eq, gte, lte } from "drizzle-orm"

import { destinations } from "@/src/lib/data/destinations"
import { packages } from "@/src/lib/data/packages"
import { reservations, users } from "@/lib/db/schema"
import type { NeonDb } from "@/lib/db/adapters/neon"
import type { MetricsRange } from "@/lib/metrics/types"
import { buildAvailableMonths, resolveMetricsWindowWithMonth } from "@/lib/metrics/service"

type DbRow = Record<string, unknown>

export type AdminReservationRange = MetricsRange

export type AdminReservationRecord = {
  id: string
  reservationCode: string
  reservationType: "appointment" | "travel"
  reservationDate: string
  reservationTime: string
  branchId: string
  branchNumber: string | null
  destinationSlug: string | null
  packageId: string | null
  destinationName: string
  packageName: string | null
  userId: string
  clientName: string
  clientEmail: string | null
  clientCountry: string | null
  peopleCount: number
  message: string | null
  preOrderItems: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export type AdminReservationsPayload = {
  range: AdminReservationRange
  rangeLabel: string
  since: string
  until: string
  selectedMonth?: string | null
  hasData: boolean
  summary: {
    total: number
    uniqueClients: number
    appointments: number
    travelBookings: number
    topClient: string | null
    topDay: string | null
  }
  charts: {
    byDay: Array<{ label: string; value: number }>
    byHour: Array<{ label: string; value: number }>
    byStatus: Array<{ label: string; value: number }>
    byType: Array<{ label: string; value: number }>
  }
  reservations: AdminReservationRecord[]
  availablePeriods: Array<{ value: AdminReservationRange; label: string }>
  availableMonths?: Array<{ month: string; label: string }>
}

type ReservationRow = DbRow & {
  id?: string
  reservationCode?: string | null
  reservationType?: string | null
  reservationDate?: string | Date | null
  reservationTime?: string | null
  branchId?: string | null
  branchNumber?: string | null
  destinationSlug?: string | null
  packageId?: string | null
  peopleCount?: number | string | null
  message?: string | null
  preOrderItems?: string | null
  status?: string | null
  createdAt?: string | Date | null
  updatedAt?: string | Date | null
  userId?: string | null
  clientEmail?: string | null
  firstName?: string | null
  lastName?: string | null
  country?: string | null
}

const PERIOD_OPTIONS: Array<{ value: AdminReservationRange; label: string }> = [
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
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
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

function monthLabel(value: Date): string {
  return value.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
}

function hourLabel(value: string) {
  return value.slice(0, 2).padStart(2, "0") + ":00"
}

function getRowString(row: DbRow, keys: string[]): string {
  for (const key of keys) {
    const parsed = toText(row[key])
    if (parsed) return parsed
  }
  return ""
}

function getRowDate(row: DbRow, keys: string[]): Date | null {
  for (const key of keys) {
    const parsed = toDate(row[key])
    if (parsed) return parsed
  }
  return null
}

function buildDestinationLabel(row: ReservationRow): { destinationSlug: string | null; destinationName: string } {
  const destinationSlug = getRowString(row, ["destinationSlug", "destination_slug"]) || null
  if (destinationSlug && DESTINATION_LOOKUP.has(destinationSlug)) {
    return { destinationSlug, destinationName: DESTINATION_LOOKUP.get(destinationSlug)?.name ?? destinationSlug }
  }

  const packageId = getRowString(row, ["packageId", "package_id"]) || null
  if (packageId && PACKAGE_LOOKUP.has(packageId)) {
    const travelPackage = PACKAGE_LOOKUP.get(packageId)
    const destination = travelPackage ? DESTINATION_LOOKUP.get(travelPackage.destinationId) : null
    return {
      destinationSlug: travelPackage?.destinationId ?? destinationSlug,
      destinationName: destination?.name ?? travelPackage?.title ?? packageId,
    }
  }

  return {
    destinationSlug,
    destinationName: row.reservationType === "appointment" ? "Cita" : "Viaje",
  }
}

function buildReservations(rows: ReservationRow[]): AdminReservationRecord[] {
  return rows.map((row) => {
    const destination = buildDestinationLabel(row)
    const firstName = getRowString(row, ["firstName", "first_name"])
    const lastName = getRowString(row, ["lastName", "last_name"])

    return {
      id: getRowString(row, ["id"]),
      reservationCode: getRowString(row, ["reservationCode", "reservation_code"]),
      reservationType: ((getRowString(row, ["reservationType", "reservation_type"]) || "appointment") as "appointment" | "travel"),
      reservationDate: getRowString(row, ["reservationDate", "reservation_date"]),
      reservationTime: getRowString(row, ["reservationTime", "reservation_time"]),
      branchId: getRowString(row, ["branchId", "branch_id"]),
      branchNumber: getRowString(row, ["branchNumber", "branch_number"]) || null,
      destinationSlug: destination.destinationSlug,
      packageId: getRowString(row, ["packageId", "package_id"]) || null,
      destinationName: destination.destinationName,
      packageName: (() => {
        const packageId = getRowString(row, ["packageId", "package_id"]) || null
        return packageId && PACKAGE_LOOKUP.has(packageId) ? PACKAGE_LOOKUP.get(packageId)?.title ?? null : null
      })(),
      userId: getRowString(row, ["userId", "user_id"]),
      clientName: `${firstName} ${lastName}`.trim() || getRowString(row, ["clientEmail", "email"]) || "Sin nombre",
      clientEmail: getRowString(row, ["clientEmail", "email"]) || null,
      clientCountry: getRowString(row, ["country"]) || null,
      peopleCount: Math.max(0, Math.round(toNumber(row.peopleCount))),
      message: getRowString(row, ["message"]) || null,
      preOrderItems: getRowString(row, ["preOrderItems", "pre_order_items"]) || null,
      status: getRowString(row, ["status"]) || "pending",
      createdAt: getRowString(row, ["createdAt", "created_at"]),
      updatedAt: getRowString(row, ["updatedAt", "updated_at"]),
    }
  })
}

function buildCharts(reservationsList: AdminReservationRecord[]) {
  const byDay = new Map<string, number>()
  const byHour = new Map<string, number>()
  const byStatus = new Map<string, number>()
  const byType = new Map<string, number>()

  for (const reservation of reservationsList) {
    const date = reservation.reservationDate
    const parsed = date ? new Date(date) : null
    if (parsed && !Number.isNaN(parsed.getTime())) {
      const key = parsed.toISOString().slice(0, 10)
      byDay.set(key, (byDay.get(key) ?? 0) + 1)
    }

    const hour = hourLabel(reservation.reservationTime)
    byHour.set(hour, (byHour.get(hour) ?? 0) + 1)
    byStatus.set(reservation.status, (byStatus.get(reservation.status) ?? 0) + 1)
    byType.set(reservation.reservationType, (byType.get(reservation.reservationType) ?? 0) + 1)
  }

  return {
    byDay: Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label: monthLabel(new Date(`${label}T00:00:00Z`)), value })),
    byHour: Array.from(byHour.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value })),
    byStatus: Array.from(byStatus.entries()).map(([label, value]) => ({ label, value })),
    byType: Array.from(byType.entries()).map(([label, value]) => ({ label, value })),
  }
}

export async function getAdminReservationsPayload(
  db: NeonDb,
  range: string | null | undefined,
  selectedMonth?: string | null,
): Promise<AdminReservationsPayload> {
  const allowed = ["7d", "14d", "30d", "90d", "365d", "month"] as const
  const selected = allowed.includes((range ?? "30d") as (typeof allowed)[number]) ? (range as AdminReservationRange) : "30d"
  const window = resolveMetricsWindowWithMonth(selected, selectedMonth)
  const since = window.since.toISOString().slice(0, 10)
  const until = window.until.toISOString().slice(0, 10)

  const rows = await db
    .select({
      id: reservations.id,
      reservationCode: reservations.reservationCode,
      reservationType: reservations.reservationType,
      reservationDate: reservations.reservationDate,
      reservationTime: reservations.reservationTime,
      branchId: reservations.branchId,
      branchNumber: reservations.branchNumber,
      destinationSlug: reservations.destinationSlug,
      packageId: reservations.packageId,
      peopleCount: reservations.peopleCount,
      message: reservations.message,
      preOrderItems: reservations.preOrderItems,
      status: reservations.status,
      createdAt: reservations.createdAt,
      updatedAt: reservations.updatedAt,
      userId: reservations.userId,
      clientEmail: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      country: users.country,
    })
    .from(reservations)
    .leftJoin(users, eq(users.id, reservations.userId))
    .where(and(gte(reservations.reservationDate, since), lte(reservations.reservationDate, until)))
    .orderBy(desc(reservations.reservationDate), asc(reservations.reservationTime))

  const reservationsList = buildReservations(rows as ReservationRow[])
  const charts = buildCharts(reservationsList)
  const reservationCounts = reservationsList.reduce<Map<string, number>>((acc, reservation) => {
    acc.set(reservation.clientName, (acc.get(reservation.clientName) ?? 0) + 1)
    return acc
  }, new Map())

  const topClientName = Array.from(reservationCounts.entries()).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? null

  const total = reservationsList.length
  const uniqueClients = new Set(reservationsList.map((entry) => entry.userId).filter(Boolean)).size
  const appointments = reservationsList.filter((entry) => entry.reservationType === "appointment").length
  const travelBookings = reservationsList.filter((entry) => entry.reservationType === "travel").length
  const dayCounts = new Map<string, number>()
  for (const item of reservationsList) {
    dayCounts.set(item.reservationDate, (dayCounts.get(item.reservationDate) ?? 0) + 1)
  }
  const topDay = Array.from(dayCounts.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? null

  return {
    range: selected,
    rangeLabel: window.rangeLabel,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    hasData: reservationsList.length > 0,
    summary: {
      total,
      uniqueClients,
      appointments,
      travelBookings,
      topClient: topClientName,
      topDay,
    },
    charts,
    reservations: reservationsList,
    availablePeriods: PERIOD_OPTIONS,
    availableMonths: buildAvailableMonths(3),
  }
}

export function resolveAdminReservationsWindow(range: string | null | undefined, selectedMonth?: string | null) {
  const allowed: AdminReservationRange[] = ["7d", "14d", "30d", "90d", "365d", "month"]
  const selected = allowed.includes((range ?? "30d") as AdminReservationRange) ? (range as AdminReservationRange) : "30d"
  return resolveMetricsWindowWithMonth(selected, selectedMonth)
}
