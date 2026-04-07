"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BadgeCheck, Play } from "lucide-react"
import { useState } from "react"

import { destinations } from "../../lib/data/destinations"
import { getTravelCopy } from "@/lib/travel-copy"
import type { Locale } from "../../lib/site-content"
import { cn } from "../../lib/utils"
import { fadeInUp, staggerContainer } from "../shared/animations"

const featuredDestinations = destinations.slice(0, 5)
const featuredBlogSlugs: Record<(typeof featuredDestinations)[number]["id"], string> = {
  "playas-cancun": "cancun-riviera-maya",
  "chichen-itza": "chichen-itza",
  "ciudad-mexico": "ciudad-de-mexico",
  "playas-rio": "rio-de-janeiro",
  "cristo-redentor": "cristo-redentor",
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      delay,
    },
  }),
}

const cardContentVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
}

const cardItemVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

function EditorialCard({
  destination,
  featured = false,
  index = 0,
  reduceMotion,
  loopVisualLabel,
}: {
  destination: (typeof destinations)[number]
  featured?: boolean
  index?: number
  reduceMotion: boolean
  loopVisualLabel: string
}) {
  const [hovered, setHovered] = useState(false)
  const blogSlug = featuredBlogSlugs[destination.id as keyof typeof featuredBlogSlugs]

  return (
    <motion.article
      custom={reduceMotion ? 0 : index * 0.08}
      variants={reduceMotion ? undefined : cardVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-100px" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/40 text-text shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl",
        featured
          ? "min-h-[32rem] xl:col-span-2 xl:row-span-2"
          : "min-h-[18rem] xl:col-span-1 xl:row-span-1",
      )}
    >
      <Link
        href={`/blog/${blogSlug}`}
        className="absolute inset-0 z-30 block"
        aria-label={`Leer blog de ${destination.name}`}
      />
      <motion.div
        aria-hidden="true"
        variants={reduceMotion ? undefined : cardContentVariants}
        initial={false}
        animate={reduceMotion ? undefined : "visible"}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          variants={reduceMotion ? undefined : cardItemVariants}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : {
                  scale: hovered ? 1.08 : featured ? [1, 1.05, 1] : [1, 1.03, 1],
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : hovered
                ? { type: "spring", stiffness: 220, damping: 24 }
                : { duration: featured ? 8 : 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }
          }
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
      </motion.div>

      <motion.div
        aria-hidden="true"
        variants={reduceMotion ? undefined : cardItemVariants}
        className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(6,13,13,0.9)_0%,rgba(6,13,13,0.12)_56%,rgba(6,13,13,0.04)_100%)]"
      />

      {featured ? (
        <motion.div
          variants={reduceMotion ? undefined : cardItemVariants}
          className="pointer-events-none absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-[color:var(--secondary)]/30 bg-[color:var(--secondary)]/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.34em] text-[color:var(--secondary)] shadow-[0_0_28px_rgba(212,160,23,0.2)]"
        >
          <span className="h-2 w-2 rounded-full bg-[color:var(--secondary)] motion-safe:animate-pulse" />
          DESTACADO
        </motion.div>
      ) : null}

      <motion.div
        variants={reduceMotion ? undefined : cardContentVariants}
        initial={false}
        animate={reduceMotion ? undefined : "visible"}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-4 text-white">
          <motion.div variants={reduceMotion ? undefined : cardItemVariants} className="max-w-[16rem]">
            <motion.p variants={reduceMotion ? undefined : cardItemVariants} className="text-[10px] uppercase tracking-[0.32em] text-white/58">
              {destination.country}
            </motion.p>
            <motion.h3
              variants={reduceMotion ? undefined : cardItemVariants}
              className="mt-2 font-display text-2xl font-semibold leading-[0.96] sm:text-3xl"
            >
              {destination.name}
            </motion.h3>
            <motion.p variants={reduceMotion ? undefined : cardItemVariants} className="mt-2 text-xs uppercase tracking-[0.3em] text-white/58">
              Blog editorial
            </motion.p>
          </motion.div>
          <motion.div variants={reduceMotion ? undefined : cardItemVariants} className="rounded-full border border-white/12 bg-white/10 p-3 backdrop-blur-xl">
            <ArrowRight className="h-4 w-4 text-[color:var(--secondary)]" />
          </motion.div>
        </div>

        <motion.div variants={reduceMotion ? undefined : cardItemVariants} className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
          <motion.span variants={reduceMotion ? undefined : cardItemVariants} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
            {destination.region}
          </motion.span>
          {featured ? (
            <motion.span variants={reduceMotion ? undefined : cardItemVariants} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 px-3 py-1 backdrop-blur">
              <Play className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
              {loopVisualLabel}
            </motion.span>
          ) : null}
        </motion.div>
      </motion.div>
    </motion.article>
  )
}

type FeaturedDestinationsProps = {
  locale: Locale
}

export function FeaturedDestinations({ locale }: FeaturedDestinationsProps) {
  const copy = getTravelCopy(locale)
  const reduceMotion = useReducedMotion() ?? false

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} className="mb-8">
        <motion.p variants={fadeInUp} className="text-xs uppercase tracking-[0.32em] text-text-muted">
          {copy.home.featuredEyebrow}
        </motion.p>
        <motion.h2 variants={fadeInUp} className="mt-2 max-w-4xl font-display text-4xl leading-[0.96] text-text sm:text-5xl">
          {copy.home.featuredTitle}
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
          {copy.home.featuredDescription}
        </motion.p>
      </motion.div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 xl:grid xl:snap-none xl:grid-cols-4 xl:grid-rows-2 xl:overflow-visible">
        <div className="min-w-[85vw] snap-start xl:min-w-0">
          <EditorialCard destination={featuredDestinations[0]} featured index={0} reduceMotion={reduceMotion} loopVisualLabel={copy.home.loopVisual} />
        </div>
        {featuredDestinations.slice(1).map((destination, index) => (
          <div key={destination.id} className="min-w-[72vw] snap-start xl:min-w-0">
            <EditorialCard destination={destination} index={index + 1} reduceMotion={reduceMotion} loopVisualLabel={copy.home.loopVisual} />
          </div>
        ))}
      </div>
    </section>
  )
}
