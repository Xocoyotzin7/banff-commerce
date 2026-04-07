import { NextRequest, NextResponse } from "next/server"

import { getDb, NotImplementedError } from "@/lib/db"
import { dispatchLowStockAlerts } from "@/lib/inventory-alerts"

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return false
  }

  if (request.headers.get("x-vercel-cron") === "1") {
    return true
  }

  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  const headerSecret = request.headers.get("x-cron-secret")?.trim() ?? null

  return bearerToken === secret || headerSecret === secret
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }

    const items = await dispatchLowStockAlerts(database.db, {
      to: process.env.ADMIN_EMAIL?.trim() || undefined,
    })

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to run inventory check"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
