"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BadgeCheck, Play } from "lucide-react"

import { destinations } from "../../lib/data/destinations"
import { cn } from "../../lib/utils"
import { fadeInUp, staggerContainer } from "../shared/animations"

const featuredDestinations = destinations.slice(0, 5)

function EditorialCard({
  destination,
  featured = false,
  index = 0,
  reduceMotion,
}: {
  destination: (typeof destinations)[number]
  featured?: boolean
  index?: number
  reduceMotion: boolean
}) {
  return (
    <motion.article
      variants={fadeInUp}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/40 text-text shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl",
        featured
          ? "min-h-[32rem] xl:col-span-2 xl:row-span-2"
          : "min-h-[18rem] xl:col-span-1 xl:row-span-1",
      )}
    >
      <Link href={`/destinations/${destination.slug}`} className="absolute inset-0 z-10" aria-label={`Ver ${destination.name}`} />
      <div className="absolute inset-0">
        <motion.div
          animate={reduceMotion ? { opacity: 1 } : { scale: featured ? [1, 1.05, 1] : [1, 1.03, 1] }}
          transition={reduceMotion ? { duration: 0 } : { duration: featured ? 8 : 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className={cn("relative h-full w-full", featured && !reduceMotion && "slow-zoom")}
        >
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            sizes={featured ? "(max-width: 1280px) 100vw, 50vw" : "(max-width: 1280px) 100vw, 25vw"}
            className="object-cover"
          />
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.9)_0%,rgba(6,13,13,0.12)_56%,rgba(6,13,13,0.04)_100%)]" />

      {featured ? (
        <div className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-[color:var(--secondary)]/30 bg-[color:var(--secondary)]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:var(--secondary)] shadow-[0_0_28px_rgba(212,160,23,0.2)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--secondary)] motion-safe:animate-pulse" />
          DESTACADO
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4 text-white">
          <div className="max-w-[16rem]">
            <p className="text-[10px] uppercase tracking-[0.32em] text-white/58">{destination.country}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold leading-[0.96] sm:text-3xl">
              {destination.name}
            </h3>
          </div>
          <div className="rounded-full border border-white/12 bg-white/10 p-3 backdrop-blur-xl">
            <ArrowRight className="h-4 w-4 text-[color:var(--secondary)]" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
            {destination.region}
          </span>
          {featured ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur">
              <Play className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
              Loop visual
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

export function FeaturedDestinations() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-8">
        <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.32em] text-text-muted">
          Destinos destacados
        </motion.p>
        <motion.h2 variants={fadeInUp} className="mt-2 max-w-4xl font-display text-4xl leading-[0.96] text-text sm:text-5xl">
          Destinos que te quitarán el aliento
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
          Un diseño editorial para inspirar primero y convertir después. En desktop la grilla se siente como una portada de revista.
        </motion.p>
      </motion.div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 xl:grid xl:snap-none xl:grid-cols-4 xl:grid-rows-2 xl:overflow-visible">
        <div className="min-w-[85vw] snap-start xl:min-w-0">
          <EditorialCard destination={featuredDestinations[0]} featured reduceMotion={reduceMotion} />
        </div>
        {featuredDestinations.slice(1).map((destination, index) => (
          <div key={destination.id} className="min-w-[72vw] snap-start xl:min-w-0">
            <EditorialCard destination={destination} index={index} reduceMotion={reduceMotion} />
          </div>
        ))}
      </div>
    </section>
  )
}
