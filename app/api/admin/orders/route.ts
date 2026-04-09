import { type NextRequest, NextResponse } from "next/server"

import { requireAdminSession } from "@banff/agency-core/lib/admin-session"

import { isAdminDemoMode } from "@/lib/admin/demo-data"
import {
  getDemoAdminOrdersPayload,
} from "@/lib/admin/orders-demo"
import {
  listAdminOrders,
  type AdminOrderFilterStatus,
  type AdminOrderSortDirection,
  type AdminOrderSortField,
} from "@/lib/admin/orders"
import { getDb } from "@/lib/db"

export const dynamic = "force-dynamic"

const allowedStatuses: AdminOrderFilterStatus[] = ["all", "pending", "processing", "shipped", "delivered"]
const allowedSortFields: AdminOrderSortField[] = [
  "createdAt",
  "orderNumber",
  "clientName",
  "itemCount",
  "totalWeight",
  "country",
  "selectedCarrier",
]
const allowedSortDirections: AdminOrderSortDirection[] = ["asc", "desc"]

async function assertAdmin(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return null
}

function resolveStatus(value: string | null): AdminOrderFilterStatus {
  return allowedStatuses.includes(value as AdminOrderFilterStatus) ? (value as AdminOrderFilterStatus) : "pending"
}

function resolveSortField(value: string | null): AdminOrderSortField {
  return allowedSortFields.includes(value as AdminOrderSortField) ? (value as AdminOrderSortField) : "createdAt"
}

function resolveSortDirection(value: string | null): AdminOrderSortDirection {
  return allowedSortDirections.includes(value as AdminOrderSortDirection) ? (value as AdminOrderSortDirection) : "desc"
}

function resolvePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(1, Math.floor(parsed))
}

export async function GET(request: NextRequest) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const status = resolveStatus(request.nextUrl.searchParams.get("status"))
  const page = resolvePositiveInt(request.nextUrl.searchParams.get("page"), 1)
  const limit = Math.min(100, resolvePositiveInt(request.nextUrl.searchParams.get("limit"), 20))
  const sortBy = resolveSortField(request.nextUrl.searchParams.get("sortBy"))
  const sortDir = resolveSortDirection(request.nextUrl.searchParams.get("sortDir"))

  try {
    if (isAdminDemoMode()) {
      return NextResponse.json(
        { success: true, data: getDemoAdminOrdersPayload(status, page, limit, sortBy, sortDir) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const database = getDb()
    if (database.kind === "sqlite") {
      return NextResponse.json(
        { success: true, data: getDemoAdminOrdersPayload(status, page, limit, sortBy, sortDir) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const data = await listAdminOrders(database.db, { status, page, limit, sortBy, sortDir })
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (isAdminDemoMode()) {
      return NextResponse.json(
        { success: true, data: getDemoAdminOrdersPayload(status, page, limit, sortBy, sortDir) },
        { headers: { "Cache-Control": "no-store" } },
      )
    }

    const message = error instanceof Error ? error.message : "Unable to load orders"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

