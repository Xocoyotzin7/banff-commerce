import type { AccountOrderAddress, AccountOrderDetail, AccountOrderListItem, AccountOrdersPayload } from "@/lib/account/orders"
import { calculateOrderFinancialSummary } from "@/lib/orders/financials"
import type { ShippingRate } from "@/types/shipping"

type DemoAccountOrderSeed = AccountOrderDetail & {
  userId: string
}

type DemoState = {
  orders: DemoAccountOrderSeed[]
}

declare global {
  // eslint-disable-next-line no-var
  var __banffAccountOrdersDemoState: DemoState | undefined
}

function isoHoursAgo(hoursAgo: number) {
  const date = new Date()
  date.setHours(date.getHours() - hoursAgo)
  return date.toISOString()
}

function money(value: number) {
  return Number(value.toFixed(2))
}

function buildAddress(name: string, country: "MX" | "CA", index: number): AccountOrderAddress {
  return {
    fullName: name,
    street: country === "MX" ? `${120 + index} Calle Banff` : `${250 + index} King St W`,
    city: country === "MX" ? "Ciudad de México" : "Toronto",
    region: country === "MX" ? "CDMX" : "Ontario",
    postalCode: country === "MX" ? "06600" : "M5V 3A8",
    country,
    phone: country === "MX" ? "+52 55 5555 0101" : "+1 416 555 0101",
  }
}

function buildRates(country: "MX" | "CA"): ShippingRate[] {
  const rates: ShippingRate[] =
    country === "MX"
      ? [
          { provider: "Skydropx", service: "Terrestre", price: 115, currency: "MXN", days_min: 3, days_max: 5, is_urgent: false },
          { provider: "DHL", service: "Express", price: 188, currency: "MXN", days_min: 1, days_max: 2, is_urgent: true },
        ]
      : [
          { provider: "Easyship", service: "Expedited Parcel", price: 118, currency: "CAD", days_min: 3, days_max: 5, is_urgent: false },
          { provider: "UPS", service: "Express Saver", price: 164, currency: "CAD", days_min: 1, days_max: 2, is_urgent: true },
        ]

  return rates
}

