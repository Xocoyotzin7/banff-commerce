import type { ShippingParcel } from "@/types/shipping"

export interface CartItem {
  weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  quantity: number
}

export function calculateVolumetricWeightKg(lengthCm: number, widthCm: number, heightCm: number): number {
  return (lengthCm * widthCm * heightCm) / 5000
}

export function calculateCartShipping(items: CartItem[]): ShippingParcel {
  if (!items.length) {
    return {
      weight_kg: 0,
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      item_count: 0,
      billable_weight_kg: 0,
    }
  }

  const parcel = items.reduce(
    (accumulator, item) => {
      const quantity = Math.max(0, item.quantity)
      const weight = Math.max(0, item.weight_kg)

      accumulator.weight_kg += weight * quantity
      accumulator.length_cm = Math.max(accumulator.length_cm, item.length_cm)
      accumulator.width_cm = Math.max(accumulator.width_cm, item.width_cm)
      accumulator.height_cm = Math.max(accumulator.height_cm, item.height_cm)
      accumulator.item_count += quantity

      return accumulator
    },
    {
      weight_kg: 0,
      length_cm: 0,
      width_cm: 0,
      height_cm: 0,
      item_count: 0,
    },
  )

  const volumetricWeightKg = calculateVolumetricWeightKg(parcel.length_cm, parcel.width_cm, parcel.height_cm)

  return {
    ...parcel,
    billable_weight_kg: Math.max(parcel.weight_kg, volumetricWeightKg),
  }
}
