import { and, eq, isNull, or } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

import { reportShippingProviderError, ShippingProviderError } from "@/lib/shipping/errors"
import { sendDeliveredEmail, sendOutForDeliveryEmail } from "@/lib/mailer/shipping-triggers"
import { getDb, NotImplementedError } from "@/lib/db"
import type { NeonDb } from "@/lib/db/adapters/neon"
import { orders, users } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

type TrackingState = "in_transit" | "delivered" | "unknown"

type TrackOrderRow = {
  id: string
  orderNumber: string
  country: string | null
  carrier: string | null
  trackingId: string | null
  trackingUrl: string | null
  outForDeliveryAt: Date | string | null
  outForDeliveryNotifiedAt: Date | string | null
  deliveredAt: Date | string | null
  total: string | number
  clientFirstName: string | null
  clientLastName: string | null
  clientEmail: string | null
}

type TrackResult = {
  processed: number
  updated: number
  errors: Array<{ orderId?: string; message: string }>
}

function isAuthorized(request: NextRequest): boolean {
  if (request.headers.get("x-vercel-cron") === "1") {
    return true
  }

  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return false
  }

  const authHeader = request.headers.get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null
  return bearerToken === secret
}

function toText(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  if (value instanceof Date) return value.toISOString()
  return ""
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

function buildClientName(firstName: unknown, lastName: unknown, email: unknown) {
  const fullName = [toText(firstName).trim(), toText(lastName).trim()].filter(Boolean).join(" ").trim()
  return fullName || toText(email) || "Cliente"
}

function normalizeCountry(value: unknown): "MX" | "CA" {
  const raw = toText(value).trim().toUpperCase()
  if (raw === "MX" || raw.includes("MEX")) return "MX"
  return "CA"
}

function extractStatus(payload: unknown): string {
  if (!payload || typeof payload !== "object") return ""

  const record = payload as Record<string, unknown>
  const directCandidates = [
    record.status,
    record.shipment_status,
    record.delivery_status,
    record.tracking_status,
    record.current_status,
    record.state,
  ]

  for (const candidate of directCandidates) {
    const text = toText(candidate).trim().toLowerCase()
    if (text) return text
  }

  for (const key of ["data", "shipment", "tracking", "result", "response"]) {
    const nested = record[key]
    const nestedStatus = extractStatus(nested)
    if (nestedStatus) return nestedStatus
  }

  return ""
}

function normalizeTrackingState(rawStatus: string): TrackingState {
  const normalized = rawStatus.toLowerCase().replace(/[\s_-]+/g, " ")
  if (
    normalized.includes("delivered") ||
    normalized.includes("completed") ||
    normalized.includes("delivered to") ||
    normalized.includes("proof of delivery")
  ) {
    return "delivered"
  }

  if (
    normalized.includes("in transit") ||
    normalized.includes("in_transit") ||
    normalized.includes("transit") ||
    normalized.includes("shipped") ||
    normalized.includes("on the way") ||
    normalized.includes("out for delivery")
  ) {
    return "in_transit"
  }

  return "unknown"
}

function resolveProviderConfig(country: "MX" | "CA") {
  if (country === "MX") {
    const apiKey = process.env.SKYDROPX_API_KEY?.trim() || ""
    return {
      provider: "skydropx",
      endpoint: "https://api.skydropx.com/v1/shipments",
      headers: {
        Authorization: `Token token=${apiKey}`,
      },
    }
  }

  const apiKey = process.env.EASYSHIP_API_KEY?.trim() || ""
  return {
    provider: "easyship",
    endpoint: "https://api.easyship.com/track/v1/status",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  }
}

async function fetchTrackingState(country: "MX" | "CA", trackingId: string): Promise<TrackingState> {
  const config = resolveProviderConfig(country)

  if ((country === "MX" && !process.env.SKYDROPX_API_KEY?.trim()) || (country === "CA" && !process.env.EASYSHIP_API_KEY?.trim())) {
    throw new ShippingProviderError(config.provider, 500, "Missing API key")
  }

  const response = await fetch(`${config.endpoint}/${encodeURIComponent(trackingId)}`, {
    method: "GET",
    headers: {
      ...config.headers,
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ShippingProviderError(config.provider, response.status, message || "Unable to fetch tracking status")
  }

  const payload = (await response.json().catch(() => null)) as unknown
  return normalizeTrackingState(extractStatus(payload))
}

async function loadTrackedOrders(database: NeonDb) {
  return database
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      country: orders.country,
      carrier: orders.carrier,
      trackingId: orders.trackingId,
      trackingUrl: orders.trackingUrl,
      outForDeliveryAt: orders.outForDeliveryAt,
      outForDeliveryNotifiedAt: orders.outForDeliveryNotifiedAt,
      deliveredAt: orders.deliveredAt,
      total: orders.total,
      clientFirstName: users.firstName,
      clientLastName: users.lastName,
      clientEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(and(or(eq(orders.status, "shipped"), eq(orders.status, "out_for_delivery")), isNull(orders.deliveredAt)))
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const result: TrackResult = {
    processed: 0,
    updated: 0,
    errors: [],
  }

  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      console.info("[cron] track-orders skipped in sqlite/demo mode")
      return NextResponse.json({ ok: true, processed: 0, updated: 0 })
    }

    const rows = (await loadTrackedOrders(database.db)) as TrackOrderRow[]

    for (const row of rows) {
      result.processed += 1

      try {
        const country = normalizeCountry(row.country)
        const trackingId = toText(row.trackingId).trim()
        const trackingUrl = toText(row.trackingUrl).trim()

        if (!trackingId || !trackingUrl) {
          result.errors.push({
            orderId: row.id,
            message: "Missing tracking data",
          })
          continue
        }

        const trackingState = await fetchTrackingState(country, trackingId)
        const clientName = buildClientName(row.clientFirstName, row.clientLastName, row.clientEmail)
        const clientEmail = toText(row.clientEmail).trim()
        const total = Number(toNumber(row.total).toFixed(2))
        const carrier = toText(row.carrier).trim() || (country === "MX" ? "Skydropx" : "Easyship")
        let changed = false

        if (trackingState === "in_transit") {
          if (!row.outForDeliveryAt) {
            await database.db
              .update(orders)
              .set({ outForDeliveryAt: new Date(), status: "out_for_delivery" })
              .where(eq(orders.id, row.id))
            changed = true
          } else if (!row.deliveredAt) {
            await database.db
              .update(orders)
              .set({ status: "out_for_delivery" })
              .where(eq(orders.id, row.id))
            changed = true
          }

          if (!row.outForDeliveryNotifiedAt && clientEmail) {
            await sendOutForDeliveryEmail({
              id: row.id,
              client_name: clientName,
              client_email: clientEmail,
              country,
              total,
              tracking_url: trackingUrl,
            })

            await database.db
              .update(orders)
              .set({ outForDeliveryNotifiedAt: new Date() })
              .where(eq(orders.id, row.id))
            changed = true
          }
        }

        if (trackingState === "delivered" && !row.deliveredAt) {
          const deliveredAt = new Date()
          await database.db
            .update(orders)
            .set({
              status: "delivered",
              deliveredAt,
            })
            .where(eq(orders.id, row.id))

          if (clientEmail) {
            await sendDeliveredEmail({
              id: row.id,
              client_name: clientName,
              client_email: clientEmail,
              country,
              total,
            })
          }

          changed = true
        }

        if (changed) {
          result.updated += 1
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to process tracking"
        result.errors.push({
          orderId: row.id,
          message,
        })

        if (error instanceof ShippingProviderError) {
          reportShippingProviderError(error)
        } else {
          console.error("[cron] track-orders error", { orderId: row.id, error })
        }
      }
    }

    console.info("[cron] track-orders", result)
    return NextResponse.json({ ok: true, processed: result.processed, updated: result.updated })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ ok: true, processed: 0, updated: 0 })
    }

    const message = error instanceof Error ? error.message : "Unable to run tracking cron"
    console.error("[cron] track-orders fatal", error)
    return NextResponse.json({ ok: false, message, processed: result.processed, updated: result.updated, errors: result.errors }, { status: 500 })
  }
}
