import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@banff/agency-core/lib/admin-session"

import { shipDemoAdminOrder } from "@/lib/admin/orders-demo"
import { isAdminDemoMode } from "@/lib/admin/demo-data"
import { getAdminOrderDetail } from "@/lib/admin/orders"
import { sendShippingConfirmationEmail } from "@/lib/mailer/shipping-triggers"
import { getDb } from "@/lib/db"
import { orders, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

const ShipSchema = z.object({
  carrier: z.string().min(1),
  tracking_id: z.string().min(1),
  tracking_url: z.string().url(),
})

async function assertAdmin(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    const body = ShipSchema.parse(await request.json())

    if (isAdminDemoMode()) {
      const updated = shipDemoAdminOrder(id, {
        carrier: body.carrier,
        trackingId: body.tracking_id,
        trackingUrl: body.tracking_url,
      })

      if (!updated) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
      }

      await sendShippingConfirmationEmail(
        {
          id: updated.id,
          client_email: updated.clientEmail ?? "demo@banff.dev",
          client_name: updated.clientName,
          country: updated.country,
          total: updated.total,
          tracking_url: updated.trackingUrl ?? body.tracking_url,
        },
        {
          carrier: updated.carrier,
          tracking_id: body.tracking_id,
          tracking_url: body.tracking_url,
          days_max: updated.selectedRate?.days_max ?? updated.quotedRates[0]?.days_max,
        },
      )

      return NextResponse.json({ success: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
    }

    const database = getDb()
    if (database.kind === "sqlite") {
      const updated = shipDemoAdminOrder(id, {
        carrier: body.carrier,
        trackingId: body.tracking_id,
        trackingUrl: body.tracking_url,
      })
      if (!updated) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
      }
      await sendShippingConfirmationEmail(
        {
          id: updated.id,
          client_email: updated.clientEmail ?? "demo@banff.dev",
          client_name: updated.clientName,
          country: updated.country,
          total: updated.total,
          tracking_url: updated.trackingUrl ?? body.tracking_url,
        },
        {
          carrier: updated.carrier,
          tracking_id: body.tracking_id,
          tracking_url: body.tracking_url,
          days_max: updated.selectedRate?.days_max ?? updated.quotedRates[0]?.days_max,
        },
      )
      return NextResponse.json({ success: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
    }

    const orderRows = await database.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        clientEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.id, id))
      .limit(1)

    const orderRow = orderRows[0]
    if (!orderRow) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    await database.db
      .update(orders)
      .set({
        status: "shipped",
        carrier: body.carrier,
        selectedCarrier: body.carrier,
        trackingId: body.tracking_id,
        trackingUrl: body.tracking_url,
        shippedAt: new Date(),
      })
      .where(eq(orders.id, id))

    const updated = await getAdminOrderDetail(database.db, id)
    if (!updated) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    if (orderRow.clientEmail) {
      await sendShippingConfirmationEmail(
        {
          id: updated.id,
          client_email: orderRow.clientEmail,
          client_name: updated.clientName,
          country: updated.country,
          total: updated.total,
          tracking_url: body.tracking_url,
        },
        {
          carrier: body.carrier,
          tracking_id: body.tracking_id,
          tracking_url: body.tracking_url,
          days_max: updated.selectedRate?.days_max ?? updated.quotedRates[0]?.days_max,
        },
      )
    }

    return NextResponse.json({ success: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to confirm shipment"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
