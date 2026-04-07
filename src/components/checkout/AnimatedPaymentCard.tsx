"use client"

import { motion } from "framer-motion"

import { cn } from "../../lib/utils"

type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "default"

type AnimatedPaymentCardProps = {
  cardNumber: string
  holderName: string
  expiry: string
  cvv: string
  cvvFocused: boolean
}

function detectBrand(number: string): CardBrand {
  const digits = number.replace(/\D/g, "")
  if (digits.startsWith("4")) return "visa"
  if (/^(5[1-5])/.test(digits)) return "mastercard"
  if (/^(34|37)/.test(digits)) return "amex"
  if (/^(6011|622|64|65)/.test(digits)) return "discover"
  return "default"
}

function formatCardNumber(number: string) {
  const digits = number.replace(/\D/g, "").slice(0, 16)
  const padded = (digits || "4242424242424242").padEnd(16, "4")
  return Array.from({ length: 4 }, (_, groupIndex) => padded.slice(groupIndex * 4, groupIndex * 4 + 4))
}

function formatHolderName(name: string) {
  return (name || "LATAM TRAVELER").toUpperCase()
}

function brandStyle(brand: CardBrand) {
  switch (brand) {
    case "visa":
      return "bg-[linear-gradient(135deg,#1a1f71_0%,#0047AB_100%)]"
    case "mastercard":
      return "bg-[linear-gradient(135deg,#EB001B_0%,#F79E1B_100%)]"
    case "amex":
      return "bg-[linear-gradient(135deg,#007B5E_0%,#00B09B_100%)]"
    case "discover":
      return "bg-[linear-gradient(135deg,#5A2D82_0%,#FF6000_100%)]"
    default:
      return "bg-[linear-gradient(135deg,rgba(10,110,110,0.95)_0%,rgba(20,34,34,0.98)_55%,rgba(232,93,38,0.8)_100%)]"
  }
}

function CardLogo({ brand }: { brand: CardBrand }) {
  const label =
    brand === "visa" ? "VISA" : brand === "mastercard" ? "Mastercard" : brand === "amex" ? "AMEX" : brand === "discover" ? "Discover" : "LATAM"

  return <span className="text-lg font-semibold tracking-[0.28em]">{label}</span>
}

function ContactlessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white/84" aria-hidden="true">
      <path d="M7 12a5 5 0 0 1 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4.5 12a7.5 7.5 0 0 1 7.5-7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10 12a2 2 0 0 1 2-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.5 12A6.5 6.5 0 0 0 10 5.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function Chip() {
  return (
    <div className="relative h-11 w-14 overflow-hidden rounded-xl border border-[rgba(212,160,23,0.32)] bg-[linear-gradient(135deg,#d4a017_0%,#f6d36b_38%,#8e6510_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_18px_rgba(0,0,0,0.28)]">
      <span className="absolute inset-x-2 top-2 h-px bg-black/20" />
      <span className="absolute inset-x-2 top-5 h-px bg-black/20" />
      <span className="absolute bottom-2 left-2 right-2 h-px bg-black/20" />
      <span className="absolute left-5 top-2 bottom-2 w-px bg-black/20" />
    </div>
  )
}

function SideDots() {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className="h-1.5 w-1.5 rounded-full bg-white/60" />
      ))}
    </div>
  )
}

export function AnimatedPaymentCard({ cardNumber, holderName, expiry, cvv, cvvFocused }: AnimatedPaymentCardProps) {
  const brand = detectBrand(cardNumber)
  const groups = formatCardNumber(cardNumber)
  const formattedHolder = formatHolderName(holderName)
  const displayExpiry = expiry || "MM/YY"

  return (
    <div className="perspective-[1000px]">
      <motion.div
        animate={{ rotateY: cvvFocused ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-56 w-full"
      >
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-[1.8rem] border border-white/12 p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]",
            brandStyle(brand),
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/58">Payment card</p>
              <CardLogo brand={brand} />
            </div>
            <div className="flex items-center gap-3">
              <ContactlessIcon />
              <Chip />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-4 gap-2 text-[1.55rem] tracking-[0.2em]">
              {groups.map((group, groupIndex) => (
                <div key={`${group}-${groupIndex}`} className="flex gap-1">
                  {group.split("").map((digit, digitIndex) => (
                    <motion.span
                      key={`${digit}-${groupIndex}-${digitIndex}`}
                      initial={{ y: 14, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: (groupIndex * 4 + digitIndex) * 0.03, type: "spring", stiffness: 320, damping: 22 }}
                    >
                      {digit}
                    </motion.span>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Cardholder</p>
                <p className="flex flex-wrap gap-0.5 text-sm font-medium tracking-[0.24em] text-white">
                  {formattedHolder.split("").map((letter, index) => (
                    <motion.span
                      key={`${letter}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] uppercase tracking-[0.32em] text-white/54">Expiry</p>
                <p className="text-sm font-medium tracking-[0.22em] text-white">{displayExpiry}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 overflow-hidden rounded-[1.8rem] border border-white/12 bg-[linear-gradient(135deg,rgba(14,26,26,0.98),rgba(6,13,13,0.98)_55%,rgba(0,0,0,0.96))] p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="mt-3 h-12 w-full rounded-md bg-black/70" />
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 rounded-md bg-white px-4 py-3 text-right text-sm font-semibold text-black">
              {cvv || "•••"}
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.34em] text-white/46">CVV</p>
              <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/68">Security code</p>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between">
            <CardLogo brand={brand} />
            <SideDots />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
