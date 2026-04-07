"use client"

import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { Globe2, LockKeyhole, ShieldCheck } from "lucide-react"

import { Badge } from "../../../components/ui/badge"
import { cn } from "../../lib/utils"

export type CheckoutGateway = "stripe" | "openpay"
export type GeoCountry = "CA" | "MX" | "OTHER"

type GeoResponse = {
  country: string
  isCanada: boolean
  isMexico: boolean
  gateway: CheckoutGateway
}

type GeoPaymentSelectorProps = {
  gateway: CheckoutGateway
  onGatewayChange: (gateway: CheckoutGateway) => void
  onCountryChange?: (country: GeoCountry) => void
}

type GatewayOption = {
  key: CheckoutGateway | "paypal"
  label: string
  description: string
  recommended?: boolean
  disabled?: boolean
}

function normalizeCountry(country: string): GeoCountry {
  if (country === "CA" || country === "MX") {
    return country
  }
  return "OTHER"
}

function flagForCountry(country: GeoCountry) {
  switch (country) {
    case "CA":
      return "🇨🇦"
    case "MX":
      return "🇲🇽"
    default:
      return "🇨🇦"
  }
}

export function GeoPaymentSelector({ gateway, onGatewayChange, onCountryChange }: GeoPaymentSelectorProps) {
  const [country, setCountry] = useState<GeoCountry>("CA")

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        // The geo endpoint provides the third-party-backed routing decision without exposing provider logic to the UI.
        const response = await fetch("/api/geo", { cache: "no-store", signal: controller.signal })
        if (!response.ok) {
          return
        }
        const json = (await response.json()) as GeoResponse
        const normalized = normalizeCountry(json.country)
        setCountry(normalized)
        onCountryChange?.(normalized)
        onGatewayChange(json.gateway)
      } catch {
        onCountryChange?.("OTHER")
      }
    }

    void load()
    return () => controller.abort()
  }, [onCountryChange, onGatewayChange])

  const options = useMemo<GatewayOption[]>(() => {
    if (country === "MX") {
      return [
        { key: "openpay", label: "BBVA Openpay", description: "Recommended in Mexico for local card flows.", recommended: true },
        { key: "stripe", label: "Stripe", description: "Alternative global card gateway." },
      ]
    }

    if (country === "CA") {
      return [
        { key: "stripe", label: "Stripe", description: "Recommended in Canada.", recommended: true },
        { key: "paypal", label: "PayPal", description: "Coming soon for Canada checkout.", disabled: true },
      ]
    }

    return [{ key: "stripe", label: "Stripe", description: "Default gateway with Canada fallback.", recommended: true }]
  }, [country])

  const activeLabel = gateway === "openpay" ? "BBVA Openpay" : "Stripe"

  return (
    <div className="space-y-4 rounded-[1.7rem] border border-white/10 bg-white/7 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">Geo payment</p>
          <h3 className="mt-2 text-2xl font-semibold text-text">Pagando con {activeLabel}</h3>
        </div>
        <Badge className="rounded-full bg-[color:var(--secondary)] text-black">
          {flagForCountry(country)} {country}
        </Badge>
      </div>

      <div className="grid gap-3">
        {options.map((option) => {
          const selected = option.key === gateway
          const disabled = option.disabled ?? false
          return (
            <motion.button
              key={option.key}
              type="button"
              whileTap={disabled ? undefined : { scale: 0.98 }}
              onClick={() => {
                if (!disabled && (option.key === "stripe" || option.key === "openpay")) {
                  onGatewayChange(option.key)
                }
              }}
              disabled={disabled}
              className={cn(
                "rounded-[1.3rem] border p-4 text-left transition-colors",
                selected ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)] text-text" : "border-white/10 bg-black/18 text-text-muted",
                disabled && "cursor-not-allowed opacity-70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-text">{option.label}</span>
                    {option.recommended ? <Badge className="rounded-full bg-[color:var(--secondary)] text-black">Recomendado</Badge> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{option.description}</p>
                </div>
                <ShieldCheck className={cn("h-5 w-5", selected ? "text-[color:var(--secondary)]" : "text-white/28")} />
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="grid gap-2 text-sm text-text-muted sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-[color:var(--secondary)]" />
          <span>Country-aware gateway routing</span>
        </div>
        <div className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-[color:var(--secondary)]" />
          <span>Test mode is on in development</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[color:var(--secondary)]" />
          <span>Canada fallback for unknown regions</span>
        </div>
      </div>

      {process.env.NODE_ENV !== "production" ? (
        <details className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-medium text-text">Test cards</summary>
          <div className="mt-4 space-y-4 text-sm text-text-muted">
            <div>
              <p className="font-semibold text-text">Stripe</p>
              <p>4242 4242 4242 4242 · Visa</p>
              <p>5555 5555 5555 4444 · Mastercard</p>
              <p>CVC: any 3 digits</p>
            </div>
            <div>
              <p className="font-semibold text-text">Openpay (MX)</p>
              <p>4111 1111 1111 1111 · approved</p>
              <p>4000 0000 0000 0002 · declined</p>
            </div>
          </div>
        </details>
      ) : null}
    </div>
  )
}
