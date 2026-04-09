import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@banff/agency-core/lib/admin-session"
import { getDb } from "@/lib/db"
import { getAdminProductById, listAdminProducts } from "@/lib/admin/products"
import {
  buildProductShippingPreview,
  resolveProductPreviewCountry,
} from "@/lib/admin/product-shipping-preview"
import {
  getDemoAdminProductById,
  isAdminDemoMode,
  listDemoAdminProducts,
} from "@/lib/admin/demo-data"

const PreviewQuerySchema = z.object({
  country: z.string().optional(),
  locale: z.string().optional(),
})

async function assertAdmin(request: NextRequest) {
  const session = await requireAdminSession(request)
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }
  return null
}

function resolveRequestCountry(request: NextRequest) {
  const parsed = PreviewQuerySchema.safeParse({
    country: request.nextUrl.searchParams.get("country") ?? undefined,
    locale: request.nextUrl.searchParams.get("locale") ?? undefined,
  })

  const countryHint = parsed.success ? parsed.data.country : undefined
  const localeHint = parsed.success ? parsed.data.locale : undefined
  const headerCountry = request.headers.get("x-vercel-ip-country")?.trim().toUpperCase()

  if (countryHint) {
    return resolveProductPreviewCountry(countryHint)
  }

  if (localeHint?.trim().toLowerCase().startsWith("es")) {
    return "MX" as const
  }

  return resolveProductPreviewCountry(headerCountry)
}

async function loadCatalog() {
  if (isAdminDemoMode()) {
    return listDemoAdminProducts()
  }

  const database = getDb()
  if (database.kind === "sqlite") {
    return listDemoAdminProducts()
  }

  return listAdminProducts(database.db)
}

async function loadProduct(id: string) {
  if (isAdminDemoMode()) {
    return getDemoAdminProductById(id)
  }

  const database = getDb()
  if (database.kind === "sqlite") {
    return getDemoAdminProductById(id)
  }

  return getAdminProductById(database.db, id)
}

export async function GET(request: NextRequest, { params }: { params: { id?: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
  }

  try {
    const [product, catalog] = await Promise.all([loadProduct(id), loadCatalog()])
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const country = resolveRequestCountry(request)
    const preview = buildProductShippingPreview(catalog, product.id, country)

    if (!preview) {
      return NextResponse.json({ success: false, message: "Unable to build shipping preview" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: preview }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to build shipping preview"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

const ConfirmSchema = z.object({
  country: z.enum(["MX", "CA"]),
  selectedRate: z.object({
    provider: z.string().min(1),
    service: z.string().min(1),
    price: z.number().nonnegative(),
    currency: z.enum(["MXN", "CAD"]),
    days_min: z.number().nonnegative(),
    days_max: z.number().nonnegative(),
  }),
})

export async function POST(request: NextRequest, { params }: { params: { id?: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
  }

  try {
    const body = ConfirmSchema.parse(await request.json())
    const [product, catalog] = await Promise.all([loadProduct(id), loadCatalog()])
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const preview = buildProductShippingPreview(catalog, product.id, body.country)
    if (!preview) {
      return NextResponse.json({ success: false, message: "Unable to build shipping preview" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        confirmedAt: new Date().toISOString(),
        productId: id,
        country: body.country,
        selectedRate: body.selectedRate,
        preview,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to confirm shipping preview"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
