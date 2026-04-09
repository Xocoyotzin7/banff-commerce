import { and, gte, inArray, lte } from "drizzle-orm"

import {
  inventoryItems,
  inventoryStock,
  inventoryStockLedger,
  orderItems,
  orders,
  pageAnalytics,
  payments,
  products,
  reservations,
  users,
} from "@/lib/db/schema"
import type { NeonDb } from "@/lib/db/adapters/neon"
import type {
  ChartBar,
  ForecastActivity,
  ForecastPayload,
  ForecastProduction,
  ForecastRestock,
  ForecastSummary,
  MarketingAnomaly,
  MarketingInsights,
  MarketingInventoryInsight,
  MarketingOrderInference,
  MarketingSegment,
  MarketingSuggestion,
  MetricsInventoryAlert,
  MetricsKpi,
  MetricsPayload,
  MetricsProductPoint,
  MetricsRange,
  MetricsSeriesPoint,
  SectionId,
  SectionPayload,
} from "@/lib/metrics/types"

type DbRow = Record<string, unknown>

type RangeWindow = {
  range: MetricsRange
  rangeLabel: string
  since: Date
  until: Date
  previousSince: Date
  previousUntil: Date
}

export type AvailableMonth = {
  month: string
  label: string
}

type Snapshot = {
  orders: DbRow[]
  orderItems: DbRow[]
  payments: DbRow[]
  reservations: DbRow[]
  analytics: DbRow[]
  users: DbRow[]
  products: DbRow[]
  inventoryItems: DbRow[]
  inventoryStock: DbRow[]
  inventoryLedger: DbRow[]
}

const SECTION_TITLES: Record<SectionId, string> = {
  clients: "Clientes",
  sales: "Ventas",
  payments: "Pagos",
  orders: "Pedidos",
  analytics: "Analítica",
  employees: "Colaboradores",
  inventory: "Inventario",
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  if (value instanceof Date) {
    return value.getTime()
  }
  return 0
}

function toText(value: unknown): string {
  if (typeof value === "string") return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return ""
}

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function formatRangeLabel(range: MetricsRange): string {
  switch (range) {
    case "1d":
      return "Último día"
    case "3d":
      return "Últimos 3 días"
    case "7d":
      return "Últimos 7 días"
    case "14d":
      return "Últimos 14 días"
    case "30d":
      return "Últimos 30 días"
    case "90d":
      return "Últimos 90 días"
    case "365d":
      return "Últimos 365 días"
    case "month":
      return "Mes actual"
  }
}

