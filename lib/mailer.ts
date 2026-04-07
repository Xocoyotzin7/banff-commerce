import { sendReservationConfirmed } from "@/lib/mailer/triggers"

export type ReservationCreatedEmailPayload = {
  to: string
  displayName: string
  reservationCode: string
  reservationDate: string
  reservationTime: string
  peopleCount: number
  branchLabel: string
  reservationType?: "appointment" | "travel"
  destinationName?: string | null
  packageName?: string | null
  message?: string | null
  preOrderItems?: string | null
}

export {
  sendOrderConfirmation,
  sendReservationConfirmed,
  sendLowStockAlert,
  sendNewOrderAlert,
} from "@/lib/mailer/triggers"

export async function sendReservationCreatedEmail(payload: ReservationCreatedEmailPayload): Promise<void> {
  // Mail delivery is routed through the transactional email adapter; page code should not talk to the provider directly.
  await sendReservationConfirmed({
    to: payload.to,
    reservationCode: payload.reservationCode,
    date: payload.reservationDate,
    time: payload.reservationTime,
    peopleCount: payload.peopleCount,
    reservationType: payload.reservationType ?? "appointment",
    branchLabel: payload.branchLabel,
    destinationName: payload.destinationName,
    packageName: payload.packageName,
  })
}
