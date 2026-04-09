import { unstable_cache } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { ShippingProviderError, reportShippingProviderError } from "@/lib/shipping/errors"
import {
  buildShippingQuoteCacheKey,
  resolveShippingRates,
  type ShippingCountry,
  type ShippingQuoteInput,
} from "@/lib/shipping/service"

export const runtime = "nodejs"

const ShippingQuoteSchema = z.object({
  originZip: z.string().min(1).optional(),
  destZip: z.string().min(1),
  weightKg: z.coerce.number().positive(),
  lengthCm: z.coerce.number().positive(),
  widthCm: z.coerce.number().positive(),
  heightCm: z.coerce.number().positive(),
})

const getCachedShippingRates = unstable_cache(
  async (_cacheKey: string, input: ShippingQuoteInput) => resolveShippingRates(input),
  ["shipping-rates"],
  {
    revalidate: 60 * 10,
  },
)

function detectCountryFromHeaders(headers: Headers): ShippingCountry {
  const country = headers.get("x-vercel-ip-country")?.trim().toUpperCase()
  return country === "MX" ? "MX" : "CA"
}

export async function POST(request: NextRequest) {
  try {
    const country = detectCountryFromHeaders(request.headers)
    const body = ShippingQuoteSchema.parse(await request.json())

    const input: ShippingQuoteInput = {
      country,
      originZip:
        country === "MX"
          ? body.originZip?.trim() || process.env.MERCHANT_ORIGIN_ZIP_MX?.trim() || ""
          : process.env.MERCHANT_ORIGIN_ZIP_CA?.trim() || "",
      destZip: body.destZip.trim(),
      weightKg: body.weightKg,
      lengthCm: body.lengthCm,
      widthCm: body.widthCm,
      heightCm: body.heightCm,
    }

    if (country === "MX" && !input.originZip) {
      return NextResponse.json(
        { success: false, message: "originZip is required for Mexico shipping quotes" },
        { status: 400 },
      )
    }

    if (country === "CA" && !input.originZip) {
      return NextResponse.json(
        { success: false, message: "MERCHANT_ORIGIN_ZIP_CA is not configured" },
        { status: 500 },
      )
    }

    const cacheKey = buildShippingQuoteCacheKey(input)
    const rates = await getCachedShippingRates(cacheKey, input)

    return NextResponse.json(
      {
        success: true,
        country,
        data: rates,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    if (error instanceof ShippingProviderError) {
      reportShippingProviderError(error)
      return NextResponse.json(
        {
          success: false,
          provider: error.provider,
          statusCode: error.statusCode,
          message: error.originalMessage,
        },
        { status: 502 },
      )
    }

    const message = error instanceof Error ? error.message : "Unable to fetch shipping rates"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