function formatMonthLabel(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("es-MX", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

function addUtcMonths(date: Date, months: number): Date {
  const copy = new Date(date)
  copy.setUTCMonth(copy.getUTCMonth() + months)
  return copy
}

export function buildAvailableMonths(count = 3, anchor = new Date()): AvailableMonth[] {
  const months: AvailableMonth[] = []
  const current = startOfUtcMonth(anchor)
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const candidate = addUtcMonths(current, -offset)
    const month = `${candidate.getUTCFullYear()}-${String(candidate.getUTCMonth() + 1).padStart(2, "0")}`
    months.push({
      month,
      label: formatMonthLabel(candidate.getUTCFullYear(), candidate.getUTCMonth()),
    })
  }
  return months
}

function parseMonthSelection(selectedMonth: string | null | undefined): Date | null {
  if (!selectedMonth) {
    return null
  }
  const normalized = selectedMonth.trim()
  if (!/^\d{4}-\d{2}$/.test(normalized)) {
    return null
  }
  const [yearText, monthText] = normalized.split("-")
  const year = Number(yearText)
  const month = Number(monthText)
  if (!year || !month || month < 1 || month > 12) {
    return null
  }
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
}

function resolveRangeWindow(range: MetricsRange, selectedMonth?: string | null): RangeWindow {
  const now = new Date()
  if (range === "month") {
    const selected = parseMonthSelection(selectedMonth) ?? startOfUtcMonth(now)
    const since = startOfUtcMonth(selected)
    const previousSince = startOfUtcMonth(addUtcMonths(since, -1))
    const previousUntil = since
    const until = addUtcMonths(since, 1)

    return {
      range,
      rangeLabel: selectedMonth && parseMonthSelection(selectedMonth) ? formatMonthLabel(since.getUTCFullYear(), since.getUTCMonth()) : formatRangeLabel(range),
      since,
      until,
      previousSince,
      previousUntil,
    }
  }

  const amount = Number(range.replace("d", ""))
  const until = now
  const since = new Date(now)
  since.setUTCDate(since.getUTCDate() - amount)
  const previousUntil = new Date(since)
  const previousSince = new Date(previousUntil)
  previousSince.setUTCDate(previousSince.getUTCDate() - amount)

  return {
    range,
    rangeLabel: formatRangeLabel(range),
    since,
    until,
    previousSince,
    previousUntil,
  }
}

function keyFromDate(value: Date): string {
  return value.toISOString().slice(0, 10)
}

function hourFromDate(value: Date): string {
  return `${String(value.getUTCHours()).padStart(2, "0")}:00`
}

function dayLabelFromDate(value: Date): string {
  return value.toLocaleDateString("es-MX", { month: "short", day: "2-digit", timeZone: "UTC" })
}

function round(value: number): number {
  return Number(value.toFixed(2))
}

function mean(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function variance(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  return mean(values.map((value) => (value - avg) ** 2))
}

function stdDev(values: number[]): number {
  return Math.sqrt(variance(values))
}

function trendPercent(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return round(((current - previous) / previous) * 100)
}

async function safeQuery<T>(label: string, task: Promise<T[]>): Promise<T[]> {
  try {
    return await task
  } catch (error) {
    console.warn(`[metrics] ${label} query failed`, error)
    return []
  }
}

async function fetchSnapshot(db: NeonDb, since: Date, until: Date): Promise<Snapshot> {
  const [currentOrders, currentPayments, currentReservations, currentAnalytics, currentUsers, currentProducts, currentInventoryItems, currentInventoryStock, currentInventoryLedger] =
    await Promise.all([
      safeQuery(
        "orders",
        db.select().from(orders).where(and(gte(orders.createdAt, since), lte(orders.createdAt, until))),
      ),
      safeQuery(
        "payments",
        db.select().from(payments).where(and(gte(payments.createdAt, since), lte(payments.createdAt, until))),
      ),
      safeQuery(
        "reservations",
        db.select().from(reservations).where(and(gte(reservations.createdAt, since), lte(reservations.createdAt, until))),
      ),
      safeQuery(
        "pageAnalytics",
        db.select().from(pageAnalytics).where(and(gte(pageAnalytics.createdAt, since), lte(pageAnalytics.createdAt, until))),
      ),
      safeQuery("users", db.select().from(users)),
      safeQuery("products", db.select().from(products)),
      safeQuery("inventoryItems", db.select().from(inventoryItems)),
      safeQuery("inventoryStock", db.select().from(inventoryStock)),
      safeQuery(
        "inventoryLedger",
        db.select().from(inventoryStockLedger).where(and(gte(inventoryStockLedger.createdAt, since), lte(inventoryStockLedger.createdAt, until))),
      ),
    ])

  const orderIds = currentOrders
    .map((order) => toText(order.id))
    .filter((id) => id.length > 0)

  const currentOrderItems = orderIds.length
    ? await safeQuery(
        "orderItems",
        db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds)),
      )
    : []

  return {
    orders: currentOrders as DbRow[],
    orderItems: currentOrderItems as DbRow[],
    payments: currentPayments as DbRow[],
    reservations: currentReservations as DbRow[],
    analytics: currentAnalytics as DbRow[],
    users: currentUsers as DbRow[],
    products: currentProducts as DbRow[],
    inventoryItems: currentInventoryItems as DbRow[],
    inventoryStock: currentInventoryStock as DbRow[],
    inventoryLedger: currentInventoryLedger as DbRow[],
  }
}

function getRowDate(row: DbRow, keys: string[]): Date | null {
  for (const key of keys) {
    const value = row[key]
    const date = toDate(value)
    if (date) return date
  }
  return null
}

function getRowString(row: DbRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    const text = toText(value)
    if (text) return text
  }
  return ""
}

function getRowNumber(row: DbRow, keys: string[]): number {
  for (const key of keys) {
    const value = row[key]
    const number = toNumber(value)
    if (Number.isFinite(number)) return number
  }
  return 0
}

function getOrderGrossTotal(order: DbRow): number {
  return getRowNumber(order, ["grossTotal", "gross_total", "total"])
}

function getOrderTaxAmount(order: DbRow): number {
  return getRowNumber(order, ["taxAmount", "tax_amount", "vatAmount", "vat_amount"])
}

function getOrderShippingAmount(order: DbRow): number {
  return getRowNumber(order, ["shippingAmount", "shipping_amount"])
}

function getOrderNetSales(order: DbRow): number {
  const stored = getRowNumber(order, ["netSales", "net_sales"])
  if (stored > 0) return stored
  return round(getOrderGrossTotal(order) - getOrderTaxAmount(order))
}

