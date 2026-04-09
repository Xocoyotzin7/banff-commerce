"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, ExternalLink, Package2, Star, Truck } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { TrackingTimeline, type TimelineStep } from "@/components/orders/TrackingTimeline"
import { getBrowserAccountToken } from "@/lib/account/browser-session"
import type { AccountOrderDetail, AccountOrderStatus } from "@/lib/account/orders"
import { cn } from "@/lib/utils"
import { useAccountOrder, useSubmitOrderReview } from "@/hooks/use-account-orders"

type PageProps = {
  params: { id: string }
}

function formatMoney(value: number, country: "MX" | "CA") {
  return new Intl.NumberFormat(country === "MX" ? "es-MX" : "en-CA", {
    style: "currency",
    currency: country === "MX" ? "MXN" : "CAD",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value?: string | null) {
  if (!value) return "Pendiente"
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function orderStatusRank(status: AccountOrderStatus) {
  switch (status) {
    case "SHIPPED":
      return 1
    case "OUT_FOR_DELIVERY":
      return 2
    case "DELIVERED":
      return 3
    case "PENDING_FULFILLMENT":
    default:
      return 0
  }
}

function statusLabel(status: AccountOrderStatus) {
  switch (status) {
    case "SHIPPED":
      return "En camino 🚚"
    case "OUT_FOR_DELIVERY":
      return "Recogido por paquetería 📦"
    case "DELIVERED":
      return "Entregado ✅"
    case "PENDING_FULFILLMENT":
    default:
      return "En preparación"
  }
}

function statusBadgeClass(status: AccountOrderStatus) {
  switch (status) {
    case "SHIPPED":
      return "border-blue/20 bg-blue/10 text-blue"
    case "OUT_FOR_DELIVERY":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "DELIVERED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "PENDING_FULFILLMENT":
    default:
      return "border-border/60 bg-muted/70 text-muted-foreground"
  }
}

function countryAccent(country: "MX" | "CA") {
  return country === "MX" ? "text-primary" : "text-blue"
}

function countryLabel(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 Enviado con Skydropx" : "🇨🇦 Shipped via Easyship"
}

function buildTimeline(order: AccountOrderDetail): TimelineStep[] {
  const shippedCompleted = orderStatusRank(order.status) >= 1
  const outForDeliveryCompleted = orderStatusRank(order.status) >= 2
  const deliveredCompleted = orderStatusRank(order.status) >= 3

  return [
    {
      label: "Pedido confirmado",
      timestamp: formatDateTime(order.createdAt),
      state: "completed",
    },
    {
      label: "Enviado",
      timestamp: formatDateTime(order.shippedAt),
      details: order.carrier && order.trackingId ? `${order.carrier} · ${order.trackingId}` : order.carrier ?? null,
      state: shippedCompleted ? "completed" : "future",
    },
    {
      label: "En camino",
      timestamp: formatDateTime(order.outForDeliveryAt),
      state: outForDeliveryCompleted ? "completed" : shippedCompleted ? "current" : "future",
    },
    {
      label: "Entregado",
      timestamp: formatDateTime(order.deliveredAt),
      state: deliveredCompleted ? "completed" : outForDeliveryCompleted ? "current" : "future",
    },
  ]
}

function OrderReviewForm({ order, token }: { order: AccountOrderDetail; token: string | null }) {
  const mutation = useSubmitOrderReview(token)
  const [rating, setRating] = useState(order.reviewRating ?? 0)
  const [comment, setComment] = useState(order.reviewComment ?? "")

  useEffect(() => {
    setRating(order.reviewRating ?? 0)
    setComment(order.reviewComment ?? "")
  }, [order.id, order.reviewComment, order.reviewRating])

  async function submitReview() {
    if (rating < 1) {
      toast.error("Selecciona una calificación")
      return
    }

    try {
      await mutation.mutateAsync({
        id: order.id,
        payload: {
          rating,
          comment: comment.trim() ? comment.trim() : null,
        },
      })
      toast.success("Gracias por tu comentario")
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : "No pudimos guardar tu reseña")
    }
  }

  return (
    <Card className="border-border/60 bg-background/70">
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">¿Cómo fue tu experiencia?</CardTitle>
        <CardDescription>Comparte una reseña rápida para ayudarnos a mejorar el empaque y la entrega.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
            <Button
              key={value}
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-11 w-11 rounded-full border transition-all",
                rating >= value ? "border-primary/30 bg-primary/10 text-primary" : "border-border/60 bg-background",
              )}
              aria-label={`Calificar con ${value} estrellas`}
              onClick={() => setRating(value)}
            >
              <Star className={cn("h-5 w-5", rating >= value && "fill-current")} />
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={`review-comment-${order.id}`}>
            Comentario
          </label>
          <Textarea
            id={`review-comment-${order.id}`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Cuéntanos qué te pareció la experiencia"
            className="min-h-[120px] rounded-2xl"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {order.reviewedAt ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Reseña enviada el {formatDateTime(order.reviewedAt)}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Tu reseña se guarda al instante.</div>
          )}
          <Button type="button" className="rounded-full" onClick={() => void submitReview()} disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Enviar reseña"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AccountOrderDetailPage({ params }: PageProps) {
  const [token, setToken] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    setToken(getBrowserAccountToken())
  }, [])

  const { data, isLoading, isError, error, refetch } = useAccountOrder(params.id, token ?? null, token !== undefined)

  const trackingSteps = useMemo(() => (data ? buildTimeline(data) : []), [data])
  const canTrack = data ? orderStatusRank(data.status) >= 1 : false

  if (isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-border/60 bg-background/70">
          <CardHeader className="space-y-3">
            <div className="h-7 w-56 animate-pulse rounded bg-muted" />
            <div className="h-4 w-80 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-48 animate-pulse rounded-3xl bg-muted/60" />
            <div className="h-32 animate-pulse rounded-3xl bg-muted/60" />
          </CardContent>
        </Card>
      </section>
    )
  }

  if (isError || !data) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-border/60 bg-background/70">
          <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Package2 className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">No pudimos cargar el pedido</h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                {error instanceof Error ? error.message : "Intenta recargar la página o vuelve al historial de órdenes."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => void refetch()} className="rounded-full">
                Reintentar
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/account/orders">Volver al historial</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-border/60 bg-background/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={cn("rounded-full border px-3 py-1 text-xs", statusBadgeClass(data.status))}>
                {statusLabel(data.status)}
              </Badge>
              <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs", data.country === "MX" ? "border-primary/20 text-primary" : "border-blue/20 text-blue")}>
                {data.country === "MX" ? "🇲🇽 México" : "🇨🇦 Canadá"}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pedido #{data.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              {data.clientName} · {formatDateTime(data.createdAt)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-border/60 bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Items</p>
                <p className="mt-1 text-lg font-semibold">{data.itemCount}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total</p>
                <p className="mt-1 text-lg font-semibold">{formatMoney(data.grossTotal, data.country)}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-muted/30">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Paquetería</p>
                <p className="mt-1 text-lg font-semibold">{data.carrier ?? "Pendiente"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border-border/60 bg-background/70">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl">Resumen del pedido</CardTitle>
            <CardDescription>Productos, totales y dirección de envío.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Producto</th>
                    <th className="px-4 py-3 text-left font-medium">Qty</th>
                    <th className="px-4 py-3 text-left font-medium">Peso</th>
                    <th className="px-4 py-3 text-left font-medium">Subtotal</th>
                    <th className="px-4 py-3 text-left font-medium">Precio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.items.map((item) => (
                    <tr key={item.id} className="bg-background/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.productId}</p>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.unitWeightKg.toFixed(3)} kg</td>
                      <td className="px-4 py-3">{item.subtotalWeightKg.toFixed(3)} kg</td>
                      <td className="px-4 py-3">{formatMoney(item.price, item.currency === "MXN" ? "MX" : "CA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border-border/60 bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total venta</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(data.grossTotal, data.country)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Venta neta</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(data.netSales, data.country)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">IVA / taxes</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(data.taxAmount, data.country)}</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Envío</p>
                  <p className="mt-1 text-lg font-semibold">{formatMoney(data.shippingAmount, data.country)}</p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package2 className={cn("h-4 w-4", countryAccent(data.country))} />
                <h2 className="text-base font-semibold">Dirección de envío</h2>
              </div>
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Nombre</p>
                  <p className="mt-1 font-medium">{data.shippingAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Teléfono</p>
                  <p className="mt-1 font-medium">{data.shippingAddress.phone}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dirección</p>
                  <p className="mt-1 font-medium leading-6">
                    {data.shippingAddress.street}
                    <br />
                    {data.shippingAddress.city}, {data.shippingAddress.region} {data.shippingAddress.postalCode}
                    <br />
                    {data.shippingAddress.country === "MX" ? "🇲🇽 México" : "🇨🇦 Canadá"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 bg-background/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Seguimiento</CardTitle>
              <CardDescription>
                {data.status === "PENDING_FULFILLMENT"
                  ? "Te avisaremos cuando el pedido salga del almacén."
                  : "También te notificaremos por email cuando cambie el estado"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {canTrack ? (
                <>
                  <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                    <Truck className={cn("h-4 w-4", data.country === "MX" ? "text-primary" : "text-blue")} />
                    <span className={cn("font-medium", data.country === "MX" ? "text-primary" : "text-blue")}>
                      {countryLabel(data.country)}
                    </span>
                  </div>

                  <TrackingTimeline steps={trackingSteps} country={data.country} />

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {data.trackingUrl ? (
                      <Button asChild className="rounded-full">
                        <a href={data.trackingUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Rastrear en {data.carrier ?? "carrier"}
                        </a>
                      </Button>
                    ) : (
                      <Button className="rounded-full" disabled>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Rastrear en {data.carrier ?? "carrier"}
                      </Button>
                    )}
                    <div className="text-sm text-muted-foreground">
                      También te notificaremos por email cuando cambie el estado
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                  El pedido todavía está en preparación. Aquí aparecerá el tracking cuando se genere la guía.
                </div>
              )}
            </CardContent>
          </Card>

          {data.status === "DELIVERED" ? (
            <OrderReviewForm order={data} token={token ?? null} />
          ) : null}
        </div>
      </div>
    </section>
  )
}
