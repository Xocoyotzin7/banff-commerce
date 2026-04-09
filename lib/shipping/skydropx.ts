import type { ShippingRate } from "@/types/shipping"

import { ShippingProviderError } from "@/lib/shipping/errors"

type SkydropxQuotationInput = {
  zip_from: string
  zip_to: string
  parcel: {
    weight: number
    height: number
    width: number
    length: number
  }
}

type SkydropxQuotationResponse = Array<{
  provider?: string
  service_level_name?: string
  total_pricing?: number | string
  days?: number | string
}>

function getApiKey() {
  return process.env.SKYDROPX_API_KEY?.trim() || ""
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapSkydropxRate(data: NonNullable<SkydropxQuotationResponse[number]>): ShippingRate {
  const days = Math.max(0, Math.round(toNumber(data.days)))

  return {
    provider: data.provider ?? "Skydropx",
    service: data.service_level_name ?? "Standard",
    price: toNumber(data.total_pricing),
    currency: "MXN",
    days_min: days,
    days_max: days + 1,
    carrier_logo: undefined,
    is_urgent: days <= 2,
  }
}

export async function fetchSkydropxRates(input: SkydropxQuotationInput): Promise<ShippingRate[]> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new ShippingProviderError("skydropx", 500, "SKYDROPX_API_KEY is not configured")
  }

  const response = await fetch("https://api.skydropx.com/v1/quotations", {
    method: "POST",
    headers: {
      Authorization: `Token token=${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ShippingProviderError("skydropx", response.status, message || "Failed to fetch quotations")
  }

  const payload = (await response.json()) as SkydropxQuotationResponse | { quotations?: SkydropxQuotationResponse }
  const rows = Array.isArray(payload) ? payload : payload.quotations ?? []

  return rows.map(mapSkydropxRate).sort((left, right) => left.price - right.price)
}
