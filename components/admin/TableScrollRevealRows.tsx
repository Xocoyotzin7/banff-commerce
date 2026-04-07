"use client"

import type { CSSProperties } from "react"
import { Children, cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from "react"

type TableScrollRevealRowsProps = {
  children: React.ReactNode
  className?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function TableScrollRevealRows({ children, className }: TableScrollRevealRowsProps) {
  const containerRef = useRef<HTMLTableSectionElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const rows = useMemo(() => Children.toArray(children), [children])
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const update = () => {
      const rect = node.getBoundingClientRect()
      const viewportHeight = window.innerHeight || 1
      const start = viewportHeight * 0.9
      const end = -rect.height * 0.15
      const progress = clamp((start - rect.top) / Math.max(start - end, 1), 0, 1)
      setVisibleCount(clamp(Math.round(progress * rows.length), 0, rows.length))
      rafRef.current = null
    }

    const onScrollOrResize = () => {
      if (rafRef.current) return
      rafRef.current = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScrollOrResize, { passive: true })
    window.addEventListener("resize", onScrollOrResize)

    return () => {
      window.removeEventListener("scroll", onScrollOrResize)
      window.removeEventListener("resize", onScrollOrResize)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [rows.length])

  return (
    <tbody ref={containerRef} className={className}>
      {rows.map((child, index) => {
        if (!isValidElement(child)) {
          return child
        }

        const visible = index < visibleCount
        return cloneElement(child, {
          style: {
            ...(child.props as { style?: CSSProperties }).style,
            opacity: visible ? 1 : 0,
            transform: visible ? "translate3d(0, 0, 0)" : "translate3d(0, 18px, 0)",
            filter: visible ? "blur(0px)" : "blur(4px)",
            transition:
              "opacity 360ms cubic-bezier(0.22,1,0.36,1), transform 360ms cubic-bezier(0.22,1,0.36,1), filter 360ms cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: `${index * 60}ms`,
            willChange: "opacity, transform, filter",
          },
        })
      })}
    </tbody>
  )
}
