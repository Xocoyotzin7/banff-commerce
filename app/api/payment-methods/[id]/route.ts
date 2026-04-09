import { type NextRequest, NextResponse } from "next/server"

import { authenticateAccountRequest } from "@/lib/account/session"
import { deletePaymentMethod } from "@/lib/payments/save-method"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  const session = authenticateAccountRequest(request)
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params

  try {
    const deleted = await deletePaymentMethod(session.userId, id)
    if (!deleted) {
      return NextResponse.json({ ok: false, message: "Payment method not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete payment method"
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
