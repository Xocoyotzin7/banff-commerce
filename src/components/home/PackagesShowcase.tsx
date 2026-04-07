"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { Sparkles } from "lucide-react"

import { PackageCard } from "../packages/PackageCard"
import { packages } from "../../lib/data/packages"
import { MagneticButton } from "../shared/MagneticButton"
import { Button } from "../../../components/ui/button"
import { cn } from "../../lib/utils"

const tabs = [
  { id: "starter", label: "Starter" },
  { id: "explorer", label: "Explorer" },
  { id: "premium", label: "Premium" },
] as const

type TabId = (typeof tabs)[number]["id"]

function tierMatches(packageId: string, tier: TabId) {
  return packageId.endsWith(`-${tier}`)
}

export function PackagesShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("explorer")
  const reduceMotion = useReducedMotion() ?? false

  const activePackages = useMemo(() => {
    return packages.filter((travelPackage) => tierMatches(travelPackage.id, activeTab)).slice(0, 3)
  }, [activeTab])

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.32em] text-text-muted">Paquetes</p>
          <h2 className="mt-2 font-display text-4xl leading-[0.96] text-text sm:text-5xl">Viajes listos para vender con una lógica clara.</h2>
          <p className="mt-4 text-base leading-8 text-text-muted">
            Cambia el nivel del paquete y la selección se reorganiza con transiciones compartidas para conservar contexto visual.
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full border-border/70 bg-surface/40 text-text">
          <Link href="/packages">Ver todos los paquetes</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-[1.6rem] border border-border/70 bg-surface/35 p-3 backdrop-blur-xl">
        {tabs.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active ? "bg-[color:var(--primary)] text-white" : "text-text-muted hover:bg-white/5 hover:text-text",
              )}
            >
              <Sparkles className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeTab}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 36 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -36 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid gap-4 lg:grid-cols-3"
        >
          {activePackages.map((travelPackage) => (
            <PackageCard key={travelPackage.id} travelPackage={travelPackage} />
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center">
        <MagneticButton href="/packages" className="bg-[color:var(--primary)] text-white">
          Ver todos los paquetes →
        </MagneticButton>
      </div>
    </section>
  )
}