function buildSeries(rows: DbRow[]): MetricsSeriesPoint[] {
  const dayMap = new Map<string, { label: string; grossTotal: number; taxAmount: number; shippingAmount: number; netSales: number }>()

  for (const order of rows) {
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (!createdAt) continue
    const day = keyFromDate(createdAt)
    const entry = dayMap.get(day) ?? { label: dayLabelFromDate(createdAt), grossTotal: 0, taxAmount: 0, shippingAmount: 0, netSales: 0 }
    entry.grossTotal += getOrderGrossTotal(order)
    entry.taxAmount += getOrderTaxAmount(order)
    entry.shippingAmount += getOrderShippingAmount(order)
    entry.netSales += getOrderNetSales(order)
    dayMap.set(day, entry)
  }

  return Array.from(dayMap.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, entry]) => ({
      date,
      label: entry.label,
      grossTotal: round(entry.grossTotal),
      taxAmount: round(entry.taxAmount),
      shippingAmount: round(entry.shippingAmount),
      netSales: round(entry.netSales),
    }))
}

function buildTopProducts(orderRows: DbRow[], itemRows: DbRow[], productRows: DbRow[]): MetricsProductPoint[] {
  const productMap = new Map<string, { name: string; units: number; revenue: number }>()
  const productNameById = new Map<string, string>()

  for (const product of productRows) {
    const id = getRowString(product, ["id"])
    const name = getRowString(product, ["name"])
    if (id && name) {
      productNameById.set(id, name)
    }
  }

  const completedOrderIds = new Set(
    orderRows.filter((order) => getRowString(order, ["status"]) !== "cancelled").map((order) => getRowString(order, ["id"])),
  )

  for (const item of itemRows) {
    const orderId = getRowString(item, ["orderId", "order_id"])
    if (!orderId || !completedOrderIds.has(orderId)) continue
    const productId = getRowString(item, ["productId", "product_id"])
    const key = productId || getRowString(item, ["name"]) || "Producto"
    const productName = productNameById.get(productId) ?? key
    const entry = productMap.get(key) ?? { name: productName, units: 0, revenue: 0 }
    const quantity = clamp(getRowNumber(item, ["quantity"]), 0, Number.MAX_SAFE_INTEGER)
    const price = getRowNumber(item, ["price"])
    entry.units += quantity
    entry.revenue += price * quantity
    productMap.set(key, entry)
  }

  return Array.from(productMap.values())
    .sort((left, right) => right.units - left.units || right.revenue - left.revenue)
    .slice(0, 5)
    .map((entry) => ({
      name: entry.name,
      units: entry.units,
      revenue: round(entry.revenue),
    }))
}

function buildInventoryAlerts(productRows: DbRow[]): MetricsInventoryAlert[] {
  return productRows
    .map((product) => ({
      id: getRowString(product, ["id"]),
      name: getRowString(product, ["name"]),
      quantity: Math.max(0, Math.round(getRowNumber(product, ["stock"]))),
      minStock: Math.max(0, Math.round(getRowNumber(product, ["minStock", "min_stock"]))),
    }))
    .filter((item) => item.quantity <= item.minStock)
    .sort((left, right) => left.quantity - right.quantity || left.name.localeCompare(right.name))
}

function buildKpis(current: Snapshot, previous: Snapshot): MetricsKpi[] {
  const currentOrders = current.orders.filter((order) => getRowString(order, ["status"]) !== "cancelled")
  const previousOrders = previous.orders.filter((order) => getRowString(order, ["status"]) !== "cancelled")

  const currentSales = currentOrders.reduce((sum, order) => sum + getOrderGrossTotal(order), 0)
  const previousSales = previousOrders.reduce((sum, order) => sum + getOrderGrossTotal(order), 0)
  const currentAvgTicket = currentOrders.length ? currentSales / currentOrders.length : 0
  const previousAvgTicket = previousOrders.length ? previousSales / previousOrders.length : 0

  const currentClientIds = new Set<string>()
  const previousClientIds = new Set<string>()

  for (const order of current.orders) {
    const userId = getRowString(order, ["userId", "user_id"])
    if (userId) currentClientIds.add(userId)
  }
  for (const reservation of current.reservations) {
    const userId = getRowString(reservation, ["userId", "user_id"])
    if (userId) currentClientIds.add(userId)
  }
  for (const order of previous.orders) {
    const userId = getRowString(order, ["userId", "user_id"])
    if (userId) previousClientIds.add(userId)
  }
  for (const reservation of previous.reservations) {
    const userId = getRowString(reservation, ["userId", "user_id"])
    if (userId) previousClientIds.add(userId)
  }

  const currentPending = current.orders.filter((order) => getRowString(order, ["status"]) === "pending").length
  const previousPending = previous.orders.filter((order) => getRowString(order, ["status"]) === "pending").length

  return [
    {
      label: "Total Sales",
      value: round(currentSales),
      trend: trendPercent(currentSales, previousSales),
      trendLabel: `vs ${previousSales > 0 ? `$${round(previousSales)}` : "periodo anterior"}`,
    },
    {
      label: "Avg Ticket",
      value: round(currentAvgTicket),
      trend: trendPercent(currentAvgTicket, previousAvgTicket),
      trendLabel: `vs ${previousAvgTicket > 0 ? `$${round(previousAvgTicket)}` : "periodo anterior"}`,
    },
    {
      label: "Active Clients",
      value: currentClientIds.size,
      trend: trendPercent(currentClientIds.size, previousClientIds.size),
      trendLabel: `vs ${previousClientIds.size} clientes`,
    },
    {
      label: "Pending Orders",
      value: currentPending,
      trend: trendPercent(currentPending, previousPending),
      trendLabel: `vs ${previousPending} pedidos`,
    },
  ]
}

