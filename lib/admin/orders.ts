import { asc, desc, eq, inArray, sql } from "drizzle-orm"

import type { NeonDb } from "@/lib/db/adapters/neon"
import { orderItems, orders, products, users } from "@/lib/db/schema"
import type { ShippingRate } from "@/types/shipping"

type AdminSelectDatabase = Pick<NeonDb, "select">

export type AdminOrderStatus = "pending" | "processing" | "shipped" | "out_for_delivery" | "delivered" | "cancelled" | "confirmed" | "completed"
export type AdminOrderFilterStatus = "all" | "pending" | "processing" | "shipped" | "delivered"
export type AdminOrderSortField = "createdAt" | "orderNumber" | "clientName" | "itemCount" | "totalWeight" | "country" | "selectedCarrier"
export type AdminOrderSortDirection = "asc" | "desc"

export type AdminOrderRecord = {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string | null
  itemCount: number
  totalWeight: number
  country: "MX" | "CA"
  selectedCarrier: string
  status: AdminOrderStatus
  createdAt: string
  ageHours: number
}

export type AdminOrderShippingAddress = {
  fullName: string
  street: string
  city: string
  region: string
  postalCode: string
  country: "MX" | "CA"
  phone: string
}

export type AdminOrderItemDetail = {
  id: string
  productId: string
  name: string
  quantity: number
  unitWeightKg: number
  subtotalWeightKg: number
  price: number
  currency: "MXN" | "CAD"
  lengthCm: number
  widthCm: number
  heightCm: number
}

export type AdminOrderDetail = AdminOrderRecord & {
  grossTotal: number
  total: number
  subtotal: number
  vatAmount: number
  taxAmount: number
  shippingAmount: number
  netSales: number
  tipAmount: number
  carrier: string
  trackingId: string | null
  trackingUrl: string | null
  shippedAt: string | null
  outForDeliveryAt: string | null
  shippingAddress: AdminOrderShippingAddress
  quotedRates: ShippingRate[]
  selectedRate: ShippingRate | null
  items: AdminOrderItemDetail[]
}

export type AdminOrdersPayload = {
  page: number
  limit: number
  total: number
  totalPages: number
  status: AdminOrderFilterStatus
  sortBy: AdminOrderSortField
  sortDir: AdminOrderSortDirection
  updatedAt: string
  orders: AdminOrderRecord[]
}

type OrderRow = Record<string, unknown> & {
  id?: string | null
  orderNumber?: string | null
  clientFirstName?: string | null
  clientLastName?: string | null
  clientEmail?: string | null
  itemCount?: number | string | null
  totalWeight?: number | string | null
  country?: string | null
  userCountry?: string | null
  selectedCarrier?: string | null
  carrier?: string | null
  status?: string | null
  createdAt?: string | Date | null
}

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

function normalizeCountry(value: unknown): "MX" | "CA" {
  const raw = toText(value).trim().toUpperCase()
  if (raw === "MX" || raw.includes("MEX") || raw.includes("MÉX")) return "MX"
  return "CA"
}

function normalizeStatus(value: unknown): AdminOrderStatus {
  const raw = toText(value).trim().toLowerCase()
  if (raw === "processing" || raw === "confirmed") return "processing"
  if (raw === "shipped") return "shipped"
  if (raw === "out_for_delivery" || raw === "out for delivery" || raw === "out-of-delivery") return "out_for_delivery"
  if (raw === "delivered" || raw === "completed") return "delivered"
  if (raw === "cancelled" || raw === "canceled") return "cancelled"
  return "pending"
}

function resolveRawStatusFilter(status: AdminOrderFilterStatus): AdminOrderStatus[] {
  switch (status) {
    case "pending":
      return ["pending"]
    case "processing":
      return ["processing", "confirmed"]
    case "shipped":
      return ["shipped", "out_for_delivery"]
    case "delivered":
      return ["delivered", "completed"]
    case "all":
    default:
      return []
  }
}

