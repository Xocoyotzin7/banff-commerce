import { beforeAll, afterEach, afterAll, describe, expect, it, vi } from "vitest"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

import { POST } from "@/app/api/shipping/rates/route"
import { resolveShippingRates } from "@/lib/shipping/service"

vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
}))

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("shipping rates", () => {
  it("maps and sorts Skydropx rates for Mexico", async () => {
    process.env.SKYDROPX_API_KEY = "skydropx-test-key"

    server.use(
      http.post("https://api.skydropx.com/v1/quotations", async ({ request }) => {
        const body = (await request.json()) as {
          zip_from: string
          zip_to: string
          parcel: { weight: number; height: number; width: number; length: number }
        }

        expect(body).toEqual({
          zip_from: "06600",
          zip_to: "44100",
          parcel: {
            weight: 2.75,
            height: 18,
            width: 30,
            length: 40,
          },
        })

        return HttpResponse.json([
          {
            provider: "ESTAFETA",
            service_level_name: "Terrestre",
            total_pricing: 180.5,
            days: 3,
          },
          {
            provider: "DHL",
            service_level_name: "Express",
            total_pricing: 260,
            days: 1,
          },
        ])
      }),
    )

    const rates = await resolveShippingRates({
      country: "MX",
      originZip: "06600",
      destZip: "44100",
      weightKg: 2.75,
      lengthCm: 40,
      widthCm: 30,
      heightCm: 18,
    })

    expect(rates).toEqual([
      {
        provider: "ESTAFETA",
        service: "Terrestre",
        price: 180.5,
        currency: "MXN",
        days_min: 3,
        days_max: 4,
        carrier_logo: undefined,
        is_urgent: false,
      },
      {
        provider: "DHL",
        service: "Express",
        price: 260,
        currency: "MXN",
        days_min: 1,
        days_max: 2,
        carrier_logo: undefined,
        is_urgent: true,
      },
    ])
  })

  it("maps and sorts Easyship rates for Canada", async () => {
    process.env.EASYSHIP_API_KEY = "easyship-test-key"
    process.env.MERCHANT_ORIGIN_ZIP_CA = "M5V3A8"

    server.use(
      http.post("https://api.easyship.com/rate/v1/rates", async ({ request }) => {
        const body = (await request.json()) as {
          origin_country_alpha2: "CA"
          origin_postal_code: string
          destination_country_alpha2: "CA"
          destination_postal_code: string
          taxes_duties_paid_by: "Sender"
          items: Array<{
            dimensions: { length: number; width: number; height: number }
            actual_weight: number
          }>
        }

        expect(body).toEqual({
          origin_country_alpha2: "CA",
          origin_postal_code: "M5V3A8",
          destination_country_alpha2: "CA",
          destination_postal_code: "H2Y1C6",
          taxes_duties_paid_by: "Sender",
          items: [
            {
              dimensions: {
                length: 34,
                width: 22,
                height: 14,
              },
              actual_weight: 3.1,
            },
          ],
        })

        return HttpResponse.json({
          rates: [
            {
              courier_name: "UPS",
              courier_service_name: "Expedited Parcel",
              total_charge: 19.95,
              min_delivery_time: 2,
              max_delivery_time: 4,
              courier_logo: "https://example.com/ups.svg",
            },
            {
              courier_name: "Canada Post",
              courier_service_name: "Xpresspost",
              total_charge: 14.5,
              min_delivery_time: 1,
              max_delivery_time: 3,
            },
          ],
        })
      }),
    )

    const rates = await resolveShippingRates({
      country: "CA",
      originZip: "M5V3A8",
      destZip: "H2Y1C6",
      weightKg: 3.1,
      lengthCm: 34,
      widthCm: 22,
      heightCm: 14,
    })

    expect(rates).toEqual([
      {
        provider: "Canada Post",
        service: "Xpresspost",
        price: 14.5,
        currency: "CAD",
        days_min: 1,
        days_max: 3,
        carrier_logo: undefined,
        is_urgent: true,
      },
      {
        provider: "UPS",
        service: "Expedited Parcel",
        price: 19.95,
        currency: "CAD",
        days_min: 2,
        days_max: 4,
        carrier_logo: "https://example.com/ups.svg",
        is_urgent: true,
      },
    ])
  })

  it("defaults to CA routing in the API route when the header country is unknown", async () => {
    process.env.EASYSHIP_API_KEY = "easyship-test-key"
    process.env.MERCHANT_ORIGIN_ZIP_CA = "M5V3A8"

    server.use(
      http.post("https://api.easyship.com/rate/v1/rates", async () =>
        HttpResponse.json({
          rates: [
            {
              courier_name: "Canada Post",
              courier_service_name: "Xpresspost",
              total_charge: 14.5,
              min_delivery_time: 1,
              max_delivery_time: 3,
            },
          ],
        }),
      ),
    )

    const request = new Request("http://localhost/api/shipping/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-ip-country": "US",
      },
      body: JSON.stringify({
        destZip: "H2Y1C6",
        weightKg: 3.1,
        lengthCm: 34,
        widthCm: 22,
        heightCm: 14,
      }),
    })

    const response = await POST(request as never)
    const json = (await response.json()) as {
      success: boolean
      country: string
      data: Array<{ provider: string; service: string; currency: string }>
    }

    expect(response.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.country).toBe("CA")
    expect(json.data[0]).toMatchObject({
      provider: "Canada Post",
      service: "Xpresspost",
      currency: "CAD",
    })
  })
})