function buildSeedState(): DemoState {
  const quotedRates1 = buildRates("MX")
  const quotedRates2 = buildRates("MX")
  const quotedRates3 = buildRates("CA")
  const quotedRates4 = buildRates("CA")
  const financials1 = calculateOrderFinancialSummary(1320, quotedRates1[0]?.price ?? 0, "MX")
  const financials2 = calculateOrderFinancialSummary(2100, quotedRates2[0]?.price ?? 0, "MX")
  const financials3 = calculateOrderFinancialSummary(1198, quotedRates3[0]?.price ?? 0, "CA")
  const financials4 = calculateOrderFinancialSummary(1600, quotedRates4[0]?.price ?? 0, "CA")

  const orders: DemoAccountOrderSeed[] = [
    {
      userId: "demo-client-1",
      id: "demo-order-1",
      orderNumber: "BF-4201",
      clientName: "Andrea Gómez",
      clientEmail: "andrea@banff.mx",
      country: "MX",
      status: "PENDING_FULFILLMENT",
      itemCount: 2,
      grossTotal: financials1.grossTotal,
      total: financials1.grossTotal,
      createdAt: isoHoursAgo(12),
      carrier: null,
      subtotal: money(1320),
      vatAmount: financials1.taxAmount,
      taxAmount: financials1.taxAmount,
      shippingAmount: financials1.shippingAmount,
      netSales: financials1.netSales,
      tipAmount: money(0),
      shippingAddress: buildAddress("Andrea Gómez", "MX", 1),
      items: [
        { id: "demo-order-1-item-1", productId: "p1", name: "Mochila Sierra", quantity: 1, unitWeightKg: 1.2, subtotalWeightKg: 1.2, price: 980, currency: "MXN" },
        { id: "demo-order-1-item-2", productId: "p2", name: "Botella térmica", quantity: 1, unitWeightKg: 0.4, subtotalWeightKg: 0.4, price: 560, currency: "MXN" },
      ],
      trackingId: null,
      trackingUrl: null,
      shippedAt: null,
      outForDeliveryAt: null,
      deliveredAt: null,
      reviewRating: null,
      reviewComment: null,
      reviewedAt: null,
      quotedRates: quotedRates1,
    },
    {
      userId: "demo-client-1",
      id: "demo-order-2",
      orderNumber: "BF-4202",
      clientName: "Andrea Gómez",
      clientEmail: "andrea@banff.mx",
      country: "MX",
      status: "SHIPPED",
      itemCount: 3,
      grossTotal: financials2.grossTotal,
      total: financials2.grossTotal,
      createdAt: isoHoursAgo(54),
      carrier: "Skydropx",
      subtotal: money(2100),
      vatAmount: financials2.taxAmount,
      taxAmount: financials2.taxAmount,
      shippingAmount: financials2.shippingAmount,
      netSales: financials2.netSales,
      tipAmount: money(0),
      shippingAddress: buildAddress("Andrea Gómez", "MX", 2),
      items: [
        { id: "demo-order-2-item-1", productId: "p3", name: "Chaqueta alpina", quantity: 2, unitWeightKg: 0.9, subtotalWeightKg: 1.8, price: 920, currency: "MXN" },
        { id: "demo-order-2-item-2", productId: "p4", name: "Gorra trail", quantity: 1, unitWeightKg: 0.2, subtotalWeightKg: 0.2, price: 620, currency: "MXN" },
      ],
      trackingId: "EST-1234567890",
      trackingUrl: "https://rastreo.estafeta.com/",
      shippedAt: isoHoursAgo(36),
      outForDeliveryAt: null,
      deliveredAt: null,
      reviewRating: null,
      reviewComment: null,
      reviewedAt: null,
      quotedRates: quotedRates2,
    },
    {
      userId: "demo-client-1",
      id: "demo-order-3",
      orderNumber: "BF-4203",
      clientName: "Andrea Gómez",
      clientEmail: "andrea@banff.mx",
      country: "CA",
      status: "OUT_FOR_DELIVERY",
      itemCount: 1,
      grossTotal: financials3.grossTotal,
      total: financials3.grossTotal,
      createdAt: isoHoursAgo(90),
      carrier: "Easyship",
      subtotal: money(1198),
      vatAmount: financials3.taxAmount,
      taxAmount: financials3.taxAmount,
      shippingAmount: financials3.shippingAmount,
      netSales: financials3.netSales,
      tipAmount: money(0),
      shippingAddress: buildAddress("Andrea Gómez", "CA", 3),
      items: [
        { id: "demo-order-3-item-1", productId: "p5", name: "Duffel Glacier", quantity: 1, unitWeightKg: 1.5, subtotalWeightKg: 1.5, price: 1198, currency: "CAD" },
      ],
      trackingId: "CA-TRACK-99887766",
      trackingUrl: "https://www.canadapost.ca/trackweb/",
      shippedAt: isoHoursAgo(60),
      outForDeliveryAt: isoHoursAgo(8),
      deliveredAt: null,
      reviewRating: null,
      reviewComment: null,
      reviewedAt: null,
      quotedRates: quotedRates3,
    },
    {
      userId: "demo-client-1",
      id: "demo-order-4",
      orderNumber: "BF-4204",
      clientName: "Andrea Gómez",
      clientEmail: "andrea@banff.mx",
      country: "CA",
      status: "DELIVERED",
      itemCount: 2,
      grossTotal: financials4.grossTotal,
      total: financials4.grossTotal,
      createdAt: isoHoursAgo(138),
      carrier: "Easyship",
      subtotal: money(1600),
      vatAmount: financials4.taxAmount,
      taxAmount: financials4.taxAmount,
      shippingAmount: financials4.shippingAmount,
      netSales: financials4.netSales,
      tipAmount: money(0),
      shippingAddress: buildAddress("Andrea Gómez", "CA", 4),
      items: [
        { id: "demo-order-4-item-1", productId: "p6", name: "Jacket North", quantity: 1, unitWeightKg: 1.1, subtotalWeightKg: 1.1, price: 1080, currency: "CAD" },
        { id: "demo-order-4-item-2", productId: "p7", name: "Insulated mug", quantity: 1, unitWeightKg: 0.4, subtotalWeightKg: 0.4, price: 520, currency: "CAD" },
      ],
      trackingId: "CA-DEL-44556677",
      trackingUrl: "https://www.canadapost.ca/trackweb/",
      shippedAt: isoHoursAgo(112),
      outForDeliveryAt: isoHoursAgo(64),
      deliveredAt: isoHoursAgo(18),
      reviewRating: 5,
      reviewComment: "Llegó rápido y el empaque estuvo impecable.",
      reviewedAt: isoHoursAgo(12),
      quotedRates: quotedRates4,
    },
  ]

  return { orders }
}

function getState() {
  if (!globalThis.__banffAccountOrdersDemoState) {
    globalThis.__banffAccountOrdersDemoState = buildSeedState()
  }
  return globalThis.__banffAccountOrdersDemoState
}

function toPayload(order: DemoAccountOrderSeed): AccountOrderListItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    clientName: order.clientName,
    clientEmail: order.clientEmail,
    country: order.country,
    status: order.status,
    itemCount: order.itemCount,
    total: order.total,
    createdAt: order.createdAt,
    carrier: order.carrier,
  }
}

export function getDemoAccountOrdersPayload(userId = "demo-client-1"): AccountOrdersPayload {
  const orders = getState().orders
    .filter((order) => order.userId === userId)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

  return {
    orders: orders.map(toPayload),
    total: orders.length,
    updatedAt: new Date().toISOString(),
  }
}

export function getDemoAccountOrderDetail(userId: string, orderId: string): AccountOrderDetail | null {
  const order = getState().orders.find((item) => item.userId === userId && item.id === orderId)
  return order ? { ...order } : null
}

export function reviewDemoAccountOrder(
  userId: string,
  orderId: string,
  input: { rating: number; comment: string | null },
): AccountOrderDetail | null {
  const index = getState().orders.findIndex((item) => item.userId === userId && item.id === orderId)
  if (index < 0) return null

  const order = getState().orders[index]
  const updated: DemoAccountOrderSeed = {
    ...order,
    reviewRating: input.rating,
    reviewComment: input.comment,
    reviewedAt: new Date().toISOString(),
  }

  getState().orders[index] = updated
  return { ...updated }
}
