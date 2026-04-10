"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BriefcaseBusiness, CalendarDays, Info, MapPinned, Mountain } from "lucide-react"

import { cn } from "../../lib/utils"

type MobileDockProps = {
  destinationsLabel: string
  packagesLabel: string
  toursLabel: string
  reservationsLabel: string
  aboutLabel: string
}

type DockItem = {
  href: string
  label: string
  icon: typeof MapPinned
}

const dockItems = ({ destinationsLabel, packagesLabel, toursLabel, reservationsLabel, aboutLabel }: MobileDockProps): DockItem[] => [
  { href: "/destinations", label: destinationsLabel, icon: MapPinned },
  { href: "/packages", label: packagesLabel, icon: BriefcaseBusiness },
  { href: "/services", label: toursLabel, icon: Mountain },
  { href: "/reservations", label: reservationsLabel, icon: CalendarDays },
  { href: "/about", label: aboutLabel, icon: Info },
]

export function MobileDock(props: MobileDockProps) {
  const pathname = usePathname()
  const items = dockItems(props)

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] px-4 sm:hidden">
        <nav className="pointer-events-auto relative mx-auto flex w-full max-w-md items-stretch gap-1 rounded-[1.55rem] border border-white/10 bg-[rgba(8,10,18,0.84)] px-2 py-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[1.55rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(212,160,23,0.06))]"
          />
          {items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className="relative flex flex-1 flex-col items-center justify-center gap-1 py-1.5"
                aria-label={item.label}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-colors",
                    active
                      ? "border-[color:var(--secondary)]/35 bg-[color:var(--secondary)]/14 text-[color:var(--secondary)]"
                      : "border-white/10 bg-white/8 text-white/78",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={cn(
                    "max-w-[4.6rem] truncate text-[9px] font-medium leading-none tracking-wide",
                    active ? "text-[color:var(--secondary)]" : "text-white/65",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom))] sm:hidden" />
    </>
  )
}
