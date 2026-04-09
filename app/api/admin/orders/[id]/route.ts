import { type NextRequest, NextResponse } from "next/server"

import { requireAdminSession } from "@banff/agency-core/lib/admin-session"

import { getDemoAdminOrderDetail } from "@/lib/admin/orders-demo"
import { isAdminDemoMode } from "@/lib/admin/demo-data"
import { getAdminOrderDetail } from "@/lib/admin/orders"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

async function assertAdmin(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const { id } = await context.params

  try {
    if (isAdminDemoMode()) {
      const data = getDemoAdminOrderDetail(id)
      if (!data) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
    }

    const database = getDb()
    if (database.kind === "sqlite") {
      const data = getDemoAdminOrderDetail(id)
      if (!data) {
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
    }

    const data = await getAdminOrderDetail(database.db, id)
    if (!data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load order"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}
