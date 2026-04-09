export type PaymentCountry = "MX" | "CA"
export type PaymentProvider = "stripe" | "openpay"

export type SavedPaymentMethod = {
  id: string
  country: PaymentCountry
  provider: PaymentProvider
  cardBrand: string
  cardLast4: string
  cardExpMonth: number
  cardExpYear: number
  isDefault: boolean
  createdAt: string
}

export type SavePaymentMethodInput = {
  country: PaymentCountry
  providerToken: string
  cardBrand?: string | null
  cardLast4?: string | null
  cardExpMonth?: number | null
  cardExpYear?: number | null
  isDefault?: boolean
}

export type PaymentMethodSelection = {
  paymentMethodId: string | null
  provider: PaymentProvider | null
  providerToken: string | null
}
