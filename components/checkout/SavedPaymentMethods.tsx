'use client'

import { useEffect, useState, type FormEvent } from "react"
import Script from "next/script"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCard, Loader2, PlusCircle, ShieldCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { getBrowserAccountToken } from "@/lib/account/browser-session"
import type { PaymentCountry, PaymentProvider, SavedPaymentMethod } from "@/types/payment-methods"
import { useCheckoutStore } from "@/lib/stores/checkout"

type SavedPaymentMethodsProps = {
  country: PaymentCountry
  className?: string
  onSaved?: (method: SavedPaymentMethod) => void
}

type SavedMethodsResponse =
  | { ok: true; data: SavedPaymentMethod[] }
  | { ok: false; message: string }

type SaveResponse =
  | { ok: true; data: SavedPaymentMethod }
  | { ok: false; message: string }

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null
const openpayMerchantId = process.env.NEXT_PUBLIC_OPENPAY_MERCHANT_ID?.trim() || ""
const openpayPublicKey = process.env.NEXT_PUBLIC_OPENPAY_PUBLIC_KEY?.trim() || ""

declare global {
  interface Window {
    OpenPay?: {
      setId: (id: string) => void
      setApiKey: (key: string) => void
      setSandboxMode: (enabled: boolean) => void
      token: {
        extractFormAndCreate: (
          formId: string,
          success: (response: { data?: { id?: string } }) => void,
          error: (response: { data?: { description?: string }; message?: string; status?: number }) => void,
        ) => void
      }
    }
  }
}

function currencyLabel(country: PaymentCountry) {
  return country === "MX" ? "MXN" : "CAD"
}

function providerLabel(provider: PaymentProvider) {
  return provider === "stripe" ? "Stripe" : "Openpay"
}

function formatCardLabel(method: SavedPaymentMethod) {
  return `${method.cardBrand[0].toUpperCase()}${method.cardBrand.slice(1)} •••• ${method.cardLast4}`
}

function providerAccent(country: PaymentCountry) {
  return country === "MX"
    ? {
        header: "text-[color:var(--primary)]",
        border: "border-l-[3px] border-l-[color:var(--primary)]",
        glow: "shadow-[0_16px_40px_rgba(1,105,111,0.12)]",
      }
    : {
        header: "text-[#006494]",
        border: "border-l-[3px] border-l-[#006494]",
        glow: "shadow-[0_16px_40px_rgba(0,100,148,0.12)]",
      }
}

function safeHeaders(): Record<string, string> {
  const token = getBrowserAccountToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}

function SavedMethodSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-muted/35" />
      ))}
    </div>
  )
}

function SavedMethodsList({
  methods,
  selectedId,
  onChange,
  onDelete,
  country,
}: {
  methods: SavedPaymentMethod[]
  selectedId: string | "new" | null
  onChange: (value: string | "new") => void
  onDelete: (methodId: string) => void
  country: PaymentCountry
}) {
  const accent = providerAccent(country)
  return (
    <RadioGroup value={selectedId ?? "new"} onValueChange={(value) => onChange(value as string | "new")} className="gap-3">
      {methods.map((method) => {
        const checked = selectedId === method.id
        return (
          <label key={method.id} className="cursor-pointer">
            <Card
              role="button"
              tabIndex={0}
              className={cn(
                "overflow-hidden border bg-background/95 transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
                checked ? cn("border-[color:var(--primary)]", accent.glow) : "border-border",
              )}
              onClick={() => onChange(method.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  onChange(method.id)
                }
              }}
            >
              <CardContent className={cn("flex items-center gap-4 p-4", country === "MX" ? accent.border : accent.border)}>
                <RadioGroupItem value={method.id} className="sr-only" />
                <div className={cn("flex size-12 items-center justify-center rounded-full text-sm font-semibold text-white", country === "MX" ? "bg-[color:var(--primary)]" : "bg-[#006494]")}>
                  {method.cardBrand.slice(0, 1).toUpperCase()}
                  {method.cardBrand.slice(1, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{formatCardLabel(method)}</p>
                    {method.isDefault ? <Badge className="rounded-full bg-emerald-500/10 text-emerald-700">Default</Badge> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.provider === "stripe" ? "CA · Stripe Elements" : "MX · Openpay hosted fields"} · Exp {String(method.cardExpMonth).padStart(2, "0")}/{method.cardExpYear}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {checked ? <Badge className="rounded-full bg-[color:var(--primary)] text-white">Seleccionada</Badge> : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full"
                    onClick={(event) => {
                      event.preventDefault()
                      onDelete(method.id)
                    }}
                  >
                    <Trash2 className="size-4" />
                    <span className="sr-only">Eliminar tarjeta</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </label>
        )
      })}

      <label className="cursor-pointer">
        <Card
          role="button"
          tabIndex={0}
          className={cn(
            "overflow-hidden border-dashed bg-background/70 transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
            selectedId === "new" ? "border-[color:var(--primary)]" : "border-border",
          )}
          onClick={() => onChange("new")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onChange("new")
            }
          }}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <RadioGroupItem value="new" className="sr-only" />
            <div className={cn("flex size-12 items-center justify-center rounded-full text-white", country === "MX" ? "bg-[color:var(--primary)]" : "bg-[#006494]")}>
              <PlusCircle className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Agregar nueva tarjeta</p>
              <p className="text-sm text-muted-foreground">
                {country === "MX" ? "Se tokeniza con Openpay" : "Se tokeniza con Stripe Elements"}
              </p>
            </div>
          </CardContent>
        </Card>
      </label>
    </RadioGroup>
  )
}

