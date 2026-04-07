import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdminSession } from "@/lib/admin-session"
import { NotImplementedError, getDb, inventoryStock, inventoryStockLedger, products } from "@/lib/db"
import { getAdminProductById, listProductInventoryHistory } from "@/lib/admin/products"

const AdjustmentSchema = z.object({
  productId: z.string().uuid(),
  amount: z.coerce.number().int().refine((value) => value !== 0, "Adjustment amount cannot be zero"),
  reason: z.enum(["restock", "damaged", "expired", "sold", "manual-adjustment"]),
  branchId: z.string().optional(),
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

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function GET(request: NextRequest) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  const productId = request.nextUrl.searchParams.get("productId")?.trim()
  if (!productId) {
    return NextResponse.json({ success: false, message: "Missing productId" }, { status: 400 })
  }

  try {
    const database = resolveDatabase()
    const product = await getAdminProductById(database, productId)
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    const history = await listProductInventoryHistory(database, productId)

    return NextResponse.json({ success: true, data: history }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to load inventory"
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin(request)
  if (unauthorized) return unauthorized

  try {
    const body = AdjustmentSchema.parse(await request.json())
    const database = resolveDatabase()

    const result = await database.transaction(async (tx) => {
      const product = await getAdminProductById(tx, body.productId)
      if (!product) {
        return null
      }

      const stockRows = await tx
        .select({
          id: inventoryStock.id,
          quantity: inventoryStock.quantity,
          branchId: inventoryStock.branchId,
        })
        .from(inventoryStock)
        .where(eq(inventoryStock.itemId, body.productId))
        .limit(1)
      const currentStock = stockRows[0] ? toNumber(stockRows[0].quantity) : product.stock
      const nextStock = currentStock + body.amount

      if (nextStock < 0) {
        return { error: "Stock cannot go below zero" as const }
      }

      if (stockRows[0]) {
        await tx
          .update(inventoryStock)
          .set({
            quantity: nextStock,
            branchId: body.branchId ?? stockRows[0].branchId ?? null,
          })
          .where(eq(inventoryStock.id, stockRows[0].id))
      } else {
        await tx.insert(inventoryStock).values({
          id: randomUUID(),
          itemId: body.productId,
          branchId: body.branchId ?? null,
          quantity: nextStock,
        })
      }

      await tx
        .update(products)
        .set({
          stock: nextStock,
        })
        .where(eq(products.id, body.productId))

      const ledgerId = randomUUID()
      await tx.insert(inventoryStockLedger).values({
        id: ledgerId,
        itemId: body.productId,
        branchId: body.branchId ?? null,
        voucherType: body.reason,
        postingDate: new Date().toISOString().slice(0, 10),
        inQty: body.amount > 0 ? body.amount : 0,
        outQty: body.amount < 0 ? Math.abs(body.amount) : 0,
        inValue: 0,
        outValue: 0,
        balanceQty: nextStock,
        balanceValue: 0,
      })

      return {
        id: ledgerId,
        productId: body.productId,
        quantity: nextStock,
      }
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    if ("error" in result) {
      return NextResponse.json({ success: false, message: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof NotImplementedError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 501 })
    }
    const message = error instanceof Error ? error.message : "Unable to adjust inventory"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
