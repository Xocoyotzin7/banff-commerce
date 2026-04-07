'use client'

import { useEffect, useState, type FormEvent } from "react"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"

import { AnimatedCard } from "@/components/checkout/AnimatedCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type GeoResponse = {
  country: string
  isCanada: boolean
  isMexico: boolean
  gateway: "stripe" | "openpay"
}

type CheckoutResponse =
  | {
      success: true
      gateway: "stripe"
      country: string
      isTestMode: boolean
      clientSecret: string | null
      paymentIntentId: string
      currency: string
      orderNumber: string
    }
  | {
      success: true
      gateway: "openpay"
      country: string
      isTestMode: boolean
      orderNumber: string
    }
  | {
      success: false
      message: string
    }

type PaymentFormProps = {
  amount: number
  email?: string
  description?: string
  className?: string
  onSuccess?: (message: string) => void
}

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || null
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

function countryFlag(country: string) {
  switch (country.toUpperCase()) {
    case "CA":
      return "🇨🇦"
    case "MX":
      return "🇲🇽"
    default:
      return "🌎"
  }
}

function gatewayLabel(gateway: "stripe" | "openpay") {
  return gateway === "stripe" ? "Stripe" : "BBVA Openpay"
}

function StripeGatewayForm({
  amount,
  email,
  description,
  onSuccess,
}: Omit<PaymentFormProps, "className">) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [cardNumber, setCardNumber] = useState("4242424242424242")
  const [expiryMonth, setExpiryMonth] = useState("12")
  const [expiryYear, setExpiryYear] = useState("30")
  const [cvv, setCvv] = useState("")
  const [isCvvFocused, setIsCvvFocused] = useState(false)

  async function finalizeCheckout(input: {
    paymentIntentId: string
    orderNumber: string
    customerName: string
  }) {
    await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "finalize",
        paymentIntentId: input.paymentIntentId,
        orderNumber: input.orderNumber,
        total: amount / 100,
        email,
        customerName: input.customerName,
        items: [
          {
            name: description ?? "Order",
            quantity: 1,
            price: amount / 100,
          },
        ],
      }),
    }).catch(() => null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) {
      toast.error("Stripe aún no está listo")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      toast.error("No se pudo cargar el formulario de tarjeta")
      return
    }

    setIsSubmitting(true)

    try {
      const checkoutResponse = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          email,
          metadata: {
            description: description ?? "",
          },
        }),
      })

      const result = (await checkoutResponse.json()) as CheckoutResponse

      if (!checkoutResponse.ok || !result.success || result.gateway !== "stripe" || !result.clientSecret) {
        throw new Error("No se pudo iniciar el pago")
      }

      const confirmation = await stripe.confirmCardPayment(result.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.trim() || undefined,
            email,
          },
        },
      })

      if (confirmation.error) {
        throw new Error(confirmation.error.message || "Stripe rechazó el pago")
      }

      if (confirmation.paymentIntent?.status === "succeeded") {
        void finalizeCheckout({
          paymentIntentId: result.paymentIntentId,
          orderNumber: result.orderNumber,
          customerName: cardholderName.trim() || email || "Customer",
        })
        const successMessage = `Pago confirmado con ${gatewayLabel("stripe")}`
        toast.success(successMessage)
        onSuccess?.(successMessage)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo procesar el pago"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatedCard
        cardNumber={cardNumber}
        cardholderName={cardholderName}
        expiryMonth={expiryMonth}
        expiryYear={expiryYear}
        cvvFocused={isCvvFocused}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cardholder-name">Cardholder name</Label>
          <Input
            id="cardholder-name"
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
            placeholder="Jane Doe"
            autoComplete="cc-name"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="preview-card-number">Card number preview</Label>
          <Input
            id="preview-card-number"
            inputMode="numeric"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="4242 4242 4242 4242"
            autoComplete="cc-number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry-month">Expiry month</Label>
          <Input
            id="expiry-month"
            inputMode="numeric"
            value={expiryMonth}
            onChange={(event) => setExpiryMonth(event.target.value)}
            placeholder="12"
            autoComplete="cc-exp-month"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiry-year">Expiry year</Label>
          <Input
            id="expiry-year"
            inputMode="numeric"
            value={expiryYear}
            onChange={(event) => setExpiryYear(event.target.value)}
            placeholder="30"
            autoComplete="cc-exp-year"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            value={cvv}
            onChange={(event) => setCvv(event.target.value)}
            onFocus={() => setIsCvvFocused(true)}
            onBlur={() => setIsCvvFocused(false)}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Stripe CardElement</Label>
        <div className="rounded-2xl border border-dashed border-border/70 bg-background/80 p-4">
          <CardElement
            options={{
              style: {
                base: {
                  color: "var(--foreground)",
                  fontFamily: "inherit",
                  fontSmoothing: "antialiased",
                  fontSize: "16px",
                  "::placeholder": {
                    color: "var(--muted-foreground)",
                  },
                },
                invalid: {
                  color: "#ef4444",
                },
              },
            }}
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" disabled={!stripe || isSubmitting}>
        {isSubmitting ? "Procesando..." : `Pagar $${(amount / 100).toLocaleString("es-MX")}`}
      </Button>
    </form>
  )
}