function buildClientsSection(current: Snapshot): SectionPayload {
  const clientStats = new Map<string, { name: string; orders: number; reservations: number; spent: number }>()

  for (const order of current.orders) {
    const userId = getRowString(order, ["userId", "user_id"])
    if (!userId) continue
    const user = current.users.find((entry) => getRowString(entry, ["id"]) === userId)
    const name = `${getRowString(user ?? {}, ["firstName", "first_name"])} ${getRowString(user ?? {}, ["lastName", "last_name"])}`.trim() || userId
    const entry = clientStats.get(userId) ?? { name, orders: 0, reservations: 0, spent: 0 }
    entry.orders += 1
    entry.spent += getOrderGrossTotal(order)
    clientStats.set(userId, entry)
  }

  for (const reservation of current.reservations) {
    const userId = getRowString(reservation, ["userId", "user_id"])
    if (!userId) continue
    const user = current.users.find((entry) => getRowString(entry, ["id"]) === userId)
    const name = `${getRowString(user ?? {}, ["firstName", "first_name"])} ${getRowString(user ?? {}, ["lastName", "last_name"])}`.trim() || userId
    const entry = clientStats.get(userId) ?? { name, orders: 0, reservations: 0, spent: 0 }
    entry.reservations += 1
    clientStats.set(userId, entry)
  }

  const clients = Array.from(clientStats.values()).sort((left, right) => right.spent - left.spent)
  const cards = [
    { label: "Clientes activos", value: clients.length },
    { label: "Clientes con reserva", value: current.reservations.length },
    { label: "Ingreso medio", value: `$${round(mean(clients.map((entry) => entry.spent)))}` },
    { label: "Interacciones top", value: clients[0]?.orders ?? 0 },
  ]
  const bars: ChartBar[] = clients.slice(0, 5).map((entry) => ({
    label: entry.name,
    value: entry.orders + entry.reservations,
    secondary: round(entry.spent),
  }))
  const table = {
    columns: ["Cliente", "Pedidos", "Reservas", "Gastado"],
    rows: clients.slice(0, 10).map((entry) => ({
      Cliente: entry.name,
      Pedidos: entry.orders,
      Reservas: entry.reservations,
      Gastado: round(entry.spent),
    })),
  }

  return {
    title: SECTION_TITLES.clients,
    hasData: clients.length > 0,
    cards,
    bars,
    table,
  }
}

function buildSalesSection(current: Snapshot, series: MetricsSeriesPoint[], topProducts: MetricsProductPoint[]): SectionPayload {
  const completedOrders = current.orders.filter((order) => getRowString(order, ["status"]) !== "cancelled")
  const salesTotal = completedOrders.reduce((sum, order) => sum + getOrderGrossTotal(order), 0)
  const taxTotal = completedOrders.reduce((sum, order) => sum + getOrderTaxAmount(order), 0)
  const shippingTotal = completedOrders.reduce((sum, order) => sum + getOrderShippingAmount(order), 0)
  const netSalesTotal = completedOrders.reduce((sum, order) => sum + getOrderNetSales(order), 0)
  const avgTicket = completedOrders.length ? salesTotal / completedOrders.length : 0
  const cards = [
    { label: "Ventas brutas", value: `$${round(salesTotal)}` },
    { label: "Taxes", value: `$${round(taxTotal)}` },
    { label: "Envíos", value: `$${round(shippingTotal)}` },
    { label: "Ventas netas", value: `$${round(netSalesTotal)}` },
    { label: "Ticket promedio", value: `$${round(avgTicket)}` },
    { label: "Pedidos", value: completedOrders.length },
  ]
  const bars: ChartBar[] = series.slice(-5).map((point) => ({
    label: point.label,
    value: point.grossTotal,
  }))
  const table = {
    columns: ["Producto", "Unidades", "Ingresos"],
    rows: topProducts.map((product) => ({
      Producto: product.name,
      Unidades: product.units,
      Ingresos: product.revenue,
    })),
  }

  return {
    title: SECTION_TITLES.sales,
    hasData: completedOrders.length > 0,
    cards,
    bars,
    table,
  }
}

