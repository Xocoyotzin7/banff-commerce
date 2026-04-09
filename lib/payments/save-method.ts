import { and, desc, eq, isNotNull } from "drizzle-orm"

import { getStripeClient } from "@/lib/stripe"
import { getDb, paymentMethods, users } from "@/lib/db"
import type { NeonDb } from "@/lib/db/adapters/neon"
import { PaymentProviderError } from "@/lib/payments/errors"
import { deleteDemoPaymentMethod, listDemoPaymentMethods, saveDemoPaymentMethod } from "@/lib/payments/demo"
import type { PaymentCountry, PaymentProvider, SavePaymentMethodInput, SavedPaymentMethod } from "@/types/payment-methods"

type PaymentMethodDatabase = Pick<NeonDb, "select" | "insert" | "delete" | "update">

type ProviderCardDetails = {
  brand: string
  last4: string
  expMonth: number
  expYear: number
}

type SaveMethodContext = {
  userId: string
  email: string
  fullName: string
}

function normalizeCountry(country: string): PaymentCountry {
  return country.trim().toUpperCase() === "MX" ? "MX" : "CA"
}

function normalizeBrand(value?: string | null, country?: PaymentCountry): string {
  const raw = value?.trim().toLowerCase()
  if (raw === "visa" || raw === "mastercard" || raw === "amex" || raw === "discover") return raw
  return country === "MX" ? "mastercard" : "visa"
}

function normalizeLast4(value?: string | null) {
  const digits = value?.replace(/[^\d]/g, "") ?? ""
  if (digits.length >= 4) return digits.slice(-4)
  return "4242"
}

function normalizeMonth(value?: number | null) {
  return Number.isFinite(value ?? NaN) && (value ?? 0) > 0 ? Number(value) : 12
}

function normalizeYear(value?: number | null) {
  const currentYear = new Date().getFullYear()
  return Number.isFinite(value ?? NaN) && (value ?? 0) > 0 ? Number(value) : currentYear + 3
}

function rowToSafeMethod(row: Record<string, unknown>): SavedPaymentMethod {
  return {
    id: String(row.id),
    country: normalizeCountry(String(row.country ?? "CA")),
    provider: row.provider === "stripe" ? "stripe" : "openpay",
    cardBrand: normalizeBrand(String(row.cardBrand ?? row.card_brand ?? ""), normalizeCountry(String(row.country ?? "CA"))),
    cardLast4: normalizeLast4(String(row.cardLast4 ?? row.card_last4 ?? "")),
    cardExpMonth: normalizeMonth(Number(row.cardExpMonth ?? row.card_exp_month ?? 0)),
    cardExpYear: normalizeYear(Number(row.cardExpYear ?? row.card_exp_year ?? 0)),
    isDefault: Boolean(row.isDefault ?? row.is_default),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString()),
  }
}

async function loadUserContext(database: PaymentMethodDatabase, userId: string): Promise<SaveMethodContext> {
  const rows = await database
    .select({
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const user = rows[0]
  if (!user) {
    throw new Error("User not found")
  }

  return {
    userId,
    email: user.email,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email,
  }
}

async function getExistingCustomerId(
  database: PaymentMethodDatabase,
  userId: string,
  country: PaymentCountry,
  provider: PaymentProvider,
): Promise<string | null> {
  const rows = await database
    .select({
      stripeCustomerId: paymentMethods.stripeCustomerId,
      openpayCustomerId: paymentMethods.openpayCustomerId,
    })
    .from(paymentMethods)
    .where(
      and(
        eq(paymentMethods.userId, userId),
        eq(paymentMethods.country, country),
        provider === "stripe" ? isNotNull(paymentMethods.stripeCustomerId) : isNotNull(paymentMethods.openpayCustomerId),
      ),
    )
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt))
    .limit(1)

  if (!rows[0]) return null
  return provider === "stripe" ? rows[0].stripeCustomerId ?? null : rows[0].openpayCustomerId ?? null
}

async function getMethodCount(database: PaymentMethodDatabase, userId: string, country: PaymentCountry) {
  const rows = await database
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.country, country)))

  return rows.length
}

function ensureDetails(input: SavePaymentMethodInput, fallback: ProviderCardDetails): ProviderCardDetails {
  return {
    brand: normalizeBrand(input.cardBrand ?? fallback.brand, input.country),
    last4: normalizeLast4(input.cardLast4 ?? fallback.last4),
    expMonth: normalizeMonth(input.cardExpMonth ?? fallback.expMonth),
    expYear: normalizeYear(input.cardExpYear ?? fallback.expYear),
  }
}

function resolveOpenpayConfig() {
  const merchantId = process.env.OPENPAY_MERCHANT_ID?.trim()
  const privateKey = process.env.OPENPAY_PRIVATE_KEY?.trim()

  if (!merchantId || !privateKey) {
    throw new Error("Openpay credentials are not configured")
  }

  return {
    merchantId,
    privateKey,
    baseUrl: process.env.OPENPAY_IS_SANDBOX === "true" ? "https://sandbox-api.openpay.co" : "https://api.openpay.co",
  }
}

