export type OrderCountry = "MX" | "CA"

export type OrderFinancialSummary = {
  grossTotal: number
  taxAmount: number
  shippingAmount: number
  netSales: number
}

const TAX_RATE_BY_COUNTRY: Record<OrderCountry, number> = {
  MX: 0.16,
  CA: 0.13,
}

function roundMoney(value: number) {
  return Number(value.toFixed(2))
}

export function getOrderTaxRate(country: OrderCountry) {
  return TAX_RATE_BY_COUNTRY[country]
}

export function calculateOrderFinancialSummary(
  subtotal: number,
  shippingAmount: number,
  country: OrderCountry,
): OrderFinancialSummary {
  const netSales = roundMoney(Math.max(0, subtotal) + Math.max(0, shippingAmount))
  const taxAmount = roundMoney(netSales * getOrderTaxRate(country))
  const grossTotal = roundMoney(netSales + taxAmount)

  return {
    grossTotal,
    taxAmount,
    shippingAmount: roundMoney(Math.max(0, shippingAmount)),
    netSales,
  }
}
