"use client"

import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

type PageTransitionProps = {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    // Reusable route transition layer owned by the agency. It preserves motion continuity across pages.
    <AnimatePresence mode="wait">
      <LayoutGroup id="travel-layout-group">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      </LayoutGroup>
    </AnimatePresence>
  )
}

