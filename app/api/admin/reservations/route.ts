import { type NextRequest, NextResponse } from "next/server"

import { requireAdminSession } from "@banff/agency-core/lib/admin-session"
import { isAdminDemoMode } from "@/lib/admin/demo-data"
import { getAdminReservationsPayload } from "@/lib/admin/reservations"
import { getDemoAdminReservationsPayload } from "@/lib/admin/reservations-demo"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

async function assertAdmin(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const range = request.nextUrl.searchParams.get("range")
  const month = request.nextUrl.searchParams.get("month")

  try {
    if (isAdminDemoMode()) {
      return NextResponse.json(
        { success: true, data: getDemoAdminReservationsPayload(range, month) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const database = getDb()
    if (database.kind === "sqlite") {
      return NextResponse.json(
        { success: true, data: getDemoAdminReservationsPayload(range, month) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const data = await getAdminReservationsPayload(database.db, range, month)
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (isAdminDemoMode()) {
      return NextResponse.json(
        { success: true, data: getDemoAdminReservationsPayload(range, month) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const message = error instanceof Error ? error.message : "Unable to load reservations"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