function resolveSelectedCarrier(country: "MX" | "CA", rawCarrier: unknown) {
  const carrier = toText(rawCarrier).trim()
  if (carrier) return carrier
  return country === "MX" ? "Skydropx" : "Easyship"
}

function resolveShippingAddress(
  country: "MX" | "CA",
  shippingAddress: unknown,
  fullName: string,
  orderNumber: string,
): AdminOrderShippingAddress {
  const parsed = shippingAddress && typeof shippingAddress === "object" ? (shippingAddress as Record<string, unknown>) : null

  return {
    fullName: toText(parsed?.fullName) || fullName,
    street: toText(parsed?.street) || `${orderNumber} Banff Ave`,
    city: toText(parsed?.city) || (country === "MX" ? "Ciudad de México" : "Toronto"),
    region: toText(parsed?.region) || (country === "MX" ? "CDMX" : "Ontario"),
    postalCode: toText(parsed?.postalCode) || (country === "MX" ? "06600" : "M5V3A8"),
    country,
    phone: toText(parsed?.phone) || (country === "MX" ? "+52 55 5555 5555" : "+1 416 555 0100"),
  }
}

function toShippingRate(value: unknown): ShippingRate | null {
  if (!value || typeof value !== "object") return null
  const row = value as Record<string, unknown>
  const provider = toText(row.provider)
  const service = toText(row.service)
  const currency = toText(row.currency) === "CAD" ? "CAD" : "MXN"
  const price = toNumber(row.price)
  const daysMin = Math.max(0, Math.round(toNumber(row.days_min ?? row.daysMin)))
  const daysMax = Math.max(daysMin, Math.round(toNumber(row.days_max ?? row.daysMax)))
  if (!provider || !service) return null

  return {
    provider,
    service,
    price,
    currency,
    days_min: daysMin,
    days_max: daysMax,
    carrier_logo: toText(row.carrier_logo) || undefined,
    is_urgent: Boolean(row.is_urgent ?? daysMin <= 2),
  }
}

function buildFallbackQuotedRates(country: "MX" | "CA", totalWeight: number): ShippingRate[] {
  const base = country === "MX"
    ? [
        { provider: "ESTAFETA", service: "Terrestre", price: 115, days_min: 2, days_max: 4 },
        { provider: "DHL", service: "Express", price: 168, days_min: 1, days_max: 2 },
        { provider: "FedEx", service: "Priority", price: 182, days_min: 1, days_max: 2 },
      ]
    : [
        { provider: "Canada Post", service: "Expedited Parcel", price: 118, days_min: 2, days_max: 4 },
        { provider: "UPS", service: "Express Saver", price: 176, days_min: 1, days_max: 2 },
        { provider: "FedEx", service: "Priority", price: 186, days_min: 1, days_max: 2 },
      ]

  return base
    .map((rate, index) => ({
      provider: rate.provider,
      service: rate.service,
      price: Math.round(rate.price + totalWeight * (country === "MX" ? 9 : 11) + index * 14),
      currency: country === "MX" ? ("MXN" as const) : ("CAD" as const),
      days_min: rate.days_min,
      days_max: rate.days_max,
      carrier_logo: undefined,
      is_urgent: rate.days_min <= 2,
    }))
    .sort((a, b) => a.price - b.price)
}

function buildClientName(firstName: unknown, lastName: unknown, fallback: unknown) {
  const name = `${toText(firstName)} ${toText(lastName)}`.trim()
  return name || toText(fallback) || "Sin nombre"
}

