"use client"

import { useRef, type ComponentType } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import {
  ArrowUpRight,
  Compass,
  Hotel,
  MapPinned,
  Mountain,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Waves,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type JourneyCard = {
  title: string
  subtitle: string
  detail: string
  accent: string
  icon: ComponentType<{ className?: string }>
}

type StoryStep = {
  number: string
  title: string
  body: string
}

const journeyCards: JourneyCard[] = [
  {
    title: "Pacific reset",
    subtitle: "Mexico Coast",
    detail: "Sunrise surf, private transfers, and low-friction booking for coastal escapes.",
    accent: "from-[color:rgba(10,110,110,0.34)] via-[color:rgba(10,110,110,0.14)] to-transparent",
    icon: Waves,
  },
  {
    title: "Altitude calm",
    subtitle: "Andes Circuit",
    detail: "High-altitude stays with slow mornings, curated logistics, and glassy lodges.",
    accent: "from-[color:rgba(212,160,23,0.30)] via-[color:rgba(212,160,23,0.12)] to-transparent",
    icon: Mountain,
  },
  {
    title: "City after dark",
    subtitle: "Cartagena Night",
    detail: "Walkable neighborhoods, rooftop dinners, and concierge support in-market.",
    accent: "from-[color:rgba(232,93,38,0.30)] via-[color:rgba(232,93,38,0.12)] to-transparent",
    icon: Hotel,
  },
]

const storySteps: StoryStep[] = [
  {
    number: "01",
    title: "Choose a route, not a room.",
    body: "We anchor the trip around the experience first: coastline, city, altitude, or a sequence that blends all three.",
  },
  {
    number: "02",
    title: "Lock the friction out.",
    body: "Transfers, support, and booking details stay tucked into a single purchase flow with minimal decision noise.",
  },
  {
    number: "03",
    title: "Travel like the plan was handmade.",
    body: "The final itinerary feels editorial, but the engine underneath stays operational and easy to maintain.",
  },
]

const stats = [
  { label: "LATAM routes", value: "18+" },
  { label: "Average response", value: "< 10 min" },
  { label: "Concierge coverage", value: "24/7" },
  { label: "Booking modes", value: "Flights + stays" },
] as const

const highlights = [
  {
    title: "Golden hour routing",
    body: "Packages are sequenced around the best light, best timing, and least crowded moments.",
    icon: SunMedium,
  },
  {
    title: "Real-time confidence",
    body: "Availability, support, and friction are surfaced up front so the story stays clean.",
    icon: ShieldCheck,
  },
  {
    title: "Curated movement",
    body: "Each screen layer shifts differently to echo the rhythm of travel discovery.",
    icon: Compass,
  },
] as const

function TravelCard({
  card,
  className,
  delay = 0,
}: {
  card: JourneyCard
  className?: string
  delay?: number
}) {
  const Icon = card.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 320, damping: 28, delay }}
      whileHover={{ y: -10, scale: 1.01 }}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl",
        className,
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br", card.accent)} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Badge className="rounded-full border border-white/12 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/78">
            {card.subtitle}
          </Badge>
          <h3 className="text-xl font-semibold tracking-tight text-white">{card.title}</h3>
          <p className="max-w-sm text-sm leading-7 text-white/72">{card.detail}</p>
        </div>
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-[color:var(--secondary)]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  )
}