function buildPaymentsSection(current: Snapshot): SectionPayload {
  const amountByMethod = new Map<string, number>()
  let total = 0
  let pending = 0
  for (const payment of current.payments) {
    const method = getRowString(payment, ["method"]) || "desconocido"
    const amount = getRowNumber(payment, ["amount"])
    amountByMethod.set(method, (amountByMethod.get(method) ?? 0) + amount)
    total += amount
    if (getRowString(payment, ["status"]) === "pending") pending += 1
  }
  const bars: ChartBar[] = Array.from(amountByMethod.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value: round(value) }))

  return {
    title: SECTION_TITLES.payments,
    hasData: current.payments.length > 0,
    cards: [
      { label: "Pagos procesados", value: current.payments.length },
      { label: "Monto total", value: `$${round(total)}` },
      { label: "Pendientes", value: pending },
      { label: "Métodos", value: amountByMethod.size },
    ],
    bars,
  }
}

function buildOrdersSection(current: Snapshot): SectionPayload {
  const statusCounts = new Map<string, number>()
  const hourCounts = new Map<string, number>()
  for (const order of current.orders) {
    const status = getRowString(order, ["status"]) || "unknown"
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (createdAt) {
      const hour = hourFromDate(createdAt)
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
    }
  }

  const bars: ChartBar[] = Array.from(statusCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }))
  const table = {
    columns: ["Estado", "Cantidad"],
    rows: Array.from(statusCounts.entries()).map(([label, value]) => ({
      Estado: label,
      Cantidad: value,
    })),
  }

  return {
    title: SECTION_TITLES.orders,
    hasData: current.orders.length > 0,
    cards: [
      { label: "Pedidos totales", value: current.orders.length },
      { label: "Pendientes", value: statusCounts.get("pending") ?? 0 },
      { label: "Confirmados", value: statusCounts.get("confirmed") ?? 0 },
      { label: "Cancelados", value: statusCounts.get("cancelled") ?? 0 },
    ],
    bars,
    table,
    message: hourCounts.size ? `Hora más cargada: ${Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]}` : undefined,
  }
}

function buildAnalyticsSection(current: Snapshot): SectionPayload {
  const pageCounts = new Map<string, number>()
  const conversionEvents = new Map<string, number>()
  let totalTime = 0
  let conversionCount = 0
  for (const entry of current.analytics) {
    const path = getRowString(entry, ["pagePath", "page_path"]) || "/"
    pageCounts.set(path, (pageCounts.get(path) ?? 0) + 1)
    totalTime += getRowNumber(entry, ["timeOnPage", "time_on_page"])
    const event = getRowString(entry, ["conversionEvent", "conversion_event"])
    if (event) {
      conversionEvents.set(event, (conversionEvents.get(event) ?? 0) + 1)
      conversionCount += 1
    }
  }

  const bars: ChartBar[] = Array.from(pageCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }))

  return {
    title: SECTION_TITLES.analytics,
    hasData: current.analytics.length > 0,
    cards: [
      { label: "Eventos", value: current.analytics.length },
      { label: "Tiempo total", value: `${round(totalTime / 60)} min` },
      { label: "Páginas únicas", value: pageCounts.size },
      { label: "Conversiones", value: conversionCount },
    ],
    bars,
  }
}

function buildEmployeesSection(current: Snapshot): SectionPayload {
  const sourceCounts = new Map<string, number>()
  const hourCounts = new Map<string, number>()

  for (const order of current.orders) {
    const sourceType = getRowString(order, ["sourceType", "source_type"]) || "directo"
    sourceCounts.set(sourceType, (sourceCounts.get(sourceType) ?? 0) + 1)
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (createdAt) {
      const hour = hourFromDate(createdAt)
      hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
    }
  }

  const bars: ChartBar[] = Array.from(sourceCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }))

  return {
    title: SECTION_TITLES.employees,
    hasData: current.orders.length > 0 || current.reservations.length > 0,
    cards: [
      { label: "Operaciones", value: current.orders.length + current.reservations.length },
      { label: "Canal dominante", value: Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A" },
      { label: "Horas activas", value: hourCounts.size },
      { label: "Reservas", value: current.reservations.length },
    ],
    bars,
  }
}

