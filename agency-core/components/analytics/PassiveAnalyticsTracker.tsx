"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

type AnalyticsSnapshot = {
  pagePath: string
  pageType: string
  destinationSlug: string | null
  packageId: string | null
  sessionId: string
  visitorId: string
  locale: string
  referrerUrl: string
  startedAt: number
  maxScrollDepth: number
}

type AnalyticsPayload = {
  pagePath: string
  pageType: string
  destinationSlug: string | null
  packageId: string | null
  sessionId: string
  visitorId: string
  timeOnPage: number
  scrollDepth: number
  locale: string
  referrerUrl: string
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function getSessionId() {
  if (typeof window === "undefined") return randomId()
  const key = "banff_session_id"
  const existing = window.sessionStorage.getItem(key)
  if (existing) return existing
  const next = randomId()
  window.sessionStorage.setItem(key, next)
  return next
}

function getVisitorId() {
  if (typeof window === "undefined") return randomId()
  const key = "banff_visitor_id"
  const existing = window.localStorage.getItem(key)
  if (existing) return existing
  const next = randomId()
  window.localStorage.setItem(key, next)
  return next
}

function getLocale() {
  if (typeof document === "undefined") return "es-MX"
  return document.documentElement.lang || navigator.language || "es-MX"
}

function getPageType(pathname: string): { pageType: string; destinationSlug: string | null; packageId: string | null } {
  if (pathname === "/") {
    return { pageType: "home", destinationSlug: null, packageId: null }
  }

  if (pathname.startsWith("/destinations/")) {
    return { pageType: "destination", destinationSlug: pathname.split("/")[2] ?? null, packageId: null }
  }

  if (pathname.startsWith("/blog/")) {
    return { pageType: "blog", destinationSlug: pathname.split("/")[2] ?? null, packageId: null }
  }

  if (pathname.startsWith("/packages/")) {
    return { pageType: "package", destinationSlug: null, packageId: pathname.split("/")[2] ?? null }
  }

  if (pathname.startsWith("/checkout")) {
    const search = new URLSearchParams(window.location.search)
    return {
      pageType: "checkout",
      destinationSlug: search.get("destinationSlug"),
      packageId: search.get("packageId"),
    }
  }

  return { pageType: pathname.replace(/^\/+/, "") || "page", destinationSlug: null, packageId: null }
}

function getScrollDepth() {
  if (typeof document === "undefined") return 0
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
  const scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1

  if (scrollHeight <= viewportHeight) return 100
  const depth = ((scrollTop + viewportHeight) / scrollHeight) * 100
  return Math.max(0, Math.min(100, Math.round(depth)))
}

function sendPayload(payload: AnalyticsPayload) {
  const body = JSON.stringify(payload)
  const blob = new Blob([body], { type: "application/json" })

  // Beacon first, fetch fallback second. This keeps unload tracking resilient.
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/track", blob)
    return
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  })
}

export function PassiveAnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const snapshotRef = useRef<AnalyticsSnapshot | null>(null)

  useEffect(() => {
    // Passive analytics boundary: keep it client-side, low overhead, and out of admin/API routes.
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
      return
    }

    const flush = () => {
      const current = snapshotRef.current
      if (!current) return

      const timeOnPage = Math.max(0, Math.round((performance.now() - current.startedAt) / 1000))
      if (!current.pagePath || current.pagePath.startsWith("/admin")) return

      sendPayload({
        pagePath: current.pagePath,
        pageType: current.pageType,
        destinationSlug: current.destinationSlug,
        packageId: current.packageId,
        sessionId: current.sessionId,
        visitorId: current.visitorId,
        timeOnPage,
        scrollDepth: current.maxScrollDepth,
        locale: current.locale,
        referrerUrl: current.referrerUrl,
      })
      snapshotRef.current = null
    }

    const routeContext = getPageType(pathname)
    snapshotRef.current = {
      pagePath: `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      pageType: routeContext.pageType,
      destinationSlug: routeContext.destinationSlug,
      packageId: routeContext.packageId,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      locale: getLocale(),
      referrerUrl: document.referrer || window.location.href,
      startedAt: performance.now(),
      maxScrollDepth: getScrollDepth(),
    }

    const onScroll = () => {
      const current = snapshotRef.current
      if (!current) return
      current.maxScrollDepth = Math.max(current.maxScrollDepth, getScrollDepth())
    }

    const onPageHide = () => flush()
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush()
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("pagehide", onPageHide)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("pagehide", onPageHide)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      flush()
    }
  }, [pathname, searchParams])

  return null
}

