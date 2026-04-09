"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PlaneTakeoff } from "lucide-react"

type EntryFlightTransitionProps = {
  enabled: boolean
  destination: "admin" | "client"
  children: ReactNode
}

function FlightOverlay({ destination }: { destination: "admin" | "client" }) {
  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-hidden bg-[#04111a]/95 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_34%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.16),_transparent_30%)]" />
      <motion.div
        className="absolute left-[-20%] top-[18%] h-px w-[140%] bg-gradient-to-r from-transparent via-white/45 to-transparent"
        animate={{ opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[-14%] top-[34%] h-14 w-40 rounded-full bg-primary-400/25 blur-3xl"
        animate={{ x: ["0%", "118%"], opacity: [0.12, 0.52, 0.16] }}
        transition={{ duration: 2.3, repeat: Infinity, ease: [0.43, 0.13, 0.23, 0.96] }}
      />
      <motion.div
        className="absolute left-[-18%] top-[48%] z-20 flex items-center gap-4"
        animate={{ x: ["0vw", "130vw"], y: [0, -14, -4, 0], rotate: [-6, 0, 4, 0] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-2 border-primary/25 bg-primary/12 shadow-[0_0_70px_rgba(1,105,111,0.35)] backdrop-blur-xl">
          <div className="absolute inset-2 rounded-full border border-white/10" />
          <PlaneTakeoff className="h-14 w-14 text-white drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]" />
        </div>
      </motion.div>
    </motion.div>
  )
}

export function EntryFlightTransition({ enabled, destination, children }: EntryFlightTransitionProps) {
  const [ready, setReady] = useState(!enabled)

  useEffect(() => {
    if (!enabled) {
      setReady(true)
      return undefined
    }

    setReady(false)
    const timer = window.setTimeout(() => setReady(true), 2200)
    return () => window.clearTimeout(timer)
  }, [enabled])

  const content = useMemo(
    () => <div className={ready ? "opacity-100" : "opacity-0 pointer-events-none"}>{children}</div>,
    [children, ready]
  )

  return (
    <>
      <AnimatePresence>{!ready ? <FlightOverlay destination={destination} /> : null}</AnimatePresence>
      {content}
    </>
  )
}
