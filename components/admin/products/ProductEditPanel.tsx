"use client"

import Link from "next/link"

import { ProductEditorForm } from "@/components/admin/products/ProductEditorForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminInventoryLedgerRecord, AdminProductRecord } from "@/lib/admin/products"
import { useAdminInventoryHistory } from "@/hooks/use-admin-products"

type ProductEditPanelProps = {
  product: AdminProductRecord
  initialHistory: AdminInventoryLedgerRecord[]
}

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function getStockBadge(stock: number, minStock: number) {
  if (stock === 0) {
    return "destructive"
  }
  if (stock <= minStock) {
    return "secondary"
  }
  return "outline"
}

export function ProductEditPanel({ product, initialHistory }: ProductEditPanelProps) {
  const { data: history = initialHistory } = useAdminInventoryHistory(product.id, initialHistory)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin products</p>
            <h1 className="text-3xl font-semibold tracking-tight">Edit product</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/products">Back to list</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStockBadge(product.stock, product.minStock)}>
            Stock {product.stock}
          </Badge>
          <span className="text-sm text-muted-foreground">{product.name}</span>
          <span className="text-sm text-muted-foreground">{money.format(Number(product.price))}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Product form</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductEditorForm mode="edit" product={product} />
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Stock history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length ? (
                    history.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.createdAt.slice(0, 19).replace("T", " ")}
                        </TableCell>
                        <TableCell>{row.voucherType ?? "manual-adjustment"}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.change > 0 ? `+${row.change}` : row.change}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{row.balanceQty}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No stock history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
