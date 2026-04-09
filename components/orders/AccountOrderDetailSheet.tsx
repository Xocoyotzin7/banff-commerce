"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, ClipboardCopy, ExternalLink, Package2, Star, Truck } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { TrackingTimeline, type TimelineStep } from "@/components/orders/TrackingTimeline"
import { useAccountOrder, useSubmitOrderReview } from "@/hooks/use-account-orders"
import type { AccountOrderDetail, AccountOrderStatus } from "@/lib/account/orders"
import { cn } from "@/lib/utils"

type AccountOrderDetailSheetProps = {
  open: boolean
  orderId: string | null
  token: string | null
  onOpenChange: (open: boolean) => void
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

function getCountryLabel(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 México" : "🇨🇦 Canadá"
}

function getProviderLabel(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 Enviado con Skydropx" : "🇨🇦 Shipped via Easyship"
}

function buildAddress(order: AccountOrderDetail) {
  return [
    order.shippingAddress.fullName,
    order.shippingAddress.street,
    `${order.shippingAddress.city}, ${order.shippingAddress.region} ${order.shippingAddress.postalCode}`,
    getCountryLabel(order.country),
    order.shippingAddress.phone,
  ].join("\n")
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
        <CardDescription>Cuéntanos si el viaje llegó bien para mejorar la entrega y el empaque.</CardDescription>
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

export function AccountOrderDetailSheet({ open, orderId, token, onOpenChange }: AccountOrderDetailSheetProps) {
  const { data, isLoading, isError, error } = useAccountOrder(orderId ?? "", token, open && Boolean(orderId))

  async function copyAddress(order: AccountOrderDetail) {
    try {
      await navigator.clipboard.writeText(buildAddress(order))
      toast.success("Dirección copiada al portapapeles")
    } catch {
      toast.error("No se pudo copiar la dirección")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-4xl overflow-hidden p-0 sm:max-w-4xl">
        <div className="flex h-full flex-col">
          <SheetHeader className="border-b border-border/60 bg-background/90 px-6 py-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-2xl">Detalle de la orden {data?.orderNumber ?? orderId}</SheetTitle>
                {data ? (
                  <>
                    <Badge className={cn("rounded-full border px-3 py-1 text-xs", statusBadgeClass(data.status))}>
                      {statusLabel(data.status)}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {getCountryLabel(data.country)}
                    </Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                      {data.carrier ?? (data.country === "MX" ? "Skydropx" : "Easyship")}
                    </Badge>
                  </>
                ) : null}
              </div>
              <SheetDescription className="flex flex-wrap items-center gap-3">
                <span>{data ? formatDateTime(data.createdAt) : "Cargando detalle..."}</span>
                {data ? <span>•</span> : null}
                <span className="font-medium text-foreground">{data?.clientName ?? "Pedido de cliente"}</span>
              </SheetDescription>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading ? (
              <div className="space-y-4">
                <Card className="border-border/60 bg-background/60">
                  <CardHeader>
                    <CardTitle className="text-base">Cargando pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              </div>
            ) : isError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No pudimos cargar el pedido</AlertTitle>
                <AlertDescription>{error instanceof Error ? error.message : "Intenta abrir el detalle de nuevo."}</AlertDescription>
              </Alert>
            ) : data ? (
              <div className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Card className="border-border/60 bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Items</p>
                      <p className="mt-1 text-lg font-semibold">{data.itemCount}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 bg-muted/30">
                    <CardContent className="p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total venta</p>
                      <p className="mt-1 text-lg font-semibold">{formatMoney(data.grossTotal, data.country)}</p>
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
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Productos del pedido</h3>
                  </div>

                  <Card className="border-border/60 bg-background/70">
                    <CardContent className="p-0">
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
                    </CardContent>
                  </Card>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className={cn("h-4 w-4", data.country === "MX" ? "text-primary" : "text-blue")} />
                    <h3 className="text-base font-semibold">Tracking mock</h3>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-border/60 bg-background/70">
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-base">Resumen de envío</CardTitle>
                        <CardDescription>
                          {orderStatusRank(data.status) >= 1
                            ? getProviderLabel(data.country)
                            : "Te avisaremos cuando el pedido salga del almacén."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {orderStatusRank(data.status) >= 1 ? (
                          <>
                            <TrackingTimeline steps={buildTimeline(data)} country={data.country} />
                            <Separator />
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
                              <Button type="button" variant="outline" className="rounded-full" onClick={() => void copyAddress(data)}>
                                <ClipboardCopy className="mr-2 h-4 w-4" />
                                Copiar dirección
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Alert>
                            <Truck className="h-4 w-4" />
                            <AlertTitle>Pedido en preparación</AlertTitle>
                            <AlertDescription>El tracking aparecerá aquí cuando se genere la guía.</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-border/60 bg-background/70">
                      <CardHeader className="space-y-2">
                        <CardTitle className="text-base">Dirección de envío</CardTitle>
                        <CardDescription>Este es el destino del paquete.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Nombre</p>
                            <p className="mt-1 font-medium">{data.shippingAddress.fullName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Teléfono</p>
                            <p className="mt-1 font-medium">{data.shippingAddress.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Dirección</p>
                            <p className="mt-1 font-medium leading-6">
                              {data.shippingAddress.street}
                              <br />
                              {data.shippingAddress.city}, {data.shippingAddress.region} {data.shippingAddress.postalCode}
                              <br />
                              {getCountryLabel(data.shippingAddress.country)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Confirmación</h3>
                  </div>

                  <Card className="border-border/60 bg-muted/20">
                    <CardContent className="space-y-4 p-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Cliente</p>
                          <p className="mt-1 font-medium">{data.clientName}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Método</p>
                          <p className="mt-1 font-medium">{data.carrier ?? (data.country === "MX" ? "Skydropx" : "Easyship")}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Estado</p>
                          <p className="mt-1 font-medium">{statusLabel(data.status)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {data.status === "DELIVERED" ? <OrderReviewForm order={data} token={token} /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
