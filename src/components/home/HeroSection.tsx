"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useInView, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion"
import { ArrowRight, ChevronsDown, MapPinned, Mountain, Sparkles } from "lucide-react"
import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"

import { destinations } from "../../lib/data/destinations"
import { MagneticButton } from "../shared/MagneticButton"
import { cn } from "../../lib/utils"
import { Button } from "../../../components/ui/button"

const heroVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const revealVariants = {
  hidden: { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" },
  show: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0% 0 0 0)",
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const chips = [
  { label: "Machu Picchu", top: "12%", left: "10%" },
  { label: "Salar de Uyuni", top: "18%", left: "72%" },
  { label: "Cartagena", top: "40%", left: "6%" },
  { label: "Cusco", top: "30%", left: "80%" },
  { label: "Atacama", top: "68%", left: "12%" },
  { label: "Riviera Maya", top: "74%", left: "74%" },
] as const

const counters = [
  { label: "Destinos", value: 20 },
  { label: "Paquetes", value: 500 },
  { label: "Viajeros", value: 10000, suffix: "+" },
] as const

function Counter({
  end,
  suffix = "",
  active,
}: {
  end: number
  suffix?: string
  active: boolean
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      return
    }

    const duration = 2000
    const start = performance.now()
    let frame = 0

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1)
      const eased = 1 - (1 - progress) ** 3
      setCount(Math.round(end * eased))

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick)
      }
    }

    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [active, end])

  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{count.toLocaleString()}</span>
      <span className="text-sm text-white/64">{suffix}</span>
    </div>
  )
}

