import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { authenticateAccountRequest } from "@/lib/account/session"
import { reviewDemoAccountOrder } from "@/lib/account/orders-demo"
import { getAccountOrderDetail } from "@/lib/account/orders"
import { getDb } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const dynamic = "force-dynamic"

const ReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().nullable(),
})

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const body = ReviewSchema.parse(await request.json())
    let database: ReturnType<typeof getDb> | null = null
    try {
      database = getDb()
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.includes("DATABASE_URL is not set")) {
        const updated = reviewDemoAccountOrder(session.userId, id, {
          rating: body.rating,
          comment: body.comment ?? null,
        })
        if (!updated) {
          return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
        }

        return NextResponse.json({ ok: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
      }
      throw error
    }

    if (session.isDemo || database.kind === "sqlite") {
      const updated = reviewDemoAccountOrder(session.userId, id, {
        rating: body.rating,
        comment: body.comment ?? null,
      })
      if (!updated) {
        return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
      }

      return NextResponse.json({ ok: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
    }

    const existing = await getAccountOrderDetail(database.db, session.userId, id)
    if (!existing) {
      return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
    }
    if (existing.status !== "DELIVERED") {
      return NextResponse.json({ ok: false, message: "Review only available after delivery" }, { status: 409 })
    }

    const updatedAt = new Date()
    await database.db
      .update(orders)
      .set({
        reviewRating: body.rating,
        reviewComment: body.comment ?? null,
        reviewedAt: updatedAt,
      })
      .where(eq(orders.id, id))

    const updated = await getAccountOrderDetail(database.db, session.userId, id)
    if (!updated) {
      return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data: updated }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit review"
    return NextResponse.json({ ok: false, message }, { status: 400 })
  }
}
