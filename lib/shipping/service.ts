import type { ShippingRate } from "@/types/shipping"

import { fetchEasyshipRates } from "@/lib/shipping/easyship"
import { fetchSkydropxRates } from "@/lib/shipping/skydropx"

export type ShippingCountry = "MX" | "CA"

export type ShippingQuoteInput = {
  country: ShippingCountry
  originZip: string
  destZip: string
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
}

function normalizeRates(rates: ShippingRate[]): ShippingRate[] {
  return rates
    .map((rate) => ({
      ...rate,
      is_urgent: rate.days_min <= 2,
    }))
    .sort((left, right) => left.price - right.price)
}

export async function resolveShippingRates(input: ShippingQuoteInput): Promise<ShippingRate[]> {
  const rates =
    input.country === "MX"
      ? await fetchSkydropxRates({
          zip_from: input.originZip,
          zip_to: input.destZip,
          parcel: {
            weight: input.weightKg,
            height: input.heightCm,
            width: input.widthCm,
            length: input.lengthCm,
          },
        })
      : await fetchEasyshipRates({
          destZip: input.destZip,
          weightKg: input.weightKg,
          lengthCm: input.lengthCm,
          widthCm: input.widthCm,
          heightCm: input.heightCm,
        })

  return normalizeRates(rates)
}

export function buildShippingQuoteCacheKey(input: ShippingQuoteInput): string {
  return [
    input.country,
    input.originZip,
    input.destZip,
    input.weightKg.toFixed(3),
    input.lengthCm.toFixed(1),
    input.widthCm.toFixed(1),
    input.heightCm.toFixed(1),
  ].join(":")
}
