import { randomUUID } from "node:crypto"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-session"
import { getDb, inventoryItems, inventoryStock, products } from "@/lib/db"
import { listAdminProducts } from "@/lib/admin/products"
import { NotImplementedError } from "@/lib/db"

const ProductInputSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  cost: z.coerce.number().nonnegative(),
  imageUrl: z.string().url(),
  stock: z.coerce.number().int().min(0),
  minStock: z.coerce.number().int().min(0).default(5),
})

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

  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }

    return NextResponse.json(
      {
        success: true,
        data: await listAdminProducts(database.db),
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to load products"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const body = ProductInputSchema.parse(await request.json())
    const database = getDb()
    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }
    const productId = randomUUID()

    await database.db.transaction(async (tx) => {
      await tx.insert(products).values({
        id: productId,
        name: body.name,
        category: body.category,
        subcategory: body.subcategory,
        price: body.price.toFixed(2),
        cost: body.cost.toFixed(2),
        stock: body.stock,
        minStock: body.minStock,
        imageUrl: body.imageUrl,
      })

      await tx.insert(inventoryItems).values({
        id: productId,
        name: body.name,
        unit: "unit",
        minStock: body.minStock,
      })

      await tx.insert(inventoryStock).values({
        itemId: productId,
        branchId: null,
        quantity: body.stock,
      })
    })

    return NextResponse.json({
      success: true,
      data: { id: productId },
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to create product"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
