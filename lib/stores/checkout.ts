import { create } from "zustand"

import type { ShippingRate } from "@/types/shipping"
import type { PaymentProvider } from "@/types/payment-methods"

type CheckoutStore = {
  shippingRate: ShippingRate | null
  setShippingRate: (shippingRate: ShippingRate | null) => void
  clearShippingRate: () => void
  paymentMethodId: string | null
  paymentProvider: PaymentProvider | null
  paymentToken: string | null
  setPaymentMethod: (input: {
    paymentMethodId: string | null
    paymentProvider: PaymentProvider | null
    paymentToken: string | null
  }) => void
  clearPaymentMethod: () => void
}

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  shippingRate: null,
  setShippingRate: (shippingRate) => set({ shippingRate }),
  clearShippingRate: () => set({ shippingRate: null }),
  paymentMethodId: null,
  paymentProvider: null,
  paymentToken: null,
  setPaymentMethod: (input) => set(input),
  clearPaymentMethod: () => set({ paymentMethodId: null, paymentProvider: null, paymentToken: null }),
}))
