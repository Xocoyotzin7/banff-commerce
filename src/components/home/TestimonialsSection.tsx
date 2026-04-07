"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "framer-motion"
import { Star } from "lucide-react"
import { useMemo, useState, type CSSProperties } from "react"

import type { Testimonial } from "../../types/travel"
import { getTravelCopy } from "@/lib/travel-copy"
import type { Locale } from "../../lib/site-content"
import { cn } from "../../lib/utils"

const rowOne: Testimonial[] = [
  { id: "row1-1", name: "Camila Rojas", country: "México", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=90", rating: 5, text: "Curated from first click to checkout. The route feels premium and effortless.", destination: "Cartagena", date: "2026-01-12" },
  { id: "row1-2", name: "Mateo Fernández", country: "Argentina", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=90", rating: 5, text: "The visual story sold the trip before I even opened the itinerary.", destination: "Machu Picchu", date: "2026-01-28" },
  { id: "row1-3", name: "Sofía Herrera", country: "Colombia", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "Smooth, elegant, and genuinely useful for high-intent travelers.", destination: "Cancún", date: "2026-02-03" },
  { id: "row1-4", name: "Luis Andrade", country: "Perú", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=90", rating: 5, text: "Luxury without friction. That balance is hard to get right.", destination: "Cusco", date: "2026-02-11" },
  { id: "row1-5", name: "Valeria Gómez", country: "Chile", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "The package pages feel like editorial spreads, not a catalog.", destination: "Atacama", date: "2026-02-17" },
  { id: "row1-6", name: "Nicolás Romero", country: "Panamá", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=90", rating: 5, text: "The brand voice stays warm, clear and conversion-ready.", destination: "San Blas", date: "2026-02-21" },
  { id: "row1-7", name: "Andrea Ponce", country: "Costa Rica", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=90", rating: 5, text: "A premium experience that still respects the decision-making flow.", destination: "Monteverde", date: "2026-03-02" },
  { id: "row1-8", name: "Diego Salazar", country: "Brasil", avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=256&q=90", rating: 4.8, text: "Every section pushes intent forward without feeling pushy.", destination: "Río de Janeiro", date: "2026-03-09" },
  { id: "row1-9", name: "Mila Thompson", country: "Canada", avatar: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?auto=format&fit=crop&w=256&q=90", rating: 5, text: "It sells the feeling of the trip, then makes the booking obvious.", destination: "Uyuni", date: "2026-03-16" },
  { id: "row1-10", name: "Ethan Clark", country: "Canada", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "The marbled glass and pacing make the whole thing feel expensive.", destination: "Patagonia", date: "2026-03-24" },
]

const rowTwo: Testimonial[] = [
  { id: "row2-1", name: "Lucía Navarro", country: "México", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=256&q=90", rating: 5, text: "The site feels like a travel magazine that happens to convert well.", destination: "Ciudad de México", date: "2026-01-08" },
  { id: "row2-2", name: "Tomás Vega", country: "Argentina", avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "I trust the offer because every route is explained with intent.", destination: "Bariloche", date: "2026-01-19" },
  { id: "row2-3", name: "Mariana Castro", country: "Colombia", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=90", rating: 5, text: "The visual hierarchy makes premium packages feel worth the price.", destination: "Cartagena", date: "2026-01-30" },
  { id: "row2-4", name: "Javier López", country: "Perú", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=90", rating: 5, text: "We got a cleaner booking funnel without losing the sense of adventure.", destination: "Machu Picchu", date: "2026-02-08" },
  { id: "row2-5", name: "Antonia Silva", country: "Chile", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=90", rating: 4.8, text: "The rhythm of the page is quiet, confident and very premium.", destination: "Atacama", date: "2026-02-14" },
  { id: "row2-6", name: "Raúl Ortega", country: "Guatemala", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=90", rating: 5, text: "This is how a high-value travel brand should feel online.", destination: "Tikal", date: "2026-02-20" },
  { id: "row2-7", name: "Paula Jiménez", country: "Panamá", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=90", rating: 5, text: "The catalog is emotional without being vague. That is rare.", destination: "Bocas del Toro", date: "2026-03-01" },
  { id: "row2-8", name: "Sebastián Melo", country: "Brasil", avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "The design gives the product room to breathe and sell itself.", destination: "Florianópolis", date: "2026-03-11" },
  { id: "row2-9", name: "Chloe Martin", country: "Canada", avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=256&q=90", rating: 5, text: "I can feel the premium positioning without any clutter.", destination: "Salar de Uyuni", date: "2026-03-18" },
  { id: "row2-10", name: "Noah Bennett", country: "Canada", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=90", rating: 4.9, text: "The content structure makes the trip feel both aspirational and easy.", destination: "Riviera Maya", date: "2026-03-25" },
]

function StarRow({ rating }: { rating: number }) {
  const stars = Math.round(rating)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={cn("h-3.5 w-3.5", index < stars ? "fill-[color:var(--secondary)] text-[color:var(--secondary)]" : "text-white/20")} />
      ))}
    </div>
  )
}

function TestimonialCard({ item }: { item: Testimonial }) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="w-[320px] shrink-0 rounded-[1.5rem] border border-white/12 bg-white/8 p-5 text-white backdrop-blur-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/12">
          <Image src={item.avatar} alt={item.name} fill sizes="44px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
          <p className="text-xs text-white/58">{item.country}</p>
        </div>
        <div className="ml-auto text-right">
          <StarRow rating={item.rating} />
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/52">{item.destination}</p>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/78">{item.text}</p>
    </motion.article>
  )
}

function MarqueeRow({
  items,
  direction,
  paused,
  reduceMotion,
}: {
  items: Testimonial[]
  direction: "left" | "right"
  paused: boolean
  reduceMotion: boolean
}) {
  const repeatedItems = useMemo(() => [...items, ...items], [items])

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "marquee-track gap-4 py-2",
          direction === "left" ? "marquee-left" : "marquee-right",
          reduceMotion && "animate-none",
        )}
        style={
          {
            animationPlayState: paused || reduceMotion ? "paused" : "running",
            ["--marquee-duration" as string]: "30s",
          } as CSSProperties
        }
      >
        {repeatedItems.map((item, index) => (
          <TestimonialCard key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}

type TestimonialsSectionProps = {
  locale: Locale
}

export function TestimonialsSection({ locale }: TestimonialsSectionProps) {
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion() ?? false
  const copy = getTravelCopy(locale)

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-8 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.32em] text-text-muted">{copy.home.testimonialsEyebrow}</p>
        <h2 className="mt-2 font-display text-4xl leading-[0.96] text-text sm:text-5xl">{copy.home.testimonialsTitle}</h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">{copy.home.testimonialsDescription}</p>
      </div>

      <div className="space-y-4">
        <MarqueeRow items={rowOne} direction="left" paused={paused} reduceMotion={reduceMotion} />
        <MarqueeRow items={rowTwo} direction="right" paused={paused} reduceMotion={reduceMotion} />
      </div>
    </section>
  )
}
