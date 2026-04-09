import { type NextRequest, NextResponse } from "next/server"

import { authenticateAccountRequest } from "@/lib/account/session"
import { getDemoAccountOrderDetail } from "@/lib/account/orders-demo"
import { getAccountOrderDetail } from "@/lib/account/orders"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    let database: ReturnType<typeof getDb> | null = null
    try {
      database = getDb()
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.includes("DATABASE_URL is not set")) {
        const data = getDemoAccountOrderDetail(session.userId, id)
        if (!data) {
          return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
        }
        return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } })
      }
      throw error
    }
    if (session.isDemo || database.kind === "sqlite") {
      const data = getDemoAccountOrderDetail(session.userId, id)
      if (!data) {
        return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
      }
      return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } })
    }

    const data = await getAccountOrderDetail(database.db, session.userId, id)
    if (!data) {
      return NextResponse.json({ ok: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
