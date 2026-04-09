"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, RefreshCw, ShoppingBag, Truck } from "lucide-react"
import { toast } from "sonner"

import { ShippingRateCard } from "@/components/checkout/ShippingRateCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import type { Locale } from "@/lib/site-content"
import type { ShippingRate } from "@/types/shipping"
import type { ProductShippingPreview } from "@/lib/admin/product-shipping-preview"
import { getProductAdminCopy } from "@/lib/admin/product-copy"

type ProductShippingPreviewSheetProps = {
  open: boolean
  productId: string | null
  locale: Locale
  onOpenChange: (open: boolean) => void
}

type PreviewResponse = {
  success: boolean
  data?: ProductShippingPreview
  message?: string
}

type ConfirmResponse = {
  success: boolean
  data?: {
    confirmedAt: string
    productId: string
    country: "MX" | "CA"
    selectedRate: ShippingRate
    preview: ProductShippingPreview
  }
  message?: string
}

type PreviewStep = "rates" | "confirm"

function formatMoney(value: number, currency: "MXN" | "CAD", locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : locale === "es" ? "es-MX" : "en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatWeight(value: number, locale: Locale) {
  return `${new Intl.NumberFormat(locale === "fr" ? "fr-CA" : locale === "es" ? "es-MX" : "en-CA", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value)} kg`
}

function resolveCountryFromLocale(locale: Locale): "MX" | "CA" {
  if (typeof navigator !== "undefined") {
    const browserLanguage = navigator.language.toLowerCase()
    if (browserLanguage.startsWith("es")) {
      return "MX"
    }
  }

  return locale === "es" ? "MX" : "CA"
}

function deliveryLabel(rate: ShippingRate, locale: Locale) {
  const days = `${rate.days_min}-${rate.days_max}`
  if (locale === "es") return `${days} días hábiles`
  if (locale === "fr") return `${days} jours ouvrables`
  return `${days} business days`
}

function countryLabel(country: "MX" | "CA", copy = getProductAdminCopy("en")) {
  return country === "MX" ? copy.preview.countryLabelMX : copy.preview.countryLabelCA
}

