import { describe, expect, it } from "vitest"

import { calculateCartShipping } from "@/lib/shipping/cart-weight"

describe("calculateCartShipping", () => {
  it("returns the item totals for a single item", () => {
    const result = calculateCartShipping([
      {
        weight_kg: 2.5,
        length_cm: 30,
        width_cm: 20,
        height_cm: 10,
        quantity: 1,
      },
    ])

    expect(result).toEqual({
      weight_kg: 2.5,
      length_cm: 30,
      width_cm: 20,
      height_cm: 10,
      item_count: 1,
      billable_weight_kg: 2.5,
    })
  })

  it("aggregates multiple items using summed weight and max dimensions", () => {
    const result = calculateCartShipping([
      {
        weight_kg: 1.25,
        length_cm: 24,
        width_cm: 18,
        height_cm: 10,
        quantity: 2,
      },
      {
        weight_kg: 3,
        length_cm: 32,
        width_cm: 22,
        height_cm: 14,
        quantity: 1,
      },
    ])

    expect(result.weight_kg).toBeCloseTo(5.5, 6)
    expect(result.length_cm).toBe(32)
    expect(result.width_cm).toBe(22)
    expect(result.height_cm).toBe(14)
    expect(result.item_count).toBe(3)
    expect(result.billable_weight_kg).toBeCloseTo(5.5, 6)
  })

  it("uses volumetric weight when it is higher than actual weight", () => {
    const result = calculateCartShipping([
      {
        weight_kg: 2,
        length_cm: 100,
        width_cm: 50,
        height_cm: 50,
        quantity: 1,
      },
    ])

    expect(result.weight_kg).toBe(2)
    expect(result.billable_weight_kg).toBeCloseTo(50, 6)
  })
})
