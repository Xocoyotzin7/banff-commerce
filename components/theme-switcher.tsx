"use client"

import * as React from "react"
import { Moon, SunMedium } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [burstKey, setBurstKey] = React.useState(0)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const syncThemeCookie = React.useCallback((value: "dark" | "light") => {
    document.cookie = `NEXT_THEME=${value}; path=/; max-age=31536000; samesite=lax`
  }, [])

  React.useEffect(() => {
    setMounted(true)
    if (resolvedTheme === "dark" || resolvedTheme === "light") {
      syncThemeCookie(resolvedTheme)
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      document.documentElement.classList.remove("theme-transition")
    }
  }, [resolvedTheme, syncThemeCookie])

  const isDarkMode = resolvedTheme === "dark"

  const handleToggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark"
    const root = document.documentElement
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = isReducedMotion ? 0 : 495

    root.classList.add("theme-transition")
    root.style.setProperty("--theme-transition-duration", `${duration}ms`)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      root.classList.remove("theme-transition")
      root.style.removeProperty("--theme-transition-duration")
    }, duration)

    if ("startViewTransition" in document && !isReducedMotion) {
      ;(document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(() => {
        setTheme(nextTheme)
      })
    } else {
      setTheme(nextTheme)
    }

    syncThemeCookie(nextTheme)

    setBurstKey((key) => key + 1)
  }

  return (
    <button
      id="theme-btn"
      aria-label="Toggle theme"
      type="button"
      onClick={handleToggleTheme}
      className="group relative ml-1 mr-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-black/5 bg-white/86 p-0 text-foreground shadow-[0_10px_26px_rgba(15,23,42,0.1)] transition-transform duration-200 hover:scale-105 hover:border-[color:var(--accent)]/30 active:scale-95 dark:border-white/10 dark:bg-[rgba(8,10,18,0.9)] dark:shadow-[0_12px_34px_rgba(0,0,0,0.38)]"
    >
      <span className="pointer-events-none absolute inset-0 theme-toggle-gradient" aria-hidden />
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      <span key={burstKey} className="pointer-events-none absolute inset-0 theme-burst" aria-hidden />
      <span key={resolvedTheme ?? "system"} className="relative inline-flex items-center justify-center theme-icon-in">
        {mounted ? (
          isDarkMode ? <SunMedium className="h-[1.05rem] w-[1.05rem] text-[color:var(--accent)]" /> : <Moon className="h-[1.05rem] w-[1.05rem] text-[color:var(--accent)]" />
        ) : (
          <Moon className="h-[1.05rem] w-[1.05rem] text-[color:var(--accent)]" />
        )}
      </span>
    </button>
  )
}
