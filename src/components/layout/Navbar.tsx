"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { ArrowUpRight, ChevronDown, Moon, PlaneTakeoff, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

import { destinations } from "../../lib/data/destinations"
import { cn } from "../../lib/utils"
import { fadeInUp, staggerContainer } from "../shared/animations"
import { MagneticButton } from "../shared/MagneticButton"

type MenuColumn = {
  title: string
  items: typeof destinations
}

const navLinks = [
  { href: "/destinations", label: "Destinos" },
  { href: "/packages", label: "Paquetes" },
  { href: "/services", label: "Tours" },
  { href: "/about", label: "Sobre nosotros" },
] as const

const popularDestinations = [
  "cancun-riviera-maya",
  "ciudad-de-mexico",
  "cartagena",
  "machu-picchu",
  "rio-de-janeiro",
  "salar-uyuni",
] as const

function getDestinationColumns(): MenuColumn[] {
  const groups = [
    {
      title: "México",
      items: destinations.filter((destination) => destination.country === "México"),
    },
    {
      title: "Brasil",
      items: destinations.filter((destination) => destination.country === "Brasil"),
    },
    {
      title: "Andes y Cono Sur",
      items: destinations.filter((destination) => ["Perú", "Argentina", "Chile", "Bolivia", "Venezuela"].includes(destination.country)),
    },
    {
      title: "Caribe y Centroamérica",
      items: destinations.filter((destination) => ["Colombia", "Guatemala", "Costa Rica", "Panamá"].includes(destination.country)),
    },
  ] satisfies MenuColumn[]

  return groups
}

