"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import type { ShippingRate } from "@/types/shipping"
import { cn } from "@/lib/utils"

type ShippingCountry = "MX" | "CA"

type ShippingRateCardProps = {
  rate: ShippingRate
  selected: boolean
  country: ShippingCountry
  onSelect: (rate: ShippingRate) => void
}

function formatDeliveryWindow(rate: ShippingRate, country: ShippingCountry) {
  const label = country === "MX" ? "días hábiles" : "business days"
  return `${rate.days_min}-${rate.days_max} ${label}`
}

function formatPrice(rate: ShippingRate) {
  return new Intl.NumberFormat(rate.currency === "MXN" ? "es-MX" : "en-CA", {
    style: "currency",
    currency: rate.currency,
    maximumFractionDigits: 0,
  }).format(rate.price)
}

function getFlag(country: ShippingCountry) {
  return country === "MX" ? "🇲🇽" : "🇨🇦"
}

function getProviderInitials(provider: string) {
  return provider
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function ShippingRateCard({ rate, selected, country, onSelect }: ShippingRateCardProps) {
  const [logoError, setLogoError] = useState(false)
  const radioId = useMemo(
    () => `shipping-rate-${country.toLowerCase()}-${rate.provider}-${rate.service}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase(),
    [country, rate.provider, rate.service],
  )

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "group block cursor-pointer rounded-[1.35rem] border border-border/70 bg-card/90 p-4 text-left backdrop-blur-xl",
        "transition-[box-shadow,border-color,transform] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-md)]",
      )}
      style={{
        boxShadow: selected ? "var(--shadow-md)" : undefined,
        borderColor: selected ? (country === "MX" ? "var(--primary)" : "var(--color-blue)") : undefined,
        borderLeftWidth: "3px",
        borderLeftColor: country === "MX" ? "var(--primary)" : "var(--color-blue)",
      }}
    >
      <input
        id={radioId}
        name="shipping-rate"
        type="radio"
        className="sr-only"
        checked={selected}
        onChange={() => onSelect(rate)}
        aria-describedby={`${radioId}-delivery ${radioId}-price`}
      />

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-surface-2 text-sm font-semibold text-text">
          {rate.carrier_logo && !logoError ? (
            <img
              src={rate.carrier_logo}
              alt={`${rate.provider} logo`}
              className="h-full w-full object-cover"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span
              className={cn(
                "inline-flex h-full w-full items-center justify-center rounded-full",
                country === "MX"
                  ? "bg-[color:rgba(10,110,110,0.12)] text-[color:var(--primary)]"
                  : "bg-[color:rgba(0,100,148,0.14)] text-[color:var(--color-blue)]",
              )}
            >
              {getProviderInitials(rate.provider)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-text">
                {getFlag(country)} {rate.provider}
              </p>
              <p className="truncate text-sm text-text-muted">{rate.service}</p>
            </div>
            {rate.is_urgent ? (
              <Badge className="shrink-0 rounded-full bg-[color:rgba(212,160,23,0.16)] text-[color:#a66b00]">
                {country === "MX" ? "Entrega rápida" : "Express Delivery"}
              </Badge>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-4">
            <span id={`${radioId}-delivery`} className="text-sm font-medium text-text-muted">
              {formatDeliveryWindow(rate, country)}
            </span>
            <span id={`${radioId}-price`} className="text-lg font-semibold text-text">
              {formatPrice(rate)}
            </span>
          </div>
        </div>
      </div>
    </label>
  )
}
