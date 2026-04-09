"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

import { ProductEditorForm } from "@/components/admin/products/ProductEditorForm"
import { ProductShippingPreviewSheet } from "@/components/admin/products/ProductShippingPreviewSheet"
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
import { getProductAdminCopy } from "@/lib/admin/product-copy"
import { useAdminProducts, useDeleteProduct } from "@/hooks/use-admin-products"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/site-content"

type ProductManagementPanelProps = {
  initialProducts: AdminProductRecord[]
  locale: Locale
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

type MockProductStatus = "ready" | "review" | "low" | "out"

function getMockProductStatus(stock: number, minStock: number) {
  if (stock === 0) {
    return {
      label: "out" as MockProductStatus,
      tone: "destructive" as const,
    }
  }

  if (stock <= minStock) {
    return {
      label: "review" as MockProductStatus,
      tone: "secondary" as const,
    }
  }

  if (stock <= minStock + 3) {
    return {
      label: "low" as MockProductStatus,
      tone: "outline" as const,
    }
  }

  return {
    label: "ready" as MockProductStatus,
    tone: "default" as const,
  }
}

export function ProductManagementPanel({ initialProducts, locale }: ProductManagementPanelProps) {
  const { data: products = initialProducts } = useAdminProducts(initialProducts)
  const deleteProduct = useDeleteProduct()
  const copy = useMemo(() => getProductAdminCopy(locale), [locale])
  const [drawer, setDrawer] = useState<DrawerState>({
    open: false,
    mode: "create",
    product: null,
  })
  const [previewProductId, setPreviewProductId] = useState<string | null>(null)

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
    const confirmed = window.confirm(copy.management.confirmDelete)
    if (!confirmed) {
      return
    }

    try {
      await deleteProduct.mutateAsync(productId)
      toast.success(copy.management.deleted)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product")
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{copy.management.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-tight">{copy.management.title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            {copy.management.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={openCreateDrawer}>
            {copy.management.newProduct}
          </Button>
        </div>
      </div>

      <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{copy.management.title}</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{copy.management.table.name}</TableHead>
                  <TableHead>{copy.management.table.category}</TableHead>
                  <TableHead>{copy.management.table.status}</TableHead>
                  <TableHead className="text-right">{copy.management.table.price}</TableHead>
                  <TableHead className="text-right">{copy.management.table.cost}</TableHead>
                  <TableHead className="text-right">{copy.management.table.stock}</TableHead>
                  <TableHead className="text-right">{copy.management.table.minStock}</TableHead>
                  <TableHead className="text-right">{copy.management.table.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableScrollRevealRows>
                {products.length ? (
                  products.map((product) => {
                    const tone = getStockBadge(product.stock, product.minStock)
                    const status = getMockProductStatus(product.stock, product.minStock)
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            <span className="text-xs text-muted-foreground">{product.subcategory}</span>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={status.tone}
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[11px] capitalize",
                              status.label === "ready" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                              status.label === "review" && "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                              status.label === "low" && "border-yellow-500/30 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
                              status.label === "out" && "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                            )}
                          >
                            {copy.management.statuses[status.label]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{money.format(Number(product.price))}</TableCell>
                        <TableCell className="text-right tabular-nums">{money.format(Number(product.cost))}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn("rounded-full border px-2 py-0.5 text-[11px]", tone.className)}>
                            {tone.label} {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{product.minStock}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => openEditDrawer(product)}>
                              {copy.management.actions.edit}
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete(product.id)}>
                              {copy.management.actions.delete}
                            </Button>
                            <Button type="button" variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}/edit`}>{copy.management.actions.open}</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                        {copy.management.table.empty}
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
            <SheetTitle>{drawer.mode === "create" ? copy.management.drawerTitleCreate : copy.management.drawerTitleEdit}</SheetTitle>
            <SheetDescription>{copy.management.drawerDescription}</SheetDescription>
          </SheetHeader>
          <div className="p-4">
            <ProductEditorForm
              mode={drawer.mode}
              product={drawer.product}
              locale={locale}
              onSuccess={() =>
                setDrawer({
                  open: false,
                  mode: "create",
                  product: null,
                })
              }
              onShippingPreviewReady={(productId) => {
                setDrawer({
                  open: false,
                  mode: "create",
                  product: null,
                })
                setPreviewProductId(productId)
              }}
              onCancel={closeDrawer}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ProductShippingPreviewSheet
        open={previewProductId !== null}
        productId={previewProductId}
        locale={locale}
        onOpenChange={(open) => {
          if (!open) setPreviewProductId(null)
        }}
      />
    </main>
  )
}