async function setDefaultFlag(database: PaymentMethodDatabase, userId: string, country: PaymentCountry) {
  await database
    .update(paymentMethods)
    .set({ isDefault: false })
    .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.country, country)))
}

export async function listSavedPaymentMethods(userId: string) {
  const database = getDb()

  if (database.kind === "sqlite") {
    return listDemoPaymentMethods(userId)
  }

  const rows = await database.db
    .select({
      id: paymentMethods.id,
      country: paymentMethods.country,
      stripePaymentMethodId: paymentMethods.stripePaymentMethodId,
      openpayCardId: paymentMethods.openpayCardId,
      cardBrand: paymentMethods.cardBrand,
      cardLast4: paymentMethods.cardLast4,
      cardExpMonth: paymentMethods.cardExpMonth,
      cardExpYear: paymentMethods.cardExpYear,
      isDefault: paymentMethods.isDefault,
      createdAt: paymentMethods.createdAt,
    })
    .from(paymentMethods)
    .where(eq(paymentMethods.userId, userId))
    .orderBy(desc(paymentMethods.isDefault), desc(paymentMethods.createdAt))

  return rows.map((row) =>
    rowToSafeMethod({
      id: row.id,
      country: row.country,
      provider: row.stripePaymentMethodId ? "stripe" : "openpay",
      cardBrand: row.cardBrand,
      cardLast4: row.cardLast4,
      cardExpMonth: row.cardExpMonth,
      cardExpYear: row.cardExpYear,
      isDefault: row.isDefault,
      createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
    }),
  )
}

