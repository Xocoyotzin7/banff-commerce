'use client'

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type AnimatedCardProps = {
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cvvFocused: boolean
  className?: string
}

type CardBrand = "visa" | "mastercard" | "amex" | "generic"

function detectBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, "")
  if (digits.startsWith("4")) return "visa"
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"
  return "generic"
}

function formatCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "").slice(0, 16)
  const padded = digits.padEnd(16, "X")
  return padded.match(/.{1,4}/g)?.join(" ") ?? "XXXX XXXX XXXX XXXX"
}

function formatExpiry(month: string, year: string) {
  const mm = month.replace(/\D/g, "").slice(0, 2).padStart(2, "X")
  const yy = year.replace(/\D/g, "").slice(-2).padStart(2, "X")
  return `${mm}/${yy}`
}

function brandLabel(brand: CardBrand) {
  switch (brand) {
    case "visa":
      return "VISA"
    case "mastercard":
      return "MASTERCARD"
    case "amex":
      return "AMEX"
    default:
      return "CARD"
  }
}

function DigitSlots({ value }: { value: string }) {
  return (
    <span className="inline-flex gap-[0.16em]">
      {value.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.08 }}
          className={cn(
            "inline-block min-w-[0.55em] text-center",
            char === "X" ? "text-white/35" : "text-white",
          )}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )
}

export function AnimatedCard({
  cardNumber,
  cardholderName,
  expiryMonth,
  expiryYear,
  cvvFocused,
  className,
}: AnimatedCardProps) {
  const brand = detectBrand(cardNumber)
  const maskedNumber = formatCardNumber(cardNumber)
  const expiry = formatExpiry(expiryMonth, expiryYear)
  const displayName = cardholderName.trim() || "CARDHOLDER NAME"

  return (
    <div className={cn("w-full", className)} style={{ perspective: 1200 }}>
      <motion.div
        className="relative h-56 w-full rounded-[32px] transition-transform duration-700 [transform-style:preserve-3d]"
        animate={{ rotateY: cvvFocused ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-5 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.20),transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/55">Payment card</div>
                <div className="mt-1 text-sm font-medium text-white/80">Secure checkout</div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                {brandLabel(brand)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-[1.18rem] font-medium tracking-[0.24em]">
                <DigitSlots value={maskedNumber} />
              </div>

              <div className="grid grid-cols-[1.2fr_0.6fr_auto] gap-4 text-sm">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Cardholder</div>
                  <div className="mt-1 truncate font-medium uppercase">{displayName}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Expiry</div>
                  <div className="mt-1 font-medium">{expiry}</div>
                </div>
                <div className="ml-auto flex h-10 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-500 text-[0.55rem] font-bold uppercase tracking-[0.18em] text-slate-900 shadow-inner">
                  chip
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-800 via-slate-950 to-black p-5 text-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.85)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="absolute inset-x-0 top-6 h-10 bg-black/85" />
          <div className="relative mt-20 flex items-center justify-between gap-4">
            <div className="h-10 flex-1 rounded-lg bg-white/90" />
            <div className="flex h-10 w-24 items-center justify-end rounded-lg bg-white/90 px-3 text-sm font-semibold text-slate-900">
              CVV
            </div>
          </div>
          <div className="relative mt-5 text-right text-xs uppercase tracking-[0.24em] text-white/55">
            Card verification flips the card
          </div>
        </div>
      </motion.div>
    </div>
  )
}
