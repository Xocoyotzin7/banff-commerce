import { and, desc, eq, sql } from "drizzle-orm"

import type { NeonDb } from "@/lib/db/adapters/neon"
import { orderItems, orders, products, users } from "@/lib/db/schema"
import type { ShippingRate } from "@/types/shipping"

type AccountSelectDatabase = Pick<NeonDb, "select">

export type AccountOrderStatus = "PENDING_FULFILLMENT" | "SHIPPED" | "OUT_FOR_DELIVERY" | "DELIVERED"

export type AccountOrderListItem = {
  id: string
  orderNumber: string
  clientName: string
  clientEmail: string | null
  country: "MX" | "CA"
  status: AccountOrderStatus
  itemCount: number
  total: number
  createdAt: string
  carrier: string | null
}

export type AccountOrderAddress = {
  fullName: string
  street: string
  city: string
  region: string
  postalCode: string
  country: "MX" | "CA"
  phone: string
}

export type AccountOrderItem = {
  id: string
  productId: string
  name: string
  quantity: number
  unitWeightKg: number
  subtotalWeightKg: number
  price: number
  currency: "MXN" | "CAD"
}

export type AccountOrderDetail = AccountOrderListItem & {
  grossTotal: number
  subtotal: number
  vatAmount: number
  taxAmount: number
  shippingAmount: number
  netSales: number
  tipAmount: number
  shippingAddress: AccountOrderAddress
  items: AccountOrderItem[]
  trackingId: string | null
  trackingUrl: string | null
  shippedAt: string | null
  outForDeliveryAt: string | null
  deliveredAt: string | null
  reviewRating: number | null
  reviewComment: string | null
  reviewedAt: string | null
  quotedRates: ShippingRate[]
}

export type AccountOrdersPayload = {
  orders: AccountOrderListItem[]
  total: number
  updatedAt: string
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
  if (raw === "MX" || raw.includes("MEX")) return "MX"
  return "CA"
}

function normalizeStatus(value: unknown, outForDeliveryAt: unknown, deliveredAt: unknown): AccountOrderStatus {
  if (toDate(deliveredAt)) return "DELIVERED"
  const raw = toText(value).trim().toLowerCase()
  if (raw === "out_for_delivery" || raw === "out for delivery" || toDate(outForDeliveryAt)) return "OUT_FOR_DELIVERY"
  if (raw === "shipped") return "SHIPPED"
  return "PENDING_FULFILLMENT"
}

function buildClientName(firstName: unknown, lastName: unknown, email: unknown) {
  const fullName = [toText(firstName).trim(), toText(lastName).trim()].filter(Boolean).join(" ").trim()
  return fullName || toText(email) || "Cliente"
}

function parseShippingAddress(shippingAddress: unknown, country: "MX" | "CA", fullName: string, orderNumber: string): AccountOrderAddress {
  const parsed = shippingAddress && typeof shippingAddress === "object" ? (shippingAddress as Record<string, unknown>) : null

  return {
    fullName: toText(parsed?.fullName) || fullName,
    street: toText(parsed?.street) || `${orderNumber} Banff Ave`,
    city: toText(parsed?.city) || (country === "MX" ? "Ciudad de México" : "Toronto"),
    region: toText(parsed?.region) || (country === "MX" ? "CDMX" : "Ontario"),
    postalCode: toText(parsed?.postalCode) || (country === "MX" ? "06600" : "M5V 3A8"),
    country,
    phone: toText(parsed?.phone) || (country === "MX" ? "+52 55 5555 5555" : "+1 416 555 5555"),
  }
}

function parseShippingRates(quotedRates: unknown): ShippingRate[] {
  if (!Array.isArray(quotedRates)) return []

  const rates: ShippingRate[] = []

  for (const rate of quotedRates) {
    if (!rate || typeof rate !== "object") continue
    const entry = rate as Partial<ShippingRate>
    if (!entry.provider || !entry.service) continue
    rates.push({
      provider: entry.provider,
      service: entry.service,
      price: toNumber(entry.price),
      currency: entry.currency === "MXN" ? "MXN" : "CAD",
      days_min: toNumber(entry.days_min),
      days_max: toNumber(entry.days_max),
      carrier_logo: typeof entry.carrier_logo === "string" ? entry.carrier_logo : undefined,
      is_urgent: Boolean(entry.is_urgent),
    })
  }

  return rates.sort((left, right) => left.price - right.price)
}

function mapOrderRow(row: Record<string, unknown>): AccountOrderListItem {
  const country = normalizeCountry(row.country ?? row.userCountry)
  return {
    id: toText(row.id),
    orderNumber: toText(row.orderNumber),
    clientName: buildClientName(row.clientFirstName, row.clientLastName, row.clientEmail),
    clientEmail: toText(row.clientEmail) || null,
    country,
    status: normalizeStatus(row.status, row.outForDeliveryAt, row.deliveredAt),
    itemCount: Math.max(0, Math.round(toNumber(row.itemCount))),
    total: Number(toNumber(row.total).toFixed(2)),
    createdAt: toText(row.createdAt) || new Date().toISOString(),
    carrier: toText(row.carrier) || null,
  }
}

function itemCurrency(country: "MX" | "CA"): "MXN" | "CAD" {
  return country === "MX" ? "MXN" : "CAD"
}

