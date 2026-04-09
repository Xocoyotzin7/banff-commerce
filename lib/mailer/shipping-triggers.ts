type ShippingOrder = {
  id: string
  client_name: string
  client_email: string
  country: "MX" | "CA"
  total: number
  tracking_url?: string | null
}

type ShippingTrackingInfo = {
  carrier: string
  tracking_id: string
  tracking_url: string
  days_max?: number
}

function parseTemplateId(value: string | undefined): number | null {
  const parsed = Number.parseInt((value ?? "").trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function resolveListmonkBaseUrl() {
  const raw = process.env.LISTMONK_URL?.trim()
  if (!raw) return null
  const normalized = raw.replace(/\/+$/, "")
  return normalized.startsWith("http://") || normalized.startsWith("https://") ? normalized : `https://${normalized}`
}

function resolveListmonkAuthHeader() {
  const username = process.env.LISTMONK_USERNAME?.trim()
  const password = process.env.LISTMONK_PASSWORD?.trim()
  if (!username || !password) return null
  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`
}

async function postTransactionalTemplate(
  templateId: number | null,
  data: Record<string, unknown>,
  subscriberEmail: string,
) {
  if (!templateId) {
    return
  }

  const baseUrl = resolveListmonkBaseUrl()
  if (!baseUrl) {
    console.warn("[listmonk] LISTMONK_URL is not configured")
    return
  }

  try {
    const authHeader = resolveListmonkAuthHeader()
    const response = await fetch(`${baseUrl}/api/tx`, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscriber_email: subscriberEmail,
        template_id: templateId,
        data,
      }),
    })

    if (!response.ok) {
      const message = await response.text().catch(() => response.statusText)
      console.error("[listmonk] shipping transactional email failed", response.status, message)
    }
  } catch (error) {
    console.error("[listmonk] shipping transactional email error", error)
  }
}

export async function sendShippingConfirmationEmail(order: ShippingOrder, tracking: ShippingTrackingInfo): Promise<void> {
  const templateId =
    parseTemplateId(process.env.LISTMONK_TEMPLATE_SHIPPING_CONFIRMED) ??
    parseTemplateId(process.env.LISTMONK_TPL_SHIPPING_CONFIRMATION)

  await postTransactionalTemplate(
    templateId,
    {
      client_name: order.client_name,
      order_id: order.id,
      carrier: tracking.carrier,
      tracking_id: tracking.tracking_id,
      tracking_url: tracking.tracking_url,
      estimated_days: tracking.days_max ?? 0,
      currency: order.country === "MX" ? "MXN" : "CAD",
      total: order.total,
    },
    order.client_email,
  )
}

export async function sendOutForDeliveryEmail(order: ShippingOrder): Promise<void> {
  const templateId =
    parseTemplateId(process.env.LISTMONK_TEMPLATE_OUT_FOR_DELIVERY) ??
    parseTemplateId(process.env.LISTMONK_TPL_OUT_FOR_DELIVERY)

  await postTransactionalTemplate(
    templateId,
    {
      client_name: order.client_name,
      order_id: order.id,
      tracking_url: order.tracking_url ?? `/orders/${order.id}`,
    },
    order.client_email,
  )
}

export async function sendDeliveredEmail(order: ShippingOrder): Promise<void> {
  const templateId =
    parseTemplateId(process.env.LISTMONK_TEMPLATE_DELIVERED) ??
    parseTemplateId(process.env.LISTMONK_TPL_DELIVERED)

  await postTransactionalTemplate(
    templateId,
    {
      client_name: order.client_name,
      order_id: order.id,
      review_url: `/orders/${order.id}/review`,
    },
    order.client_email,
  )
}