function StripeNewMethodForm({
  country,
  onSaved,
}: {
  country: PaymentCountry
  onSaved?: (method: SavedPaymentMethod) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [saveForFuture, setSaveForFuture] = useState(true)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements) {
      toast.error("Stripe aún no está listo")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("No se pudo cargar la tarjeta")
      return
    }

    setIsSubmitting(true)
    try {
      const paymentMethod = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardholderName.trim() || undefined,
        },
      })

      if (paymentMethod.error || !paymentMethod.paymentMethod) {
        throw new Error(paymentMethod.error?.message || "No se pudo tokenizar la tarjeta")
      }

      const payload = {
        country,
        provider_token: paymentMethod.paymentMethod.id,
        card_brand: paymentMethod.paymentMethod.card?.brand ?? null,
        card_last4: paymentMethod.paymentMethod.card?.last4 ?? null,
        card_exp_month: paymentMethod.paymentMethod.card?.exp_month ?? null,
        card_exp_year: paymentMethod.paymentMethod.card?.exp_year ?? null,
        is_default: saveForFuture,
      }
      const requestHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...safeHeaders(),
      }

      if (!saveForFuture) {
        useCheckoutStore.setState({
          paymentMethodId: null,
          paymentProvider: "stripe",
          paymentToken: paymentMethod.paymentMethod.id,
        })
        toast.success("Tarjeta tokenizada para este pago")
        return
      }

      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(payload),
      })

      const result = (await response.json()) as SaveResponse
      if (!response.ok || !result.ok) {
        throw new Error(result.ok ? "No se pudo guardar la tarjeta" : result.message)
      }

      useCheckoutStore.setState({
        paymentMethodId: result.data.id,
        paymentProvider: "stripe",
        paymentToken: null,
      })
      toast.success("Tarjeta guardada con Stripe")
      onSaved?.(result.data)
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar la tarjeta"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="stripe-cardholder-name">Cardholder name</Label>
          <Input
            id="stripe-cardholder-name"
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="cc-name"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Stripe Elements</Label>
          <div className="rounded-2xl border border-dashed border-border bg-background/80 p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    color: "var(--foreground)",
                    fontFamily: "inherit",
                    fontSize: "16px",
                    "::placeholder": {
                      color: "var(--muted-foreground)",
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
        <Checkbox id="save-card" checked={saveForFuture} onCheckedChange={(checked) => setSaveForFuture(Boolean(checked))} />
        <div className="space-y-0.5">
          <Label htmlFor="save-card" className="cursor-pointer">
            Guardar esta tarjeta para futuras compras
          </Label>
          <p className="text-sm text-muted-foreground">Si lo desactivas, solo se tokeniza para este pago.</p>
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={!stripe || isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Guardando
          </span>
        ) : (
          "Usar tarjeta"
        )}
      </Button>
    </form>
  )
}

