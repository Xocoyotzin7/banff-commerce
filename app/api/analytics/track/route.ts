import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { detectCountry } from "@/lib/geo"
import { getDb, pageAnalytics } from "@/lib/db"
import { isAdminDemoMode } from "@/lib/admin/demo-data"

export const dynamic = "force-dynamic"

const AnalyticsEventSchema = z.object({
  pagePath: z.string().min(1),
  pageType: z.string().optional().nullable(),
  destinationSlug: z.string().optional().nullable(),
  packageId: z.string().optional().nullable(),
  sessionId: z.string().optional().nullable(),
  visitorId: z.string().optional().nullable(),
  timeOnPage: z.coerce.number().int().min(0).optional().default(0),
  scrollDepth: z.coerce.number().int().min(0).max(100).optional().default(0),
  locale: z.string().optional().nullable(),
  referrerUrl: z.string().optional().nullable(),
  conversionEvent: z.string().optional().nullable(),
  conversionValue: z.coerce.number().optional().nullable(),
  userId: z.string().optional().nullable(),
})

export async function POST(request: NextRequest) {
  try {
    const body = AnalyticsEventSchema.parse(await request.json())
    const geo = await detectCountry(request.headers)

    if (isAdminDemoMode()) {
      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
    }

    const database = getDb()
    if (database.kind === "sqlite") {
      return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
    }

    await database.db.insert(pageAnalytics).values({
      userId: body.userId || null,
      sessionId: body.sessionId || null,
      visitorId: body.visitorId || null,
      pagePath: body.pagePath,
      pageType: body.pageType || null,
      destinationSlug: body.destinationSlug || null,
      packageId: body.packageId || null,
      timeOnPage: body.timeOnPage ?? 0,
      scrollDepth: body.scrollDepth ?? 0,
      locale: body.locale || null,
      country: geo.country,
      referrerUrl: body.referrerUrl || null,
      conversionEvent: body.conversionEvent || null,
      conversionValue: body.conversionValue ?? null,
    })

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to track analytics"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
