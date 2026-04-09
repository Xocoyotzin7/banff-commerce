'use client'

import { useEffect, useRef } from "react"
import { toast as sonnerToast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast as appToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/site-content"

export type InventoryAlertItem = {
  name: string
  quantity: number
  minStock: number
}

type InventoryAlertProps = {
  items: InventoryAlertItem[]
  surface?: "admin" | "storefront"
  renderTable?: boolean
  className?: string
  locale?: Locale
}

function getBadgeTone(quantity: number, minStock: number) {
  if (quantity === 0) {
    return { label: "🔴 critical", className: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400" }
  }
  if (quantity <= minStock) {
    return { label: "🟡 warning", className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300" }
  }
  return { label: "ok", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
}

export function InventoryAlert({
  items,
  surface = "admin",
  renderTable = true,
  className,
  locale = "en",
}: InventoryAlertProps) {
  const notifiedKeys = useRef(new Set<string>())

  useEffect(() => {
    for (const item of items) {
      const key = `${surface}:${item.name}:${item.quantity}:${item.minStock}`
      if (notifiedKeys.current.has(key)) continue

      if (surface === "storefront") {
        if (item.quantity === 0) {
          sonnerToast.error("Agotado")
          notifiedKeys.current.add(key)
        } else if (item.quantity > 0 && item.quantity <= item.minStock) {
          sonnerToast.warning(`Últimas ${item.quantity} unidades`)
          notifiedKeys.current.add(key)
        }
        continue
      }

      if (item.quantity === 0) {
        appToast.warning(`Sin stock: ${item.name} — no disponible para clientes`)
        notifiedKeys.current.add(key)
      }
    }
  }, [items, surface])

  if (!renderTable) {
    return null
  }

  const visibleItems = items.filter((item) => item.quantity <= item.minStock)
  const copy =
    locale === "es"
      ? {
          title: "Alertas de inventario",
          item: "Artículo",
          stock: "Stock",
          min: "Mín",
          status: "Estado",
          action: "Acción",
          reorder: "Reordenar",
          empty: "No hay artículos con stock bajo por ahora.",
        }
      : locale === "fr"
        ? {
            title: "Alertes de stock",
            item: "Article",
            stock: "Stock",
            min: "Min",
            status: "Statut",
            action: "Action",
            reorder: "Réapprovisionner",
            empty: "Aucun article en faible stock pour le moment.",
          }
        : {
            title: "Inventory Alerts",
            item: "Item",
            stock: "Stock",
            min: "Min",
            status: "Status",
            action: "Action",
            reorder: "Reorder",
            empty: "No low-stock items right now.",
          }

  return (
    <Card className={cn("border-border/70 bg-card/90 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{copy.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{copy.item}</TableHead>
              <TableHead className="text-right">{copy.stock}</TableHead>
              <TableHead className="text-right">{copy.min}</TableHead>
              <TableHead>{copy.status}</TableHead>
              <TableHead className="text-right">{copy.action}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.length ? (
              visibleItems.map((item) => {
                const tone = getBadgeTone(item.quantity, item.minStock)
                return (
                  <TableRow key={`${item.name}-${item.quantity}-${item.minStock}`}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.minStock}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full border px-2 py-0.5 text-[11px]", tone.className)}>
                        {tone.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="outline" size="sm">
                        {copy.reorder}
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  {copy.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
