import { sendTransactionalEmail } from "@/lib/mailer/listmonk"

function parseTemplateId(value: string | undefined): number | null {
  const parsed = Number.parseInt((value ?? "").trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function resolveAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || null
}

export async function sendOrderConfirmation(input: {
  to: string
  orderNumber: string
  total: number
  items: Array<{ name: string; quantity: number; price?: number }>
}): Promise<void> {
  const templateId = parseTemplateId(process.env.LISTMONK_TPL_ORDER)
  if (!templateId) {
    console.warn("[listmonk] LISTMONK_TPL_ORDER is not configured")
    return
  }

  await sendTransactionalEmail({
    to: input.to,
    templateId,
    data: {
      orderNumber: input.orderNumber,
      total: input.total,
      items: input.items,
    },
  })
}

export async function sendReservationConfirmed(input: {
  to: string
  reservationCode: string
  date: string
  time: string
  peopleCount: number
}): Promise<void> {
  const templateId = parseTemplateId(process.env.LISTMONK_TPL_RESERVATION)
  if (!templateId) {
    console.warn("[listmonk] LISTMONK_TPL_RESERVATION is not configured")
    return
  }

  await sendTransactionalEmail({
    to: input.to,
    templateId,
    data: {
      reservationCode: input.reservationCode,
      date: input.date,
      time: input.time,
      peopleCount: input.peopleCount,
    },
  })
}

export async function sendLowStockAlert(input: {
  to?: string
  productName: string
  currentStock: number
  minStock: number
}): Promise<void> {
  const templateId = parseTemplateId(process.env.LISTMONK_TPL_LOW_STOCK)
  const adminEmail = input.to?.trim() || resolveAdminEmail()

  if (!templateId) {
    console.warn("[listmonk] LISTMONK_TPL_LOW_STOCK is not configured")
    return
  }

  if (!adminEmail) {
    console.warn("[listmonk] ADMIN_EMAIL is not configured")
    return
  }

  await sendTransactionalEmail({
    to: adminEmail,
    templateId,
    data: {
      productName: input.productName,
      currentStock: input.currentStock,
      minStock: input.minStock,
    },
  })
}

export async function sendNewOrderAlert(input: {
  to?: string
  orderNumber: string
  customerName: string
  total: number
}): Promise<void> {
  const templateId = parseTemplateId(process.env.LISTMONK_TPL_NEW_ORDER)
  const adminEmail = input.to?.trim() || resolveAdminEmail()

  if (!templateId) {
    console.warn("[listmonk] LISTMONK_TPL_NEW_ORDER is not configured")
    return
  }

  if (!adminEmail) {
    console.warn("[listmonk] ADMIN_EMAIL is not configured")
    return
  }

  await sendTransactionalEmail({
    to: adminEmail,
    templateId,
    data: {
      orderNumber: input.orderNumber,
      customerName: input.customerName,
      total: input.total,
    },
  })
}
