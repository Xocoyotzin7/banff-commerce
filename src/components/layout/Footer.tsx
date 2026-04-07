"use client"

import Link from "next/link"
import { useState, type FormEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowUpRight,
  Check,
  Facebook,
  Instagram,
  Mail,
  MessageCircleMore,
  PhoneCall,
  Send,
  Twitter,
  Youtube,
} from "lucide-react"

import { destinations } from "../../lib/data/destinations"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { fadeInUp, staggerContainer } from "@banff/agency-core/components/shared/animations"
import { getTravelCopy } from "@/lib/travel-copy"
import type { Locale } from "@/lib/site-content"

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com/latamviajes", icon: Instagram, hoverClass: "hover:text-[#E1306C]" },
  { name: "Twitter / X", href: "https://x.com/latamviajes", icon: Twitter, hoverClass: "hover:text-[#1D9BF0]" },
  { name: "Facebook", href: "https://facebook.com/latamviajes", icon: Facebook, hoverClass: "hover:text-[#1877F2]" },
  { name: "YouTube", href: "https://youtube.com/@latamviajes", icon: Youtube, hoverClass: "hover:text-[#FF0033]" },
] as const

const popularDestinations = [
  "cancun-riviera-maya",
  "ciudad-de-mexico",
  "cartagena",
  "machu-picchu",
  "rio-de-janeiro",
  "salar-uyuni",
] as const

const informationLinks = [
  { href: "/about", label: "Sobre nosotros" },
  { href: "/blog", label: "Blog" },
  { href: "/about#terms", label: "Términos" },
  { href: "/about#privacy", label: "Privacidad" },
] as const

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

type FooterProps = {
  locale: Locale
}

export function Footer({ locale }: FooterProps) {
  const copy = getTravelCopy(locale)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "error" | "success">("idle")
  const [shakeToken, setShakeToken] = useState(0)

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!isValidEmail(newsletterEmail)) {
      setNewsletterStatus("error")
      setShakeToken((current) => current + 1)
      return
    }

    setNewsletterStatus("success")
    setNewsletterEmail("")
  }

  return (
    <footer className="border-t border-border/70 bg-surface/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeInUp} className="space-y-5">
              <Link href="/" className="inline-flex items-center gap-3 text-text">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/55 text-[color:var(--secondary)]">
                  <PlaneBrandMark />
                </span>
                <span className="font-serif text-xl tracking-[0.2em]">LATAM VIAJES</span>
              </Link>

              <p className="max-w-sm text-sm leading-7 text-text-muted">{copy.footer.description}</p>

              <div className="flex flex-wrap items-center gap-3">
                {socialLinks.map(({ name, href, icon: Icon, hoverClass }) => (
                  <motion.a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/45 text-text-muted transition-colors",
                      hoverClass,
                    )}
                    aria-label={name}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--secondary)]">{copy.footer.popularDestinationsTitle}</h3>
              <ul className="mt-5 space-y-3">
                {popularDestinations.map((slug) => {
                  const destination = destinations.find((item) => item.slug === slug)
                  if (!destination) return null

                  return (
                    <li key={destination.id}>
                      <Link
                        href={`/destinations/${destination.slug}`}
                        className="group inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
                      >
                        <ArrowUpRight className="h-4 w-4 text-[color:var(--secondary)] opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        {destination.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeInUp}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--secondary)]">{copy.footer.infoTitle}</h3>
              <ul className="mt-5 space-y-3">
                {informationLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-text-muted transition-colors hover:text-text">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <motion.div variants={fadeInUp} className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[color:var(--secondary)]">{copy.footer.contactTitle}</h3>
                <div className="mt-5 space-y-3 text-sm text-text-muted">
                  <a href="mailto:hello@latamviajes.com" className="flex items-center gap-2 transition-colors hover:text-text">
                    <Mail className="h-4 w-4 text-[color:var(--secondary)]" />
                    hello@latamviajes.com
                  </a>
                  <a
                    href="https://wa.me/5215555555555"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-text"
                  >
                    <MessageCircleMore className="h-4 w-4 text-[color:var(--secondary)]" />
                    WhatsApp para reservas
                  </a>
                  <a href="tel:+5215555555555" className="flex items-center gap-2 transition-colors hover:text-text">
                    <PhoneCall className="h-4 w-4 text-[color:var(--secondary)]" />
                    +52 1 555 555 5555
                  </a>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-border/70 bg-background/35 p-4">
                <p className="text-sm font-semibold text-text">{copy.footer.newsletterTitle}</p>
                <p className="mt-2 text-sm leading-6 text-text-muted">{copy.footer.newsletterDescription}</p>

                <form onSubmit={handleNewsletterSubmit} className="mt-4 space-y-3">
                  <motion.div
                    key={shakeToken}
                    animate={newsletterStatus === "error" ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Input
                      type="email"
                      value={newsletterEmail}
                      onChange={(event) => {
                        setNewsletterEmail(event.target.value)
                        if (newsletterStatus !== "idle") setNewsletterStatus("idle")
                      }}
                      placeholder={copy.footer.newsletterPlaceholder}
                      className="h-11 rounded-full border-border/70 bg-background/55"
                    />
                    <Button type="submit" className="h-11 rounded-full bg-[color:var(--primary)] px-5 text-white hover:bg-[color:var(--primary-dark)]">
                      <span className="inline-flex items-center gap-2">
                        {copy.footer.subscribe}
                        <Send className="h-4 w-4" />
                      </span>
                    </Button>
                  </motion.div>

                  <AnimatePresence mode="wait" initial={false}>
                    {newsletterStatus === "error" ? (
                      <motion.p
                        key="newsletter-error"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-[color:var(--accent)]"
                      >
                        {copy.footer.invalidEmail}
                      </motion.p>
                    ) : null}

                    {newsletterStatus === "success" ? (
                      <motion.p
                        key="newsletter-success"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="inline-flex items-center gap-2 text-sm text-emerald-300"
                      >
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <Check className="h-4 w-4" />
                        </motion.span>
                        {copy.footer.success}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

function PlaneBrandMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M3 13.5 21 4l-6.8 8.5L21 20 3 13.5Z" fill="currentColor" opacity="0.9" />
      <path d="M3 13.5 21 4l-6.8 8.5L21 20 3 13.5Z" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
