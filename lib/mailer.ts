import { sendReservationConfirmed } from "@/lib/mailer/triggers"

export type ReservationCreatedEmailPayload = {
  to: string
  displayName: string
  reservationCode: string
  reservationDate: string
  reservationTime: string
  peopleCount: number
  branchLabel: string
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
  await sendReservationConfirmed({
    to: payload.to,
    reservationCode: payload.reservationCode,
    date: payload.reservationDate,
    time: payload.reservationTime,
    peopleCount: payload.peopleCount,
  })
}
