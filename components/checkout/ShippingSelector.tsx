"use client"

import { useEffect, useMemo, useState } from "react"
import { RefreshCw, Truck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShippingRateCard } from "@/components/checkout/ShippingRateCard"
import { ShippingSkeleton } from "@/components/checkout/ShippingSkeleton"
import { useCheckoutStore } from "@/lib/stores/checkout"
import type { ShippingRate } from "@/types/shipping"
import { cn } from "@/lib/utils"

type ShippingCountry = "MX" | "CA"

type ShippingSelectorProps = {
  country: ShippingCountry
  parcel: {
    weight_kg: number
    length_cm: number
    width_cm: number
    height_cm: number
  }
  destinationPostalCode?: string
}

type ShippingRatesResponse = {
  success: boolean
  country?: ShippingCountry
  data?: ShippingRate[]
  message?: string
}

const defaultDestinationPostalCodes: Record<ShippingCountry, string> = {
  MX: "06600",
  CA: "M5V3A8",
}

function sortByPrice(rates: ShippingRate[]) {
  return [...rates].sort((left, right) => left.price - right.price)
}

function providerPrefix(country: ShippingCountry) {
  return country === "MX" ? "🇲🇽 Envío con Skydropx" : "🇨🇦 Shipping via Easyship"
}

function footerNote(country: ShippingCountry) {
  return country === "MX" ? "Servicio operado por Skydropx · Cargos en MXN" : "Powered by Easyship · Charges in CAD"
}

export function ShippingSelector({ country, parcel, destinationPostalCode }: ShippingSelectorProps) {
  const shippingRate = useCheckoutStore((state) => state.shippingRate)
  const setShippingRate = useCheckoutStore((state) => state.setShippingRate)
  const clearShippingRate = useCheckoutStore((state) => state.clearShippingRate)

  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTick, setReloadTick] = useState(0)

  const destZip = destinationPostalCode?.trim() || defaultDestinationPostalCodes[country]

  const sortedRates = useMemo(() => sortByPrice(rates), [rates])

  useEffect(() => {
    const controller = new AbortController()
    clearShippingRate()
    setLoading(true)
    setError(null)

    async function loadRates() {
      try {
        const response = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-vercel-ip-country": country,
          },
          body: JSON.stringify({
            destZip,
            weightKg: parcel.weight_kg,
            lengthCm: parcel.length_cm,
            widthCm: parcel.width_cm,
            heightCm: parcel.height_cm,
          }),
          signal: controller.signal,
          cache: "no-store",
        })

        const json = (await response.json()) as ShippingRatesResponse

        if (!response.ok || !json.success || !json.data) {
          throw new Error(json.message ?? "Unable to fetch shipping rates")
        }

        setRates(sortByPrice(json.data))
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }
        setRates([])
        setError(error instanceof Error ? error.message : "Unable to fetch shipping rates")
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadRates()

    return () => controller.abort()
  }, [clearShippingRate, country, destZip, parcel.height_cm, parcel.length_cm, parcel.weight_kg, parcel.width_cm, reloadTick])

  const selectedId = shippingRate ? `${shippingRate.provider}:${shippingRate.service}` : null

  return (
    <section
      className={cn(
        "space-y-4 rounded-[1.7rem] border border-border/70 bg-white/7 p-5 backdrop-blur-xl",
        country === "MX" ? "text-text" : "text-text",
      )}
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: country === "MX" ? "var(--primary)" : "var(--color-blue)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">Shipping methods</p>
          <h3
            className={cn(
              "mt-2 text-2xl font-semibold",
              country === "MX" ? "text-[color:var(--primary)]" : "text-[color:var(--color-blue)]",
            )}
          >
            {providerPrefix(country)}
          </h3>
          <p className="mt-2 text-sm text-text-muted">
            {country === "MX"
              ? "Rutas, tiempos y tarifa estimada calculados con Skydropx."
              : "Rutas, tiempos y tarifa estimada calculados con Easyship."}
          </p>
        </div>

        <Badge className={cn("rounded-full border bg-transparent", country === "MX" ? "border-[color:var(--primary)] text-[color:var(--primary)]" : "border-[color:var(--color-blue)] text-[color:var(--color-blue)]")}>
          {country === "MX" ? "MXN" : "CAD"}
        </Badge>
      </div>

      {loading ? <ShippingSkeleton /> : null}

      {!loading && error ? (
        <div className="rounded-[1.35rem] border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">No pudimos cotizar el envío. Verifica tu código postal.</p>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-destructive/30 bg-background text-text"
              onClick={() => setReloadTick((current) => current + 1)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="space-y-3">
          {sortedRates.map((rate) => (
            <ShippingRateCard
              key={`${rate.provider}-${rate.service}`}
              rate={rate}
              selected={selectedId === `${rate.provider}:${rate.service}`}
              country={country}
              onSelect={setShippingRate}
            />
          ))}
        </div>
      ) : null}

      <div className="rounded-[1.2rem] border border-border/70 bg-black/10 px-4 py-3 text-sm text-text-muted">
        <div className="flex items-start gap-2">
          <Truck className={cn("mt-0.5 h-4 w-4 shrink-0", country === "MX" ? "text-[color:var(--primary)]" : "text-[color:var(--color-blue)]")} />
          <p>{footerNote(country)}</p>
        </div>
      </div>
    </section>
  )
}