function buildOrderBy(sortBy: AdminOrderSortField, sortDir: AdminOrderSortDirection) {
  const direction = sortDir === "asc" ? asc : desc
  const clientNameExpr = sql<string>`lower(trim(concat(coalesce(${users.firstName}, ''), ' ', coalesce(${users.lastName}, ''))))`
  const countryExpr = sql<string>`upper(coalesce(${orders.country}, ${users.country}, 'CA'))`
  const carrierExpr = sql<string>`lower(coalesce(${orders.selectedCarrier}, ''))`
  const itemCountExpr = sql<number>`count(${orderItems.id})`
  const totalWeightExpr = sql<number>`coalesce(sum(${products.weightKg} * ${orderItems.quantity}), 0)`

  switch (sortBy) {
    case "orderNumber":
      return [direction(orders.orderNumber), desc(orders.createdAt)]
    case "clientName":
      return [direction(clientNameExpr), desc(orders.createdAt)]
    case "itemCount":
      return [direction(itemCountExpr), desc(orders.createdAt)]
    case "totalWeight":
      return [direction(totalWeightExpr), desc(orders.createdAt)]
    case "country":
      return [direction(countryExpr), desc(orders.createdAt)]
    case "selectedCarrier":
      return [direction(carrierExpr), desc(orders.createdAt)]
    case "createdAt":
    default:
      return [direction(orders.createdAt), desc(orders.orderNumber)]
  }
}

export async function listAdminOrders(
  database: AdminSelectDatabase,
  {
    status = "pending",
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortDir = "desc",
  }: {
    status?: AdminOrderFilterStatus
    page?: number
    limit?: number
    sortBy?: AdminOrderSortField
    sortDir?: AdminOrderSortDirection
  } = {},
): Promise<AdminOrdersPayload> {
  const safePage = Math.max(1, Math.floor(page))
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)))
  const safeSortBy = sortBy ?? "createdAt"
  const safeSortDir = sortDir === "asc" ? "asc" : "desc"
  const rawStatuses = resolveRawStatusFilter(status)

  const totalRows = rawStatuses.length
    ? await database
        .select({ count: sql<number>`count(distinct ${orders.id})` })
        .from(orders)
        .leftJoin(users, eq(orders.userId, users.id))
        .where(inArray(orders.status, rawStatuses))
    : await database.select({ count: sql<number>`count(distinct ${orders.id})` }).from(orders).leftJoin(users, eq(orders.userId, users.id))
  const total = Math.max(0, Math.round(Number(totalRows[0]?.count ?? 0)))
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const offset = (safePage - 1) * safeLimit

  const itemCountExpr = sql<number>`count(${orderItems.id})`
  const totalWeightExpr = sql<number>`coalesce(sum(${products.weightKg} * ${orderItems.quantity}), 0)`
  const query = database
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      clientFirstName: users.firstName,
      clientLastName: users.lastName,
      clientEmail: users.email,
      itemCount: itemCountExpr,
      totalWeight: totalWeightExpr,
      country: orders.country,
      userCountry: users.country,
      selectedCarrier: orders.selectedCarrier,
      carrier: orders.carrier,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))

  const groupedQuery = rawStatuses.length ? query.where(inArray(orders.status, rawStatuses)) : query
  const rows = await groupedQuery
    .groupBy(
      orders.id,
      orders.orderNumber,
      orders.country,
      orders.selectedCarrier,
      orders.carrier,
      orders.status,
      orders.createdAt,
      users.firstName,
      users.lastName,
      users.email,
      users.country,
    )
    .orderBy(...buildOrderBy(safeSortBy, safeSortDir))
    .limit(safeLimit)
    .offset(offset)

  const now = Date.now()

  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    status,
    sortBy: safeSortBy,
    sortDir: safeSortDir,
    updatedAt: new Date().toISOString(),
    orders: (rows as OrderRow[]).map((row) => {
      const createdAt = toDate(row.createdAt) ?? new Date()
      const country = normalizeCountry(row.country ?? row.userCountry)
      const ageHours = Math.max(0, (now - createdAt.getTime()) / (1000 * 60 * 60))
      const carrier = resolveSelectedCarrier(country, row.carrier ?? row.selectedCarrier)
      return {
        id: toText(row.id),
        orderNumber: toText(row.orderNumber),
        clientName: buildClientName(row.clientFirstName, row.clientLastName, row.clientEmail),
        clientEmail: toText(row.clientEmail) || null,
        itemCount: Math.max(0, Math.round(toNumber(row.itemCount))),
        totalWeight: Math.max(0, Number(toNumber(row.totalWeight).toFixed(3))),
        country,
        selectedCarrier: carrier,
        status: normalizeStatus(row.status),
        createdAt: createdAt.toISOString(),
        ageHours,
      }
    }),
  }
}

