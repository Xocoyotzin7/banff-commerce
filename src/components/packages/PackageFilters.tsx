"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Crown, Mountain, Sparkles, X, type LucideIcon } from "lucide-react"

import type { TravelPackage } from "../../types/travel"
import { Button } from "../ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet"
import { Slider } from "../../../components/ui/slider"
import { cn } from "../../lib/utils"

export type PackageTier = "all" | "starter" | "explorer" | "premium"
export type PackageDuration = "all" | "5-7" | "8-10" | "11+"

export type PackageFiltersState = {
  countries: string[]
  budget: [number, number]
  duration: PackageDuration
  tier: PackageTier
}

type PackageFiltersProps = {
  packages: TravelPackage[]
  countries: string[]
  minPrice: number
  maxPrice: number
  value: PackageFiltersState
  onChange: (next: PackageFiltersState) => void
  onClear: () => void
}

const durationOptions: { label: string; value: PackageDuration }[] = [
  { label: "5-7 días", value: "5-7" },
  { label: "8-10 días", value: "8-10" },
  { label: "11+ días", value: "11+" },
]

const tierOptions: { label: string; value: PackageTier; icon: LucideIcon }[] = [
  { label: "Starter", value: "starter", icon: Mountain },
  { label: "Explorer", value: "explorer", icon: Sparkles },
  { label: "Premium", value: "premium", icon: Crown },
]

function TierIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className="h-4 w-4" />
}

function FilterPanel({
  packages,
  countries,
  minPrice,
  maxPrice,
  value,
  onChange,
  onClear,
}: PackageFiltersProps) {
  const active = value.countries.length > 0 || value.duration !== "all" || value.tier !== "all" || value.budget[0] !== minPrice || value.budget[1] !== maxPrice

  function update(next: Partial<PackageFiltersState>) {
    onChange({ ...value, ...next })
  }

  return (
    <div className="space-y-6 rounded-[1.6rem] border border-white/10 bg-white/7 p-5 text-text backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">Filters</p>
          <h2 className="mt-2 text-xl font-semibold text-text">Refine the catalog</h2>
        </div>

        <AnimatePresence>
          {active ? (
            <motion.button
              key="clear-filters"
              type="button"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/20 px-3 py-2 text-xs font-medium text-white"
            >
              <X className="h-3.5 w-3.5" />
              Limpiar filtros
            </motion.button>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-muted">País de destino</p>
        <div className="flex flex-wrap gap-2">
          {countries.map((country) => {
            const selected = value.countries.includes(country)
            return (
              <motion.button
                key={country}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  update({
                    countries: selected ? value.countries.filter((item) => item !== country) : [...value.countries, country],
                  })
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selected ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)] text-text" : "border-white/10 bg-black/20 text-text-muted",
                )}
              >
                {country}
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-muted">Presupuesto</p>
        <div className="space-y-4 rounded-[1.2rem] border border-white/10 bg-black/18 p-4">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={25}
            value={value.budget}
            onValueChange={(next) => update({ budget: [next[0] ?? minPrice, next[1] ?? maxPrice] })}
          />
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>${value.budget[0].toLocaleString()} USD</span>
            <span>${value.budget[1].toLocaleString()} USD</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-muted">Duración</p>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((option) => {
            const selected = value.duration === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ duration: option.value })}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  selected ? "border-[color:var(--secondary)] bg-[color:rgba(212,160,23,0.16)] text-text" : "border-white/10 bg-black/20 text-text-muted",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.32em] text-text-muted">Tipo</p>
        <div className="grid gap-2">
          {tierOptions.map((option) => {
            const selected = value.tier === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => update({ tier: option.value })}
                className={cn(
                  "flex items-center justify-between rounded-[1.1rem] border px-4 py-3 text-left transition-colors",
                  selected ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)] text-text" : "border-white/10 bg-black/20 text-text-muted",
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <TierIcon icon={option.icon} />
                  {option.label}
                </span>
                <option.icon className="h-4 w-4 opacity-60" />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function PackageFilters(props: PackageFiltersProps) {
  const { value, onChange } = props

  return (
    <>
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full rounded-full border-white/10 bg-white/7 text-white">
              Open filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[88vh] rounded-t-[2rem] border-t border-white/10 bg-[color:var(--bg)] px-4 pb-6">
            <SheetHeader className="px-1 pt-3">
              <SheetTitle className="text-left text-xl text-text">Package filters</SheetTitle>
              <SheetDescription className="text-left text-text-muted">
                Choose countries, budget, duration and package type.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto pb-8">
              <FilterPanel {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <aside className="sticky top-28 hidden self-start lg:block">
        <FilterPanel {...props} />
      </aside>
    </>
  )
}
