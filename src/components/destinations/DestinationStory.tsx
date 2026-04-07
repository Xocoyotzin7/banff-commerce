"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Check, MapPinned, Star } from "lucide-react"

import type { Destination, Testimonial, Tour, TravelPackage } from "../../types/travel"
import { StaggeredGrid } from "../shared/StaggeredGrid"
import { DestinationHero } from "./DestinationHero"
import { TourCard } from "./TourCard"
import { PackageCard } from "../packages/PackageCard"
import { cn } from "../../lib/utils"
import { Button } from "../../../components/ui/button"
import { useReducedMotion } from "framer-motion"

type DestinationStoryProps = {
  destination: Destination
  destinationTours: Tour[]
  destinationPackages: TravelPackage[]
  testimonials: Testimonial[]
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

function AnimatedCheck() {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[color:var(--secondary)]" aria-hidden="true">
      <motion.path
        d="M5 12.5 9.5 17 19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={reduceMotion ? undefined : "32"}
        strokeDashoffset={reduceMotion ? undefined : "32"}
        whileInView={reduceMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: 0 }}
        viewport={{ once: true }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
      />
    </svg>
  )
}

export function DestinationStory({ destination, destinationTours, destinationPackages, testimonials }: DestinationStoryProps) {
  const explorerPackage = destinationPackages.find((item) => item.badge === "Más vendido")
  const reduceMotion = useReducedMotion() ?? false

  return (
    <main id="main-content" className="bg-background pb-20">
      <DestinationHero destination={destination} />

      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20"
      >
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.34em] text-text-muted">About the destination</p>
            <p className="max-w-3xl text-lg leading-9 text-text-muted sm:text-xl">
              {destination.description}
            </p>

            <div className="space-y-3">
              {destination.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="flex items-start gap-3 rounded-[1.2rem] border border-white/8 bg-white/4 px-4 py-3 text-text"
                >
                  <AnimatedCheck />
                  <span className="pt-0.5 text-sm leading-7 text-text/90">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <div className="relative min-h-[28rem] overflow-hidden rounded-[1.8rem]">
              <Image
                src={destination.images[0]}
                alt={`${destination.name} main image`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.72),rgba(6,13,13,0.12))]" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">{destination.country}</p>
                <h3 className="mt-2 text-2xl font-semibold">{destination.name}</h3>
              </div>
            </div>
            <div className="grid gap-3">
              {destination.images.slice(1, 4).map((image, index) => (
                <div key={image} className={cn("relative overflow-hidden rounded-[1.5rem]", index === 0 ? "min-h-40" : "min-h-28")}>
                  <Image
                    src={image}
                    alt={`${destination.name} view ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 22vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Tours</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text">
              Tours disponibles en {destination.name}
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <StaggeredGrid className="grid-cols-1 gap-4 md:!grid-cols-1 lg:!grid-cols-1 2xl:!grid-cols-1">
            {destinationTours.slice(0, 3).map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                imageSrc={destination.images[0]}
                href={`/checkout?type=tour&id=${tour.id}`}
              />
            ))}
          </StaggeredGrid>
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Packages</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text">
              Paquetes armados para vender rápido
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {destinationPackages.map((travelPackage) => (
            <PackageCard
              key={travelPackage.id}
              travelPackage={travelPackage}
              layout="horizontal"
              highlighted={travelPackage.badge === "Más vendido"}
            />
          ))}
        </div>

        {explorerPackage ? (
          <div className="mt-6 rounded-[1.8rem] border border-[color:var(--primary)]/45 bg-[color:var(--surface)]/70 p-5 shadow-[0_0_0_1px_rgba(10,110,110,0.2),0_0_36px_rgba(10,110,110,0.12)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-text-muted">Comparison</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-text">Starter vs Explorer vs Premium</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs uppercase tracking-[0.28em] text-text-muted">
                Explorer destacado
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {destinationPackages.map((travelPackage) => {
                const isExplorer = travelPackage.badge === "Más vendido"
                return (
                  <div
                    key={`comparison-${travelPackage.id}`}
                    className={cn(
                      "rounded-[1.3rem] border bg-black/18 p-4",
                      isExplorer ? "border-[color:var(--primary)]/55 shadow-[0_0_24px_rgba(10,110,110,0.2)]" : "border-white/10",
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.34em] text-white/56">{travelPackage.badge}</p>
                    <p className="mt-2 text-xl font-semibold text-white">{travelPackage.title}</p>
                    <ul className="mt-4 space-y-2 text-sm text-white/74">
                      {[
                        travelPackage.includes.hotel ? "Hotel incluido" : "Hotel no incluido",
                        travelPackage.includes.flights ? "Vuelos incluidos" : "Sin vuelos",
                        travelPackage.includes.breakfast ? "Desayunos incluidos" : "Sin desayunos",
                        travelPackage.includes.allInclusive ? "Todo incluido" : "Plan flexible",
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </motion.section>

      <motion.section
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--surface-2)] p-6 text-white sm:p-8">
          <div className="flex items-center gap-2 text-[color:var(--secondary)]">
            <MapPinned className="h-4 w-4" />
            <p className="text-xs uppercase tracking-[0.34em] text-white/56">Map placeholder</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div className="relative min-h-[22rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/30">
              <iframe
                title={`Google Maps preview for ${destination.name}`}
                src={`https://www.google.com/maps?q=${destination.coordinates.latitude},${destination.coordinates.longitude}&z=12&output=embed`}
                className="absolute inset-0 h-full w-full grayscale-[0.08] contrast-[1.06] saturate-[0.82]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(10,110,110,0.22),transparent_34%),linear-gradient(to_bottom,rgba(6,13,13,0.18),rgba(6,13,13,0.42))]" />
              <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.34em] text-white/70 backdrop-blur-xl">
                Google Maps preview
              </div>
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{
                  transformOrigin: "center",
                }}
              >
                <span className="absolute h-24 w-24 animate-ping rounded-full bg-[color:var(--primary)]/20" />
                <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-white/30 bg-[color:var(--primary)] shadow-[0_0_24px_rgba(10,110,110,0.55)]">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-white/50">Coordinates</p>
              <p className="text-2xl font-semibold text-white">
                {destination.coordinates.latitude.toFixed(4)}, {destination.coordinates.longitude.toFixed(4)}
              </p>
              <p className="text-sm leading-7 text-white/72">
                The map placeholder keeps the route visually grounded while a real map provider is integrated later.
              </p>
              <Button asChild className="rounded-full bg-[color:var(--primary)] text-white">
                <Link
                  href={`https://www.google.com/maps?q=${destination.coordinates.latitude},${destination.coordinates.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver en Google Maps
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6"
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Reviews</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text">
              Sample traveler stories for {destination.name}
            </h2>
          </div>
        </div>

        <StaggeredGrid className="mt-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="rounded-[1.6rem] border border-white/10 bg-white/7 p-5 text-text backdrop-blur-xl"
            >
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/12">
                  <Image src={testimonial.avatar} alt={testimonial.name} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{testimonial.name}</p>
                      <p className="text-xs uppercase tracking-[0.28em] text-white/50">{testimonial.country}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-white">
                      <Star className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
                      {testimonial.rating}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/76">{testimonial.text}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-white/46">
                    {testimonial.destination} · {testimonial.date}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </StaggeredGrid>
      </motion.section>
    </main>
  )
}
