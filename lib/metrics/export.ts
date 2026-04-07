import * as XLSX from "xlsx"

import type { MetricsPayload } from "@/lib/metrics/types"

function escapeCsv(value: string | number | boolean | null | undefined): string {
  const text = value === null || value === undefined ? "" : String(value)
  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function toCsv(rows: Array<Record<string, string | number | boolean | null | undefined>>): string {
  if (!rows.length) {
    return ""
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
  const lines = [headers.map(escapeCsv).join(",")]

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","))
  }

  return `${lines.join("\n")}\n`
}

export function buildMetricsExportRows(data: MetricsPayload) {
  const kpis = data.kpis.map((kpi) => ({
    label: kpi.label,
    value: kpi.value,
    trend: kpi.trend ?? "",
    trendLabel: kpi.trendLabel,
  }))

  const salesSeries = data.salesSeries.map((point) => ({
    date: point.date,
    label: point.label,
    revenue: point.revenue,
  }))

  const topProducts = data.topProducts.map((product) => ({
    name: product.name,
    units: product.units,
    revenue: product.revenue,
  }))

  const inventoryAlerts = data.inventoryAlerts.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    minStock: item.minStock,
  }))

  const restockForecast = data.forecasts.restock.map((item) => ({
    id: item.id,
    name: item.name,
    quantity: item.quantity,
    avgDailyUse: item.avgDailyUse,
    daysRemaining: item.daysRemaining ?? "",
    nextRestock: item.nextRestock ?? "",
  }))

  const salesClusters = data.marketing.salesClusters.map((segment) => ({
    name: segment.name,
    count: segment.count,
    avgTicket: segment.avgTicket,
    description: segment.description,
  }))

  return {
    kpis,
    salesSeries,
    topProducts,
    inventoryAlerts,
    restockForecast,
    salesClusters,
  }
}

export function buildMetricsCsv(data: MetricsPayload): string {
  const rows = buildMetricsExportRows(data)
  const sections = [
    ["kpis", rows.kpis],
    ["sales-series", rows.salesSeries],
    ["top-products", rows.topProducts],
    ["inventory-alerts", rows.inventoryAlerts],
    ["restock-forecast", rows.restockForecast],
    ["sales-clusters", rows.salesClusters],
  ] as const

  return sections
    .map(([title, sectionRows]) => `# ${title}\n${toCsv(sectionRows)}\n`)
    .join("\n")
}

export function buildMetricsWorkbook(data: MetricsPayload): XLSX.WorkBook {
  const rows = buildMetricsExportRows(data)
  const workbook = XLSX.utils.book_new()

  const sheets: Array<[string, Array<Record<string, string | number | boolean | null | undefined>>]> = [
    ["KPIs", rows.kpis],
    ["SalesSeries", rows.salesSeries],
    ["TopProducts", rows.topProducts],
    ["InventoryAlerts", rows.inventoryAlerts],
    ["RestockForecast", rows.restockForecast],
    ["SalesClusters", rows.salesClusters],
  ]

  for (const [name, sheetRows] of sheets) {
    const sheet = XLSX.utils.json_to_sheet(sheetRows)
    XLSX.utils.book_append_sheet(workbook, sheet, name)
  }

  return workbook
}
