"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"
import { ArrowRight, Star } from "lucide-react"
import type { MouseEvent } from "react"
import { useMemo, useState } from "react"

import type { Destination } from "../../types/travel"
import { cn } from "../../lib/utils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"

type DestinationCardProps = {
  destination: Destination
  className?: string
}

const flagMap: Record<string, string> = {
  México: "🇲🇽",
  Brasil: "🇧🇷",
  Venezuela: "🇻🇪",
  Perú: "🇵🇪",
  Colombia: "🇨🇴",
  Guatemala: "🇬🇹",
  "Costa Rica": "🇨🇷",
  Panamá: "🇵🇦",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Bolivia: "🇧🇴",
}

function RatingStars({ rating, reduceMotion }: { rating: number; reduceMotion: boolean }) {
  const stars = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <motion.svg
          key={index}
          viewBox="0 0 24 24"
          className={cn("h-3.5 w-3.5", index < stars ? "text-[color:var(--secondary)]" : "text-white/20")}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.7, rotate: -15 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.04 * index, type: "spring", stiffness: 300, damping: 22 }}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="m12 17.27 5.18 3.03-1.64-5.81L20 9.24l-5.91-.5L12 3 9.91 8.74 4 9.24l4.46 5.25-1.64 5.81L12 17.27Z" />
        </motion.svg>
      ))}
    </div>
  )
}

export function DestinationCard({ destination, className }: DestinationCardProps) {
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })
  const reduceMotion = useReducedMotion() ?? false
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const flag = useMemo(() => flagMap[destination.country] ?? "🏳️", [destination.country])

  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - (rect.left + rect.width / 2)
    const offsetY = event.clientY - (rect.top + rect.height / 2)
    const rotateYValue = (offsetX / rect.width) * 16
    const rotateXValue = -(offsetY / rect.height) * 16

    rotateX.set(Math.max(-8, Math.min(8, rotateXValue)))
    rotateY.set(Math.max(-8, Math.min(8, rotateYValue)))
  }

  function handleMouseLeave() {
    setIsHovered(false)
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.article
      style={{
        perspective: 1000,
      }}
      className={cn("group relative h-full w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        onMouseMove={reduceMotion ? undefined : handleMouseMove}
        style={{
          rotateX: reduceMotion ? 0 : springRotateX,
          rotateY: reduceMotion ? 0 : springRotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={reduceMotion ? undefined : { scale: 1.015 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="relative aspect-[4/5] min-h-[72svh] overflow-hidden rounded-[1.9rem] border border-white/12 bg-[color:var(--surface)] shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:min-h-[64svh] lg:h-[500px] lg:w-[400px] lg:min-h-0"
      >
        <div className={cn("absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.92)_0%,rgba(6,13,13,0.28)_42%,rgba(6,13,13,0)_100%)] transition-opacity duration-500", isHovered ? "opacity-100" : "opacity-95")} />

        <div className="absolute inset-0">
          <Image
            src={destination.heroImage}
            alt={destination.name}
            fill
            className={cn("object-cover transition-all duration-700 group-hover:scale-105", imageLoaded ? "opacity-100" : "opacity-0")}
            sizes="(max-width: 1024px) 100vw, 400px"
            onLoadingComplete={() => setImageLoaded(true)}
          />
          {!imageLoaded ? (
            <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.06)_8%,rgba(255,255,255,0.14)_18%,rgba(255,255,255,0.06)_33%)] bg-[length:200%_100%]" />
          ) : null}
        </div>

        <div className="absolute left-4 right-4 top-4 z-10 flex items-start justify-between gap-3">
          <Badge className="rounded-full border border-white/14 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.26em] text-white backdrop-blur-xl">
            {destination.country}
          </Badge>
          <Badge className="rounded-full border border-white/14 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.26em] text-white backdrop-blur-xl">
            Desde ${destination.startingPriceUsd.toLocaleString()} USD
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 p-5">
          <div className="flex items-center justify-between gap-4 text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/62">{flag} {destination.country}</p>
              <h3 className="mt-2 max-w-[16rem] font-display text-[2rem] font-bold leading-[0.96] text-white">
                {destination.name}
              </h3>
            </div>
            <div className="rounded-full border border-white/14 bg-white/10 px-3 py-2 backdrop-blur-xl">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
                <span className="text-sm font-semibold text-white">{destination.rating.toFixed(1)}</span>
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/58">{destination.reviewCount} reseñas</p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/14 bg-white/8 p-4 text-white backdrop-blur-2xl md:hidden">
            <div className="flex items-center gap-3">
              <RatingStars rating={destination.rating} reduceMotion={reduceMotion} />
              <span className="text-xs uppercase tracking-[0.28em] text-white/62">{destination.bestSeason}</span>
            </div>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/76">{destination.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white/90">
                Desde ${destination.startingPriceUsd.toLocaleString()} USD
              </span>
              <Button asChild size="sm" className="rounded-full bg-[color:var(--primary)] text-white shadow-[0_0_20px_rgba(10,110,110,0.35)]">
                <Link href="/packages">
                  Ver paquetes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {isHovered ? (
              <motion.div
                initial={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { y: 40, opacity: 0 }}
                transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 25 }}
                className="mt-5 rounded-[1.5rem] border border-white/14 bg-white/10 p-4 text-white backdrop-blur-2xl"
              >
                <div className="flex items-center gap-3">
                  <RatingStars rating={destination.rating} reduceMotion={reduceMotion} />
                  <span className="text-xs uppercase tracking-[0.28em] text-white/62">
                    {destination.bestSeason}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/76">
                  {destination.description}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white/90">
                    Desde ${destination.startingPriceUsd.toLocaleString()} USD
                  </span>
                  <Button asChild size="sm" className="rounded-full bg-[color:var(--primary)] text-white shadow-[0_0_20px_rgba(10,110,110,0.35)]">
                    <Link href="/packages">
                      Ver paquetes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.article>
  )
}