export function ProductShippingPreviewSheet({ open, productId, locale, onOpenChange }: ProductShippingPreviewSheetProps) {
  const copy = useMemo(() => getProductAdminCopy(locale), [locale])
  const localeCode = typeof locale === "string" ? locale : "en"
  const [step, setStep] = useState<PreviewStep>("rates")
  const [data, setData] = useState<ProductShippingPreview | null>(null)
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [reloadTick, setReloadTick] = useState(0)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const resolvedCountry = resolveCountryFromLocale(locale)
  const selectedCountry = data?.country ?? resolvedCountry

  useEffect(() => {
    if (!open || !productId) {
      setData(null)
      setSelectedRate(null)
      setStep("rates")
      setError(null)
      setLoading(false)
      setConfirmDialogOpen(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)
    setStep("rates")

    async function loadPreview() {
      try {
        const currentProductId = productId ?? ""
        const shippingPreviewUrl = `/api/admin/products/${encodeURIComponent(currentProductId)}/shipping-preview?country=${resolvedCountry}&locale=${encodeURIComponent(localeCode)}`
        const response = await fetch(shippingPreviewUrl, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        })
        const json = (await response.json()) as PreviewResponse

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.message ?? copy.preview.error)
        }

        setData(json.data)
        setSelectedRate(json.data.selectedRate ?? json.data.rates[0] ?? null)
      } catch (fetchError) {
        if (controller.signal.aborted) return
        setData(null)
        setSelectedRate(null)
        setError(fetchError instanceof Error ? fetchError.message : copy.preview.error)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadPreview()

    return () => controller.abort()
  }, [copy.preview.error, localeCode, open, productId, reloadTick, resolvedCountry])

  useEffect(() => {
    if (data) {
      setSelectedRate(data.selectedRate ?? data.rates[0] ?? null)
    }
  }, [data])

  const activeRate = selectedRate ?? data?.selectedRate ?? data?.rates[0] ?? null
  const summaryRate = activeRate ?? data?.rates[0] ?? data?.selectedRate ?? null

  async function confirmPreview() {
    if (!data || !activeRate || !productId) return

    try {
      setConfirming(true)
      const response = await fetch(`/api/admin/products/${encodeURIComponent(productId)}/shipping-preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country: selectedCountry,
          selectedRate: activeRate,
        }),
      })
      const json = (await response.json()) as ConfirmResponse

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? copy.preview.error)
      }

      toast.success(copy.preview.confirmed)
      setConfirmDialogOpen(false)
      onOpenChange(false)
    } catch (confirmError) {
      toast.error(confirmError instanceof Error ? confirmError.message : copy.preview.error)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setConfirmDialogOpen(false)
          onOpenChange(false)
        }
      }}
    >
      <SheetContent side="right" className="w-full overflow-hidden p-0 sm:max-w-5xl">
        <div className="flex h-full flex-col">
          <SheetHeader
            className={cn(
              "border-b px-6 py-5",
              selectedCountry === "MX" ? "border-primary/20 bg-primary/8" : "border-blue/20 bg-blue/8",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-2xl">{copy.preview.title}</SheetTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full px-3 py-1 text-xs",
                      selectedCountry === "MX"
                        ? "border-primary/25 bg-primary/10 text-primary"
                        : "border-blue/25 bg-blue/10 text-blue",
                    )}
                  >
                    {countryLabel(selectedCountry, copy)}
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    {step === "rates" ? copy.preview.stepRates : copy.preview.stepConfirm}
                  </Badge>
                </div>
                <SheetDescription>{copy.preview.subtitle}</SheetDescription>
              </div>

              <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="rounded-full">
                {copy.preview.close}
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading ? (
              <div className="space-y-4">
                <Card className="border-border/60 bg-background/70">
                  <CardHeader>
                    <Skeleton className="h-5 w-56" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                    <Skeleton className="h-32 w-full rounded-2xl" />
                  </CardContent>
                </Card>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{copy.preview.error}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                <div className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setReloadTick((current) => current + 1)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {copy.preview.retry}
                  </Button>
                </div>
              </Alert>
            ) : data ? (
              <div className="space-y-6">
                {step === "rates" ? (
                  <section className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Truck className={cn("h-4 w-4", selectedCountry === "MX" ? "text-primary" : "text-blue")} />
                      <h3 className="text-base font-semibold">{copy.preview.stepRates}</h3>
                    </div>

                    <div className="space-y-3">
                      {data.rates.map((rate) => (
                        <ShippingRateCard
                          key={`${rate.provider}-${rate.service}`}
                          rate={rate}
                          selected={selectedRate ? `${selectedRate.provider}:${selectedRate.service}` === `${rate.provider}:${rate.service}` : false}
                          country={selectedCountry}
                          onSelect={setSelectedRate}
                        />
                      ))}
                    </div>

                    <div className="flex justify-end">
                      <Button type="button" disabled={!selectedRate} onClick={() => setStep("confirm")}>
                        {copy.preview.continue}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </section>
                ) : (
                  <section className="space-y-6">
                    <Alert className={cn("border", selectedCountry === "MX" ? "border-primary/20 bg-primary/10" : "border-blue/20 bg-blue/10")}>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertTitle>{copy.preview.stepConfirm}</AlertTitle>
                      <AlertDescription>
                        {copy.preview.subtitle}
                      </AlertDescription>
                    </Alert>

                    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                      <Card className="border-border/60 bg-background/70">
                        <CardHeader>
                          <CardTitle className="text-base">{copy.preview.customer}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.customer}</p>
                            <p className="mt-1 font-medium">{data.customer.fullName}</p>
                            <p className="text-muted-foreground">{data.customer.email}</p>
                            <p className="text-muted-foreground">{data.customer.phone}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.address}</p>
                            <p className="mt-1 font-medium">{data.shippingAddress.street}</p>
                            <p className="text-muted-foreground">
                              {data.shippingAddress.city}, {data.shippingAddress.region} {data.shippingAddress.postalCode}
                            </p>
                            <p className="text-muted-foreground">{countryLabel(data.country, copy)}</p>
                          </div>
                          <Separator />
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.method}</p>
                            <p className="mt-1 font-medium">
                              {summaryRate?.provider} · {summaryRate?.service}
                            </p>
                            <p className="text-muted-foreground">{summaryRate ? deliveryLabel(summaryRate, locale) : "—"}</p>
                            <p className="text-muted-foreground">
                              {copy.preview.cost}: {summaryRate ? formatMoney(summaryRate.price, summaryRate.currency, locale) : "—"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-border/60 bg-background/70">
                        <CardHeader>
                          <CardTitle className="text-base">{copy.preview.photos}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            {data.items.map((item) => (
                              <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
                                <img src={item.imageUrl} alt={item.name} className="h-24 w-full object-cover" />
                              </div>
                            ))}
                          </div>

                          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.cart}</p>
                            <div className="mt-3 space-y-3">
                              {data.items.map((item) => (
                                <div key={`${item.id}-summary`} className="flex items-start justify-between gap-3 text-sm">
                                  <div className="space-y-0.5">
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty {item.quantity} · {formatWeight(item.subtotalWeightKg, locale)}
                                    </p>
                                  </div>
                                  <p className="font-medium">{formatMoney(item.price, item.currency, locale)}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid gap-3 xl:grid-cols-2">
                            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                {copy.preview.weightCardTitle}
                              </p>
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.totalWeight}</span>
                                  <span className="font-medium">{formatWeight(data.summary.totalWeightKg, locale)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.billableWeight}</span>
                                  <span className="font-medium">{formatWeight(data.parcel.billable_weight_kg, locale)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                {copy.preview.totalsCardTitle}
                              </p>
                              <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.saleTotal}</span>
                                  <span className="font-medium">{formatMoney(data.summary.grossTotal, data.summary.currency, locale)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.taxes}</span>
                                  <span className="font-medium">{formatMoney(data.summary.taxAmount, data.summary.currency, locale)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.netSales}</span>
                                  <span className="font-medium">{formatMoney(data.summary.netSales, data.summary.currency, locale)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>{copy.preview.shippingCost}</span>
                                  <span className="font-medium">
                                    {summaryRate ? formatMoney(summaryRate.price, summaryRate.currency, locale) : "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </div>

          <SheetFooter className="border-t border-border/60 px-6 py-4">
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                {step === "rates"
                  ? copy.preview.subtitle
                  : `${copy.preview.method}: ${activeRate?.provider ?? "—"} · ${activeRate?.service ?? ""}`}
              </div>
              <div className="flex items-center gap-2">
                {step === "confirm" ? (
                  <Button type="button" variant="outline" onClick={() => setStep("rates")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {copy.preview.back}
                  </Button>
                ) : null}
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {copy.preview.cancel}
                </Button>
                {step === "confirm" ? (
                  <Button type="button" onClick={() => setConfirmDialogOpen(true)} disabled={confirming || !activeRate}>
                    {confirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {copy.preview.loading}
                      </>
                    ) : (
                      copy.preview.confirm
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={() => setStep("confirm")} disabled={!selectedRate}>
                    {copy.preview.continue}
                  </Button>
                )}
              </div>
            </div>
          </SheetFooter>
        </div>

        <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <AlertDialogContent className="border-border/90 bg-background sm:max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>{copy.preview.confirmDialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>{copy.preview.confirmDialogDescription}</AlertDialogDescription>
            </AlertDialogHeader>

            {data && activeRate ? (
              <div className="grid gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.confirmDialogCustomer}</p>
                    <p className="mt-1 font-medium">{data.customer.fullName}</p>
                    <p className="text-muted-foreground">{data.customer.email}</p>
                    <p className="text-muted-foreground">{data.customer.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.confirmDialogAddress}</p>
                    <p className="mt-1 font-medium">{data.shippingAddress.street}</p>
                    <p className="text-muted-foreground">
                      {data.shippingAddress.city}, {data.shippingAddress.region} {data.shippingAddress.postalCode}
                    </p>
                    <p className="text-muted-foreground">{countryLabel(data.country, copy)}</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.confirmDialogMethod}</p>
                    <p className="mt-1 font-medium">
                      {activeRate.provider} · {activeRate.service}
                    </p>
                    <p className="text-muted-foreground">{deliveryLabel(activeRate, locale)}</p>
                    <p className="text-muted-foreground">
                      {copy.preview.cost}: {formatMoney(activeRate.price, activeRate.currency, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.confirmDialogTotals}</p>
                    <p className="mt-1 text-muted-foreground">
                      {copy.preview.saleTotal}: {formatMoney(data.summary.grossTotal, data.summary.currency, locale)}
                    </p>
                    <p className="text-muted-foreground">
                      {copy.preview.taxes}: {formatMoney(data.summary.taxAmount, data.summary.currency, locale)}
                    </p>
                    <p className="text-muted-foreground">
                      {copy.preview.netSales}: {formatMoney(data.summary.netSales, data.summary.currency, locale)}
                    </p>
                    <p className="text-muted-foreground">
                      {copy.preview.shippingCost}: {formatMoney(activeRate.price, activeRate.currency, locale)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.confirmDialogWeight}</p>
                  <p className="mt-1 text-muted-foreground">
                    {copy.preview.totalWeight}: {formatWeight(data.summary.totalWeightKg, locale)} ·{" "}
                    {copy.preview.billableWeight}: {formatWeight(data.parcel.billable_weight_kg, locale)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {copy.preview.confirmDialogItems}: {data.summary.itemCount}
                  </p>
                </div>
              </div>
            ) : null}

            <AlertDialogFooter>
              <AlertDialogCancel>{copy.preview.confirmDialogCancel}</AlertDialogCancel>
              <AlertDialogAction onClick={() => void confirmPreview()}>
                {confirming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {copy.preview.loading}
                  </>
                ) : (
                  copy.preview.confirmDialogAction
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  )
}
