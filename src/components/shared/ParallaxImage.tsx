"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"

import { cn } from "../../lib/utils"

type ParallaxImageProps = {
  src: string
  alt: string
  speed?: number
  priority?: boolean
  className?: string
}

export function ParallaxImage({ src, alt, speed = 0.3, priority = false, className }: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`])
  const height = `calc(100% + ${speed * 200}px)`

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="absolute inset-0" aria-hidden="true">
        <div className="relative h-full w-full" style={{ height }}>
          <Image src={src} alt={alt} fill priority={priority} className="object-cover" sizes="100vw" />
        </div>
      </motion.div>
    </div>
  )
}