export function Navbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrollY = useMotionValue(0)
  const megaMenuWrapperRef = useRef<HTMLDivElement | null>(null)
  const megaButtonRef = useRef<HTMLButtonElement | null>(null)
  const megaMenuRef = useRef<HTMLDivElement | null>(null)
  const reduceMotion = useReducedMotion() ?? false
  const isHomePage = pathname === "/"

  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    [isHomePage ? "rgba(14, 26, 26, 0)" : "rgba(14, 26, 26, 0.9)", "rgba(14, 26, 26, 0.92)"],
  )

  const destinationColumns = useMemo(() => getDestinationColumns(), [])
  const isGlass = scrolled || !isHomePage || menuOpen || drawerOpen
  const isDarkTheme = (resolvedTheme ?? "dark") === "dark"

  const focusMenuItem = (direction: 1 | -1) => {
    const menu = megaMenuRef.current
    if (!menu) return

    const items = Array.from(menu.querySelectorAll<HTMLElement>('[data-mega-item="true"]'))
    if (items.length === 0) return

    const currentIndex = items.findIndex((item) => item === document.activeElement)
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + direction + items.length) % items.length
    items[nextIndex]?.focus()
  }

  useEffect(() => {
    setMounted(true)

    const handleScroll = () => {
      const nextScroll = window.scrollY
      scrollY.set(nextScroll)
      setScrolled(nextScroll > 80)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [scrollY])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [drawerOpen])

  useEffect(() => {
    setMenuOpen(false)
    setDrawerOpen(false)
  }, [pathname])

  const toggleTheme = () => {
    const nextTheme = isDarkTheme ? "light" : "dark"
    setTheme(nextTheme)
    document.cookie = `NEXT_THEME=${nextTheme}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <motion.header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-transparent transition-[border-color,box-shadow] duration-300",
        isGlass && "border-border/70 shadow-sm backdrop-blur-xl",
      )}
      style={reduceMotion ? undefined : { backgroundColor }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className={cn(
            "group inline-flex items-center gap-3 text-[0.85rem] font-semibold tracking-[0.28em]",
            isGlass ? "text-text" : "text-white",
          )}
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[color:var(--secondary)] shadow-[0_10px_30px_rgba(0,0,0,0.16)] backdrop-blur">
            <PlaneTakeoff className="h-4 w-4" />
          </span>
          <span className="font-serif text-base tracking-[0.22em]">LATAM VIAJES</span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          <div
            ref={megaMenuWrapperRef}
            className="relative"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
            onBlur={(event) => {
              if (!megaMenuWrapperRef.current?.contains(event.relatedTarget as Node | null)) {
                setMenuOpen(false)
              }
            }}
          >
            <button
              ref={megaButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              onFocus={() => setMenuOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setMenuOpen(false)
                  megaButtonRef.current?.focus()
                }
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setMenuOpen(true)
                  window.requestAnimationFrame(() => focusMenuItem(1))
                }
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                isGlass ? "text-text/80 hover:bg-white/5 hover:text-text" : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              Destinos
              <ChevronDown className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {menuOpen ? (
                <motion.div
                  key="mega-menu"
                  ref={megaMenuRef}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault()
                      setMenuOpen(false)
                      megaButtonRef.current?.focus()
                      return
                    }

                    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                      event.preventDefault()
                      focusMenuItem(1)
                    }

                    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                      event.preventDefault()
                      focusMenuItem(-1)
                    }

                    if (event.key === "Home") {
                      const menu = megaMenuRef.current
                      const items = menu ? Array.from(menu.querySelectorAll<HTMLElement>('[data-mega-item="true"]')) : []
                      items[0]?.focus()
                    }

                    if (event.key === "End") {
                      const menu = megaMenuRef.current
                      const items = menu ? Array.from(menu.querySelectorAll<HTMLElement>('[data-mega-item="true"]')) : []
                      items.at(-1)?.focus()
                    }
                  }}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scaleY: 0.97 }}
                  animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scaleY: 0.97 }}
                  transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute left-0 top-[calc(100%+1rem)] w-[min(80rem,calc(100vw-2rem))] origin-top rounded-[2rem] border border-border/70 bg-surface/95 p-5 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.55)]"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[0.35em] text-text-muted">Explora por región</p>
                      <h2 className="mt-1 text-xl font-semibold text-text">20 destinos curados para viajar en grande</h2>
                    </div>
                    <Link
                      href="/destinations"
                      className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-[color:var(--secondary)]/40 hover:text-[color:var(--secondary)]"
                    >
                      Ver todos
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    {destinationColumns.map((column, columnIndex) => (
                      <motion.div
                        key={column.title}
                        className="rounded-[1.4rem] border border-border/70 bg-background/40 p-3"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        transition={{ delayChildren: 0.05 * columnIndex }}
                      >
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--secondary)]">
                          {column.title}
                        </p>
                        <div className="space-y-2">
                          {column.items.map((destination) => (
                            <motion.div
                              key={destination.id}
                              variants={fadeInUp}
                              whileHover={{ x: 4 }}
                              transition={{ type: "spring", stiffness: 420, damping: 28 }}
                            >
                              <Link
                                data-mega-item="true"
                                href={`/destinations/${destination.slug}`}
                                className="group flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-colors hover:border-[color:var(--primary)]/25 hover:bg-[color:var(--primary)]/10"
                              >
                                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                                  <Image
                                    src={destination.heroImage}
                                    alt={destination.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold text-text transition-colors group-hover:text-white">
                                    {destination.name}
                                  </span>
                                  <span className="block text-xs text-text-muted">{destination.country}</span>
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {navLinks.slice(1).map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isGlass ? "text-text/80 hover:bg-white/5 hover:text-text" : "text-white/80 hover:bg-white/10 hover:text-white",
                  active && "text-[color:var(--secondary)]",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Cambiar tema"
            onClick={toggleTheme}
            className={cn(
              "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-white/8 text-text transition-[transform,background-color,border-color] hover:scale-105 hover:border-white/20 hover:bg-white/12",
              isGlass ? "text-text" : "text-white",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mounted ? (isDarkTheme ? "dark" : "light") : "fallback"}
                initial={{ opacity: 0, rotate: -180, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 180, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {mounted && isDarkTheme ? <SunMedium className="h-4 w-4 text-[color:var(--secondary)]" /> : <Moon className="h-4 w-4 text-[color:var(--secondary)]" />}
              </motion.span>
            </AnimatePresence>
          </button>

          <MagneticButton href="/checkout" className="hidden bg-[color:var(--primary)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.04)] lg:inline-flex">
            Reservar
          </MagneticButton>

          <button
            type="button"
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setDrawerOpen((current) => !current)}
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 transition-colors hover:border-white/20 hover:bg-white/12 lg:hidden",
              isGlass ? "text-text" : "text-white",
            )}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <motion.path
                d="M4 7H20"
                initial={false}
                animate={drawerOpen ? { y: 5.5, rotate: 45, pathLength: 1 } : { y: 0, rotate: 0, pathLength: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              />
              <motion.path
                d="M4 12H20"
                initial={false}
                animate={drawerOpen ? { opacity: 0, pathLength: 0 } : { opacity: 1, pathLength: 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.path
                d="M4 17H20"
                initial={false}
                animate={drawerOpen ? { y: -5.5, rotate: -45, pathLength: 1 } : { y: 0, rotate: 0, pathLength: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
              />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.button
              key="drawer-backdrop"
              type="button"
              aria-label="Cerrar navegación"
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              key="drawer"
              className="fixed right-0 top-0 z-50 h-dvh w-[min(88vw,24rem)] border-l border-border/70 bg-surface/95 px-5 pb-8 pt-6 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.55)] lg:hidden"
              initial={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0 }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%", opacity: 0 }}
              transition={reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 360, damping: 34 }}
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-[0.24em] text-text">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/60 text-[color:var(--secondary)]">
                    <PlaneTakeoff className="h-4 w-4" />
                  </span>
                  LATAM VIAJES
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full border border-border/70 bg-background/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted"
                >
                  Cerrar
                </button>
              </div>

              <motion.nav
                className="mt-8 space-y-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {navLinks.map((link) => (
                  <motion.div key={link.href} variants={fadeInUp}>
                    <Link
                      href={link.href}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/35 px-4 py-4 text-base font-medium text-text transition-colors hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--primary)]/10"
                    >
                      {link.label}
                      <span className="text-[color:var(--secondary)]">→</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              <div className="mt-8 rounded-[1.6rem] border border-border/70 bg-background/35 p-4">
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-text-muted">Destinos destacados</p>
                <div className="mt-3 grid gap-2">
                  {popularDestinations.map((slug) => {
                    const destination = destinations.find((item) => item.slug === slug)
                    if (!destination) return null

                    return (
                      <Link
                        key={destination.id}
                        href={`/destinations/${destination.slug}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/5"
                      >
                        <span className="relative h-12 w-12 overflow-hidden rounded-lg">
                          <Image src={destination.heroImage} alt={destination.name} fill sizes="48px" className="object-cover" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-text">{destination.name}</span>
                          <span className="block text-xs text-text-muted">{destination.country}</span>
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="mt-8">
                <MagneticButton href="/checkout" className="w-full justify-center bg-[color:var(--primary)] text-white">
                  Reservar ahora
                </MagneticButton>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