function FloatingChip({
  label,
  top,
  left,
  delay,
  mobileHiddenClass,
  reduceMotion,
}: {
  label: string
  top: string
  left: string
  delay: number
  mobileHiddenClass: string
  reduceMotion: boolean
}) {
  return (
    <motion.div
      className={cn(
        "absolute z-20 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs text-white/90 shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm",
        mobileHiddenClass,
      )}
      style={{ top, left } as CSSProperties}
      initial={reduceMotion ? { opacity: 0, scale: 0.92, y: 0 } : { opacity: 0, scale: 0.92, y: 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: reduceMotion ? 0 : [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.4, delay },
        scale: { duration: 0.4, delay },
        y: reduceMotion
          ? { duration: 0 }
          : {
              duration: 3 + (delay % 2),
              delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              scale: 1.05,
              boxShadow: "0 0 0 1px rgba(10,110,110,0.35), 0 0 34px rgba(10,110,110,0.28)",
            }
      }
    >
      {label}
    </motion.div>
  )
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const counterRef = useRef<HTMLDivElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const isCounterVisible = useInView(counterRef, { once: true, margin: "-20% 0px -20% 0px" })
  const { scrollYProgress, scrollY } = useScroll({ target: sectionRef, offset: ["start start", "end start"] })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"])
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, -36])
  const [showScrollHint, setShowScrollHint] = useState(true)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowScrollHint(prefersReducedMotion ? true : latest < 100)
  })

  const heroImage = useMemo(() => {
    return destinations.find((destination) => destination.slug === "salar-uyuni")?.heroImage ?? destinations[16]?.heroImage ?? destinations[0]?.heroImage
  }, [])

  return (
    <section ref={sectionRef} className="relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--bg)]">
      <motion.div style={prefersReducedMotion ? undefined : { y: backgroundY }} className="absolute inset-0 scale-[1.12]">
        <Image
          src={heroImage}
          alt="Luxury travel in Latin America"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,13,13,0.3)_0%,rgba(6,13,13,0.85)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(10,110,110,0.24),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(212,160,23,0.2),transparent_24%),radial-gradient(circle_at_50%_80%,rgba(232,93,38,0.14),transparent_18%)]" />

      <AnimatePresence>
        {chips.map((chip, index) => (
          <FloatingChip
            key={chip.label}
            label={chip.label}
            top={chip.top}
            left={chip.left}
            delay={index * 0.12}
            mobileHiddenClass={index < 3 ? "hidden md:inline-flex" : "hidden xl:inline-flex"}
            reduceMotion={prefersReducedMotion}
          />
        ))}
      </AnimatePresence>

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-between px-4 pb-8 pt-28 sm:px-6 lg:px-8 lg:pb-10 lg:pt-32">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="show"
          className="grid flex-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="max-w-4xl">
            <motion.div
              variants={fadeUpVariants}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-white/78 backdrop-blur-xl"
            >
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
              luxury travel e-commerce
            </motion.div>

            <motion.h1
              variants={revealVariants}
              className="mt-6 font-display text-5xl font-normal uppercase tracking-widest text-[color:var(--text)] sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              DESCUBRE
            </motion.h1>

            <motion.h2
              variants={revealVariants}
              className="mt-2 max-w-5xl font-display text-6xl font-bold uppercase leading-[0.9] tracking-tight text-[color:var(--secondary)] sm:text-7xl lg:text-8xl"
            >
              LATINOAMÉRICA
            </motion.h2>

            <motion.p variants={fadeUpVariants} className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--text)]/78 sm:text-lg">
              20 destinos · Paquetes desde $599 USD · Vuelos incluidos
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                    staggerChildren: 0.1,
                    delayChildren: 0.12,
                  },
                },
              }}
              className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2"
            >
              <MagneticButton href="/destinations" className="w-full bg-[color:var(--primary)] px-6 py-3 text-sm text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_0_30px_rgba(10,110,110,0.4)]">
                Explorar destinos
              </MagneticButton>
              <Button asChild variant="ghost" className="w-full rounded-full border border-white/12 bg-white/8 px-6 py-3 text-sm text-white backdrop-blur-xl hover:bg-white/12 hover:text-white">
                <Link href="/packages" className="inline-flex items-center justify-center gap-2">
                  Ver paquetes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeUpVariants}
              className="mt-10 grid max-w-2xl grid-cols-3 overflow-hidden rounded-[1.5rem] border border-white/12 bg-white/8 backdrop-blur-2xl"
            >
              <div className="px-4 py-4 sm:px-5">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Destinos</p>
                <div ref={counterRef} className="mt-3">
                  <Counter end={counters[0].value} active={isCounterVisible} />
                </div>
              </div>
              <div className="flex items-stretch justify-center border-x border-white/10 px-4 py-4 sm:px-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Paquetes</p>
                  <div className="mt-3">
                    <Counter end={counters[1].value} active={isCounterVisible} />
                  </div>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-5">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Viajeros</p>
                <div className="mt-3">
                  <Counter end={counters[2].value} suffix="+" active={isCounterVisible} />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div style={prefersReducedMotion ? undefined : { y: foregroundY }} className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-[rgba(212,160,23,0.18)] blur-3xl" />
            <div className="absolute -right-8 bottom-10 h-28 w-28 rounded-full bg-[rgba(232,93,38,0.2)] blur-3xl" />

            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/8 p-5 text-white shadow-[0_28px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Featured escape</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">Patagonia to Atacama loop</h3>
                </div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                  <Mountain className="h-5 w-5 text-[color:var(--secondary)]" />
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                <div className="relative h-80 overflow-hidden rounded-[1.5rem] border border-white/10">
                  <Image
                    src={heroImage}
                    alt="Featured route"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.7),rgba(0,0,0,0.12))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/62">Route 03</p>
                    <p className="mt-2 text-lg font-semibold">Salar de Uyuni · Cusco · Cartagena</p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { label: "Stay", value: "5-star sanctuaries" },
                    { label: "Transfer", value: "Private aircraft" },
                    { label: "Support", value: "24/7 concierge" },
                    { label: "Mood", value: "Slow luxury" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { title: "Private routes", body: "Mexico to the Caribbean" },
                  { title: "Altitude breaks", body: "Cusco and the Andes" },
                  { title: "Night programs", body: "Cartagena and beyond" },
                ].map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    whileInView={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.08, type: "spring", stiffness: 280, damping: 26 }}
                    className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur-2xl"
                  >
                    <div className="flex items-center gap-2 text-[color:var(--secondary)]">
                      <MapPinned className="h-4 w-4" />
                      <span className="text-[10px] uppercase tracking-[0.3em] text-white/54">Curated</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-white">{card.title}</p>
                    <p className="mt-1 text-xs leading-6 text-white/62">{card.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "mx-auto flex w-full max-w-2xl items-center justify-center gap-3 rounded-full border border-white/12 bg-white/7 px-4 py-3 text-white/80 backdrop-blur-2xl transition-all duration-300",
            showScrollHint ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <motion.div
            animate={prefersReducedMotion ? { opacity: 1 } : { y: [0, 8, 0] }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <ChevronsDown className="h-4 w-4 text-[color:var(--secondary)]" />
          </motion.div>
          <span className="text-xs uppercase tracking-[0.34em]">Scroll para explorar</span>
        </motion.div>
      </div>
    </section>
  )
}
