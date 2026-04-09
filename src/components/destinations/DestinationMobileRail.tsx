"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, type Variants } from "framer-motion"
import { ArrowRight, ChevronDown } from "lucide-react"

import { destinations } from "../../lib/data/destinations"
import { cn } from "../../lib/utils"

const railVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

function mobileCopy(country: string) {
  return country === "México" ? "Explora destinos" : "Explore destinations"
}

export function DestinationMobileRail() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="fixed inset-0 z-40 md:hidden overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(10,110,110,0.18),transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.98))]" />

      <div className="sticky top-0 z-20 border-b border-white/10 bg-background/75 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">Destinos</p>
            <h2 className="mt-1 text-lg font-semibold text-text">Lista inmersiva</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <ChevronDown className="h-3.5 w-3.5" />
            Desliza
          </div>
        </div>
      </div>

      <motion.div
        variants={railVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "visible"}
        className="relative z-10 h-[calc(100svh-4rem)] overflow-y-auto overscroll-y-contain snap-y snap-mandatory [scrollbar-width:none]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {destinations.map((destination, index) => (
          <motion.article
            key={destination.id}
            variants={reduceMotion ? undefined : itemVariants}
            className={cn(
              "relative flex min-h-[calc(100svh-4rem)] snap-start items-end overflow-hidden border-b border-white/8",
              index % 2 === 0 ? "bg-[color:var(--surface)]" : "bg-[color:var(--surface-2)]",
            )}
          >
            <Image
              src={destination.heroImage}
              alt={destination.name}
              fill
              className="object-cover"
              sizes="100vw"
              priority={index < 2}
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.96)_6%,rgba(6,13,13,0.22)_52%,rgba(6,13,13,0.08)_100%)]" />

            <div className="relative z-10 w-full p-4 pb-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
                  {destination.country}
                </span>
                <span className="rounded-full border border-white/12 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur-xl">
                  Desde ${destination.startingPriceUsd.toLocaleString()} USD
                </span>
              </div>

              <div className="rounded-[1.8rem] border border-white/12 bg-black/42 p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
                <p className="text-[10px] uppercase tracking-[0.34em] text-white/58">{destination.region}</p>
                <h3 className="mt-2 max-w-[12ch] font-display text-4xl leading-[0.92] tracking-tight">{destination.name}</h3>
                <p className="mt-3 line-clamp-4 text-sm leading-7 text-white/78">{destination.description}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/76">
                  {destination.highlights.slice(0, 4).map((highlight) => (
                    <div key={highlight} className="rounded-2xl border border-white/10 bg-white/6 px-3 py-2">
                      {highlight}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-white/58">{mobileCopy(destination.country)}</p>
                  <Link
                    href={`/destinations/${destination.slug}`}
                    className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(10,110,110,0.32)] transition-transform duration-200 active:scale-[0.98]"
                  >
                    Ver destino
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  )
}
