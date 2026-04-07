import { sendTransactionalEmail } from "@/lib/mailer/listmonk"

function parseTemplateId(value: string | undefined): number | null {
  const parsed = Number.parseInt((value ?? "").trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function resolveAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim() || null
}

function buildReservationEmailData(input: {
  reservationCode: string
  date: string
  time: string
  peopleCount: number
  branchLabel?: string | null
  destinationName?: string | null
  packageName?: string | null
  reservationType: "appointment" | "travel"
}) {
  // Template payload stays provider-agnostic so the same data can feed multiple transactional templates.
  return {
    reservationCode: input.reservationCode,
    date: input.date,
    time: input.time,
    peopleCount: input.peopleCount,
    branchLabel: input.branchLabel ?? null,
    destinationName: input.destinationName ?? null,
    packageName: input.packageName ?? null,
    reservationType: input.reservationType,
    isAppointment: input.reservationType === "appointment",
    isTravel: input.reservationType === "travel",
  }
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

async function sendReservationTemplateEmail(
  input: {
    to: string
    reservationCode: string
    date: string
    time: string
    peopleCount: number
    branchLabel?: string | null
    destinationName?: string | null
    packageName?: string | null
    reservationType: "appointment" | "travel"
  },
  templateId: number | null,
  templateName: string,
): Promise<void> {
  if (!templateId) {
    console.warn(`[listmonk] ${templateName} is not configured`)
    return
  }

  await sendTransactionalEmail({
    to: input.to,
    templateId,
    data: buildReservationEmailData(input),
  })
}

export async function sendAppointmentReservationConfirmed(input: {
  to: string
  reservationCode: string
  date: string
  time: string
  peopleCount: number
  branchLabel?: string | null
  destinationName?: string | null
  packageName?: string | null
}): Promise<void> {
  const templateId =
    parseTemplateId(process.env.LISTMONK_TPL_RESERVATION_APPOINTMENT) ??
    parseTemplateId(process.env.LISTMONK_TPL_RESERVATION)

  await sendReservationTemplateEmail(
    {
      ...input,
      reservationType: "appointment",
    },
    templateId,
    "LISTMONK_TPL_RESERVATION_APPOINTMENT",
  )
}

export async function sendTravelReservationConfirmed(input: {
  to: string
  reservationCode: string
  date: string
  time: string
  peopleCount: number
  branchLabel?: string | null
  destinationName?: string | null
  packageName?: string | null
}): Promise<void> {
  const templateId = parseTemplateId(process.env.LISTMONK_TPL_RESERVATION_TRAVEL)

  await sendReservationTemplateEmail(
    {
      ...input,
      reservationType: "travel",
    },
    templateId,
    "LISTMONK_TPL_RESERVATION_TRAVEL",
  )
}

export async function sendReservationConfirmed(input: {
  to: string
  reservationCode: string
  date: string
  time: string
  peopleCount: number
  reservationType?: "appointment" | "travel"
  branchLabel?: string | null
  destinationName?: string | null
  packageName?: string | null
}): Promise<void> {
  if (input.reservationType === "travel") {
    await sendTravelReservationConfirmed({
      to: input.to,
      reservationCode: input.reservationCode,
      date: input.date,
      time: input.time,
      peopleCount: input.peopleCount,
      branchLabel: input.branchLabel,
      destinationName: input.destinationName,
      packageName: input.packageName,
    })
    return
  }

  await sendAppointmentReservationConfirmed({
    to: input.to,
    reservationCode: input.reservationCode,
    date: input.date,
    time: input.time,
    peopleCount: input.peopleCount,
    branchLabel: input.branchLabel,
    destinationName: input.destinationName,
    packageName: input.packageName,
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
