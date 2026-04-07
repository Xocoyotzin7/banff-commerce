export type PaymentGateway = "stripe" | "openpay"

export function getGateway(country: string): PaymentGateway {
  return country.trim().toUpperCase() === "MX" ? "openpay" : "stripe"
}
