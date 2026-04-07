import { eq, lte } from "drizzle-orm"

import { inventoryItems, inventoryStock } from "@/lib/db/schema"
import type { NeonDb } from "@/lib/db/adapters/neon"
import { sendLowStockAlert } from "@/lib/mailer/triggers"

export type LowStockAlertItem = {
  id: string
  name: string
  currentStock: number
  minStock: number
}

function toNumber(value: unknown): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function getLowStockItems(db: NeonDb): Promise<LowStockAlertItem[]> {
  const rows = await db
    .select({
      id: inventoryItems.id,
      name: inventoryItems.name,
      currentStock: inventoryStock.quantity,
      minStock: inventoryItems.minStock,
    })
    .from(inventoryStock)
    .innerJoin(inventoryItems, eq(inventoryStock.itemId, inventoryItems.id))
    .where(lte(inventoryStock.quantity, inventoryItems.minStock))
    .orderBy(inventoryItems.name)

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    currentStock: toNumber(row.currentStock),
    minStock: toNumber(row.minStock),
  }))
}

export async function dispatchLowStockAlerts(
  db: NeonDb,
  options: {
    to?: string
  } = {},
): Promise<LowStockAlertItem[]> {
  const items = await getLowStockItems(db)

  for (const item of items) {
    void sendLowStockAlert({
      to: options.to,
      productName: item.name,
      currentStock: item.currentStock,
      minStock: item.minStock,
    })
  }

  return items
}