function buildInventorySection(current: Snapshot): SectionPayload {
  const productAlerts = buildInventoryAlerts(current.products)

  const bars: ChartBar[] = productAlerts.slice(0, 5).map((item) => ({
    label: item.name,
    value: item.quantity,
    secondary: item.minStock,
  }))

  return {
    title: SECTION_TITLES.inventory,
    hasData: current.products.length > 0 || current.inventoryItems.length > 0,
    cards: [
      { label: "Alertas", value: productAlerts.length },
      { label: "Items inventario", value: current.inventoryItems.length || current.products.length },
      { label: "Ledger", value: current.inventoryLedger.length },
      { label: "Stock crítico", value: productAlerts.filter((item) => item.quantity === 0).length },
    ],
    bars,
    table: {
      columns: ["Item", "Cantidad", "Mínimo"],
      rows: productAlerts.slice(0, 10).map((item) => ({
        Item: item.name,
        Cantidad: item.quantity,
        Mínimo: item.minStock,
      })),
    },
  }
}

function buildSalesWindows(current: Snapshot): ForecastSummary[] {
  const windows = [
    { label: "7 días", days: 7 },
    { label: "14 días", days: 14 },
    { label: "30 días", days: 30 },
  ]

  return windows.map((window) => {
    const cutoff = new Date()
    cutoff.setUTCDate(cutoff.getUTCDate() - window.days)
    const filtered = current.orders.filter((order) => {
      const createdAt = getRowDate(order, ["createdAt", "created_at"])
      return createdAt ? createdAt >= cutoff : false
    })
    const revenue = filtered.reduce((sum, order) => sum + getOrderGrossTotal(order), 0)
    const buckets = new Map<string, { revenue: number; orders: number }>()
    for (const order of filtered) {
      const createdAt = getRowDate(order, ["createdAt", "created_at"])
      if (!createdAt) continue
      const label = dayLabelFromDate(createdAt)
      const entry = buckets.get(label) ?? { revenue: 0, orders: 0 }
      entry.revenue += getOrderGrossTotal(order)
      entry.orders += 1
      buckets.set(label, entry)
    }
    const topActivity = Array.from(buckets.entries())
      .sort((left, right) => right[1].orders - left[1].orders)
      .slice(0, 3)
      .map(([label, entry]): ForecastActivity => ({ day: label, hour: "00:00", count: entry.orders }))
    return {
      label: window.label,
      days: window.days,
      revenue: round(revenue),
      orders: filtered.length,
      busiestDay: topActivity[0]?.day ?? "Sin datos",
      topActivity,
    }
  })
}

function buildBranchDemand(current: Snapshot): ForecastPayload["branchDemand"] {
  const branchMap = new Map<string, Map<string, number>>()
  for (const reservation of current.reservations) {
    const branch = getRowString(reservation, ["branchId", "branch_id"]) || "general"
    const date = getRowDate(reservation, ["reservationDate", "reservation_date"])
    if (!date) continue
    const day = keyFromDate(date)
    const revenue = getRowNumber(reservation, ["peopleCount", "people_count"])
    const branchEntry = branchMap.get(branch) ?? new Map<string, number>()
    branchEntry.set(day, (branchEntry.get(day) ?? 0) + revenue)
    branchMap.set(branch, branchEntry)
  }

  return Array.from(branchMap.entries()).map(([branch, points]) => ({
    branch,
    points: Array.from(points.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, revenue]) => ({ date, revenue: round(revenue) })),
  }))
}

function buildRestockForecast(current: Snapshot): ForecastRestock[] {
  const alerts = buildInventoryAlerts(current.products)
  return alerts.map((item) => {
    const avgDailyUse = item.minStock > 0 ? round(item.minStock / 7) : 0
    const daysRemaining = avgDailyUse > 0 ? round(item.quantity / avgDailyUse) : null
    return {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      avgDailyUse,
      daysRemaining,
      nextRestock: daysRemaining !== null ? `${Math.max(1, Math.round(daysRemaining))} días` : null,
    }
  })
}

