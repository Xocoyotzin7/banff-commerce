"use client"

import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import type { MouseEvent, ReactNode } from "react"

import { cn } from "@banff/agency-core/lib/utils"

type MagneticButtonProps = {
  href: string
  children: ReactNode
  className?: string
}

const MAX_DISTANCE = 80
const MAX_DISPLACEMENT = 12

function useMagneticMotion() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 })
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 })

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = event.clientX - centerX
    const deltaY = event.clientY - centerY
    const distance = Math.hypot(deltaX, deltaY)

    if (distance > MAX_DISTANCE) {
      mouseX.set(0)
      mouseY.set(0)
      return
    }

    const force = (1 - distance / MAX_DISTANCE) * MAX_DISPLACEMENT
    const normalizedX = distance === 0 ? 0 : (deltaX / distance) * force
    const normalizedY = distance === 0 ? 0 : (deltaY / distance) * force

    mouseX.set(normalizedX)
    mouseY.set(normalizedY)
  }

  const reset = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return {
    springX,
    springY,
    handleMove,
    reset,
  }
}

export function MagneticButton({ href, children, className }: MagneticButtonProps) {
  const { springX, springY, handleMove, reset } = useMagneticMotion()

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      <Link
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={cn(
          "inline-flex items-center justify-center rounded-full border border-white/12 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur-xl transition-[box-shadow,background-color,border-color] hover:border-white/20 hover:bg-white/12 hover:shadow-[0_0_28px_rgba(10,110,110,0.24)]",
          className,
        )}
      >
        {children}
      </Link>
    </motion.div>
  )
}

