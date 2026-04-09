import { type NextRequest, NextResponse } from "next/server"

import { authenticateAccountRequest } from "@/lib/account/session"
import { getDemoAccountOrdersPayload } from "@/lib/account/orders-demo"
import { listAccountOrders } from "@/lib/account/orders"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    let database: ReturnType<typeof getDb> | null = null
    try {
      database = getDb()
    } catch (error) {
      const message = error instanceof Error ? error.message : ""
      if (message.includes("DATABASE_URL is not set")) {
        return NextResponse.json({ ok: true, data: getDemoAccountOrdersPayload(session.userId) }, { headers: { "Cache-Control": "no-store" } })
      }
      throw error
    }
    if (session.isDemo || database.kind === "sqlite") {
      return NextResponse.json({ ok: true, data: getDemoAccountOrdersPayload(session.userId) }, { headers: { "Cache-Control": "no-store" } })
    }

    const data = await listAccountOrders(database.db, session.userId)
    return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load orders"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
