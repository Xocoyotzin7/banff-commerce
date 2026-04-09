"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { ShippingRateCard } from "@/components/checkout/ShippingRateCard"
import type { AdminOrderDetail } from "@/lib/admin/orders"
import { resolveOrderAgeLabel } from "@/lib/admin/orders"
import { cn } from "@/lib/utils"
import { useAdminOrder, useShipAdminOrder } from "@/hooks/use-admin-order-detail"
import { AlertTriangle, CheckCircle2, ClipboardCopy, ExternalLink, Loader2, MapPin, Package, Truck, X } from "lucide-react"
import { toast } from "sonner"
import type { ShippingRate } from "@/types/shipping"

type OrderDetailSheetProps = {
  open: boolean
  orderId: string | null
  onOpenChange: (open: boolean) => void
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatWeight(value: number) {
  return `${new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)} kg`
}

function formatMoney(value: number, currency: "MXN" | "CAD") {
  return new Intl.NumberFormat(currency === "MXN" ? "es-MX" : "en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function getCountryLabel(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 México" : "🇨🇦 Canadá"
}

function getProviderHeader(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 Skydropx" : "🇨🇦 Easyship"
}

function getProviderUrl(country: "MX" | "CA") {
  return country === "MX" ? "https://pro.skydropx.com" : "https://app.easyship.com"
}

function getAccentClasses(country: "MX" | "CA") {
  return country === "MX"
    ? "border-primary/20 bg-primary/10 text-primary"
    : "border-blue/20 bg-blue/10 text-blue"
}

function getOrderStatusMeta(status: AdminOrderDetail["status"]) {
  switch (status) {
    case "processing":
      return { label: "En preparación", className: "border-border/60 bg-muted/70 text-muted-foreground" }
    case "shipped":
      return { label: "Enviado", className: "border-blue/25 bg-blue/10 text-blue" }
    case "out_for_delivery":
      return { label: "Recogido por paquetería", className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" }
    case "delivered":
      return { label: "Entregado", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
    case "confirmed":
      return { label: "Confirmado", className: "border-primary/20 bg-primary/10 text-primary" }
    case "cancelled":
      return { label: "Cancelado", className: "border-destructive/20 bg-destructive/10 text-destructive" }
    default:
      return { label: "Pendiente", className: "border-border/60 bg-muted/70 text-muted-foreground" }
  }
}

function formatAddress(address: AdminOrderDetail["shippingAddress"]) {
  return [
    address.fullName,
    address.street,
    `${address.city}, ${address.region} ${address.postalCode}`,
    getCountryLabel(address.country),
    address.phone,
  ].join("\n")
}

function getTrackingPlaceholder(country: "MX" | "CA") {
  return country === "MX"
    ? "Ej: 1234567890123456 (Estafeta)"
    : "Ej: 1234 5678 9012 3456 7890 (Canada Post)"
}

function getTrackingUrlPlaceholder(country: "MX" | "CA") {
  return country === "MX"
    ? "https://rastreo.estafeta.com/..."
    : "https://www.canadapost.ca/trackweb/..."
}

function buildProductTableRows(items: AdminOrderDetail["items"]) {
  return items.map((item) => (
    <TableRow key={item.id}>
      <TableCell>
        <div className="space-y-1">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.productId}</p>
        </div>
      </TableCell>
      <TableCell>{item.quantity}</TableCell>
      <TableCell>{formatWeight(item.unitWeightKg)}</TableCell>
      <TableCell>{formatWeight(item.subtotalWeightKg)}</TableCell>
      <TableCell>{formatMoney(item.price, item.currency)}</TableCell>
    </TableRow>
  ))
}

export function OrderDetailSheet({ open, orderId, onOpenChange }: OrderDetailSheetProps) {
  const { data, isLoading, isError, error } = useAdminOrder(orderId ?? "", open && Boolean(orderId))
  const shipMutation = useShipAdminOrder()
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [trackingId, setTrackingId] = useState("")
  const [trackingUrl, setTrackingUrl] = useState("")

  useEffect(() => {
    if (!data) return
    setSelectedRate(data.selectedRate ?? data.quotedRates[0] ?? null)
    setTrackingId(data.trackingId ?? "")
    setTrackingUrl(data.trackingUrl ?? "")
  }, [data])

  const resolvedRate = selectedRate ?? data?.selectedRate ?? data?.quotedRates[0] ?? null
  const country = data?.country ?? "CA"
  const accentClasses = getAccentClasses(country)
  const shippingLabel = getProviderHeader(country)
  const providerUrl = getProviderUrl(country)
  const clientSelectedRate = data?.selectedRate ?? null
  const totalItems = data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const totalWeight = data?.items.reduce((sum, item) => sum + item.subtotalWeightKg, 0) ?? 0
  const totalPrice = data?.grossTotal ?? data?.total ?? 0
  const volumetricWeight = useMemo(() => {
    if (!data?.items.length) return 0
    const maxLength = Math.max(...data.items.map((item) => item.lengthCm))
    const maxWidth = Math.max(...data.items.map((item) => item.widthCm))
    const totalHeight = data.items.reduce((sum, item) => sum + item.heightCm * item.quantity, 0)
    return Number(((maxLength * maxWidth * totalHeight) / 5000).toFixed(3))
  }, [data?.items])
  const volumetricWarning = volumetricWeight > totalWeight

  async function copyAddress() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(formatAddress(data.shippingAddress))
      toast.success("Dirección copiada al portapapeles")
    } catch {
      toast.error("No se pudo copiar la dirección")
    }
  }

  async function confirmShipment() {
    if (!data || !resolvedRate) return

    try {
      const updated = await shipMutation.mutateAsync({
        id: data.id,
        payload: {
          carrier: resolvedRate.provider,
          tracking_id: trackingId.trim(),
          tracking_url: trackingUrl.trim(),
        },
      })

      toast.success(`Pedido #${updated.orderNumber} marcado como enviado. Email enviado a cliente. ✅`)
      onOpenChange(false)
      setSelectedRate(null)
      setTrackingId("")
      setTrackingUrl("")
    } catch (mutationError) {
      toast.error(mutationError instanceof Error ? mutationError.message : "No se pudo confirmar el envío")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-4xl overflow-hidden p-0 sm:max-w-4xl">
        <div className="flex h-full flex-col">
          <SheetHeader className={cn("border-b px-6 py-5", accentClasses)}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-2xl">Pedido {data?.orderNumber ?? orderId}</SheetTitle>
                  {data ? (
                    <>
                      <Badge className={cn("rounded-full border px-3 py-1 text-xs", getOrderStatusMeta(data.status).className)}>
                        {getOrderStatusMeta(data.status).label}
                      </Badge>
                      <Badge className={cn("rounded-full border px-3 py-1 text-xs", accentClasses)}>{getCountryLabel(data.country)}</Badge>
                      <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                        {shippingLabel}
                      </Badge>
                      <Badge className={cn("rounded-full border px-3 py-1 text-xs", getAgeClasses(data))}>
                        {resolveOrderAgeLabel(data.ageHours).label}
                      </Badge>
                    </>
                  ) : null}
                </div>
                <SheetDescription className="flex flex-wrap items-center gap-3">
                  <span>{data ? formatDateTime(data.createdAt) : "Cargando detalle..."}</span>
                  {data ? <span>•</span> : null}
                  <span className="font-medium text-foreground">{data?.carrier ?? shippingLabel}</span>
                </SheetDescription>
              </div>

              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-full">
                <X className="mr-2 h-4 w-4" />
                ✕ Close
              </Button>
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
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Productos del pedido</h3>
                  </div>

                  {volumetricWarning ? (
                    <Alert className="border-amber-500/20 bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <AlertTitle>Peso volumétrico mayor al real</AlertTitle>
                      <AlertDescription>
                        La paquetería podría cobrar por el peso volumétrico estimado de {formatWeight(volumetricWeight)}.
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  <Card className="border-border/60 bg-background/70">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Peso unit.</TableHead>
                            <TableHead>Subtotal peso</TableHead>
                            <TableHead>Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>{buildProductTableRows(data.items)}</TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total items</p>
                        <p className="mt-1 text-lg font-semibold">{totalItems}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total peso</p>
                        <p className="mt-1 text-lg font-semibold">{formatWeight(totalWeight)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Total venta</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(totalPrice, country === "MX" ? "MXN" : "CAD")}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Venta neta</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(data.netSales, country === "MX" ? "MXN" : "CAD")}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">IVA / taxes</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(data.taxAmount, country === "MX" ? "MXN" : "CAD")}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border/60 bg-muted/20">
                      <CardContent className="p-4">
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Envío</p>
                        <p className="mt-1 text-lg font-semibold">{formatMoney(data.shippingAmount, country === "MX" ? "MXN" : "CAD")}</p>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Dirección de envío</h3>
                  </div>

                  <Card className="border-border/60 bg-background/70">
                    <CardContent className="space-y-4 p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Nombre</p>
                          <p className="mt-1 font-medium">{data.shippingAddress.fullName}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Teléfono</p>
                          <p className="mt-1 font-medium">{data.shippingAddress.phone}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dirección</p>
                          <p className="mt-1 font-medium">
                            {data.shippingAddress.street}
                            <br />
                            {data.shippingAddress.city}, {data.shippingAddress.region} {data.shippingAddress.postalCode}
                            <br />
                            {getCountryLabel(data.shippingAddress.country)}
                          </p>
                        </div>
                      </div>

                      <Button type="button" variant="outline" className="w-fit rounded-full" onClick={() => void copyAddress()}>
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copiar dirección
                      </Button>
                    </CardContent>
                  </Card>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Selección de paquetería</h3>
                  </div>

                  <div className={cn("space-y-4 border-l-4 pl-4", data.country === "MX" ? "border-primary" : "border-blue")}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className={cn("text-xs uppercase tracking-[0.24em]", data.country === "MX" ? "text-primary" : "text-blue")}>
                          {shippingLabel}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {data.country === "MX"
                            ? "Servicio operado por Skydropx · Cargos en MXN"
                            : "Powered by Easyship · Charges in CAD"}
                        </p>
                      </div>
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => window.open(providerUrl, "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Abrir {data.country === "MX" ? "Skydropx" : "Easyship"}
                      </Button>
                    </div>

                    {data.quotedRates.map((rate) => {
                      const isClientChoice =
                        clientSelectedRate?.provider === rate.provider &&
                        clientSelectedRate?.service === rate.service &&
                        clientSelectedRate?.currency === rate.currency

                      return (
                        <div key={`${rate.provider}-${rate.service}-${rate.currency}`} className="space-y-2">
                          {isClientChoice ? (
                            <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">Cliente eligió</Badge>
                          ) : null}
                          <ShippingRateCard
                            rate={rate}
                            selected={
                              resolvedRate?.provider === rate.provider &&
                              resolvedRate?.service === rate.service &&
                              resolvedRate?.currency === rate.currency
                            }
                            country={data.country}
                            onSelect={(nextRate) => setSelectedRate(nextRate)}
                          />
                        </div>
                      )
                    })}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold">Ingreso de guía</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Tracking ID / Número de guía</p>
                      <Input
                        value={trackingId}
                        onChange={(event) => setTrackingId(event.target.value)}
                        placeholder={getTrackingPlaceholder(data.country)}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">URL de rastreo del cliente</p>
                      <Input
                        value={trackingUrl}
                        onChange={(event) => setTrackingUrl(event.target.value)}
                        placeholder={getTrackingUrlPlaceholder(data.country)}
                      />
                    </div>
                  </div>
                </section>
              </div>
            ) : null}
          </div>

          <SheetFooter className="sticky bottom-0 border-t bg-background/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancelar
              </Button>
              <Button
                type="button"
                className="rounded-full"
                disabled={!data || !resolvedRate || trackingId.trim().length === 0 || trackingUrl.trim().length === 0 || shipMutation.isPending}
                onClick={() => void confirmShipment()}
              >
                {shipMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirmar envío
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function getAgeClasses(data: AdminOrderDetail) {
  const age = resolveOrderAgeLabel(data.ageHours)
  switch (age.tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700"
    case "destructive":
      return "border-destructive/20 bg-destructive/10 text-destructive"
  }
}
