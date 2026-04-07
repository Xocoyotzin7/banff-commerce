'use client'

import { useEffect, useState } from "react"

import { InventoryAlert } from "@/components/metrics/InventoryAlert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProductStockSnapshot } from "@/lib/metrics/types"

type ProductDetailProps = {
  product: ProductStockSnapshot
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [stock, setStock] = useState<ProductStockSnapshot>(product)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStock() {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(product.handle)}/stock`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) return
        const json = (await response.json()) as { success: boolean; data?: ProductStockSnapshot }
        if (json.success && json.data) {
          setStock(json.data)
        }
      } catch {
        // Keep the server-rendered value when the refresh request fails.
      }
    }

    void loadStock()
    return () => controller.abort()
  }, [product.handle])

  const stockLabel = stock.stock === 0 ? "Agotado" : stock.stock <= stock.minStock ? `Últimas ${stock.stock} unidades` : `${stock.stock} en stock`
  const stockTone =
    stock.stock === 0
      ? "destructive"
      : stock.stock <= stock.minStock
        ? "secondary"
        : "outline"

  return (
    <>
      <InventoryAlert
        items={[{ name: stock.name, quantity: stock.stock, minStock: stock.minStock }]}
        surface="storefront"
        renderTable={false}
      />

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="space-y-2">
          <Badge variant={stockTone} className="w-fit rounded-full">
            {stockLabel}
          </Badge>
          <CardTitle className="text-2xl font-semibold tracking-tight">{stock.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Handle: {stock.handle}</span>
            <span>Min stock: {stock.minStock}</span>
          </div>
          <Button type="button" disabled={stock.stock === 0} className="rounded-full">
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
