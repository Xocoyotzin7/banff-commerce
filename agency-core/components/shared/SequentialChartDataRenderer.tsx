"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"

type SequentialChartDataRendererProps<T> = {
  data: readonly T[]
  active: boolean
  reduceMotion?: boolean
  initialDelayMs?: number
  stepMs?: number
  children: (state: {
    data: readonly T[]
    complete: boolean
    visibleCount: number
  }) => ReactNode
}

export function SequentialChartDataRenderer<T>({
  data,
  active,
  reduceMotion = false,
  initialDelayMs = 120,
  stepMs = 90,
  children,
}: SequentialChartDataRendererProps<T>) {
  const [visibleCount, setVisibleCount] = useState(reduceMotion ? data.length : 0)

  useEffect(() => {
    if (reduceMotion) {
      setVisibleCount(data.length)
      return
    }

    if (!active || data.length === 0) {
      setVisibleCount(0)
      return
    }

    let cancelled = false
    let interval: ReturnType<typeof setInterval> | null = null

    setVisibleCount(0)

    const timeout = window.setTimeout(() => {
      if (cancelled) return

      setVisibleCount(1)
      let current = 1

      if (data.length === 1) {
        return
      }

      interval = window.setInterval(() => {
        if (cancelled) return

        current += 1
        setVisibleCount(Math.min(current, data.length))

        if (current >= data.length && interval) {
          window.clearInterval(interval)
          interval = null
        }
      }, stepMs)
    }, initialDelayMs)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
      if (interval) {
        window.clearInterval(interval)
      }
    }
  }, [active, data.length, initialDelayMs, reduceMotion, stepMs])

  const visibleData = useMemo(() => data.slice(0, visibleCount), [data, visibleCount])
  const complete = reduceMotion || visibleCount >= data.length

  return <>{children({ data: visibleData, complete, visibleCount })}</>
}
