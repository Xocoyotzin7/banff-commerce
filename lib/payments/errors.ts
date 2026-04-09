export class PaymentProviderError extends Error {
  provider: "stripe" | "openpay"
  statusCode: number
  originalMessage: string

  constructor(provider: "stripe" | "openpay", statusCode: number, originalMessage: string) {
    super(`${provider} provider error`)
    this.name = "PaymentProviderError"
    this.provider = provider
    this.statusCode = statusCode
    this.originalMessage = originalMessage
  }
}
