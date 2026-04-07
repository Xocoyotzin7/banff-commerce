import * as XLSX from "xlsx"

import type { AdminReservationsPayload } from "@/lib/admin/reservations"

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

export function buildReservationsExportRows(data: AdminReservationsPayload) {
  return {
    summary: [
      {
        label: "total",
        value: data.summary.total,
      },
      {
        label: "uniqueClients",
        value: data.summary.uniqueClients,
      },
      {
        label: "appointments",
        value: data.summary.appointments,
      },
      {
        label: "travelBookings",
        value: data.summary.travelBookings,
      },
      {
        label: "topClient",
        value: data.summary.topClient ?? "N/A",
      },
      {
        label: "topDay",
        value: data.summary.topDay ?? "N/A",
      },
    ],
    reservations: data.reservations.map((reservation) => ({
      code: reservation.reservationCode,
      type: reservation.reservationType,
      date: reservation.reservationDate,
      time: reservation.reservationTime,
      client: reservation.clientName,
      email: reservation.clientEmail ?? "",
      country: reservation.clientCountry ?? "",
      destination: reservation.destinationName,
      packageName: reservation.packageName ?? "",
      peopleCount: reservation.peopleCount,
      status: reservation.status,
      branchId: reservation.branchId,
      branchNumber: reservation.branchNumber ?? "",
      message: reservation.message ?? "",
    })),
    byDay: data.charts.byDay,
    byHour: data.charts.byHour,
    byStatus: data.charts.byStatus,
    byType: data.charts.byType,
  }
}

export function buildReservationsCsv(data: AdminReservationsPayload): string {
  const rows = buildReservationsExportRows(data)
  const sections = [
    ["summary", rows.summary],
    ["reservations", rows.reservations],
    ["by-day", rows.byDay],
    ["by-hour", rows.byHour],
    ["by-status", rows.byStatus],
    ["by-type", rows.byType],
  ] as const

  return sections.map(([title, sectionRows]) => `# ${title}\n${toCsv(sectionRows)}\n`).join("\n")
}

export function buildReservationsWorkbook(data: AdminReservationsPayload): XLSX.WorkBook {
  const rows = buildReservationsExportRows(data)
  const workbook = XLSX.utils.book_new()

  const sheets: Array<[string, Array<Record<string, string | number | boolean | null | undefined>>]> = [
    ["Summary", rows.summary],
    ["Reservations", rows.reservations],
    ["ByDay", rows.byDay],
    ["ByHour", rows.byHour],
    ["ByStatus", rows.byStatus],
    ["ByType", rows.byType],
  ]

  for (const [name, sheetRows] of sheets) {
    const sheet = XLSX.utils.json_to_sheet(sheetRows)
    XLSX.utils.book_append_sheet(workbook, sheet, name)
  }

  return workbook
}
