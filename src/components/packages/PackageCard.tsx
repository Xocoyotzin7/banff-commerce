"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { BedDouble, Check, PlaneTakeoff, Ticket, ArrowRight } from "lucide-react"
import { useMemo, useState } from "react"

import { destinations } from "../../lib/data/destinations"
import type { TravelPackage } from "../../types/travel"
import { cn } from "../../lib/utils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"
import { MagneticButton } from "../shared/MagneticButton"

type PackageCardProps = {
  travelPackage: TravelPackage
  layout?: "vertical" | "horizontal"
  highlighted?: boolean
  layoutId?: string
}

const currencyLabels = ["USD", "MXN", "CAD"] as const
type Currency = (typeof currencyLabels)[number]

function getDestination(destinationId: string) {
  return destinations.find((destination) => destination.id === destinationId)
}

function money(value: number) {
  return value.toLocaleString("en-US")
}

export function PackageCard({ travelPackage, layout = "vertical", highlighted = false, layoutId }: PackageCardProps) {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [imageLoaded, setImageLoaded] = useState(false)
  const reduceMotion = useReducedMotion() ?? false
  const destination = useMemo(() => getDestination(travelPackage.destinationId), [travelPackage.destinationId])
  const priceMap = travelPackage.pricing ?? {
    usd: travelPackage.price,
    mxn: Math.round(travelPackage.price * 20),
    cad: Math.round(travelPackage.price * 1.35),
  }
  const displayPrice = currency === "USD" ? priceMap.usd : currency === "MXN" ? priceMap.mxn : priceMap.cad
  const isHorizontal = layout === "horizontal"

  return (
    <motion.article
      layout
      layoutId={layoutId ?? `package-card-${travelPackage.id}`}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/7 shadow-[0_24px_70px_rgba(0,0,0,0.26)] backdrop-blur-xl",
        highlighted && "border-[color:var(--primary)]/50 shadow-[0_0_0_1px_rgba(10,110,110,0.24),0_0_26px_rgba(10,110,110,0.16)]",
      )}
    >
      <div className={cn(isHorizontal ? "grid gap-0 lg:grid-cols-[0.92fr_1.08fr]" : "block")}>
        <div className="relative min-h-[260px] overflow-hidden lg:min-h-full">
          <Image
            src={destination?.heroImage ?? "/serene-nature-sharp.jpg"}
            alt={travelPackage.title}
            fill
            className={cn("object-cover transition-transform duration-700", imageLoaded ? "scale-100" : "scale-105")}
            onLoadingComplete={() => setImageLoaded(true)}
            sizes="(max-width: 1024px) 100vw, 420px"
          />
          {!imageLoaded ? (
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_8%,rgba(255,255,255,0.14)_18%,rgba(255,255,255,0.06)_33%)] bg-[length:200%_100%]" />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.9)_0%,rgba(6,13,13,0.26)_54%,rgba(6,13,13,0.04)_100%)]" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <Badge className={cn("rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-black", travelPackage.badge === "Más vendido" ? "bg-[color:var(--secondary)]" : "bg-white")}>
              {travelPackage.badge ?? "Starter"}
            </Badge>
            <Badge className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-xl">
              {destination?.country ?? "LATAM"}
            </Badge>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/58">{destination?.name ?? travelPackage.destinationId}</p>
            <h3 className="mt-2 max-w-md font-display text-[2rem] font-bold leading-[0.95] text-white">
              {travelPackage.title}
            </h3>
            <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/60">
              <span>{travelPackage.days} days</span>
              <span>·</span>
              <span>{travelPackage.nights} nights</span>
            </div>
          </div>
        </div>

        <Card className="border-0 bg-transparent shadow-none">
          <CardContent className="flex h-full flex-col gap-5 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white">
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold">
                  {currency}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1">
                  {currencyLabels.map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCurrency(label)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                        currency === label ? "bg-[color:var(--primary)] text-white" : "text-white/68 hover:text-white",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">From</p>
                <motion.div
                  key={`${currency}-${displayPrice}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="text-2xl font-semibold text-text"
                >
                  {currency === "USD" ? `$${money(displayPrice)} ${currency}` : `${currency} ${money(displayPrice)}`}
                </motion.div>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/18 p-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/54">
                  <PlaneTakeoff className="h-3.5 w-3.5" />
                  Flights
                </div>
                <p className="mt-2 text-sm font-medium">{travelPackage.includes.flights ? "Included" : "Optional"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/54">
                  <BedDouble className="h-3.5 w-3.5" />
                  Hotel
                </div>
                <p className="mt-2 text-sm font-medium">3★ / 4★ / 5★ by tier</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/54">
                  <Ticket className="h-3.5 w-3.5" />
                  Tours
                </div>
                <p className="mt-2 text-sm font-medium">{travelPackage.includes.tours.length} curated experiences</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/18 p-4 text-white">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/54">
                  <Check className="h-3.5 w-3.5" />
                  Breakfast
                </div>
                <p className="mt-2 text-sm font-medium">{travelPackage.includes.breakfast ? "Included" : "Not included"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {travelPackage.itinerary.slice(0, 3).map((step) => (
                <span key={step} className="rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/74">
                  {step}
                </span>
              ))}
            </div>

            <div className="mt-auto grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" className="rounded-full border-white/12 bg-white/6 text-white hover:bg-white/12">
                <Link href={`/packages/${travelPackage.id}`}>
                  Ver detalles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <MagneticButton href={`/checkout?packageId=${travelPackage.id}`} className="w-full bg-[color:var(--primary)] text-white">
                Reservar
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.article>
  )
}
