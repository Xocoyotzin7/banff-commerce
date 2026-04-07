"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ChevronRight, MapPinned, Star } from "lucide-react"
import { useRef } from "react"

import type { Destination } from "../../types/travel"
import { cn } from "../../lib/utils"

type DestinationHeroProps = {
  destination: Destination
}

export function DestinationHero({ destination }: DestinationHeroProps) {
  const ref = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion() ?? false
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 24])

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative isolate min-h-[100svh] overflow-hidden"
    >
      <motion.div style={reduceMotion ? undefined : { y: imageY }} className="absolute inset-0 scale-[1.12]">
        <Image
          src={destination.heroImage}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,13,13,0.24)_0%,rgba(6,13,13,0.7)_52%,rgba(6,13,13,0.95)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(10,110,110,0.18),transparent_26%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 pb-10 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 self-start rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-white/76 backdrop-blur-xl"
        >
          <Link href="/">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/38" />
          <Link href="/destinations">Destinos</Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/38" />
          <span>{destination.country}</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/38" />
          <span className="max-w-[12rem] truncate text-white">{destination.name}</span>
        </motion.div>

        <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-5xl">
            <motion.h1
            style={reduceMotion ? undefined : { y: titleY }}
            initial={reduceMotion ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", opacity: 0, y: 60 }}
            animate={reduceMotion ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)", opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-center font-display text-5xl font-bold leading-[0.92] tracking-tight text-[color:var(--text)] sm:text-6xl lg:text-7xl"
            >
              {destination.name}
            </motion.h1>

            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 grid gap-3 rounded-[1.7rem] border border-white/12 bg-white/8 p-4 text-white backdrop-blur-2xl sm:grid-cols-2 xl:grid-cols-4"
            >
              <div className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/54">Rating</p>
                <div className="mt-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-[color:var(--secondary)]" />
                  <span className="text-lg font-semibold">{destination.rating.toFixed(1)}</span>
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/54">Reseñas</p>
                <p className="mt-3 text-lg font-semibold">{destination.reviewCount.toLocaleString()}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/54">Mejor temporada</p>
                <p className="mt-3 text-lg font-semibold">{destination.bestSeason}</p>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-black/18 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/54">País</p>
                <p className="mt-3 text-lg font-semibold">{destination.country}</p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 26 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="hidden rounded-[1.7rem] border border-white/12 bg-white/8 p-5 text-white backdrop-blur-2xl lg:block"
          >
            <div className="flex items-center gap-2 text-[color:var(--secondary)]">
              <MapPinned className="h-4 w-4" />
              <span className="text-[10px] uppercase tracking-[0.34em] text-white/58">Route data</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-[1.1rem] border border-white/10 bg-black/18 p-4">
                <p className="text-white/52">Region</p>
                <p className="mt-2 text-white">{destination.region}</p>
              </div>
              <div className="rounded-[1.1rem] border border-white/10 bg-black/18 p-4">
                <p className="text-white/52">Coordenadas</p>
                <p className="mt-2 text-white">
                  {destination.coordinates.latitude.toFixed(3)}, {destination.coordinates.longitude.toFixed(3)}
                </p>
              </div>
              <div className="col-span-2 rounded-[1.1rem] border border-white/10 bg-black/18 p-4">
                <p className="text-white/52">Desde</p>
                <p className="mt-2 text-2xl font-semibold text-white">${destination.startingPriceUsd.toLocaleString()} USD</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
