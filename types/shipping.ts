export interface ShippingParcel {
  weight_kg: number
  length_cm: number
  width_cm: number
  height_cm: number
  item_count: number
  billable_weight_kg: number
}

export interface ShippingRate {
  provider: string
  service: string
  price: number
  currency: "MXN" | "CAD"
  days_min: number
  days_max: number
  carrier_logo?: string
  is_urgent: boolean
}
