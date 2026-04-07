import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { detectCountry } from "@/lib/geo"
import { NotImplementedError } from "@/lib/db"
import { createOpenpayCharge } from "@/lib/openpay"
import { getGateway } from "@/lib/payment-gateway"
import { sendNewOrderAlert, sendOrderConfirmation } from "@/lib/mailer/triggers"
import { getStripeClient, isStripeTestMode } from "@/lib/stripe"

export const runtime = "nodejs"

const CheckoutItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  price: z.coerce.number().nonnegative().optional(),
})

const CheckoutCreateSchema = z.object({
  amount: z.coerce.number().int().positive(),
  email: z.string().email().optional(),
  metadata: z.record(z.string()).optional(),
})

const CheckoutFinalizeSchema = z.object({
  action: z.literal("finalize"),
  paymentIntentId: z.string().min(1),
  orderNumber: z.string().min(1),
  total: z.coerce.number().nonnegative(),
  email: z.string().email().optional(),
  customerName: z.string().min(1).optional(),
  items: z.array(CheckoutItemSchema).default([]),
})

const CheckoutPayloadSchema = z.union([CheckoutCreateSchema, CheckoutFinalizeSchema])

export async function POST(request: NextRequest) {
  try {
    const body = CheckoutPayloadSchema.parse(await request.json())
    const geo = await detectCountry(request.headers)
    const gateway = getGateway(geo.country)
    const stripeCurrency = geo.country === "MX" ? "mxn" : "cad"

    if ("action" in body && body.action === "finalize") {
      // Third-party providers share the same app-owned checkout contract.
      if (gateway === "openpay") {
        const adminEmail = process.env.ADMIN_EMAIL?.trim() || body.email
        if (body.email) {
          void sendOrderConfirmation({
            to: body.email,
            orderNumber: body.orderNumber,
            total: body.total,
            items: body.items,
          })
        }
        void sendNewOrderAlert({
          to: adminEmail,
          orderNumber: body.orderNumber,
          customerName: body.customerName ?? body.email ?? "Customer",
          total: body.total,
        })

        return NextResponse.json({
          success: true,
          gateway,
          country: geo.country,
          isTestMode: process.env.NODE_ENV !== "production",
          orderNumber: body.orderNumber,
        })
      }

      const stripe = getStripeClient()
      const paymentIntent = await stripe.paymentIntents.retrieve(body.paymentIntentId)

      if (paymentIntent.status !== "succeeded") {
        return NextResponse.json(
          { success: false, message: "Payment intent was not successful" },
          { status: 409 },
        )
      }

      if (body.email) {
        void sendOrderConfirmation({
          to: body.email,
          orderNumber: body.orderNumber,
          total: body.total,
          items: body.items,
        })
      }

      void sendNewOrderAlert({
        to: process.env.ADMIN_EMAIL?.trim() || body.email,
        orderNumber: body.orderNumber,
        customerName: body.customerName ?? body.email ?? "Customer",
        total: body.total,
      })

      return NextResponse.json({
        success: true,
        gateway,
        country: geo.country,
        isTestMode: isStripeTestMode(),
        orderNumber: body.orderNumber,
      })
    }

    const orderNumber = `ORD-${randomUUID().slice(0, 8).toUpperCase()}`

    if (gateway === "openpay") {
      // Third-party Openpay branch: create the charge only when the geo router selects it.
      const charge = await createOpenpayCharge({
        amount: body.amount,
        currency: geo.currency,
        country: geo.country,
        email: body.email,
        metadata: body.metadata,
      })

      return NextResponse.json({
        success: true,
        gateway,
        country: geo.country,
        isTestMode: process.env.NODE_ENV !== "production",
        charge,
        orderNumber,
      })
    }

    // Stripe provider branch stays isolated so the rest of the checkout flow remains provider-agnostic.
    const stripe = getStripeClient()
      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount,
        currency: stripeCurrency,
        receipt_email: body.email,
        metadata: {
          country: geo.country,
        gateway,
        testMode: String(isStripeTestMode()),
        orderNumber,
        ...body.metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

      return NextResponse.json({
        success: true,
        gateway,
        country: geo.country,
        isTestMode: isStripeTestMode(),
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        currency: stripeCurrency,
        orderNumber,
      })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Checkout failed"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
