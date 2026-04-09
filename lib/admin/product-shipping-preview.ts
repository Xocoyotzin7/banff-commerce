import type { ShippingRate } from "@/types/shipping"
import type { AdminProductRecord } from "@/lib/admin/products"
import { calculateCartShipping, type CartItem } from "@/lib/shipping/cart-weight"
import { calculateOrderFinancialSummary } from "@/lib/orders/financials"

export type ProductShippingPreviewCountry = "MX" | "CA"

export type ProductShippingPreviewCustomer = {
  fullName: string
  email: string
  phone: string
}

export type ProductShippingPreviewAddress = {
  fullName: string
  street: string
  city: string
  region: string
  postalCode: string
  country: ProductShippingPreviewCountry
  phone: string
}

export type ProductShippingPreviewItem = {
  id: string
  productId: string
  name: string
  imageUrl: string
  quantity: number
  unitWeightKg: number
  subtotalWeightKg: number
  price: number
  currency: "MXN" | "CAD"
}

export type ProductShippingPreviewSummary = {
  itemCount: number
  totalWeightKg: number
  totalSubtotal: number
  grossTotal: number
  taxAmount: number
  shippingAmount: number
  netSales: number
  currency: "MXN" | "CAD"
}

export type ProductShippingPreview = {
  productId: string
  country: ProductShippingPreviewCountry
  customer: ProductShippingPreviewCustomer
  shippingAddress: ProductShippingPreviewAddress
  parcel: ReturnType<typeof calculateCartShipping>
  rates: ShippingRate[]
  selectedRate: ShippingRate
  items: ProductShippingPreviewItem[]
  summary: ProductShippingPreviewSummary
}

function money(value: number) {
  return Number(value.toFixed(2))
}

function weight(value: number) {
  return Number(value.toFixed(3))
}

export function resolveProductPreviewCountry(input?: string | null): ProductShippingPreviewCountry {
  const raw = input?.trim().toUpperCase() ?? ""
  if (raw === "MX") return "MX"
  if (raw === "CA") return "CA"
  return "CA"
}

function buildCustomer(country: ProductShippingPreviewCountry): ProductShippingPreviewCustomer {
  if (country === "MX") {
    return {
      fullName: "Andrea Gómez",
      email: "andrea@demo.mx",
      phone: "+52 55 5555 0101",
    }
  }

  return {
    fullName: "Mila Thompson",
    email: "mila@demo.ca",
    phone: "+1 416 555 0101",
  }
}

export function buildProductShippingAddress(
  customer: ProductShippingPreviewCustomer,
  country: ProductShippingPreviewCountry,
  index: number,
): ProductShippingPreviewAddress {
  return {
    fullName: customer.fullName,
    street: country === "MX" ? `${120 + index} Calle Banff` : `${250 + index} King St W`,
    city: country === "MX" ? "Ciudad de México" : "Toronto",
    region: country === "MX" ? "CDMX" : "Ontario",
    postalCode: country === "MX" ? "06600" : "M5V 3A8",
    country,
    phone: customer.phone,
  }
}

function buildRates(country: ProductShippingPreviewCountry, totalWeightKg: number): ShippingRate[] {
  const baseRates =
    country === "MX"
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

  return baseRates
    .map((rate, index) => ({
      provider: rate.provider,
      service: rate.service,
      price: Math.round(rate.price + totalWeightKg * (country === "MX" ? 9 : 11) + index * 14),
      currency: country === "MX" ? ("MXN" as const) : ("CAD" as const),
      days_min: rate.days_min,
      days_max: rate.days_max,
      carrier_logo: undefined,
      is_urgent: rate.days_min <= 2,
    }))
    .sort((left, right) => left.price - right.price)
}

function buildCartItems(products: AdminProductRecord[], country: ProductShippingPreviewCountry): ProductShippingPreviewItem[] {
  const currency = country === "MX" ? ("MXN" as const) : ("CAD" as const)

  return products.map((entry, index) => {
    const quantity = [2, 1, 1][index] ?? 1
    const unitWeightKg = Number(entry.weightKg)
    const subtotalWeightKg = weight(unitWeightKg * quantity)
    const price = Number(entry.price)

    return {
      id: `${entry.id}-${index}`,
      productId: entry.id,
      name: entry.name,
      imageUrl: entry.imageUrl,
      quantity,
      unitWeightKg,
      subtotalWeightKg,
      price,
      currency,
    }
  })
}

function pickSupportingProducts(catalog: AdminProductRecord[], productId: string) {
  const primary = catalog.find((product) => product.id === productId) ?? catalog[0]
  const rest = catalog.filter((product) => product.id !== primary?.id)
  const secondary = rest.find((product) => product.category === primary?.category) ?? rest[0]
  const tertiary = rest.find((product) => product.id !== secondary?.id && product.category !== primary?.category) ?? rest[1]

  return [primary, secondary, tertiary].filter((product): product is AdminProductRecord => Boolean(product))
}

export function buildProductShippingPreview(
  catalog: AdminProductRecord[],
  productId: string,
  country: ProductShippingPreviewCountry,
): ProductShippingPreview | null {
  const product = catalog.find((entry) => entry.id === productId)
  if (!product) {
    return null
  }

  const customer = buildCustomer(country)
  const supportingProducts = pickSupportingProducts(catalog, productId)
  const items = buildCartItems(supportingProducts, country)

  const shippingItems: CartItem[] = supportingProducts.map((entry, index) => {
    const quantity = [2, 1, 1][index] ?? 1
    return {
      weight_kg: Number(entry.weightKg),
      length_cm: Number(entry.lengthCm),
      width_cm: Number(entry.widthCm),
      height_cm: Number(entry.heightCm),
      quantity,
    }
  })

  const parcel = calculateCartShipping(shippingItems)
  const rates = buildRates(country, parcel.billable_weight_kg)
  const subtotal = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shippingAmount = rates[0]?.price ?? 0
  const financials = calculateOrderFinancialSummary(subtotal, shippingAmount, country)
  const summary = {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalWeightKg: weight(parcel.weight_kg),
    totalSubtotal: subtotal,
    grossTotal: financials.grossTotal,
    taxAmount: financials.taxAmount,
    shippingAmount: financials.shippingAmount,
    netSales: financials.netSales,
    currency: country === "MX" ? ("MXN" as const) : ("CAD" as const),
  }

  return {
    productId,
    country,
    customer,
    shippingAddress: buildProductShippingAddress(customer, country, summary.itemCount),
    parcel,
    rates,
    selectedRate: rates[0] ?? {
      provider: country === "MX" ? "ESTAFETA" : "Canada Post",
      service: country === "MX" ? "Terrestre" : "Expedited Parcel",
      price: 0,
      currency: country === "MX" ? "MXN" : "CAD",
      days_min: 0,
      days_max: 0,
      is_urgent: false,
      carrier_logo: undefined,
    },
    items,
    summary,
  }
}
