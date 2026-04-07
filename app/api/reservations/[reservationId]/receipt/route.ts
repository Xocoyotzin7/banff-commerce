import { type NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { isAdminDemoMode } from "@/lib/admin/demo-data"
import { verifyToken } from "@/lib/auth"
import { getDb, reservations } from "@/lib/db"
import { getDemoReservationById } from "@/lib/reservations-demo-state"
import { buildReservationReceipt } from "@/lib/reservations-receipt"

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const authenticateRequest = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.replace("Bearer ", "")

  if (!token) {
    if (isAdminDemoMode()) {
      return { decoded: { userId: "demo-client-1" } }
    }
    throw new HttpError(401, "Token requerido")
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    if (isAdminDemoMode()) {
      return { decoded: { userId: "demo-client-1" } }
    }
    throw new HttpError(401, "Token inválido")
  }

  return { decoded }
}

export async function GET(request: NextRequest, context: { params: { reservationId?: string } }) {
  try {
    const { decoded } = authenticateRequest(request)
    const reservationId = context.params?.reservationId?.trim()

    if (!reservationId) {
      throw new HttpError(400, "Falta el ID de la reservación")
    }

    if (isAdminDemoMode()) {
      const data = getDemoReservationById(reservationId)
      if (!data || data.userId !== decoded.userId) {
        throw new HttpError(404, "No encontramos la reservación solicitada.")
      }

      return NextResponse.json({ success: true, data: { receipt: buildReservationReceipt(data) } })
    }

    const database = getDb().db
    const rows = await database
      .select({
        id: reservations.id,
        reservationCode: reservations.reservationCode,
        reservationType: reservations.reservationType,
        reservationDate: reservations.reservationDate,
        reservationTime: reservations.reservationTime,
        branchId: reservations.branchId,
        branchNumber: reservations.branchNumber,
        destinationSlug: reservations.destinationSlug,
        packageId: reservations.packageId,
        peopleCount: reservations.peopleCount,
        status: reservations.status,
        createdAt: reservations.createdAt,
        updatedAt: reservations.updatedAt,
      })
      .from(reservations)
      .where(and(eq(reservations.id, reservationId), eq(reservations.userId, decoded.userId)))
      .limit(1)

    const data = rows[0]
    if (!data) {
      throw new HttpError(404, "No encontramos la reservación solicitada.")
    }

    return NextResponse.json({
      success: true,
      data: {
        receipt: buildReservationReceipt({
          id: data.id,
          reservationCode: data.reservationCode,
          reservationType: data.reservationType,
          reservationDate: data.reservationDate,
          reservationTime: data.reservationTime,
          branchId: data.branchId,
          branchNumber: data.branchNumber,
          destinationSlug: data.destinationSlug,
          packageId: data.packageId,
          peopleCount: data.peopleCount,
          status: data.status,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          clientName: null,
          clientEmail: null,
          clientCountry: null,
          message: null,
          preOrderItems: null,
        }),
      },
    })
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error("Error obteniendo comprobante:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

