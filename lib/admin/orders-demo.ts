import { randomUUID } from "node:crypto"

import { listDemoAdminProducts } from "@/lib/admin/demo-data"
import { calculateOrderFinancialSummary } from "@/lib/orders/financials"
import type { ShippingRate } from "@/types/shipping"
import type {
  AdminOrderFilterStatus,
  AdminOrderDetail,
  AdminOrderRecord,
  AdminOrderItemDetail,
  AdminOrderShippingAddress,
  AdminOrderSortDirection,
  AdminOrderSortField,
  AdminOrdersPayload,
} from "@/lib/admin/orders"

type DemoOrderSeed = AdminOrderRecord & {
  clientEmail: string | null
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
  quotedRates: ShippingRate[]
  shippingAddress: AdminOrderShippingAddress
}

type DemoState = {
  orders: DemoOrderSeed[]
}

declare global {
  // eslint-disable-next-line no-var
  var __banffAdminOrdersDemoState: DemoState | undefined
}

function isoFromHoursAgo(hoursAgo: number) {
  const date = new Date()
  date.setHours(date.getHours() - hoursAgo)
  return date.toISOString()
}

function money(value: number) {
  return Number(value.toFixed(2))
}

function weight(value: number) {
  return Number(value.toFixed(3))
}

function buildOrderNumber(index: number) {
  return `BF-${String(2400 + index).padStart(4, "0")}`
}

function buildCustomer(index: number, country: "MX" | "CA") {
  const mxCustomers = [
    { name: "Andrea Gómez", email: "andrea@banff.mx" },
    { name: "Luis Hernández", email: "luis@banff.mx" },
    { name: "Paola Méndez", email: "paola@banff.mx" },
    { name: "Javier Soto", email: "javier@banff.mx" },
    { name: "Mariana Castillo", email: "mariana@banff.mx" },
  ]

  const caCustomers = [
    { name: "Mila Thompson", email: "mila@banff.ca" },
    { name: "Ethan Brooks", email: "ethan@banff.ca" },
    { name: "Sophie Martin", email: "sophie@banff.ca" },
    { name: "Noah Bennett", email: "noah@banff.ca" },
    { name: "Olivia Parker", email: "olivia@banff.ca" },
  ]

  const pool = country === "MX" ? mxCustomers : caCustomers
  return pool[index % pool.length]
}

function buildShippingAddress(name: string, country: "MX" | "CA", index: number): AdminOrderShippingAddress {
  return {
    fullName: name,
    street: country === "MX" ? `${120 + index} Calle Banff` : `${250 + index} King St W`,
    city: country === "MX" ? "Ciudad de México" : "Toronto",
    region: country === "MX" ? "CDMX" : "Ontario",
    postalCode: country === "MX" ? "06600" : "M5V 3A8",
    country,
    phone: country === "MX" ? `+52 55 55${String(1000 + index).slice(-4)} ${String(3000 + index).slice(-4)}` : `+1 416 555 ${String(1000 + index).slice(-4)}`,
  }
}

