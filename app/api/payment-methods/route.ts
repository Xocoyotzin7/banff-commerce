import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { authenticateAccountRequest } from "@/lib/account/session"
import { deletePaymentMethod, listSavedPaymentMethods, savePaymentMethod } from "@/lib/payments/save-method"

export const dynamic = "force-dynamic"

const SaveSchema = z.object({
  country: z.enum(["MX", "CA"]),
  provider_token: z.string().trim().min(1),
  card_brand: z.string().trim().optional().nullable(),
  card_last4: z.string().trim().optional().nullable(),
  card_exp_month: z.coerce.number().int().min(1).max(12).optional().nullable(),
  card_exp_year: z.coerce.number().int().min(2000).max(2100).optional().nullable(),
  is_default: z.coerce.boolean().optional().nullable(),
})

export async function GET(request: NextRequest) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const methods = await listSavedPaymentMethods(session.userId)
    return NextResponse.json({ ok: true, data: methods }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load payment methods"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = SaveSchema.parse(await request.json())
    const method = await savePaymentMethod(session.userId, {
      country: body.country,
      providerToken: body.provider_token,
      cardBrand: body.card_brand ?? undefined,
      cardLast4: body.card_last4 ?? undefined,
      cardExpMonth: body.card_exp_month ?? undefined,
      cardExpYear: body.card_exp_year ?? undefined,
      isDefault: body.is_default ?? undefined,
    })

    return NextResponse.json({ ok: true, data: method }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save payment method"
    return NextResponse.json({ ok: false, message }, { status: 400 })
  }
}
