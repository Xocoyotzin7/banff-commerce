import type { Metadata } from "next"
import { Suspense } from "react"

import { CheckoutFlow } from "../../components/checkout/CheckoutFlow"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Premium travel checkout with geo-aware payment routing.",
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32 text-text-muted">Loading checkout…</div>}>
      <CheckoutFlow />
    </Suspense>
  )
}
