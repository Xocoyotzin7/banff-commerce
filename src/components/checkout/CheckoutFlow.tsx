"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import { CalendarDays, Minus, Plus, ShieldCheck, Loader2, PlaneTakeoff, User, Users } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { destinations } from "../../lib/data/destinations"
import { packages } from "../../lib/data/packages"
import type { TravelPackage } from "../../types/travel"
import { cn } from "../../lib/utils"
import { AnimatedPaymentCard } from "./AnimatedPaymentCard"
import { CheckoutStepper } from "./CheckoutStepper"
import { GeoPaymentSelector, type CheckoutGateway, type GeoCountry } from "./GeoPaymentSelector"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Calendar } from "../../../components/ui/calendar"
import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"
import { toast } from "sonner"

const travelerSchema = z.object({
  firstName: z.string().min(2, "Ingresa tu nombre"),
  lastName: z.string().min(2, "Ingresa tu apellido"),
  email: z.string().email("Ingresa un email válido"),
  phone: z.string().min(8, "Ingresa un teléfono válido"),
  passport: z.string().min(4, "Ingresa tu pasaporte"),
  nationality: z.string().min(2, "Ingresa tu nacionalidad"),
})

type TravelerFormValues = z.infer<typeof travelerSchema>

type CabinClass = "economy" | "business"

const cabinPriceDelta: Record<CabinClass, number> = {
  economy: 0,
  business: 0.22,
}

const countryCurrency: Record<GeoCountry, "CAD" | "MXN"> = {
  CA: "CAD",
  MX: "MXN",
  OTHER: "CAD",
}

const countryTaxRate: Record<GeoCountry, number> = {
  CA: 0.13,
  MX: 0.16,
  OTHER: 0,
}

function getDefaultPackage(packageId: string | null) {
  return packages.find((travelPackage) => travelPackage.id === packageId) ?? packages[0]
}

function getDestination(destinationId: string) {
  return destinations.find((destination) => destination.id === destinationId)
}

function currencySymbol(currency: "CAD" | "MXN") {
  return currency === "MXN" ? "$" : "$"
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value))
}

function AnimatedMoney({ value, currency }: { value: number; currency: "CAD" | "MXN" }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 700
    const start = performance.now()
    let frame = 0

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(value * eased))
      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [value])

  return (
    <span>
      {currencySymbol(currency)}
      {formatMoney(display)} {currency}
    </span>
  )
}

function CounterButton({
  label,
  value,
  onMinus,
  onPlus,
}: {
  label: string
  value: number
  onMinus: () => void
  onPlus: () => void
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-black/18 p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/50">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileTap={{ scale: 0.94 }} type="button" onClick={onMinus} className="rounded-full border border-white/10 bg-white/6 p-2">
            <Minus className="h-4 w-4" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.94 }} type="button" onClick={onPlus} className="rounded-full border border-white/10 bg-white/6 p-2">
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function FieldStatus({ error, hasValue }: { error?: string; hasValue: boolean }) {
  if (error) {
    return (
      <motion.div
        key={error}
        initial={{ opacity: 0, scale: 0.8, x: 0 }}
        animate={{ opacity: 1, scale: 1, x: [0, -8, 8, -6, 6, 0] }}
        transition={{ duration: 0.45 }}
        className="flex items-center gap-2 text-sm text-red-400"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">×</span>
        {error}
      </motion.div>
    )
  }

  if (hasValue) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-emerald-400">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">✓</span>
        Valido
      </motion.div>
    )
  }

  return null
}

function ConfettiOverlay({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) {
      return
    }

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.2,
      size: 6 + Math.random() * 6,
      velocityX: -2 + Math.random() * 4,
      velocityY: 2 + Math.random() * 6,
      rotation: Math.random() * Math.PI,
      spin: -0.2 + Math.random() * 0.4,
      color: ["#0A6E6E", "#D4A017", "#E85D26", "#F0EDE4"][Math.floor(Math.random() * 4)],
    }))

    let raf = 0
    const started = performance.now()

    const draw = (time: number) => {
      context.clearRect(0, 0, canvas.width, canvas.height)
      const elapsed = time - started

      pieces.forEach((piece) => {
        piece.x += piece.velocityX
        piece.y += piece.velocityY
        piece.rotation += piece.spin
        piece.velocityY += 0.03

        context.save()
        context.translate(piece.x, piece.y)
        context.rotate(piece.rotation)
        context.fillStyle = piece.color
        context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.5)
        context.restore()
      })

      if (elapsed < 1800) {
        raf = window.requestAnimationFrame(draw)
      } else {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    window.addEventListener("resize", resize)
    raf = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [active])

  if (!active) return null

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-50" />
}

