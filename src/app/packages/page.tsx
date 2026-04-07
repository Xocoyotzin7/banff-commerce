"use client"

import Link from "next/link"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import { PackageCard } from "../../components/packages/PackageCard"
import { PackageFilters, type PackageFiltersState } from "../../components/packages/PackageFilters"
import { packages } from "../../lib/data/packages"
import { destinations } from "../../lib/data/destinations"
import type { TravelPackage } from "../../types/travel"

type Tier = "starter" | "explorer" | "premium"

function tierFromPackage(travelPackage: TravelPackage): Tier {
  if (travelPackage.id.endsWith("-starter")) return "starter"
  if (travelPackage.id.endsWith("-explorer")) return "explorer"
  return "premium"
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const startValue = display
    const duration = 500
    const started = performance.now()
    let frame = 0

    const tick = (time: number) => {
      const progress = Math.min((time - started) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(startValue + (value - startValue) * eased))

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [value])

  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {display}
    </motion.span>
  )
}

export default function PackagesPage() {
  const reduceMotion = useReducedMotion() ?? false
  const countries = useMemo(() => Array.from(new Set(packages.map((travelPackage) => destinations.find((entry) => entry.id === travelPackage.destinationId)?.country).filter(Boolean) as string[])), [])
  const minPrice = useMemo(() => Math.min(...packages.map((travelPackage) => travelPackage.price)), [])
  const maxPrice = useMemo(() => Math.max(...packages.map((travelPackage) => travelPackage.price)), [])

  const [filters, setFilters] = useState<PackageFiltersState>({
    countries: [],
    budget: [minPrice, maxPrice],
    duration: "all",
    tier: "all",
  })

  const filteredPackages = useMemo(() => {
    return packages.filter((travelPackage) => {
      const destination = destinations.find((entry) => entry.id === travelPackage.destinationId)
      const matchesCountry = filters.countries.length === 0 || (destination ? filters.countries.includes(destination.country) : false)
      const matchesBudget = travelPackage.price >= filters.budget[0] && travelPackage.price <= filters.budget[1]
      const matchesDuration =
        filters.duration === "all" ||
        (filters.duration === "5-7" && travelPackage.days >= 5 && travelPackage.days <= 7) ||
        (filters.duration === "8-10" && travelPackage.days >= 8 && travelPackage.days <= 10) ||
        (filters.duration === "11+" && travelPackage.days >= 11)
      const matchesTier = filters.tier === "all" || tierFromPackage(travelPackage) === filters.tier

      return matchesCountry && matchesBudget && matchesDuration && matchesTier
    })
  }, [filters])

  const handleClear = () => {
    setFilters({
      countries: [],
      budget: [minPrice, maxPrice],
      duration: "all",
      tier: "all",
    })
  }

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Packages</p>
        <h1 className="mt-3 text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl">Packages built to sell from the first glance.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
          Filter by country, budget, duration and tier. The grid uses shared layout transitions so the detail page feels connected.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        <PackageFilters
          packages={packages}
          countries={countries}
          minPrice={minPrice}
          maxPrice={maxPrice}
          value={filters}
          onChange={setFilters}
          onClear={handleClear}
        />

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-text-muted backdrop-blur-xl">
              <AnimatedCount value={filteredPackages.length} /> paquetes encontrados
            </div>
            <Link href="/checkout" className="text-sm text-[color:var(--secondary)] hover:underline">
              Ir al checkout
            </Link>
          </div>

          <LayoutGroup id="package-grid">
            <AnimatePresence mode="popLayout">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredPackages.map((travelPackage) => (
                  <motion.div
                    key={travelPackage.id}
                    layout
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
                    animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 300, damping: 26 }}
                  >
                    <PackageCard travelPackage={travelPackage} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </LayoutGroup>
        </section>
      </div>
    </main>
  )
}
