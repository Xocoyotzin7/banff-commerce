import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-session"
import { getAdminProductById } from "@/lib/admin/products"
import { NotImplementedError, getDb, inventoryItems, inventoryStock, products } from "@/lib/db"

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

function resolveDatabase() {
  const database = getDb()
  if (database.kind === "sqlite") {
    throw new NotImplementedError("SQLite adapter not connected yet")
  }
  return database.db
}

export async function GET(request: NextRequest, { params }: { params: { id?: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
  }

  try {
    const database = resolveDatabase()
    const product = await getAdminProductById(database, id)

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to load product"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id?: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
  }

  try {
    const body = ProductInputSchema.parse(await request.json())
    const database = resolveDatabase()

    const result = await database.transaction(async (tx) => {
      const productUpdate = await tx
        .update(products)
        .set({
          name: body.name,
          category: body.category,
          subcategory: body.subcategory,
          price: body.price.toFixed(2),
          cost: body.cost.toFixed(2),
          stock: body.stock,
          minStock: body.minStock,
          imageUrl: body.imageUrl,
        })
        .where(eq(products.id, id))
        .returning({ id: products.id })

      if (!productUpdate.length) {
        return null
      }

      const inventoryItemUpdate = await tx
        .update(inventoryItems)
        .set({
          name: body.name,
          minStock: body.minStock,
        })
        .where(eq(inventoryItems.id, id))
        .returning({ id: inventoryItems.id })

      if (!inventoryItemUpdate.length) {
        await tx.insert(inventoryItems).values({
          id,
          name: body.name,
          unit: "unit",
          minStock: body.minStock,
        })
      }

      const stockUpdate = await tx
        .update(inventoryStock)
        .set({
          quantity: body.stock,
        })
        .where(eq(inventoryStock.itemId, id))
        .returning({ id: inventoryStock.id })

      if (!stockUpdate.length) {
        await tx.insert(inventoryStock).values({
          id: randomUUID(),
          itemId: id,
          branchId: null,
          quantity: body.stock,
        })
      }

      return { id }
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to update product"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id?: string } }) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const id = params.id?.trim()
  if (!id) {
    return NextResponse.json({ success: false, message: "Missing product id" }, { status: 400 })
  }

  try {
    const database = resolveDatabase()
    const deletedAt = new Date()

    const result = await database
      .update(products)
      .set({ deletedAt })
      .where(eq(products.id, id))
      .returning({ id: products.id })

    if (!result.length) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to delete product"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