export async function savePaymentMethod(userId: string, input: SavePaymentMethodInput): Promise<SavedPaymentMethod> {
  const database = getDb()
  const country = normalizeCountry(input.country)

  if (database.kind === "sqlite") {
    return saveDemoPaymentMethod(userId, input)
  }

  const context = await loadUserContext(database.db, userId)
  const provider: PaymentProvider = country === "CA" ? "stripe" : "openpay"
  const shouldBecomeDefault = input.isDefault ?? (await getMethodCount(database.db, userId, country)) === 0

  if (provider === "stripe") {
    const stripe = getStripeClient()
    let customerId = await getExistingCustomerId(database.db, userId, country, "stripe")

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: context.email,
        name: context.fullName,
        metadata: { userId },
      })
      customerId = customer.id
    }

    try {
      const paymentMethod = await stripe.paymentMethods.attach(input.providerToken, { customer: customerId })
      const details = ensureDetails(input, {
        brand: paymentMethod.card?.brand ?? "visa",
        last4: paymentMethod.card?.last4 ?? "4242",
        expMonth: paymentMethod.card?.exp_month ?? 12,
        expYear: paymentMethod.card?.exp_year ?? new Date().getFullYear() + 3,
      })

      if (shouldBecomeDefault) {
        await setDefaultFlag(database.db, userId, country)
      }

      const inserted = await database.db
        .insert(paymentMethods)
        .values({
          userId,
          country,
          stripePaymentMethodId: paymentMethod.id,
          stripeCustomerId: customerId,
          cardBrand: details.brand,
          cardLast4: details.last4,
          cardExpMonth: details.expMonth,
          cardExpYear: details.expYear,
          isDefault: shouldBecomeDefault,
        })
        .returning({
          id: paymentMethods.id,
          country: paymentMethods.country,
          cardBrand: paymentMethods.cardBrand,
          cardLast4: paymentMethods.cardLast4,
          cardExpMonth: paymentMethods.cardExpMonth,
          cardExpYear: paymentMethods.cardExpYear,
          isDefault: paymentMethods.isDefault,
          createdAt: paymentMethods.createdAt,
        })

      const row = inserted[0]
      if (!row) throw new Error("Unable to save payment method")

      return {
        id: row.id,
        country: normalizeCountry(row.country),
        provider: "stripe",
        cardBrand: String(row.cardBrand),
        cardLast4: String(row.cardLast4),
        cardExpMonth: Number(row.cardExpMonth),
        cardExpYear: Number(row.cardExpYear),
        isDefault: Boolean(row.isDefault),
        createdAt: row.createdAt.toISOString(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new PaymentProviderError("stripe", 400, error.message)
      }
      throw new PaymentProviderError("stripe", 400, "Unable to save Stripe payment method")
    }
  }

  let customerId = await getExistingCustomerId(database.db, userId, country, "openpay")
  if (!customerId) {
    const openpay = resolveOpenpayConfig()
    const response = await fetch(`${openpay.baseUrl}/v1/${openpay.merchantId}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${openpay.merchantId}:${openpay.privateKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        name: context.fullName.split(" ")[0] || context.fullName,
        last_name: context.fullName.split(" ").slice(1).join(" ") || context.fullName,
        email: context.email,
        external_id: userId,
      }),
    })

    if (!response.ok) {
      const message = await response.text()
      throw new PaymentProviderError("openpay", response.status, message || "Unable to create Openpay customer")
    }

    const customer = (await response.json()) as { id?: string }
    customerId = customer.id ?? null
  }

  if (!customerId) {
    throw new PaymentProviderError("openpay", 500, "Unable to resolve Openpay customer")
  }

  const openpay = resolveOpenpayConfig()
  const cardResponse = await fetch(
    `${openpay.baseUrl}/v1/${openpay.merchantId}/customers/${customerId}/cards`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${openpay.merchantId}:${openpay.privateKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        token_id: input.providerToken,
      }),
    },
  )

  if (!cardResponse.ok) {
    const message = await cardResponse.text()
    throw new PaymentProviderError("openpay", cardResponse.status, message || "Unable to save Openpay card")
  }

  const card = (await cardResponse.json()) as {
    id?: string
    brand?: string
    card_number?: string
    expiration_month?: string | number
    expiration_year?: string | number
  }

  const details = ensureDetails(input, {
    brand: card.brand ?? "mastercard",
    last4: card.card_number?.slice(-4) ?? "4242",
    expMonth: Number(card.expiration_month ?? 12),
    expYear: Number(card.expiration_year ?? new Date().getFullYear() + 3),
  })

  if (shouldBecomeDefault) {
    await setDefaultFlag(database.db, userId, country)
  }

  const inserted = await database.db
    .insert(paymentMethods)
    .values({
      userId,
      country,
      openpayCardId: card.id ?? input.providerToken,
      openpayCustomerId: customerId,
      cardBrand: details.brand,
      cardLast4: details.last4,
      cardExpMonth: details.expMonth,
      cardExpYear: details.expYear,
      isDefault: shouldBecomeDefault,
    })
    .returning({
      id: paymentMethods.id,
      country: paymentMethods.country,
      cardBrand: paymentMethods.cardBrand,
      cardLast4: paymentMethods.cardLast4,
      cardExpMonth: paymentMethods.cardExpMonth,
      cardExpYear: paymentMethods.cardExpYear,
      isDefault: paymentMethods.isDefault,
      createdAt: paymentMethods.createdAt,
    })

  const row = inserted[0]
  if (!row) {
    throw new PaymentProviderError("openpay", 500, "Unable to save payment method")
  }

  return {
    id: row.id,
    country: normalizeCountry(row.country),
    provider: "openpay",
    cardBrand: String(row.cardBrand),
    cardLast4: String(row.cardLast4),
    cardExpMonth: Number(row.cardExpMonth),
    cardExpYear: Number(row.cardExpYear),
    isDefault: Boolean(row.isDefault),
    createdAt: row.createdAt.toISOString(),
  }
}

export async function deletePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  const database = getDb()

  if (database.kind === "sqlite") {
    return deleteDemoPaymentMethod(userId, paymentMethodId)
  }

  const rows = await database.db
    .select({
      id: paymentMethods.id,
      country: paymentMethods.country,
      stripePaymentMethodId: paymentMethods.stripePaymentMethodId,
      stripeCustomerId: paymentMethods.stripeCustomerId,
      openpayCardId: paymentMethods.openpayCardId,
      openpayCustomerId: paymentMethods.openpayCustomerId,
      isDefault: paymentMethods.isDefault,
    })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))
    .limit(1)

  const method = rows[0]
  if (!method) return false

  if (method.stripePaymentMethodId) {
    const stripe = getStripeClient()
    await stripe.paymentMethods.detach(method.stripePaymentMethodId)
  }

  if (method.openpayCardId && method.openpayCustomerId) {
    const openpay = resolveOpenpayConfig()
    const response = await fetch(
      `${openpay.baseUrl}/v1/${openpay.merchantId}/customers/${method.openpayCustomerId}/cards/${method.openpayCardId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(`${openpay.merchantId}:${openpay.privateKey}`).toString("base64")}`,
        },
      },
    )

    if (!response.ok) {
      const message = await response.text()
      throw new PaymentProviderError("openpay", response.status, message || "Unable to delete Openpay card")
    }
  }

  await database.db.delete(paymentMethods).where(and(eq(paymentMethods.id, paymentMethodId), eq(paymentMethods.userId, userId)))

  if (method.isDefault) {
    const replacement = await database.db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(and(eq(paymentMethods.userId, userId), eq(paymentMethods.country, normalizeCountry(String(method.country)))))
      .orderBy(desc(paymentMethods.createdAt))
      .limit(1)

    if (replacement[0]) {
      await database.db.update(paymentMethods).set({ isDefault: true }).where(eq(paymentMethods.id, replacement[0].id))
    }
  }

  return true
}
