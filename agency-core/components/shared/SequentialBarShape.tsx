"use client"

import { motion } from "framer-motion"

type SequentialBarShapeProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  fill?: string
  index?: number
  reduceMotion?: boolean
  orientation?: "vertical" | "horizontal"
}

export function SequentialBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = "currentColor",
  index = 0,
  reduceMotion = false,
  orientation = "vertical",
}: SequentialBarShapeProps) {
  const delay = reduceMotion ? 0 : index * 0.12
  const transition = {
    duration: reduceMotion ? 0 : 0.55,
    delay,
    ease: [0.16, 1, 0.3, 1] as const,
  }

  const style =
    orientation === "horizontal"
      ? { transformOrigin: "left center" }
      : { transformOrigin: "center bottom" }

  const initial = reduceMotion
    ? { opacity: 1, scaleX: 1, scaleY: 1 }
    : orientation === "horizontal"
      ? { opacity: 0, scaleX: 0, scaleY: 1 }
      : { opacity: 0, scaleX: 1, scaleY: 0 }

  const animate = { opacity: 1, scaleX: 1, scaleY: 1 }

  return (
    <motion.rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      rx={8}
      ry={8}
      style={style}
      initial={initial}
      animate={animate}
      transition={transition}
    />
  )
}