function buildProductionForecast(current: Snapshot): ForecastProduction[] {
  const counts = new Map<string, number>()
  const hours = new Map<string, number>()
  for (const order of current.orders) {
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (!createdAt) continue
    const hour = hourFromDate(createdAt)
    hours.set(hour, (hours.get(hour) ?? 0) + 1)
    const sourceType = getRowString(order, ["sourceType", "source_type"]) || "general"
    counts.set(sourceType, (counts.get(sourceType) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([sourceType, count], index) => ({
      id: `${sourceType}-${index}`,
      name: sourceType,
      dailyAverage: round(count / Math.max(1, current.orders.length)),
      weeklyDemand: round(count * 7),
      peakHour: Array.from(hours.entries()).sort((left, right) => right[1] - left[1])[0]?.[0] ?? "00:00",
    }))
}

function buildMarketingInsights(current: Snapshot): MarketingInsights {
  const salesByClient = new Map<string, { orders: number; spent: number }>()
  for (const order of current.orders) {
    const userId = getRowString(order, ["userId", "user_id"]) || "guest"
    const entry = salesByClient.get(userId) ?? { orders: 0, spent: 0 }
    entry.orders += 1
    entry.spent += getOrderGrossTotal(order)
    salesByClient.set(userId, entry)
  }

  const points = Array.from(salesByClient.values()).map((entry) => ({
    orders: entry.orders,
    spent: entry.spent,
  }))
  const sortedByOrders = [...points].sort((left, right) => left.orders - right.orders)
  const minOrders = sortedByOrders[0]?.orders ?? 0
  const maxOrders = sortedByOrders[sortedByOrders.length - 1]?.orders ?? 0
  const k1Threshold = minOrders + (maxOrders - minOrders) / 3
  const k2Threshold = minOrders + ((maxOrders - minOrders) * 2) / 3
  const clusterCounts = [0, 0, 0]
  const clusterSpent = [0, 0, 0]

  for (const point of points) {
    const clusterIndex = point.orders <= k1Threshold ? 0 : point.orders <= k2Threshold ? 1 : 2
    clusterCounts[clusterIndex] += 1
    clusterSpent[clusterIndex] += point.spent
  }

  const salesClusters: MarketingSegment[] = ["K1", "K2", "K3"].map((name, index) => ({
    name,
    description: index === 0 ? "Clientes ocasionales" : index === 1 ? "Clientes recurrentes" : "Clientes intensivos",
    count: clusterCounts[index],
    avgTicket: clusterCounts[index] ? round(clusterSpent[index] / clusterCounts[index]) : 0,
    chart: {
      points: points.slice(index * 2, index * 2 + 4),
      centroid: {
        orders: clusterCounts[index] ? round(clusterCounts[index]) : 0,
        spent: clusterCounts[index] ? round(clusterSpent[index] / clusterCounts[index]) : 0,
      },
    },
  }))

  const productSuggestions: MarketingSuggestion[] = buildTopProducts(current.orders, current.orderItems, current.products)
    .slice(0, 5)
    .map((product) => ({
      product: product.name,
      reason: product.units > 5 ? "Demanda sostenida en el rango" : "Oportunidad de promoción cruzada",
    }))

  const hourCounts = new Map<string, number>()
  for (const order of current.orders) {
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (!createdAt) continue
    const hour = hourFromDate(createdAt)
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1)
  }

  const bestHours = Array.from(hourCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([hour, count]) => ({ day: hour, hour, count }))

  const pageSequenceByVisitor = new Map<string, DbRow[]>()
  for (const entry of current.analytics) {
    const visitor = getRowString(entry, ["userId", "user_id"]) || getRowString(entry, ["userAgent", "user_agent"]) || "anon"
    const list = pageSequenceByVisitor.get(visitor) ?? []
    list.push(entry)
    pageSequenceByVisitor.set(visitor, list)
  }
  const transitionCounts = new Map<string, number>()
  for (const entries of pageSequenceByVisitor.values()) {
    const sorted = [...entries].sort((left, right) => {
      const leftDate = getRowDate(left, ["createdAt", "created_at"])?.getTime() ?? 0
      const rightDate = getRowDate(right, ["createdAt", "created_at"])?.getTime() ?? 0
      return leftDate - rightDate
    })
    for (let index = 0; index < sorted.length - 1; index += 1) {
      const from = getRowString(sorted[index], ["pagePath", "page_path"]) || "/"
      const to = getRowString(sorted[index + 1], ["pagePath", "page_path"]) || "/"
      const key = `${from} -> ${to}`
      transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1)
    }
  }

  const orderInference: MarketingOrderInference[] = Array.from(transitionCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([transition, count]) => {
      const [from, to] = transition.split(" -> ")
      return {
        from,
        to,
        probability: round(count / Math.max(1, current.analytics.length)),
      }
    })

  const inventoryBayesian: MarketingInventoryInsight[] = buildInventoryAlerts(current.products)
    .slice(0, 5)
    .map((item) => {
      const risk = item.quantity === 0 ? "Crítico" : item.quantity <= item.minStock / 2 ? "Alto" : "Medio"
      return {
        item: item.name,
        risk,
        recommendation: item.quantity === 0 ? "Reordenar hoy" : "Monitorear diariamente",
      }
    })

  const dailySales = new Map<string, number>()
  for (const order of current.orders) {
    const createdAt = getRowDate(order, ["createdAt", "created_at"])
    if (!createdAt) continue
    const day = keyFromDate(createdAt)
    dailySales.set(day, (dailySales.get(day) ?? 0) + getOrderGrossTotal(order))
  }
  const salesValues = Array.from(dailySales.values())
  const salesMean = mean(salesValues)
  const salesStd = stdDev(salesValues)
  const anomalies: MarketingAnomaly[] = Array.from(dailySales.entries())
    .filter(([, revenue]) => salesStd > 0 && Math.abs((revenue - salesMean) / salesStd) >= 1.5)
    .map(([date, revenue]) => ({
      label: date,
      description: `Z-score ${round((revenue - salesMean) / salesStd)} con ventas de $${round(revenue)}`,
    }))

  return {
    salesClusters,
    productSuggestions,
    bestHours,
    orderInference,
    inventoryBayesian,
    anomalies,
  }
}

