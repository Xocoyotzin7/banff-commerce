import { NotImplementedError } from "@/lib/db"

export type OpenpayChargeInput = {
  amount: number
  currency: string
  country: string
  email?: string
  metadata?: Record<string, string>
}

export async function createOpenpayCharge(_input: OpenpayChargeInput): Promise<never> {
  // Third-party payment provider adapter placeholder. Keep this unimplemented until Openpay credentials and flow are contracted.
  throw new NotImplementedError("Openpay gateway is not connected yet")
}
