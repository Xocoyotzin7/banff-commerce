import Stripe from "stripe"

const STRIPE_API_VERSION = "2026-02-25.clover"

function resolveStripeSecretKey() {
  const isTestMode = process.env.NODE_ENV !== "production"
  const testKey = process.env.STRIPE_SECRET_KEY_TEST?.trim()
  const liveKey = process.env.STRIPE_SECRET_KEY?.trim()

  if (isTestMode) {
    return testKey || liveKey || null
  }

  return liveKey || testKey || null
}

export function isStripeTestMode() {
  return process.env.NODE_ENV !== "production"
}

export function getStripeClient() {
  const secretKey = resolveStripeSecretKey()

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured")
  }

  return new Stripe(secretKey, {
    apiVersion: STRIPE_API_VERSION as Stripe.LatestApiVersion,
  })
}