function OpenpayNewMethodForm({
  country,
  onSaved,
}: {
  country: PaymentCountry
  onSaved?: (method: SavedPaymentMethod) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [saveForFuture, setSaveForFuture] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const formId = "openpay-saved-method-form"

  useEffect(() => {
    if (typeof window === "undefined" || !window.OpenPay || !openpayMerchantId || !openpayPublicKey) {
      return
    }

    window.OpenPay.setId(openpayMerchantId)
    window.OpenPay.setApiKey(openpayPublicKey)
    window.OpenPay.setSandboxMode(process.env.NEXT_PUBLIC_OPENPAY_IS_SANDBOX === "true")
    setIsReady(true)
  }, [])

  async function persistToken(payload: {
    provider_token: string
    card_brand?: string | null
    card_last4?: string | null
    card_exp_month?: number | null
    card_exp_year?: number | null
  }) {
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...safeHeaders(),
    }
    const response = await fetch("/api/payment-methods", {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify({
        country,
        is_default: saveForFuture,
        ...payload,
      }),
    })

    const result = (await response.json()) as SaveResponse
    if (!response.ok || !result.ok) {
      throw new Error(result.ok ? "No se pudo guardar la tarjeta" : result.message)
    }

    useCheckoutStore.setState({
      paymentMethodId: result.data.id,
      paymentProvider: "openpay",
      paymentToken: null,
    })
    toast.success("Tarjeta guardada con Openpay")
    onSaved?.(result.data)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!window.OpenPay) {
      toast.error("Openpay aún no está listo")
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise<void>((resolve, reject) => {
        window.OpenPay?.token.extractFormAndCreate(
          formId,
          (response) => {
            const tokenId = response.data?.id?.trim()
            if (!tokenId) {
              reject(new Error("Openpay no devolvió un token"))
              return
            }

            const cardNumber = (document.getElementById("openpay-card-number") as HTMLInputElement | null)?.value ?? ""
            const expMonth = Number((document.getElementById("openpay-expiry-month") as HTMLInputElement | null)?.value || 12)
            const expYear = Number((document.getElementById("openpay-expiry-year") as HTMLInputElement | null)?.value || new Date().getFullYear() + 3)
            const brand = /5/.test(cardNumber.replace(/[^\d]/g, "").charAt(0)) ? "mastercard" : "visa"

            if (!saveForFuture) {
              useCheckoutStore.setState({
                paymentMethodId: null,
                paymentProvider: "openpay",
                paymentToken: tokenId,
              })
              toast.success("Tarjeta tokenizada para este pago")
              resolve()
              return
            }

            void persistToken({
              provider_token: tokenId,
              card_brand: brand,
              card_last4: cardNumber.replace(/[^\d]/g, "").slice(-4) || "4242",
              card_exp_month: expMonth,
              card_exp_year: expYear,
            })
              .then(() => resolve())
              .catch(reject)
          },
          (response) => {
            const description = response.data?.description ?? response.message ?? "Openpay rechazó la tokenización"
            reject(new Error(description))
          },
        )
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo tokenizar la tarjeta"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Script
        src="https://openpay.s3.amazonaws.com/openpay.v1.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.OpenPay && openpayMerchantId && openpayPublicKey) {
            window.OpenPay.setId(openpayMerchantId)
            window.OpenPay.setApiKey(openpayPublicKey)
            window.OpenPay.setSandboxMode(process.env.NEXT_PUBLIC_OPENPAY_IS_SANDBOX === "true")
            setIsReady(true)
          }
        }}
      />
      <form id={formId} onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-3xl border border-dashed border-border bg-background/80 p-5">
          <input type="hidden" name="token_id" id="token_id" />
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-4 text-[color:var(--primary)]" />
            <p className="text-sm font-medium">Openpay hosted fields</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="openpay-cardholder-name">Cardholder name</Label>
              <Input
                id="openpay-cardholder-name"
                name="holder"
                value={cardholderName}
                onChange={(event) => setCardholderName(event.target.value)}
                placeholder="Como aparece en la tarjeta"
                data-openpay-card="holder_name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="openpay-card-number">Card number</Label>
              <Input
                id="openpay-card-number"
                name="card"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                data-openpay-card="card_number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openpay-expiry-month">Expiry month</Label>
              <Input
                id="openpay-expiry-month"
                inputMode="numeric"
                placeholder="12"
                data-openpay-card="expiration_month"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openpay-expiry-year">Expiry year</Label>
              <Input
                id="openpay-expiry-year"
                inputMode="numeric"
                placeholder="30"
                data-openpay-card="expiration_year"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="openpay-cvv">CVV</Label>
              <Input id="openpay-cvv" inputMode="numeric" placeholder="123" autoComplete="cc-csc" data-openpay-card="cvv2" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            {isReady ? "Openpay listo para tokenizar sin guardar datos sensibles en tu backend." : "Cargando Openpay hosted fields..."}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <Checkbox id="save-card-openpay" checked={saveForFuture} onCheckedChange={(checked) => setSaveForFuture(Boolean(checked))} />
          <div className="space-y-0.5">
            <Label htmlFor="save-card-openpay" className="cursor-pointer">
              Guardar esta tarjeta para futuras compras
            </Label>
            <p className="text-sm text-muted-foreground">Si lo desactivas, solo se tokeniza para este pago.</p>
          </div>
        </div>

        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting || !isReady}>
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Guardando
            </span>
          ) : (
            "Usar tarjeta"
          )}
        </Button>
      </form>
    </>
  )
}

