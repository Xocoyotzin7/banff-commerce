"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Mail, Phone } from "lucide-react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileDock } from "@/components/mobile-dock"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { localizedSectionHref } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { getSiteCopy, type Locale } from "@/lib/site-content"

type SiteHeaderProps = {
  locale: Locale
}

export function SiteHeader({ locale }: SiteHeaderProps) {
  const pathname = usePathname()
  const copy = getSiteCopy(locale)

  const navItems = [
    { href: localizedSectionHref(locale, "about"), label: copy.nav.about },
    { href: localizedSectionHref(locale, "packages"), label: copy.nav.packages },
    { href: localizedSectionHref(locale, "services"), label: copy.nav.services },
    { href: "/portfolio", label: copy.nav.portfolio },
    { href: "/blog", label: copy.nav.blog },
  ]

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
        <header className="pointer-events-auto relative flex w-full max-w-[1100px] items-center justify-between gap-3 rounded-3xl border px-3 py-3 text-sm font-semibold shadow-2xl transition-all duration-500 backdrop-blur-md text-gray-900 dark:text-white border-black/5 bg-white/80 dark:border-white/10 dark:bg-black/60 sm:px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 leading-tight">
            {pathname !== "/" ? (
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-foreground shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white sm:hidden">
                <Home className="h-4 w-4" />
              </span>
            ) : null}
            <span className="truncate text-sm font-semibold text-foreground sm:text-base">{copy.brand.name}</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-4 sm:flex lg:gap-6">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname?.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative inline-flex flex-col items-center gap-1 text-[0.95rem] font-semibold tracking-wide text-gray-700 transition duration-300 dark:text-gray-200",
                    active ? "text-[color:var(--accent)] dark:text-[color:var(--accent)]" : "",
                  )}
                >
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "h-1 w-1 rounded-full bg-current transition-all duration-200",
                      active
                        ? "translate-y-0 opacity-100"
                        : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300",
                      "group-hover:scale-x-100",
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`mailto:${copy.contact.emails[0]}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-foreground shadow-sm backdrop-blur-xl transition-colors hover:border-[color:var(--accent)]/30 hover:text-[color:var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label={`Email ${copy.contact.emails[0]}`}
            >
              <Mail className="h-4 w-4" />
            </Link>
            <Link
              href={`tel:${copy.contact.phone.replace(/[^+\d]/g, "")}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-foreground shadow-sm backdrop-blur-xl transition-colors hover:border-[color:var(--accent)]/30 hover:text-[color:var(--accent)] dark:border-white/10 dark:bg-white/5 dark:text-white"
              aria-label={`Call ${copy.contact.phone}`}
            >
              <Phone className="h-4 w-4" />
            </Link>
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
        </header>
      </div>
      <MobileDock
        locale={locale}
        aboutLabel={copy.nav.about}
        packagesLabel={copy.nav.packages}
        portfolioLabel={copy.nav.portfolio}
        blogLabel={copy.nav.blog}
        servicesLabel={copy.nav.services}
      />
    </>
  )
}
