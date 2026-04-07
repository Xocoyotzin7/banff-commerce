"use client"

import { type ReactNode, useEffect, useState } from "react"

type DeferredChartMountProps = {
  active: boolean
  delayMs?: number
  children: ReactNode
}

export function DeferredChartMount({ active, delayMs = 180, children }: DeferredChartMountProps) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (!active) {
      setShouldRender(false)
      return
    }

    const timer = window.setTimeout(() => {
      setShouldRender(true)
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [active, delayMs])

  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}
