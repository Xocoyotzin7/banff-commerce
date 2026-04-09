import type { SavedPaymentMethod, PaymentCountry, SavePaymentMethodInput } from "@/types/payment-methods"

type DemoPaymentMethodSeed = SavedPaymentMethod & {
  providerToken: string
  userId: string
}

type DemoState = {
  paymentMethods: DemoPaymentMethodSeed[]
}

declare global {
  // eslint-disable-next-line no-var
  var __banffPaymentMethodsDemoState: DemoState | undefined
}

function isoNow(offsetMinutes = 0) {
  const date = new Date()
  date.setMinutes(date.getMinutes() - offsetMinutes)
  return date.toISOString()
}

function normalizeBrand(value?: string | null, country?: PaymentCountry) {
  const raw = value?.trim().toLowerCase()
  if (raw === "visa" || raw === "mastercard" || raw === "amex" || raw === "discover") return raw
  return country === "CA" ? "visa" : "mastercard"
}

function normalizeLast4(value?: string | null) {
  const digits = value?.replace(/[^\d]/g, "") ?? ""
  if (digits.length >= 4) return digits.slice(-4)
  return "4242"
}

function normalizeMonth(value?: number | null) {
  return value && value > 0 ? value : 12
}

function normalizeYear(value?: number | null) {
  const currentYear = new Date().getFullYear()
  return value && value > 0 ? value : currentYear + 3
}

function seedState(): DemoState {
  return {
    paymentMethods: [
      {
        id: "demo-pm-1",
        userId: "demo-client-1",
        country: "CA",
        provider: "stripe",
        cardBrand: "visa",
        cardLast4: "4242",
        cardExpMonth: 12,
        cardExpYear: 2028,
        isDefault: true,
        createdAt: isoNow(180),
        providerToken: "pm_demo_visa_4242",
      },
      {
        id: "demo-pm-2",
        userId: "demo-client-1",
        country: "MX",
        provider: "openpay",
        cardBrand: "mastercard",
        cardLast4: "1234",
        cardExpMonth: 11,
        cardExpYear: 2027,
        isDefault: true,
        createdAt: isoNow(240),
        providerToken: "tok_demo_openpay_1234",
      },
    ],
  }
}

function getState() {
  if (!globalThis.__banffPaymentMethodsDemoState) {
    globalThis.__banffPaymentMethodsDemoState = seedState()
  }

  return globalThis.__banffPaymentMethodsDemoState
}

function toSafeMethod(method: DemoPaymentMethodSeed): SavedPaymentMethod {
  return {
    id: method.id,
    country: method.country,
    provider: method.provider,
    cardBrand: method.cardBrand,
    cardLast4: method.cardLast4,
    cardExpMonth: method.cardExpMonth,
    cardExpYear: method.cardExpYear,
    isDefault: method.isDefault,
    createdAt: method.createdAt,
  }
}

export function listDemoPaymentMethods(userId = "demo-client-1"): SavedPaymentMethod[] {
  return getState()
    .paymentMethods.filter((method) => method.userId === userId)
    .sort((left, right) => Number(right.isDefault) - Number(left.isDefault) || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map(toSafeMethod)
}

export function saveDemoPaymentMethod(userId: string, input: SavePaymentMethodInput): SavedPaymentMethod {
  const state = getState()
  const id = `demo-pm-${state.paymentMethods.length + 1}`
  const isDefault = input.isDefault ?? state.paymentMethods.filter((method) => method.userId === userId && method.country === input.country).length === 0
  const method: DemoPaymentMethodSeed = {
    id,
    userId,
    country: input.country,
    provider: input.country === "CA" ? "stripe" : "openpay",
    cardBrand: normalizeBrand(input.cardBrand, input.country),
    cardLast4: normalizeLast4(input.cardLast4),
    cardExpMonth: normalizeMonth(input.cardExpMonth),
    cardExpYear: normalizeYear(input.cardExpYear),
    isDefault,
    createdAt: new Date().toISOString(),
    providerToken: input.providerToken,
  }

  if (isDefault) {
    state.paymentMethods = state.paymentMethods.map((existing) =>
      existing.userId === userId && existing.country === input.country ? { ...existing, isDefault: false } : existing,
    )
  }

  state.paymentMethods.push(method)
  return toSafeMethod(method)
}

export function deleteDemoPaymentMethod(userId: string, paymentMethodId: string): boolean {
  const state = getState()
  const index = state.paymentMethods.findIndex((method) => method.userId === userId && method.id === paymentMethodId)
  if (index < 0) return false

  const [removed] = state.paymentMethods.splice(index, 1)
  if (removed?.isDefault) {
    const replacement = state.paymentMethods.find((method) => method.userId === userId && method.country === removed.country)
    if (replacement) {
      replacement.isDefault = true
    }
  }

  return true
}
