import { headers as nextHeaders } from "next/headers"

export type GeoCountry = "MX" | "CA" | "US" | "OTHER"
export type GeoCurrency = "MXN" | "CAD" | "USD"
export type GeoGateway = "stripe" | "openpay"
export type GeoLocale = "es-MX" | "en-CA" | "en-US"

export type GeoConfig = {
  country: GeoCountry
  currency: GeoCurrency
  gateway: GeoGateway
  symbol: "$" | "CA$"
  locale: GeoLocale
  isCanada: boolean
  isMexico: boolean
  flagCountry: "MX" | "CA" | "US"
  testCards: string[]
}

const STRIPE_TEST_CARDS = [
  "Stripe: 4242 4242 4242 4242 (Visa)",
  "Stripe: 5555 5555 5555 4444 (Mastercard)",
  "CVC: cualquier 3 dígitos",
]

const OPENPAY_TEST_CARDS = [
  "Openpay: 4111 1111 1111 1111 (aprobada)",
  "Openpay: 4000 0000 0000 0002 (declinada)",
]

function buildConfig(country: GeoCountry): GeoConfig {
  if (country === "MX") {
    return {
      country,
      currency: "MXN",
      gateway: "openpay",
      symbol: "$",
      locale: "es-MX",
      isCanada: false,
      isMexico: true,
      flagCountry: "MX",
      testCards: [...OPENPAY_TEST_CARDS, ...STRIPE_TEST_CARDS],
    }
  }

  if (country === "US") {
    return {
      country,
      currency: "USD",
      gateway: "stripe",
      symbol: "$",
      locale: "en-US",
      isCanada: false,
      isMexico: false,
      flagCountry: "US",
      testCards: [...STRIPE_TEST_CARDS],
    }
  }

  if (country === "OTHER") {
    return {
      country,
      currency: "CAD",
      gateway: "stripe",
      symbol: "CA$",
      locale: "en-CA",
      isCanada: false,
      isMexico: false,
      flagCountry: "CA",
      testCards: [...STRIPE_TEST_CARDS],
    }
  }

  return {
    country: "CA",
    currency: "CAD",
    gateway: "stripe",
    symbol: "CA$",
    locale: "en-CA",
    isCanada: true,
    isMexico: false,
    flagCountry: "CA",
    testCards: [...STRIPE_TEST_CARDS],
  }
}

function normalizeCountryCode(value: string | null | undefined): GeoCountry | null {
  const country = value?.trim().toUpperCase()

  if (country === "MX" || country === "CA" || country === "US") {
    return country
  }

  if (!country) {
    return null
  }

  return "OTHER"
}

function getHeaderCountry(inputHeaders?: Headers | Pick<Headers, "get"> | null): GeoCountry | null {
  const headerCountry = inputHeaders?.get("x-vercel-ip-country") ?? inputHeaders?.get("cf-ipcountry") ?? null
  return normalizeCountryCode(headerCountry)
}

async function resolveCountryFromIpApi(): Promise<GeoCountry> {
  try {
    const response = await fetch("http://ip-api.com/json/?fields=status,countryCode", {
      cache: "no-store",
      headers: {
        accept: "application/json",
      },
    })

    if (!response.ok) {
      return "CA"
    }

    const data = (await response.json()) as { status?: string; countryCode?: string }
    const country = normalizeCountryCode(data.countryCode)

    return country ?? "CA"
  } catch {
    return "CA"
  }
}

export async function detectCountry(inputHeaders?: Headers | Pick<Headers, "get"> | null): Promise<GeoConfig> {
  const headerCountry = getHeaderCountry(inputHeaders ?? nextHeaders())

  if (headerCountry) {
    return buildConfig(headerCountry)
  }

  const ipCountry = await resolveCountryFromIpApi()
  return buildConfig(ipCountry)
}

export function getGeoConfig(country: string): GeoConfig {
  const normalized = normalizeCountryCode(country) ?? "CA"
  return buildConfig(normalized)
}
