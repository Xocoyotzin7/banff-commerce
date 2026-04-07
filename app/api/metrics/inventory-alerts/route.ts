import { NextResponse } from "next/server"

import { getDb, NotImplementedError } from "@/lib/db"
import { dispatchLowStockAlerts } from "@/lib/inventory-alerts"

export async function GET() {
  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }

    const items = await dispatchLowStockAlerts(database.db, {
      to: process.env.ADMIN_EMAIL?.trim() || undefined,
    })

    return NextResponse.json({ success: true, data: items }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to check inventory alerts"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
