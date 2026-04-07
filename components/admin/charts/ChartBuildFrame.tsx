"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type ChartBuildFrameProps = {
  children: ReactNode
  className?: string
}

export function ChartBuildFrame({ children, className }: ChartBuildFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.26, rootMargin: "0px 0px -8% 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const visible = shouldReduceMotion || isVisible

  return (
    <motion.div
      ref={ref}
      className={cn("relative h-full overflow-hidden rounded-[inherit]", className)}
      initial={false}
      animate={visible ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0, y: 24, scale: 0.985, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      style={{ willChange: "transform, opacity, filter" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(90deg,transparent_0%,rgba(10,110,110,0.08)_35%,rgba(212,160,23,0.1)_50%,rgba(10,110,110,0.08)_65%,transparent_100%)]"
        initial={false}
        animate={visible ? { x: ["-110%", "110%"], opacity: [0, 1, 0] } : { x: "-110%", opacity: 0 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 1.05,
                ease: [0.16, 1, 0.3, 1],
                times: [0, 0.5, 1],
              }
        }
      />
      <div className="relative z-0 h-full w-full">{children}</div>
    </motion.div>
  )
}
