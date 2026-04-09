export class ShippingProviderError extends Error {
  provider: string
  statusCode: number
  originalMessage: string

  constructor(provider: string, statusCode: number, originalMessage: string) {
    super(`[${provider}] ${originalMessage}`)
    this.name = "ShippingProviderError"
    this.provider = provider
    this.statusCode = statusCode
    this.originalMessage = originalMessage
  }
}

export function reportShippingProviderError(error: ShippingProviderError) {
  const payload = {
    provider: error.provider,
    statusCode: error.statusCode,
    originalMessage: error.originalMessage,
    message: error.message,
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("[shipping] provider error", payload)
    return
  }

  // Hook this into the monitoring backend used by the app; keep the error shape stable for observability.
  console.error("[monitoring] shipping provider error", payload)
}
