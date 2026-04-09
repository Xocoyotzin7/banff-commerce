import type { ShippingRate } from "@/types/shipping"

import { ShippingProviderError } from "@/lib/shipping/errors"

type EasyshipRateInput = {
  origin_country_alpha2: "CA"
  origin_postal_code: string
  destination_country_alpha2: "CA"
  destination_postal_code: string
  taxes_duties_paid_by: "Sender"
  items: Array<{
    dimensions: {
      length: number
      width: number
      height: number
    }
    actual_weight: number
  }>
}

type EasyshipResponse = {
  rates?: Array<{
    courier_name?: string
    courier_service_name?: string
    total_charge?: number | string
    min_delivery_time?: number | string
    max_delivery_time?: number | string
    courier_logo?: string
  }>
}

function getApiKey() {
  return process.env.EASYSHIP_API_KEY?.trim() || ""
}

function getMerchantOriginZipCa() {
  return process.env.MERCHANT_ORIGIN_ZIP_CA?.trim() || ""
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function mapEasyshipRate(rate: NonNullable<NonNullable<EasyshipResponse["rates"]>[number]>): ShippingRate {
  const daysMin = Math.max(0, Math.round(toNumber(rate.min_delivery_time)))
  const daysMax = Math.max(daysMin, Math.round(toNumber(rate.max_delivery_time) || daysMin))

  return {
    provider: rate.courier_name ?? "Easyship",
    service: rate.courier_service_name ?? "Standard",
    price: toNumber(rate.total_charge),
    currency: "CAD",
    days_min: daysMin,
    days_max: daysMax,
    carrier_logo: rate.courier_logo,
    is_urgent: daysMin <= 2,
  }
}

export async function fetchEasyshipRates(input: {
  destZip: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}): Promise<ShippingRate[]> {
  const apiKey = getApiKey()
  const originZip = getMerchantOriginZipCa()

  if (!apiKey) {
    throw new ShippingProviderError("easyship", 500, "EASYSHIP_API_KEY is not configured")
  }

  if (!originZip) {
    throw new ShippingProviderError("easyship", 500, "MERCHANT_ORIGIN_ZIP_CA is not configured")
  }

  const body: EasyshipRateInput = {
    origin_country_alpha2: "CA",
    origin_postal_code: originZip,
    destination_country_alpha2: "CA",
    destination_postal_code: input.destZip,
    taxes_duties_paid_by: "Sender",
    items: [
      {
        dimensions: {
          length: input.lengthCm,
          width: input.widthCm,
          height: input.heightCm,
        },
        actual_weight: input.weightKg,
      },
    ],
  }

  const response = await fetch("https://api.easyship.com/rate/v1/rates", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ShippingProviderError("easyship", response.status, message || "Failed to fetch rates")
  }

  const payload = (await response.json()) as EasyshipResponse
  const rows = payload.rates ?? []

  return rows.map(mapEasyshipRate).sort((left, right) => left.price - right.price)
}
