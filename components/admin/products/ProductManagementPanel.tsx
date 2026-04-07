"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { ProductEditorForm } from "@/components/admin/products/ProductEditorForm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableScrollRevealRows } from "@/components/admin/TableScrollRevealRows"
import type { AdminProductRecord } from "@/lib/admin/products"
import { useAdminProducts, useDeleteProduct } from "@/hooks/use-admin-products"
import { cn } from "@/lib/utils"

type ProductManagementPanelProps = {
  initialProducts: AdminProductRecord[]
}

type DrawerState = {
  open: boolean
  mode: "create" | "edit"
  product: AdminProductRecord | null
}

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
})

function getStockBadge(stock: number, minStock: number) {
  if (stock === 0) {
    return {
      label: "🔴 out",
      className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    }
  }
  if (stock <= minStock) {
    return {
      label: "🟡 low",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    }
  }
  return {
    label: "🟢 healthy",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  }
}

export function ProductManagementPanel({ initialProducts }: ProductManagementPanelProps) {
  const { data: products = initialProducts } = useAdminProducts(initialProducts)
  const deleteProduct = useDeleteProduct()
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    mode: "create",
    product: null,
  })

  function openCreateDrawer() {
    setDrawer({
      open: true,
      mode: "create",
      product: null,
    })
  }

  function openEditDrawer(product: AdminProductRecord) {
    setDrawer({
      open: true,
      mode: "edit",
      product,
    })
  }

  function closeDrawer() {
    setDrawer((current) => ({
      ...current,
      open: false,
    }))
  }

  async function handleDelete(productId: string) {
    const confirmed = window.confirm("Delete this product? This will soft-delete it.")
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct.mutateAsync(productId)
      toast.success("Product deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product")
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Admin products</p>
          <h1 className="text-3xl font-semibold tracking-tight">Product management</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            Functional catalog control for the store owner. Products are written directly to Neon through the admin API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={openCreateDrawer}>
            New Product
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">MinStock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableScrollRevealRows>
                {products.length ? (
                  products.map((product) => {
                    const tone = getStockBadge(product.stock, product.minStock)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">{product.subcategory}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right tabular-nums">{money.format(product.price)}</TableCell>
                        <TableCell className="text-right tabular-nums">{money.format(product.cost)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn("rounded-full border px-2 py-0.5 text-[11px]", tone.className)}>
                            {tone.label} {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{product.minStock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditDrawer(product)}>
                              Edit
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete(product.id)}>
                              Delete
                            </Button>
                            <Button type="button" variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>Open</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                      No products yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableScrollRevealRows>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={drawer.open}
        onOpenChange={(open) =>
          setDrawer((current) => ({
            ...current,
            open,
          }))
        }
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader className="border-b border-border/60 pb-4 pr-10">
            <SheetTitle>{drawer.mode === "create" ? "New product" : "Edit product"}</SheetTitle>
            <SheetDescription>Product data is stored directly in Neon.</SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <ProductEditorForm
              mode={drawer.mode}
              product={drawer.product}
              onSuccess={() =>
                setDrawer({
                  open: false,
                  mode: "create",
                  product: null,
                })
              }
              onCancel={closeDrawer}
            />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
