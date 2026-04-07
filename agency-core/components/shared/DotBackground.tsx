"use client"

import { useEffect, useRef } from "react"

import { cn } from "@banff/agency-core/lib/utils"

type DotBackgroundProps = {
  className?: string
  quantity?: number
  speed?: number
  accentRatio?: number
  baseColor?: string
  accentColor?: string
  opacity?: number
}

type Dot = {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
}

export function DotBackground({
  className,
  quantity = 96,
  speed = 0.35,
  accentRatio = 0.18,
  baseColor = "94, 82, 71",
  accentColor = "127, 105, 255",
  opacity = 1,
}: DotBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const dotsRef = useRef<Dot[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const particleCount = Math.max(0, Math.floor(quantity))
    const normalizedAccentRatio = Math.min(1, Math.max(0, accentRatio))

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches
      const effectiveCount = isDesktop ? Math.round(particleCount * 1.15) : particleCount
      const accentCount = Math.round(effectiveCount * normalizedAccentRatio)
      const accentMap = Array.from({ length: effectiveCount }, (_, index) => index < accentCount)

      for (let index = accentMap.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(Math.random() * (index + 1))
        ;[accentMap[index], accentMap[swap]] = [accentMap[swap], accentMap[index]]
      }

      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${Math.floor(rect.width)}px`
      canvas.style.height = `${Math.floor(rect.height)}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      dotsRef.current = Array.from({ length: effectiveCount }, (_, index) => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        radius: accentMap[index] ? 1.2 + Math.random() * 1.6 : 0.75 + Math.random() * 1.4,
        alpha: accentMap[index] ? 0.55 + Math.random() * 0.3 : 0.14 + Math.random() * 0.38,
        color: accentMap[index] ? accentColor : baseColor,
      }))
    }

    const draw = () => {
      const rect = container.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      for (const dot of dotsRef.current) {
        dot.x += dot.vx
        dot.y += dot.vy

        if (dot.x <= 0 || dot.x >= rect.width) dot.vx *= -1
        if (dot.y <= 0 || dot.y >= rect.height) dot.vy *= -1

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dot.color}, ${dot.alpha})`
        ctx.fill()
      }

      rafRef.current = window.requestAnimationFrame(draw)
    }

    resize()
    rafRef.current = window.requestAnimationFrame(draw)
    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [accentColor, accentRatio, baseColor, quantity, speed])

  return (
    <div ref={containerRef} className={cn("pointer-events-none absolute inset-0", className)} style={{ opacity }}>
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
    </div>
  )
}