export async function getAdminOrderDetail(database: AdminSelectDatabase, orderId: string): Promise<AdminOrderDetail | null> {
  const rows = await database
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      country: orders.country,
      selectedCarrier: orders.selectedCarrier,
      carrier: orders.carrier,
      trackingId: orders.trackingId,
      trackingUrl: orders.trackingUrl,
      shippedAt: orders.shippedAt,
      outForDeliveryAt: orders.outForDeliveryAt,
      quotedRates: orders.quotedRates,
      shippingAddress: orders.shippingAddress,
      grossTotal: orders.grossTotal,
      total: orders.total,
      subtotal: orders.subtotal,
      vatAmount: orders.vatAmount,
      taxAmount: orders.taxAmount,
      shippingAmount: orders.shippingAmount,
      netSales: orders.netSales,
      tipAmount: orders.tipAmount,
      createdAt: orders.createdAt,
      clientFirstName: users.firstName,
      clientLastName: users.lastName,
      clientEmail: users.email,
      clientCountry: users.country,
      itemId: orderItems.id,
      productId: products.id,
      productName: products.name,
      quantity: orderItems.quantity,
      unitWeightKg: products.weightKg,
      price: orderItems.price,
      lengthCm: products.lengthCm,
      widthCm: products.widthCm,
      heightCm: products.heightCm,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.id, orderId))
    .groupBy(
      orders.id,
      orders.orderNumber,
      orders.status,
      orders.country,
      orders.selectedCarrier,
      orders.carrier,
      orders.trackingId,
      orders.trackingUrl,
      orders.shippedAt,
      orders.outForDeliveryAt,
      orders.quotedRates,
      orders.shippingAddress,
      orders.grossTotal,
      orders.total,
      orders.subtotal,
      orders.vatAmount,
      orders.taxAmount,
      orders.shippingAmount,
      orders.netSales,
      orders.tipAmount,
      orders.createdAt,
      users.firstName,
      users.lastName,
      users.email,
      users.country,
      orderItems.id,
      orderItems.quantity,
      orderItems.price,
      products.id,
      products.name,
      products.weightKg,
      products.lengthCm,
      products.widthCm,
      products.heightCm,
    )

  if (!rows.length) {
    return null
  }

  const orderRow = rows[0] as Record<string, unknown>
  const fullName = buildClientName(orderRow.clientFirstName, orderRow.clientLastName, orderRow.clientEmail)
  const country = normalizeCountry(orderRow.country ?? orderRow.clientCountry)
  const createdAt = toDate(orderRow.createdAt) ?? new Date()
  const items = rows
    .filter((row) => toText((row as Record<string, unknown>).itemId))
    .map((row) => {
      const entry = row as Record<string, unknown>
      const quantity = Math.max(0, Math.round(toNumber(entry.quantity)))
      const unitWeightKg = Math.max(0, Number(toNumber(entry.unitWeightKg).toFixed(3)))
      return {
        id: toText(entry.itemId),
        productId: toText(entry.productId),
        name: toText(entry.productName),
        quantity,
        unitWeightKg,
        subtotalWeightKg: Number((unitWeightKg * quantity).toFixed(3)),
        price: toNumber(entry.price),
        currency: country === "MX" ? ("MXN" as const) : ("CAD" as const),
        lengthCm: Number(toNumber(entry.lengthCm).toFixed(1)),
        widthCm: Number(toNumber(entry.widthCm).toFixed(1)),
        heightCm: Number(toNumber(entry.heightCm).toFixed(1)),
      }
    })

  const totalWeight = Number(items.reduce((sum, item) => sum + item.subtotalWeightKg, 0).toFixed(3))
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const shippingAddress = resolveShippingAddress(country, orderRow.shippingAddress, fullName, toText(orderRow.orderNumber))
  const quotedRates = (Array.isArray(orderRow.quotedRates) ? orderRow.quotedRates : [])
    .map(toShippingRate)
    .filter((rate): rate is ShippingRate => rate !== null)
    .sort((a, b) => a.price - b.price)
  const fallbackRates = quotedRates.length ? quotedRates : buildFallbackQuotedRates(country, totalWeight)
  const selectedCarrier = resolveSelectedCarrier(country, orderRow.carrier ?? orderRow.selectedCarrier)
  const selectedRate = fallbackRates.find((rate) => rate.provider.toLowerCase().includes(selectedCarrier.toLowerCase()))
    ?? fallbackRates.find((rate) => rate.provider.toLowerCase() === selectedCarrier.toLowerCase())
    ?? fallbackRates[0]
    ?? null
  const subtotal = Number(toNumber(orderRow.subtotal).toFixed(2))
  const grossTotal = Number(toNumber(orderRow.grossTotal ?? orderRow.total).toFixed(2))
  const taxAmount = Number(toNumber(orderRow.taxAmount ?? orderRow.vatAmount).toFixed(2))
  const shippingAmount = Number(toNumber(orderRow.shippingAmount).toFixed(2))
  const netSales = Number((toNumber(orderRow.netSales) || subtotal + shippingAmount).toFixed(2))

  return {
    id: toText(orderRow.id),
    orderNumber: toText(orderRow.orderNumber),
    clientName: fullName,
    clientEmail: toText(orderRow.clientEmail) || null,
    itemCount: totalItems,
    totalWeight,
    country,
    selectedCarrier,
    status: normalizeStatus(orderRow.status),
    createdAt: createdAt.toISOString(),
    ageHours: Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)),
    total: Number(toNumber(orderRow.total).toFixed(2)),
    subtotal,
    vatAmount: Number(toNumber(orderRow.vatAmount).toFixed(2)),
    grossTotal,
    taxAmount,
    shippingAmount,
    netSales,
    tipAmount: Number(toNumber(orderRow.tipAmount).toFixed(2)),
    carrier: selectedCarrier,
    trackingId: toText(orderRow.trackingId) || null,
    trackingUrl: toText(orderRow.trackingUrl) || null,
    shippedAt: toDate(orderRow.shippedAt)?.toISOString() ?? null,
    outForDeliveryAt: toDate(orderRow.outForDeliveryAt)?.toISOString() ?? null,
    shippingAddress,
    quotedRates: fallbackRates,
    selectedRate,
    items,
  }
}

export function resolveOrderAgeLabel(ageHours: number): {
  label: string
  tone: "success" | "warning" | "destructive"
  urgent: boolean
  icon: null | "warning" | "pulse" | "strong-pulse"
} {
  if (ageHours < 24) {
    return {
      label: "Nuevo",
      tone: "success" as const,
      urgent: false,
      icon: null,
    }
  }

  if (ageHours < 48) {
    return {
      label: "24h+",
      tone: "warning" as const,
      urgent: false,
      icon: "warning" as const,
    }
  }

  if (ageHours < 72) {
    return {
      label: "48h+ ⚠️",
      tone: "destructive" as const,
      urgent: false,
      icon: "pulse" as const,
    }
  }

  return {
    label: "72h+ 🔴",
    tone: "destructive" as const,
    urgent: true,
    icon: "strong-pulse" as const,
  }
}
