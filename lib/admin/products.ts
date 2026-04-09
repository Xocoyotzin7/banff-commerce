import { desc, eq, isNull, sql } from "drizzle-orm"

import type { NeonDb } from "@/lib/db/adapters/neon"
import { inventoryItems, inventoryStock, inventoryStockLedger, products } from "@/lib/db/schema"

type AdminSelectDatabase = Pick<NeonDb, "select">

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toIsoString(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value ?? "")
}

export type AdminProductRecord = {
  id: string
  name: string
  category: string
  subcategory: string
  price: string
  cost: string
  weightKg: string
  lengthCm: string
  widthCm: string
  heightCm: string
  volumetricWeightKg: string
  stock: number
  minStock: number
  imageUrl: string
  deletedAt: string | null
  createdAt: string
}

export type AdminInventoryLedgerRecord = {
  id: string
  productId: string
  branchId: string | null
  voucherType: string | null
  postingDate: string | null
  inQty: number
  outQty: number
  balanceQty: number
  createdAt: string
  change: number
}

export async function listAdminProducts(database: AdminSelectDatabase): Promise<AdminProductRecord[]> {
  const rows = await database
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      subcategory: products.subcategory,
      price: products.price,
      cost: products.cost,
      weightKg: products.weightKg,
      lengthCm: products.lengthCm,
      widthCm: products.widthCm,
      heightCm: products.heightCm,
      volumetricWeightKg: products.volumetricWeightKg,
      stock: sql<unknown>`coalesce(${inventoryStock.quantity}, ${products.stock})`,
      minStock: products.minStock,
      imageUrl: products.imageUrl,
      deletedAt: products.deletedAt,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(inventoryItems, eq(inventoryItems.id, products.id))
    .leftJoin(inventoryStock, eq(inventoryStock.itemId, inventoryItems.id))
    .where(isNull(products.deletedAt))
    .orderBy(desc(products.createdAt))

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: String(row.price),
    cost: String(row.cost),
    weightKg: String(row.weightKg),
    lengthCm: String(row.lengthCm),
    widthCm: String(row.widthCm),
    heightCm: String(row.heightCm),
    volumetricWeightKg: String(row.volumetricWeightKg),
    stock: toNumber(row.stock),
    minStock: Number(row.minStock),
    imageUrl: row.imageUrl,
    deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
    createdAt: toIsoString(row.createdAt),
  }))
}

export async function getAdminProductById(
  database: AdminSelectDatabase,
  productId: string,
): Promise<AdminProductRecord | null> {
  const rows = await database
    .select({
      id: products.id,
      name: products.name,
      category: products.category,
      subcategory: products.subcategory,
      price: products.price,
      cost: products.cost,
      weightKg: products.weightKg,
      lengthCm: products.lengthCm,
      widthCm: products.widthCm,
      heightCm: products.heightCm,
      volumetricWeightKg: products.volumetricWeightKg,
      stock: sql<unknown>`coalesce(${inventoryStock.quantity}, ${products.stock})`,
      minStock: products.minStock,
      imageUrl: products.imageUrl,
      deletedAt: products.deletedAt,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(inventoryItems, eq(inventoryItems.id, products.id))
    .leftJoin(inventoryStock, eq(inventoryStock.itemId, inventoryItems.id))
    .where(eq(products.id, productId))
    .limit(1)

  const row = rows[0]

  if (!row || row.deletedAt) {
    return null
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: String(row.price),
    cost: String(row.cost),
    weightKg: String(row.weightKg),
    lengthCm: String(row.lengthCm),
    widthCm: String(row.widthCm),
    heightCm: String(row.heightCm),
    volumetricWeightKg: String(row.volumetricWeightKg),
    stock: toNumber(row.stock),
    minStock: Number(row.minStock),
    imageUrl: row.imageUrl,
    deletedAt: row.deletedAt ? toIsoString(row.deletedAt) : null,
    createdAt: toIsoString(row.createdAt),
  }
}

export async function listProductInventoryHistory(
  database: AdminSelectDatabase,
  productId: string,
): Promise<AdminInventoryLedgerRecord[]> {
  const rows = await database
    .select({
      id: inventoryStockLedger.id,
      itemId: inventoryStockLedger.itemId,
      branchId: inventoryStockLedger.branchId,
      voucherType: inventoryStockLedger.voucherType,
      postingDate: inventoryStockLedger.postingDate,
      inQty: inventoryStockLedger.inQty,
      outQty: inventoryStockLedger.outQty,
      balanceQty: inventoryStockLedger.balanceQty,
      createdAt: inventoryStockLedger.createdAt,
    })
    .from(inventoryStockLedger)
    .where(eq(inventoryStockLedger.itemId, productId))
    .orderBy(desc(inventoryStockLedger.createdAt))

  return rows.map((row) => {
    const inQty = toNumber(row.inQty)
    const outQty = toNumber(row.outQty)
    return {
      id: row.id,
      productId: row.itemId,
      branchId: row.branchId ?? null,
      voucherType: row.voucherType ?? null,
      postingDate: row.postingDate ? String(row.postingDate) : null,
      inQty,
      outQty,
      balanceQty: toNumber(row.balanceQty),
      createdAt: toIsoString(row.createdAt),
      change: inQty - outQty,
    }
  })
}