export async function listAccountOrders(database: AccountSelectDatabase, userId: string): Promise<AccountOrdersPayload> {
  const rows = await database
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      clientFirstName: users.firstName,
      clientLastName: users.lastName,
      clientEmail: users.email,
      itemCount: sql<number>`count(${orderItems.id})`,
      total: orders.total,
      country: orders.country,
      userCountry: users.country,
      status: orders.status,
      carrier: orders.carrier,
      outForDeliveryAt: orders.outForDeliveryAt,
      outForDeliveryNotifiedAt: orders.outForDeliveryNotifiedAt,
      deliveredAt: orders.deliveredAt,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.userId, userId))
    .groupBy(
      orders.id,
      orders.orderNumber,
      users.firstName,
      users.lastName,
      users.email,
      orders.total,
      orders.country,
      users.country,
      orders.status,
      orders.carrier,
      orders.outForDeliveryAt,
      orders.outForDeliveryNotifiedAt,
      orders.deliveredAt,
      orders.createdAt,
    )
    .orderBy(desc(orders.createdAt))

  return {
    total: rows.length,
    updatedAt: new Date().toISOString(),
    orders: rows.map((row) => mapOrderRow(row as Record<string, unknown>)),
  }
}

export async function getAccountOrderDetail(
  database: AccountSelectDatabase,
  userId: string,
  orderId: string,
): Promise<AccountOrderDetail | null> {
  const rows = await database
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      clientFirstName: users.firstName,
      clientLastName: users.lastName,
      clientEmail: users.email,
      status: orders.status,
      country: orders.country,
      userCountry: users.country,
      createdAt: orders.createdAt,
      carrier: orders.carrier,
      trackingId: orders.trackingId,
      trackingUrl: orders.trackingUrl,
      shippedAt: orders.shippedAt,
      outForDeliveryAt: orders.outForDeliveryAt,
      deliveredAt: orders.deliveredAt,
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
      reviewRating: orders.reviewRating,
      reviewComment: orders.reviewComment,
      reviewedAt: orders.reviewedAt,
      itemId: orderItems.id,
      productId: products.id,
      productName: products.name,
      quantity: orderItems.quantity,
      unitWeightKg: products.weightKg,
      price: orderItems.price,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .groupBy(
      orders.id,
      orders.orderNumber,
      users.firstName,
      users.lastName,
      users.email,
      orders.status,
      orders.country,
      users.country,
      orders.carrier,
      orders.trackingId,
      orders.trackingUrl,
      orders.shippedAt,
      orders.outForDeliveryAt,
      orders.outForDeliveryNotifiedAt,
      orders.deliveredAt,
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
      orders.reviewRating,
      orders.reviewComment,
      orders.reviewedAt,
      orderItems.id,
      orderItems.quantity,
      orderItems.price,
      products.id,
      products.name,
      products.weightKg,
    )

  if (!rows.length) return null

  const orderRow = rows[0] as Record<string, unknown>
  const country = normalizeCountry(orderRow.country ?? orderRow.userCountry)
  const fullName = buildClientName(orderRow.clientFirstName, orderRow.clientLastName, orderRow.clientEmail)
  const createdAt = toDate(orderRow.createdAt) ?? new Date()
  const order = mapOrderRow(orderRow)
  const items = rows
    .filter((row) => toText((row as Record<string, unknown>).itemId))
    .map((row) => {
      const entry = row as Record<string, unknown>
      const quantity = Math.max(0, Math.round(toNumber(entry.quantity)))
      const unitWeightKg = Number(toNumber(entry.unitWeightKg).toFixed(3))
      return {
        id: toText(entry.itemId),
        productId: toText(entry.productId),
        name: toText(entry.productName),
        quantity,
        unitWeightKg,
        subtotalWeightKg: Number((unitWeightKg * quantity).toFixed(3)),
        price: toNumber(entry.price),
        currency: itemCurrency(country),
      }
    })

  return {
    ...order,
    clientName: fullName,
    createdAt: createdAt.toISOString(),
    grossTotal: Number(toNumber(orderRow.grossTotal ?? orderRow.total).toFixed(2)),
    subtotal: Number(toNumber(orderRow.subtotal).toFixed(2)),
    vatAmount: Number(toNumber(orderRow.vatAmount).toFixed(2)),
    taxAmount: Number(toNumber(orderRow.taxAmount ?? orderRow.vatAmount).toFixed(2)),
    shippingAmount: Number(toNumber(orderRow.shippingAmount).toFixed(2)),
    netSales: Number((toNumber(orderRow.netSales) || toNumber(orderRow.subtotal) + toNumber(orderRow.shippingAmount)).toFixed(2)),
    tipAmount: Number(toNumber(orderRow.tipAmount).toFixed(2)),
    shippingAddress: parseShippingAddress(orderRow.shippingAddress, country, fullName, toText(orderRow.orderNumber)),
    items,
    trackingId: toText(orderRow.trackingId) || null,
    trackingUrl: toText(orderRow.trackingUrl) || null,
    shippedAt: toText(orderRow.shippedAt) || null,
    outForDeliveryAt: toText(orderRow.outForDeliveryAt) || null,
    deliveredAt: toText(orderRow.deliveredAt) || null,
    reviewRating: orderRow.reviewRating == null ? null : Math.max(1, Math.min(5, Math.round(toNumber(orderRow.reviewRating)))),
    reviewComment: toText(orderRow.reviewComment) || null,
    reviewedAt: toText(orderRow.reviewedAt) || null,
    quotedRates: parseShippingRates(orderRow.quotedRates),
  }
}

export function normalizeAccountOrderStatus(status: AccountOrderStatus): "pending" | "shipped" | "delivered" {
  if (status === "DELIVERED") return "delivered"
  if (status === "SHIPPED" || status === "OUT_FOR_DELIVERY") return "shipped"
  return "pending"
}
