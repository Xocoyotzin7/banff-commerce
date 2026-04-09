"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { ProductEditorForm } from "@/components/admin/products/ProductEditorForm"
import { ProductShippingPreviewSheet } from "@/components/admin/products/ProductShippingPreviewSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AdminInventoryLedgerRecord, AdminProductRecord } from "@/lib/admin/products"
import { buildProductShippingAddress, type ProductShippingPreviewCountry } from "@/lib/admin/product-shipping-preview"
import { useAdminInventoryHistory } from "@/hooks/use-admin-products"
import type { Locale } from "@/lib/site-content"
import { getProductAdminCopy } from "@/lib/admin/product-copy"

type ProductEditPanelProps = {
  product: AdminProductRecord
  initialHistory: AdminInventoryLedgerRecord[]
  locale: Locale
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

function resolvePreviewCountry(locale: Locale): ProductShippingPreviewCountry {
  return locale === "es" ? "MX" : "CA"
}

function getMockShippingCustomer(country: ProductShippingPreviewCountry) {
  if (country === "MX") {
    return {
      fullName: "Andrea Gómez",
      email: "andrea@demo.mx",
      phone: "+52 55 5555 0101",
    }
  }

  return {
    fullName: "Mila Thompson",
    email: "mila@demo.ca",
    phone: "+1 416 555 0101",
  }
}

export function ProductEditPanel({ product, initialHistory, locale }: ProductEditPanelProps) {
  const { data: history = initialHistory } = useAdminInventoryHistory(product.id, initialHistory)
  const copy = useMemo(() => getProductAdminCopy(locale), [locale])
  const previewCountry = resolvePreviewCountry(locale)
  const previewCustomer = getMockShippingCustomer(previewCountry)
  const previewAddress = buildProductShippingAddress(previewCustomer, previewCountry, product.stock + product.minStock)
  const [previewProductId, setPreviewProductId] = useState<string | null>(null)

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{copy.edit.eyebrow}</p>
            <h1 className="text-3xl font-semibold tracking-tight">{copy.edit.title}</h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/admin/products">{copy.edit.back}</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStockBadge(product.stock, product.minStock)}>
            {copy.edit.stockLabel} {product.stock}
          </Badge>
          <span className="text-sm text-muted-foreground">{product.name}</span>
          <span className="text-sm text-muted-foreground">{money.format(Number(product.price))}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{copy.edit.formTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductEditorForm
              mode="edit"
              product={product}
              locale={locale}
              onSuccess={() => {
                setPreviewProductId(product.id)
              }}
              onShippingPreviewReady={(productId) => {
                setPreviewProductId(productId)
              }}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{copy.edit.addressTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{copy.edit.addressDescription}</p>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.customer}</p>
                    <p className="mt-1 font-medium">{previewAddress.fullName}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                    {previewAddress.country === "MX" ? copy.preview.countryLabelMX : copy.preview.countryLabelCA}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.address}</p>
                    <p className="mt-1 font-medium">{previewAddress.street}</p>
                    <p className="text-muted-foreground">
                      {previewAddress.city}, {previewAddress.region} {previewAddress.postalCode}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.email}</p>
                    <p className="mt-1 font-medium">{previewCustomer.email}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.phone}</p>
                    <p className="mt-1 font-medium">{previewAddress.phone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{copy.edit.historyTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{copy.edit.historyColumns.date}</TableHead>
                      <TableHead>{copy.edit.historyColumns.reason}</TableHead>
                      <TableHead className="text-right">{copy.edit.historyColumns.change}</TableHead>
                      <TableHead className="text-right">{copy.edit.historyColumns.balance}</TableHead>
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
                          {copy.edit.historyEmpty}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
