"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, CalendarDays, ChevronRight, PackageSearch, RefreshCw } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AccountOrderDetailSheet } from "@/components/orders/AccountOrderDetailSheet"
import type { AccountOrderListItem, AccountOrderStatus } from "@/lib/account/orders"
import { getBrowserAccountToken } from "@/lib/account/browser-session"
import { cn } from "@/lib/utils"
import { useAccountOrders } from "@/hooks/use-account-orders"
import { EntryFlightTransition } from "@/components/entry-flight-transition"

function formatMoney(value: number, country: "MX" | "CA") {
  return new Intl.NumberFormat(country === "MX" ? "es-MX" : "en-CA", {
    style: "currency",
    currency: country === "MX" ? "MXN" : "CAD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatUpdatedAt(value?: string | null) {
  if (!value) return "Actualizado hace -"
  const minutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000))
  return `Actualizado hace ${minutes} min`
}

function statusMeta(status: AccountOrderStatus) {
  switch (status) {
    case "SHIPPED":
      return { label: "En camino 🚚", className: "border-blue/20 bg-blue/10 text-blue" }
    case "OUT_FOR_DELIVERY":
      return { label: "Recogido por paquetería 📦", className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" }
    case "DELIVERED":
      return { label: "Entregado ✅", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
    case "PENDING_FULFILLMENT":
    default:
      return { label: "En preparación", className: "border-border/60 bg-muted/60 text-muted-foreground" }
  }
}

function EmptyState({ error }: { error: string | null }) {
  return (
    <Card className="border-border/60 bg-background/70">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
          {error ? <AlertTriangle className="h-8 w-8" /> : <PackageSearch className="h-8 w-8" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            {error ? "No pudimos cargar tus pedidos" : "Todavía no tienes pedidos"}
          </h2>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">
            {error ?? "Aquí aparecerán tus compras, el estado de envío y los detalles de seguimiento."}
          </p>
        </div>
        {error ? (
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="border-border/60 bg-background/70">
      <CardHeader className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="space-y-3 py-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </CardContent>
    </Card>
  )
}

function OrdersTable({
  orders,
  onSelectOrder,
}: {
  orders: AccountOrderListItem[]
  onSelectOrder: (orderId: string) => void
}) {
  return (
    <Card className="border-border/60 bg-background/70">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody initial="hidden" animate="visible">
            {orders.map((order, index) => {
              const meta = statusMeta(order.status)
              return (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: {
                      duration: 0.32,
                      delay: index * 0.045,
                      ease: "easeOut",
                    },
                  }}
                  className="bg-background/40"
                >
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-muted-foreground font-mono">#{order.orderNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.itemCount}</TableCell>
                  <TableCell className="text-muted-foreground">{formatMoney(order.total, order.country)}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full border px-3 py-1 text-xs", meta.className)}>{meta.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10" onClick={() => onSelectOrder(order.id)}>
                      Ver detalle
                      <ChevronRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function AccountOrdersPage() {
  const [token, setToken] = useState<string | null | undefined>(undefined)
  const searchParams = useSearchParams()
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  useEffect(() => {
    setToken(getBrowserAccountToken())
  }, [])

  const { data, isLoading, isError, error, refetch, isFetching } = useAccountOrders(token ?? null, token !== undefined)
  const errorMessage = isError ? (error instanceof Error ? error.message : "Unable to load orders") : null
  const orders = useMemo(() => data?.orders ?? [], [data?.orders])
  const entryEnabled = searchParams.get("entry") === "flight"

  return (
    <EntryFlightTransition enabled={entryEnabled} destination="client">
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/60 bg-background/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <CalendarDays className="h-3.5 w-3.5" />
              Mis pedidos
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Historial de órdenes</h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Revisa tus compras, el estado de envío y entra al detalle para seguir tu paquete.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">{formatUpdatedAt(data?.updatedAt)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="rounded-full"
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <EmptyState error={errorMessage} />
      ) : orders.length ? (
        <>
          <OrdersTable orders={orders} onSelectOrder={setSelectedOrderId} />
          <AccountOrderDetailSheet
            open={Boolean(selectedOrderId)}
            orderId={selectedOrderId}
            token={token ?? null}
            onOpenChange={(open) => {
              if (!open) setSelectedOrderId(null)
            }}
          />
        </>
        ) : (
          <EmptyState error={null} />
        )}
      </section>
    </EntryFlightTransition>
  )
}