export function TravelLanding() {
  const heroRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -100])
  const clusterY = useSpring(useTransform(scrollYProgress, [0, 1], [0, -24]), {
    stiffness: 160,
    damping: 24,
    mass: 0.5,
  })

  return (
    <main className="relative overflow-hidden bg-background text-foreground">
      <section ref={heroRef} className="relative isolate min-h-[100svh] overflow-hidden">
        <motion.div style={{ y: imageY }} className="absolute inset-0">
          <Image
            src="/serene-nature-sharp.jpg"
            alt="LATAM travel backdrop"
            fill
            priority
            className="object-cover object-center"
          />
        </motion.div>

        <motion.div style={{ y: glowY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(10,110,110,0.42),transparent_26%),radial-gradient(circle_at_82%_22%,rgba(212,160,23,0.24),transparent_22%),radial-gradient(circle_at_72%_78%,rgba(232,93,38,0.18),transparent_18%),linear-gradient(180deg,rgba(6,13,13,0.22),rgba(6,13,13,0.9)_68%,rgba(6,13,13,1))]" />
          <div className="absolute inset-0 hero-glow" />
        </motion.div>

        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-end gap-12 px-4 pb-14 pt-28 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-36">
          <div className="max-w-3xl">
            <Badge className="rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-[10px] uppercase tracking-[0.35em] text-white/82 backdrop-blur-xl">
              LATAM travel e-commerce
            </Badge>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              className="mt-6 max-w-4xl text-5xl leading-[0.94] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.8rem]"
            >
              Journeys that feel editorial before they feel transactional.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 170, damping: 22 }}
              className="mt-7 max-w-2xl text-base leading-8 text-white/76 sm:text-lg"
            >
              A premium booking experience for LATAM routes, built around atmospheric storytelling, glass surfaces, and a checkout flow that stays calm under pressure.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, type: "spring", stiffness: 170, damping: 22 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Button asChild size="lg" className="rounded-full bg-[color:var(--primary)] px-7 text-white shadow-[0_24px_60px_rgba(10,110,110,0.38)] transition-transform duration-200 hover:scale-[1.02]">
                <Link href="/packages">
                  Explore journeys
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/15 bg-white/7 px-7 text-white backdrop-blur-xl hover:bg-white/12">
                <Link href="/services">See concierge flow</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 22 }}
              className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4"
            >
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-2xl"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/54">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div style={{ y: clusterY }} className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -left-6 top-10 hidden h-28 w-28 rounded-full bg-[color:rgba(212,160,23,0.18)] blur-3xl lg:block" />
            <div className="absolute -right-6 bottom-12 hidden h-32 w-32 rounded-full bg-[color:rgba(232,93,38,0.2)] blur-3xl lg:block" />

            <div className="grid gap-4">
              <Card className="glass-panel relative overflow-hidden border-white/10 bg-white/8 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/58">Featured escape</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pacific to Andes loop</h2>
                  </div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                    <Sparkles className="h-5 w-5 text-[color:var(--secondary)]" />
                  </span>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20">
                    <Image
                      src="/serene-nature-sharp.jpg"
                      alt="Curated travel route"
                      width={900}
                      height={760}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/62">Route 03</p>
                      <p className="mt-2 text-lg font-semibold">Cartagena · Medellín · Cusco</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {[
                      { label: "Stay", value: "4 nights" },
                      { label: "Transfer", value: "Private" },
                      { label: "Support", value: "24/7" },
                      { label: "Mood", value: "Slow luxury" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-white/55">{item.label}</p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 sm:grid-cols-3">
                {journeyCards.map((card, index) => (
                  <TravelCard key={card.title} card={card} delay={index * 0.05} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto -mt-10 max-w-7xl px-4 pb-8 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ delay: index * 0.06, type: "spring", stiffness: 260, damping: 26 }}
                whileHover={{ y: -8 }}
                className="glass-panel rounded-[1.6rem] border border-white/10 bg-white/7 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.28)]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-[color:var(--secondary)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/70">{item.body}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-22 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:py-28">
        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <Badge className="rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/78">
            Storytelling-driven checkout
          </Badge>
          <h2 className="max-w-xl text-4xl leading-[0.98] tracking-tight text-white sm:text-5xl">
            Built like a magazine spread, sold like a clean e-commerce flow.
          </h2>
          <p className="max-w-lg text-base leading-8 text-white/68">
            The interface uses contrast and spacing to pace the journey. Each step reveals a little more, so the user never feels dropped into a flat product grid.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[color:var(--secondary)] px-6 text-black hover:bg-[color:var(--secondary)]/90">
              <Link href="/blog">Read the travel notes</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/6 px-6 text-white backdrop-blur-xl hover:bg-white/12">
              <Link href="/services">Plan with concierge</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {storySteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ type: "spring", stiffness: 280, damping: 26, delay: index * 0.05 }}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/7 p-6 shadow-[0_22px_72px_rgba(0,0,0,0.28)] backdrop-blur-2xl",
                index === 1 ? "lg:ml-10" : "",
                index === 2 ? "lg:ml-20" : "",
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,110,110,0.12),transparent_35%,rgba(232,93,38,0.08)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative grid gap-4 md:grid-cols-[120px_1fr] md:items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.36em] text-white/52">Step {step.number}</p>
                  <div className="mt-4 h-px w-12 bg-gradient-to-r from-[color:var(--secondary)] to-transparent" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{step.title}</h3>
                  <p className="max-w-2xl text-sm leading-7 text-white/72">{step.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:pb-32">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="glass-panel overflow-hidden border-white/10 bg-white/7 p-6 text-white shadow-[0_24px_84px_rgba(0,0,0,0.34)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">Why it works</p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">The UI stays practical beneath the atmosphere.</h3>
              </div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-[color:var(--primary)]">
                <MapPinned className="h-5 w-5" />
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                "Glass surfaces for layered content",
                "Strong CTA contrast for booking decisions",
                "Parallax depth without visual noise",
              ].map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-white/10 bg-black/18 p-4 text-sm leading-7 text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-panel overflow-hidden border-white/10 bg-white/7 p-6 text-white shadow-[0_24px_84px_rgba(0,0,0,0.34)]">
            <p className="text-xs uppercase tracking-[0.3em] text-white/55">Final call</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">Start with one route, then let the story branch out.</h3>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
              The layout is built to support storefront conversion, but it still reads like a travel editorial. That balance is what keeps the page memorable without feeling heavy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-[color:var(--primary)] px-6 text-white shadow-[0_18px_46px_rgba(10,110,110,0.34)]">
                <Link href="/packages">Reserve a route</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/6 px-6 text-white backdrop-blur-xl hover:bg-white/12">
                <Link href="/admin/login?entry=flight">Owner console</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </main>
  )
}