function OpenpayGatewayForm({
  amount,
  email,
  description,
}: Omit<PaymentFormProps, "className" | "onSuccess">) {
  const [cardholderName, setCardholderName] = useState("")
  const [cardNumber, setCardNumber] = useState("4111111111111111")
  const [expiryMonth, setExpiryMonth] = useState("12")
  const [expiryYear, setExpiryYear] = useState("30")
  const [cvv, setCvv] = useState("")
  const [isCvvFocused, setIsCvvFocused] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        email,
        metadata: {
          description: description ?? "",
        },
      }),
    })

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string }
      toast.error(payload.message ?? "Openpay no está conectado todavía")
      return
    }

    toast.success("Openpay placeholder submitted")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatedCard
        cardNumber={cardNumber}
        cardholderName={cardholderName}
        expiryMonth={expiryMonth}
        expiryYear={expiryYear}
        cvvFocused={isCvvFocused}
      />

      <div className="rounded-2xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
        Openpay.js iFrame placeholder. Replace this block with the embedded BBVA/Openpay checkout once credentials are available.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="openpay-cardholder-name">Cardholder name</Label>
          <Input
            id="openpay-cardholder-name"
            value={cardholderName}
            onChange={(event) => setCardholderName(event.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="openpay-card-number">Card number preview</Label>
          <Input
            id="openpay-card-number"
            inputMode="numeric"
            value={cardNumber}
            onChange={(event) => setCardNumber(event.target.value)}
            placeholder="4111 1111 1111 1111"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="openpay-expiry-month">Expiry month</Label>
          <Input
            id="openpay-expiry-month"
            inputMode="numeric"
            value={expiryMonth}
            onChange={(event) => setExpiryMonth(event.target.value)}
            placeholder="12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="openpay-expiry-year">Expiry year</Label>
          <Input
            id="openpay-expiry-year"
            inputMode="numeric"
            value={expiryYear}
            onChange={(event) => setExpiryYear(event.target.value)}
            placeholder="30"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="openpay-cvv">CVV</Label>
          <Input
            id="openpay-cvv"
            value={cvv}
            onChange={(event) => setCvv(event.target.value)}
            onFocus={() => setIsCvvFocused(true)}
            onBlur={() => setIsCvvFocused(false)}
            inputMode="numeric"
            placeholder="123"
          />
        </div>
      </div>

      <Button type="submit" className="w-full rounded-full" variant="outline">
        Openpay placeholder
      </Button>
    </form>
  )
}

export function PaymentForm({ amount, email, description, className, onSuccess }: PaymentFormProps) {
  const [geo, setGeo] = useState<GeoResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    async function loadGeo() {
      try {
        const response = await fetch("/api/geo", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error("Geo lookup failed")
        }
        const json = (await response.json()) as GeoResponse
        setGeo(json)
      } catch {
        setGeo({ country: "CA", isCanada: true, isMexico: false, gateway: "stripe" })
      } finally {
        setIsLoading(false)
      }
    }

    void loadGeo()
    return () => controller.abort()
  }, [])

  const gateway = geo?.gateway ?? "stripe"
  const country = geo?.country ?? "CA"
  const heroLabel = geo ? `Pagando con ${gatewayLabel(gateway)}` : "Detectando país..."

  return (
    <Card className={cn("border-border/70 bg-card/90 shadow-sm", className)}>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-full">
            {countryFlag(country)} {country}
          </Badge>
          <Badge variant="secondary" className="rounded-full">
            {heroLabel}
          </Badge>
        </div>
        <CardTitle className="text-xl font-semibold">Checkout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Detecting geo and payment gateway...
          </div>
        ) : gateway === "stripe" ? (
          stripePublishableKey && stripePromise ? (
            <Elements stripe={stripePromise}>
              <StripeGatewayForm amount={amount} email={email} description={description} onSuccess={onSuccess} />
            </Elements>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Stripe publishable key missing. Set <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
            </div>
          )
        ) : (
          <OpenpayGatewayForm amount={amount} email={email} description={description} />
        )}

        {process.env.NODE_ENV !== "production" ? (
          <details className="rounded-2xl border border-border/70 bg-background/80 p-4">
            <summary className="cursor-pointer list-none text-sm font-medium">Test cards</summary>
            <div className="mt-4 space-y-5 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">Stripe (Canada - CAD)</div>
                <ul className="mt-2 space-y-1">
                  <li>Success: 4242 4242 4242 4242 | any future date | any CVV</li>
                  <li>Declined: 4000 0000 0000 0002</li>
                  <li>3DS: 4000 0025 0000 3155</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-foreground">Stripe (México - MXN)</div>
                <ul className="mt-2 space-y-1">
                  <li>Success: 4242 4242 4242 4242 | any future date | any CVV</li>
                  <li>OXXO test: pm_card_oxxo</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-foreground">Openpay (México)</div>
                <ul className="mt-2 space-y-1">
                  <li>Success: 4111 1111 1111 1111</li>
                  <li>Declined: 4444 4444 4444 4448</li>
                </ul>
              </div>
            </div>
          </details>
        ) : null}
      </CardContent>
    </Card>
  )
}
