import { destinations } from "@/src/lib/data/destinations"
import { packages } from "@/src/lib/data/packages"
import type { AdminReservationsPayload, AdminReservationRecord, AdminReservationRange } from "@/lib/admin/reservations"
import {
  listAllDemoReservations,
  type DemoReservationRecord,
  getDemoUserProfile,
} from "@/lib/reservations-demo-state"
import { buildAvailableMonths, resolveMetricsWindowWithMonth } from "@/lib/metrics/service"

function buildDestinationLabel(reservation: DemoReservationRecord): { destinationSlug: string | null; destinationName: string; packageName: string | null } {
  const packageRecord = reservation.packageId ? packages.find((item) => item.id === reservation.packageId) : null
  if (reservation.destinationSlug) {
    const destination = destinations.find((item) => item.slug === reservation.destinationSlug)
    return {
      destinationSlug: reservation.destinationSlug,
      destinationName: destination?.name ?? reservation.destinationSlug.replaceAll("-", " "),
      packageName: packageRecord?.title ?? null,
    }
  }

  return {
    destinationSlug: null,
    destinationName: "Cita",
    packageName: null,
  }
}

function buildCharts(reservations: AdminReservationRecord[]) {
  const dayMap = new Map<string, number>()
  const hourMap = new Map<string, number>()
  const statusMap = new Map<string, number>()
  const typeMap = new Map<string, number>()

  for (const reservation of reservations) {
    dayMap.set(reservation.reservationDate, (dayMap.get(reservation.reservationDate) ?? 0) + 1)
    hourMap.set(reservation.reservationTime.slice(0, 2) + ":00", (hourMap.get(reservation.reservationTime.slice(0, 2) + ":00") ?? 0) + 1)
    statusMap.set(reservation.status, (statusMap.get(reservation.status) ?? 0) + 1)
    typeMap.set(reservation.reservationType, (typeMap.get(reservation.reservationType) ?? 0) + 1)
  }

  return {
    byDay: Array.from(dayMap.entries()).map(([label, value]) => ({ label, value })),
    byHour: Array.from(hourMap.entries()).map(([label, value]) => ({ label, value })),
    byStatus: Array.from(statusMap.entries()).map(([label, value]) => ({ label, value })),
    byType: Array.from(typeMap.entries()).map(([label, value]) => ({ label, value })),
  }
}

export function getDemoAdminReservationsPayload(range: string | null | undefined, selectedMonth?: string | null): AdminReservationsPayload {
  const allowed = ["7d", "14d", "30d", "90d", "365d", "month"] as const
  const selected = allowed.includes((range ?? "30d") as AdminReservationRange) ? (range as AdminReservationRange) : "30d"
  const window = resolveMetricsWindowWithMonth(selected, selectedMonth)
  const since = window.since.toISOString().slice(0, 10)
  const reservations = listAllDemoReservations()
    .filter((entry) => entry.reservationDate >= since)
    .map((entry) => {
      const profile = getDemoUserProfile(entry.userId)
      const destination = buildDestinationLabel(entry)

      return {
        id: entry.id,
        reservationCode: entry.reservationCode,
        reservationType: entry.reservationType,
        reservationDate: entry.reservationDate,
        reservationTime: entry.reservationTime,
        branchId: entry.branchId,
        branchNumber: entry.branchNumber,
        destinationSlug: destination.destinationSlug,
        packageId: entry.packageId,
        destinationName: destination.destinationName,
        packageName: destination.packageName,
        userId: entry.userId,
        clientName: entry.clientName || profile.clientName,
        clientEmail: entry.clientEmail ?? profile.clientEmail,
        clientCountry: entry.clientCountry ?? profile.clientCountry,
        peopleCount: entry.peopleCount,
        message: entry.message,
        preOrderItems: entry.preOrderItems,
        status: entry.status,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      } satisfies AdminReservationRecord
    })

  const summary = {
    total: reservations.length,
    uniqueClients: new Set(reservations.map((entry) => entry.userId)).size,
    appointments: reservations.filter((entry) => entry.reservationType === "appointment").length,
    travelBookings: reservations.filter((entry) => entry.reservationType === "travel").length,
    topClient: reservations[0]?.clientName ?? null,
    topDay: reservations[0]?.reservationDate ?? null,
  }

  return {
    range: selected,
    rangeLabel: window.rangeLabel,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    selectedMonth: selectedMonth ?? null,
    hasData: reservations.length > 0,
    summary,
    charts: buildCharts(reservations),
    reservations,
    availablePeriods: [
      { value: "7d", label: "7 días" },
      { value: "14d", label: "14 días" },
      { value: "30d", label: "30 días" },
      { value: "90d", label: "90 días" },
      { value: "365d", label: "365 días" },
      { value: "month", label: "Mes actual" },
    ],
    availableMonths: buildAvailableMonths(),
  }
}
