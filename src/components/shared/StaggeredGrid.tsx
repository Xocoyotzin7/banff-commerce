"use client"

import { motion, useInView, useReducedMotion } from "framer-motion"
import { Children, useRef } from "react"
import type { ReactNode } from "react"

import { cn } from "../../lib/utils"

type StaggeredGridProps = {
  children: ReactNode
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
}

export function StaggeredGrid({ children, className }: StaggeredGridProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const reduceMotion = useReducedMotion() ?? false
  const items = Children.toArray(children)

  return (
    <motion.div
      ref={ref}
      variants={reduceMotion ? undefined : containerVariants}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion ? "visible" : isInView ? "visible" : "hidden"}
      className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4", className)}
    >
      {items.map((child, index) => (
        <motion.div key={index} variants={reduceMotion ? undefined : itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