function buildQuotedRates(country: "MX" | "CA", totalWeight: number): ShippingRate[] {
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

function buildSeedState(): DemoState {
  const products = listDemoAdminProducts()
  const carriersByCountry = {
    MX: ["Estafeta", "DHL", "FedEx", "Paquetexpress"],
    CA: ["Canada Post", "UPS", "Purolator", "FedEx"],
  } as const

  const hoursAgoSequence = [6, 12, 18, 22, 29, 35, 41, 49, 58, 67, 73, 78, 81, 86, 94, 102, 118, 136, 148, 172, 196, 220, 244, 268, 292, 316, 340, 364]
  const statusSequence: Array<AdminOrderRecord["status"]> = [
    "pending",
    "processing",
    "pending",
    "shipped",
    "processing",
    "pending",
    "processing",
    "pending",
    "out_for_delivery",
    "processing",
    "pending",
    "pending",
    "processing",
    "out_for_delivery",
    "pending",
    "delivered",
    "processing",
    "pending",
    "out_for_delivery",
    "delivered",
    "processing",
    "pending",
    "out_for_delivery",
    "pending",
    "processing",
    "delivered",
    "pending",
    "shipped",
  ]

  const countries: Array<"MX" | "CA"> = [
    "MX",
    "CA",
    "MX",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "MX",
    "CA",
    "CA",
    "MX",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
    "MX",
    "CA",
  ]

  return {
    orders: hoursAgoSequence.map((hoursAgo, index) => {
      const country = countries[index] ?? "CA"
      const customer = buildCustomer(index, country)
      const primary = products[index % products.length]
      const secondary = products[(index + 2) % products.length]
      const quantityPrimary = (index % 3) + 1
      const quantitySecondary = index % 4 === 0 ? 1 : 0
      const itemCount = quantityPrimary + quantitySecondary
      const totalWeight = weight(
        Number(primary.weightKg) * quantityPrimary +
          (quantitySecondary ? Number(secondary.weightKg) * quantitySecondary : 0),
      )
      const carrier = carriersByCountry[country][index % carriersByCountry[country].length]
      const quotedRates = buildQuotedRates(country, totalWeight)
      const subtotal = money(430 + itemCount * 82 + totalWeight * 58)
      const shippingAmount = quotedRates[0]?.price ?? 0
      const financials = calculateOrderFinancialSummary(subtotal, shippingAmount, country)
      const status = statusSequence[index] ?? "pending"
      const shippedAt = status === "shipped" || status === "out_for_delivery" || status === "delivered" ? isoFromHoursAgo(Math.max(1, hoursAgo - 18)) : null
      const outForDeliveryAt =
        status === "out_for_delivery" || status === "delivered" ? isoFromHoursAgo(Math.max(1, hoursAgo - 8)) : null
      const deliveredAt = status === "delivered" ? isoFromHoursAgo(Math.max(1, hoursAgo - 2)) : null

      return {
        id: `demo-order-${randomUUID()}`,
        orderNumber: buildOrderNumber(index + 1),
        clientName: customer.name,
        clientEmail: customer.email,
        itemCount,
        totalWeight,
        country,
        selectedCarrier: carrier,
        status,
        createdAt: isoFromHoursAgo(hoursAgo),
        ageHours: hoursAgo,
        grossTotal: financials.grossTotal,
        total: financials.grossTotal,
        subtotal,
        vatAmount: financials.taxAmount,
        taxAmount: financials.taxAmount,
        shippingAmount: financials.shippingAmount,
        netSales: financials.netSales,
        tipAmount: money(index % 3 === 0 ? 15 : 0),
        carrier,
        trackingId: status === "pending" ? null : `${country === "MX" ? "MX" : "CA"}-${index + 1}-${randomUUID().slice(0, 8)}`,
        trackingUrl: status === "pending" ? null : country === "MX" ? "https://rastreo.estafeta.com/" : "https://www.canadapost.ca/trackweb/",
        shippedAt,
        outForDeliveryAt,
        deliveredAt,
        quotedRates,
        shippingAddress: buildShippingAddress(customer.name, country, index + 1),
      }
    }),
  }
}

function getState(): DemoState {
  if (!globalThis.__banffAdminOrdersDemoState) {
    globalThis.__banffAdminOrdersDemoState = buildSeedState()
  }
  return globalThis.__banffAdminOrdersDemoState
}

function normalizeStatus(status: AdminOrderFilterStatus) {
  switch (status) {
    case "all":
      return getState().orders
    case "pending":
    case "processing":
    case "shipped":
    case "delivered":
      return getState().orders.filter((order) => order.status === status)
    default:
      return getState().orders
  }
}

function compareValues(a: DemoOrderSeed, b: DemoOrderSeed, sortBy: AdminOrderSortField) {
  switch (sortBy) {
    case "orderNumber":
      return a.orderNumber.localeCompare(b.orderNumber)
    case "clientName":
      return a.clientName.localeCompare(b.clientName)
    case "itemCount":
      return a.itemCount - b.itemCount
    case "totalWeight":
      return a.totalWeight - b.totalWeight
    case "country":
      return a.country.localeCompare(b.country)
    case "selectedCarrier":
      return a.selectedCarrier.localeCompare(b.selectedCarrier)
    case "createdAt":
    default:
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  }
}

function sortOrders(orders: DemoOrderSeed[], sortBy: AdminOrderSortField, sortDir: AdminOrderSortDirection) {
  const direction = sortDir === "asc" ? 1 : -1
  return [...orders].sort((a, b) => {
    const comparison = compareValues(a, b, sortBy)
    if (comparison !== 0) return comparison * direction
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function getDemoAdminOrdersPayload(
  status: AdminOrderFilterStatus = "pending",
  page = 1,
  limit = 20,
  sortBy: AdminOrderSortField = "createdAt",
  sortDir: AdminOrderSortDirection = "desc",
): AdminOrdersPayload {
  const safePage = Math.max(1, Math.floor(page))
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)))
  const filtered = sortOrders(normalizeStatus(status), sortBy, sortDir)
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const start = (safePage - 1) * safeLimit

  return {
    page: safePage,
    limit: safeLimit,
    total,
    totalPages,
    status,
    sortBy,
    sortDir,
    updatedAt: new Date().toISOString(),
    orders: filtered.slice(start, start + safeLimit).map((order) => ({ ...order })),
  }
}

function buildItems(orderIndex: number, country: "MX" | "CA"): AdminOrderItemDetail[] {
  const products = listDemoAdminProducts()
  const first = products[orderIndex % products.length]
  const second = products[(orderIndex + 2) % products.length]
  const firstQty = (orderIndex % 3) + 1
  const secondQty = orderIndex % 4 === 0 ? 1 : 0
  const currency = country === "MX" ? ("MXN" as const) : ("CAD" as const)

  return [
    {
      id: `demo-item-${orderIndex}-1`,
      productId: first.id,
      name: first.name,
      quantity: firstQty,
      unitWeightKg: Number(first.weightKg),
      subtotalWeightKg: Number((Number(first.weightKg) * firstQty).toFixed(3)),
      price: Number(first.price),
      currency,
      lengthCm: Number(first.lengthCm),
      widthCm: Number(first.widthCm),
      heightCm: Number(first.heightCm),
    },
    ...(secondQty
      ? [
          {
            id: `demo-item-${orderIndex}-2`,
            productId: second.id,
            name: second.name,
            quantity: secondQty,
            unitWeightKg: Number(second.weightKg),
            subtotalWeightKg: Number((Number(second.weightKg) * secondQty).toFixed(3)),
            price: Number(second.price),
            currency,
            lengthCm: Number(second.lengthCm),
            widthCm: Number(second.widthCm),
            heightCm: Number(second.heightCm),
          },
        ]
      : []),
  ]
}

export function getDemoAdminOrderDetail(orderId: string): AdminOrderDetail | null {
  const index = getState().orders.findIndex((order) => order.id === orderId)
  if (index < 0) return null

  const order = getState().orders[index]
  const items = buildItems(index, order.country)
  const totalWeight = Number(items.reduce((sum, item) => sum + item.subtotalWeightKg, 0).toFixed(3))
  const selectedRate = order.quotedRates[0] ?? null

  return {
    ...order,
    clientName: order.clientName,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalWeight,
    carrier: order.carrier,
    selectedRate,
    items,
    shippingAddress: order.shippingAddress,
    quotedRates: order.quotedRates,
  }
}

export function shipDemoAdminOrder(
  orderId: string,
  input: { carrier: string; trackingId: string; trackingUrl: string },
): AdminOrderDetail | null {
  const index = getState().orders.findIndex((order) => order.id === orderId)
  if (index < 0) return null

  const current = getState().orders[index]
  const next: DemoOrderSeed = {
    ...current,
    status: "shipped",
    carrier: input.carrier,
    selectedCarrier: input.carrier,
    trackingId: input.trackingId,
    trackingUrl: input.trackingUrl,
    shippedAt: new Date().toISOString(),
  }

  getState().orders[index] = next
  return getDemoAdminOrderDetail(orderId)
}