export function SavedPaymentMethods({ country, className, onSaved }: SavedPaymentMethodsProps) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([])
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const provider = country === "CA" ? "stripe" : "openpay"

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function loadMethods() {
      setLoading(true)
      setError(null)
      try {
        const requestHeaders: HeadersInit = {
          ...safeHeaders(),
        }
        const response = await fetch("/api/payment-methods", {
          method: "GET",
          headers: requestHeaders,
          cache: "no-store",
          signal: controller.signal,
        })
        const result = (await response.json()) as SavedMethodsResponse

        if (!active) return

        if (!response.ok || !result.ok) {
          throw new Error(result.ok ? "No se pudieron cargar tus métodos" : result.message)
        }

        const filtered = result.data.filter((method) => method.country === country)
        setMethods(filtered)
        const defaultMethod = filtered.find((method) => method.isDefault) ?? filtered[0] ?? null
        setSelectedId(defaultMethod?.id ?? "new")
        if (defaultMethod) {
          useCheckoutStore.setState({
            paymentMethodId: defaultMethod.id,
            paymentProvider: defaultMethod.provider,
            paymentToken: null,
          })
        }
      } catch (error) {
        if (!active) return
        const message = error instanceof Error ? error.message : "No pudimos cargar tus métodos"
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadMethods()

    return () => {
      active = false
      controller.abort()
    }
  }, [country, refreshKey])

  const accent = providerAccent(country)
  const headerLabel = country === "MX" ? "🇲🇽 Métodos guardados" : "🇨🇦 Saved payment methods"
  const noteLabel = country === "MX" ? "Operado con Openpay · Sin almacenar PAN/CVV" : "Powered by Stripe · No raw card data stored"

  async function handleDelete(paymentMethodId: string) {
    const requestHeaders: HeadersInit = {
      ...safeHeaders(),
    }
    const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
      method: "DELETE",
      headers: requestHeaders,
    })

    const result = (await response.json()) as { ok: boolean; message?: string }
    if (!response.ok || !result.ok) {
      throw new Error(result.message || "No se pudo eliminar la tarjeta")
    }

    setRefreshKey((value) => value + 1)
    toast.success("Tarjeta eliminada")
  }

  return (
    <section className={cn("space-y-4 rounded-3xl border bg-background/95 p-5", accent.border, className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={cn("text-sm font-semibold", accent.header)}>{headerLabel}</p>
          <p className="mt-1 text-sm text-muted-foreground">{noteLabel}</p>
        </div>
        <Badge className={cn("rounded-full", country === "MX" ? "bg-[color:var(--primary)] text-white" : "bg-[#006494] text-white")}>
          {providerLabel(provider)} · {currencyLabel(country)}
        </Badge>
      </div>

      {loading ? (
        <SavedMethodSkeleton />
      ) : error ? (
        <div className="space-y-3 rounded-3xl border border-amber-500/20 bg-amber-500/8 p-5">
          <p className="text-sm text-foreground">No pudimos cargar tus tarjetas guardadas.</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setRefreshKey((value) => value + 1)}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <SavedMethodsList
            methods={methods}
            selectedId={selectedId}
            onChange={(value) => {
              setSelectedId(value)
              if (value === "new") {
                useCheckoutStore.setState({ paymentMethodId: null, paymentProvider: provider, paymentToken: null })
              } else {
                const current = methods.find((method) => method.id === value) ?? null
                useCheckoutStore.setState({
                  paymentMethodId: current?.id ?? null,
                  paymentProvider: current?.provider ?? provider,
                  paymentToken: null,
                })
              }
            }}
            onDelete={(methodId) => {
              void handleDelete(methodId).catch((deleteError) => {
                const message = deleteError instanceof Error ? deleteError.message : "No se pudo eliminar la tarjeta"
                toast.error(message)
              })
            }}
            country={country}
          />

          <div className={cn("space-y-4 rounded-3xl border p-5", country === "MX" ? "border-[color:rgba(1,105,111,0.18)] bg-[color:rgba(1,105,111,0.06)]" : "border-[#006494]/20 bg-[#006494]/6")}>
            <div className="flex items-center gap-2">
              <CreditCard className="size-4" />
              <p className="text-sm font-semibold">Nueva tarjeta</p>
            </div>
            {selectedId === "new" || methods.length === 0 ? (
              country === "CA" ? (
                stripePromise ? (
                  <Elements stripe={stripePromise}>
                    <StripeNewMethodForm country={country} onSaved={onSaved} />
                  </Elements>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Stripe publishable key missing. Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
                  </div>
                )
              ) : openpayMerchantId && openpayPublicKey ? (
                <OpenpayNewMethodForm country={country} onSaved={onSaved} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Openpay public key or merchant id missing. Set <code>NEXT_PUBLIC_OPENPAY_MERCHANT_ID</code> and <code>NEXT_PUBLIC_OPENPAY_PUBLIC_KEY</code>.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                Selecciona <span className="font-medium text-foreground">Agregar nueva tarjeta</span> para cargar el formulario tokenizado.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
