"use client"

import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

const steps = ["Selección", "Datos", "Pago"] as const

type CheckoutStepperProps = {
  currentStep: 1 | 2 | 3
}

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="space-y-4 rounded-[1.7rem] border border-white/10 bg-white/7 p-5 backdrop-blur-xl">
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left rounded-full bg-[color:var(--primary)]"
          initial={false}
          animate={{ scaleX: currentStep / 3 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, index) => {
          const active = currentStep === index + 1
          const done = currentStep > index + 1

          return (
            <div key={step} className="flex flex-col items-center gap-2 text-center">
              <motion.div
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold",
                  active || done ? "border-[color:var(--primary)] bg-[color:rgba(10,110,110,0.18)] text-text" : "border-white/10 bg-black/20 text-text-muted",
                )}
              >
                {index + 1}
              </motion.div>
              <span className={cn("text-xs uppercase tracking-[0.3em]", active || done ? "text-text" : "text-text-muted")}>{step}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