function PackageSummary({
  travelPackage,
  adults,
  children,
  cabin,
  date,
  totalUsd,
  country,
}: {
  travelPackage: TravelPackage
  adults: number
  children: number
  cabin: CabinClass
  date: Date | null
  totalUsd: number
  country: GeoCountry
}) {
  const destination = getDestination(travelPackage.destinationId)
  const currency = countryCurrency[country]
  const taxRate = countryTaxRate[country]
  const converted = currency === "MXN" ? 20 : 1.35
  const subtotal = totalUsd * converted
  const tax = subtotal * taxRate
  const total = subtotal + tax

  return (
    <div className="sticky top-28 space-y-5">
      <Card className="overflow-hidden border border-white/10 bg-white/7 text-text backdrop-blur-xl">
        <div className="relative h-48">
          <Image
            src={destination?.heroImage ?? "/serene-nature-sharp.jpg"}
            alt={travelPackage.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 480px"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.88),rgba(6,13,13,0.12))]" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/56">{destination?.country ?? "LATAM"}</p>
            <h3 className="mt-2 text-2xl font-semibold">{travelPackage.title}</h3>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {date ? date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) : "Select date"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {adults + children} travelers
            </span>
          </div>

          <div className="grid gap-3 rounded-[1.3rem] border border-white/10 bg-black/18 p-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Base package</span>
              <span className="text-text">${travelPackage.price.toLocaleString()} USD</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Travelers adjustment</span>
              <span className="text-text">x{((adults * 1 + children * 0.65) / 1).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cabin</span>
              <span className="text-text">{cabin === "business" ? "Business" : "Economy"}</span>
            </div>
          </div>

          <div className="grid gap-2 rounded-[1.3rem] border border-white/10 bg-black/18 p-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="text-text">
                <AnimatedMoney value={subtotal} currency={currency} />
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxes</span>
              <span className="text-text">
                {currencySymbol(currency)}
                {formatMoney(tax)} {currency}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-semibold text-text">
              <span>Total</span>
              <span>
                {currencySymbol(currency)}
                {formatMoney(total)} {currency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-4 py-3 text-sm text-text-muted">
            <ShieldCheck className="h-4 w-4 text-[color:var(--secondary)]" />
            {country === "MX" ? "MX: 16% VAT" : country === "CA" ? "CA: 5% GST + 8% provincial" : "OTHER: 0% taxes"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function CheckoutFlow() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get("packageId") ?? searchParams.get("id")
  const selectedPackage = useMemo(() => getDefaultPackage(packageId), [packageId])
  const destination = getDestination(selectedPackage.destinationId)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [cabin, setCabin] = useState<CabinClass>("economy")
  const [country, setCountry] = useState<GeoCountry>("CA")
  const [gateway, setGateway] = useState<CheckoutGateway>("stripe")
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [cardNumber, setCardNumber] = useState("4242424242424242")
  const [cardholderName, setCardholderName] = useState("")
  const [expiry, setExpiry] = useState("12/28")
  const [cvv, setCvv] = useState("")
  const [cvvFocused, setCvvFocused] = useState(false)

  const travelerForm = useForm<TravelerFormValues>({
    resolver: zodResolver(travelerSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      passport: "",
      nationality: "",
    },
  })

  const travelerValues = travelerForm.watch()

  const travelFactor = useMemo(() => 1 + Math.max(0, adults - 1) * 0.18 + children * 0.12, [adults, children])
  const cabinFactor = 1 + cabinPriceDelta[cabin]
  const totalUsd = useMemo(() => selectedPackage.price * travelFactor * cabinFactor, [cabinFactor, selectedPackage.price, travelFactor])

  const handleTravelerSubmit = travelerForm.handleSubmit(() => setStep(3))

  const confirmPayment = async () => {
    setLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1400))
    setLoading(false)
    setCompleted(true)
    toast.success(`Pago confirmado con ${gateway === "openpay" ? "BBVA Openpay" : "Stripe"}`)
    window.setTimeout(() => setCompleted(false), 2400)
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Checkout</p>
        <h1 className="mt-3 text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl">A premium checkout that still feels calm.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
          Pick a package, set the travel details, and pay with a geo-aware gateway. The right column stays sticky with the live price breakdown.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <CheckoutStepper currentStep={step} />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <Card className="overflow-hidden border-white/10 bg-white/7 backdrop-blur-xl">
                  <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[280px]">
                      <Image
                        src={destination?.heroImage ?? "/serene-nature-sharp.jpg"}
                        alt={selectedPackage.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 480px"
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.88),rgba(6,13,13,0.14))]" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-[10px] uppercase tracking-[0.34em] text-white/56">{destination?.country ?? "LATAM"}</p>
                        <h2 className="mt-2 text-3xl font-semibold">{selectedPackage.title}</h2>
                        <p className="mt-2 text-sm text-white/78">
                          {selectedPackage.days} days · {selectedPackage.nights} nights · {selectedPackage.badge}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Selected package</p>
                          <h3 className="mt-2 text-2xl font-semibold text-text">{selectedPackage.title}</h3>
                        </div>
                        <Badge className="rounded-full bg-[color:var(--secondary)] text-black">{selectedPackage.badge}</Badge>
                      </div>
                      <div className="grid gap-3 rounded-[1.3rem] border border-white/10 bg-black/18 p-4 text-sm text-text-muted">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2">
                            <PlaneTakeoff className="h-4 w-4" />
                            Flights
                          </span>
                          <span className="text-text">{selectedPackage.includes.flights ? "Included" : "Optional"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Start date
                          </span>
                          <span className="text-text">{selectedDate?.toLocaleDateString("es-MX") ?? "Pick one"}</span>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-[1.3rem] border border-white/10 bg-black/18 p-3"
                      />
                    </div>
                  </div>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <CounterButton
                    label="Adults"
                    value={adults}
                    onMinus={() => setAdults((current) => Math.max(1, current - 1))}
                    onPlus={() => setAdults((current) => Math.min(8, current + 1))}
                  />
                  <CounterButton
                    label="Children"
                    value={children}
                    onMinus={() => setChildren((current) => Math.max(0, current - 1))}
                    onPlus={() => setChildren((current) => Math.min(6, current + 1))}
                  />
                </div>

                <Card className="border-white/10 bg-white/7 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-[color:var(--secondary)]">
                    <Users className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Seat selector</p>
                  </div>
                  <RadioGroup value={cabin} onValueChange={(value) => setCabin(value as CabinClass)} className="mt-4 grid gap-3 md:grid-cols-2">
                    <label className="cursor-pointer">
                      <div className={cn("rounded-[1.3rem] border p-4 transition-colors", cabin === "economy" ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)]" : "border-white/10 bg-black/18")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="economy" id="economy" />
                              <Label htmlFor="economy" className="text-base text-text">
                                Economy
                              </Label>
                            </div>
                            <p className="mt-3 text-sm text-text-muted">Best value for short and medium trips.</p>
                          </div>
                          <Badge className="rounded-full bg-[color:var(--secondary)] text-black">Base</Badge>
                        </div>
                      </div>
                    </label>
                    <label className="cursor-pointer">
                      <div className={cn("rounded-[1.3rem] border p-4 transition-colors", cabin === "business" ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)]" : "border-white/10 bg-black/18")}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="business" id="business" />
                              <Label htmlFor="business" className="text-base text-text">
                                Business
                              </Label>
                            </div>
                            <p className="mt-3 text-sm text-text-muted">Extra comfort with higher cabin pricing.</p>
                          </div>
                          <Badge className="rounded-full bg-white text-black">+22%</Badge>
                        </div>
                      </div>
                    </label>
                  </RadioGroup>
                </Card>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full bg-[color:var(--primary)] px-6 text-white"
                    disabled={!selectedDate}
                  >
                    Continue
                  </Button>
                </div>
              </motion.section>
            ) : null}

            {step === 2 ? (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <Card className="border-white/10 bg-white/7 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-[color:var(--secondary)]">
                    <User className="h-4 w-4" />
                    <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Traveler details</p>
                  </div>
                  <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleTravelerSubmit}>
                    {[
                      { name: "firstName", label: "Nombre", placeholder: "Camila" },
                      { name: "lastName", label: "Apellido", placeholder: "Riaño" },
                      { name: "email", label: "Email", placeholder: "camila@email.com", span: true },
                      { name: "phone", label: "Teléfono", placeholder: "+52 55 0000 0000" },
                      { name: "passport", label: "Pasaporte", placeholder: "X1234567" },
                      { name: "nationality", label: "Nacionalidad", placeholder: "Mexicana" },
                    ].map((field) => {
                      const fieldName = field.name as keyof TravelerFormValues
                      const error = travelerForm.formState.errors[fieldName]?.message
                      const hasValue = Boolean(travelerValues[fieldName])

                      return (
                        <div key={field.name} className={cn("space-y-2", field.span ? "md:col-span-2" : "")}>
                          <Label htmlFor={field.name} className="text-text">
                            {field.label}
                          </Label>
                          <motion.div animate={error ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }} transition={{ duration: 0.35 }}>
                            <Input
                              id={field.name}
                              {...travelerForm.register(fieldName)}
                              placeholder={field.placeholder}
                              className="rounded-full border-white/10 bg-black/18 text-text placeholder:text-text-muted"
                            />
                          </motion.div>
                          <FieldStatus error={error} hasValue={hasValue} />
                        </div>
                      )
                    })}

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/7 text-white" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" className="rounded-full bg-[color:var(--primary)] text-white">
                        Continue to payment
                      </Button>
                    </div>
                  </form>
                </Card>
              </motion.section>
            ) : null}

            {step === 3 ? (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="grid gap-5">
                  <AnimatedPaymentCard
                    cardNumber={cardNumber}
                    holderName={cardholderName}
                    expiry={expiry}
                    cvv={cvv}
                    cvvFocused={cvvFocused}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="card-number" className="text-text">
                        Card number
                      </Label>
                      <Input
                        id="card-number"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="rounded-full border-white/10 bg-black/18 text-text placeholder:text-text-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-name" className="text-text">
                        Cardholder name
                      </Label>
                      <Input
                        id="card-name"
                        value={cardholderName}
                        onChange={(event) => setCardholderName(event.target.value)}
                        placeholder="LATAM TRAVELER"
                        className="rounded-full border-white/10 bg-black/18 text-text placeholder:text-text-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-expiry" className="text-text">
                        Expiry
                      </Label>
                      <Input
                        id="card-expiry"
                        value={expiry}
                        onChange={(event) => {
                          const value = event.target.value.replace(/[^\d]/g, "").slice(0, 4)
                          const formatted = value.length > 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value
                          setExpiry(formatted)
                        }}
                        placeholder="12/28"
                        className="rounded-full border-white/10 bg-black/18 text-text placeholder:text-text-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card-cvv" className="text-text">
                        CVV
                      </Label>
                      <Input
                        id="card-cvv"
                        value={cvv}
                        onChange={(event) => setCvv(event.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                        onFocus={() => setCvvFocused(true)}
                        onBlur={() => setCvvFocused(false)}
                        placeholder="123"
                        className="rounded-full border-white/10 bg-black/18 text-text placeholder:text-text-muted"
                      />
                    </div>
                  </div>

                  <GeoPaymentSelector gateway={gateway} onGatewayChange={setGateway} onCountryChange={setCountry} />
                </div>

                <div className="flex flex-wrap justify-between gap-3">
                  <Button type="button" variant="outline" className="rounded-full border-white/10 bg-white/7 text-white" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-[color:var(--primary)] px-6 text-white shadow-[0_0_24px_rgba(10,110,110,0.28)]"
                    onClick={confirmPayment}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing
                      </span>
                    ) : (
                      "Confirmar y pagar"
                    )}
                  </Button>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>

        <PackageSummary
          travelPackage={selectedPackage}
          adults={adults}
          children={children}
          cabin={cabin}
          date={selectedDate ?? null}
          totalUsd={totalUsd}
          country={country}
        />
      </div>

      <ConfettiOverlay active={completed} />
    </main>
  )
}