function buildForecasts(current: Snapshot): ForecastPayload {
  return {
    restock: buildRestockForecast(current),
    production: buildProductionForecast(current),
    salesWindows: buildSalesWindows(current),
    branchDemand: buildBranchDemand(current),
  }
}

function buildSections(current: Snapshot, currentSeries: MetricsSeriesPoint[], currentTopProducts: MetricsProductPoint[]): Record<SectionId, SectionPayload> {
  return {
    clients: buildClientsSection(current),
    sales: buildSalesSection(current, currentSeries, currentTopProducts),
    payments: buildPaymentsSection(current),
    orders: buildOrdersSection(current),
    analytics: buildAnalyticsSection(current),
    employees: buildEmployeesSection(current),
    inventory: buildInventorySection(current),
  }
}

export function resolveMetricsWindow(range: string | null | undefined): RangeWindow {
  const normalized = (range ?? "30d") as MetricsRange
  const allowed: MetricsRange[] = ["1d", "3d", "7d", "14d", "30d", "90d", "365d", "month"]
  const selected = allowed.includes(normalized) ? normalized : "30d"
  return resolveRangeWindow(selected)
}

export function resolveMetricsWindowWithMonth(range: string | null | undefined, selectedMonth?: string | null) {
  const normalized = (range ?? "30d") as MetricsRange
  const allowed: MetricsRange[] = ["1d", "3d", "7d", "14d", "30d", "90d", "365d", "month"]
  const selected = allowed.includes(normalized) ? normalized : "30d"
  return resolveRangeWindow(selected, selectedMonth)
}

export async function getMetricsPayload(
  db: NeonDb,
  range: string | null | undefined,
  selectedMonth?: string | null,
): Promise<MetricsPayload> {
  const window = resolveMetricsWindowWithMonth(range, selectedMonth)
  const current = await fetchSnapshot(db, window.since, window.until)
  const previous = await fetchSnapshot(db, window.previousSince, window.previousUntil)

  const currentSeries = buildSeries(current.orders)
  const topProducts = buildTopProducts(current.orders, current.orderItems, current.products)
  const sections = buildSections(current, currentSeries, topProducts)
  const forecasts = buildForecasts(current)
  const marketing = buildMarketingInsights(current)
  const kpis = buildKpis(current, previous)
  const inventoryAlerts = buildInventoryAlerts(current.products)

  return {
    range: window.range,
    rangeLabel: window.rangeLabel,
    since: window.since.toISOString(),
    until: window.until.toISOString(),
    selectedMonth: selectedMonth ?? null,
    hasData: current.orders.length > 0 || current.payments.length > 0 || current.analytics.length > 0,
    sections,
    forecasts,
    marketing,
    kpis,
    salesSeries: currentSeries,
    topProducts,
    inventoryAlerts,
    availableMonths: buildAvailableMonths(),
  }
}

export async function getProductStockSnapshot(db: NeonDb, handle: string): Promise<ProductStockSnapshot | null> {
  const normalizedHandle = handle.trim().toLowerCase()
  if (!normalizedHandle) return null

  const rows = await safeQuery("products", db.select().from(products))
  for (const row of rows) {
    const id = getRowString(row, ["id"])
    const name = getRowString(row, ["name"])
    const slug = slugify(name)
    if (id === normalizedHandle || slug === normalizedHandle) {
      return {
        id,
        handle: slug,
        name,
        stock: Math.max(0, Math.round(getRowNumber(row, ["stock"]))),
        minStock: Math.max(0, Math.round(getRowNumber(row, ["minStock", "min_stock"]))),
      }
    }
  }

  return null
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
