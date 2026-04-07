"use client"

import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { Sparkles } from "lucide-react"

import { PackageCard } from "../packages/PackageCard"
import { packages } from "../../lib/data/packages"
import { MagneticButton } from "@banff/agency-core/components/shared/MagneticButton"
import { Button } from "../../../components/ui/button"
import { cn } from "../../lib/utils"
import { staggerContainer } from "@banff/agency-core/components/shared/animations"
import { getTravelCopy } from "@/lib/travel-copy"
import type { Locale } from "../../lib/site-content"

const tabs = [
  { id: "starter", label: "Starter" },
  { id: "explorer", label: "Growth" },
  { id: "premium", label: "Premium" },
] as const

type TabId = (typeof tabs)[number]["id"]

const packageCardVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    y: index % 2 === 0 ? 32 : -32,
    scale: 0.96,
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      delay: index * 0.08,
    },
  }),
}

const packageCardScrollVariants = {
  hidden: (index: number) => ({
    opacity: 0,
    y: index % 2 === 0 ? 44 : -44,
    scale: 0.97,
  }),
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 26,
      delay: index * 0.1,
    },
  }),
}

function tierMatches(packageId: string, tier: TabId) {
  return packageId.endsWith(`-${tier}`)
}

type PackagesShowcaseProps = {
  locale: Locale
}

export function PackagesShowcase({ locale }: PackagesShowcaseProps) {
  const [activeTab, setActiveTab] = useState<TabId>("explorer")
  const reduceMotion = useReducedMotion() ?? false
  const copy = getTravelCopy(locale)

  const activePackages = useMemo(() => {
    return packages.filter((travelPackage) => tierMatches(travelPackage.id, activeTab)).slice(0, 3)
  }, [activeTab])

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.32em] text-text-muted">{copy.home.packagesEyebrow}</p>
          <h2 className="mt-2 font-display text-4xl leading-[0.96] text-text sm:text-5xl">{copy.home.packagesTitle}</h2>
          <p className="mt-4 text-base leading-8 text-text-muted">{copy.home.packagesDescription}</p>
        </div>

        <Button asChild variant="outline" className="rounded-full border-border/70 bg-surface/40 text-text">
          <Link href="/packages">{copy.home.packagesCta}</Link>
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
              {tab.id === "starter" ? copy.home.packageTabs.starter : tab.id === "explorer" ? copy.home.packageTabs.explorer : copy.home.packageTabs.premium}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={activeTab}
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -36 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 grid gap-4 lg:grid-cols-3"
        >
          {activePackages.map((travelPackage) => (
            <motion.div
              key={travelPackage.id}
              custom={activePackages.indexOf(travelPackage)}
              variants={reduceMotion ? undefined : packageCardScrollVariants}
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: true, margin: "-120px" }}
              className="h-full"
            >
              <PackageCard travelPackage={travelPackage} locale={locale} />
            </motion.div>
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
