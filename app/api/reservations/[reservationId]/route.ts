/*
 * --------------------------------------------------------------------
 *  Xoco Café — Software Property
 *  Copyright (c) 2025 Xoco Café
 *  Principal Developer: Donovan Riaño
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  --------------------------------------------------------------------
 *  PROPIEDAD DEL SOFTWARE — XOCO CAFÉ.
 *  Copyright (c) 2025 Xoco Café.
 *  Desarrollador Principal: Donovan Riaño.
 *
 *  Este archivo está licenciado bajo la Apache License 2.0.
 *  Consulta el archivo LICENSE en la raíz del proyecto para más detalles.
 * --------------------------------------------------------------------
 */

import { type NextRequest, NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"

import { verifyToken } from "@/lib/auth"
import { getDb, reservations } from "@/lib/db"

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
    throw new HttpError(401, "Token requerido")
  }

  const decoded = verifyToken(token)
  if (!decoded) {
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

    const database = getDb().db
    const rows = await database
      .select({
        id: reservations.id,
        userId: reservations.userId,
        reservationCode: reservations.reservationCode,
        reservationDate: reservations.reservationDate,
        reservationTime: reservations.reservationTime,
        branchId: reservations.branchId,
        branchNumber: reservations.branchNumber,
        peopleCount: reservations.peopleCount,
        message: reservations.message,
        preOrderItems: reservations.preOrderItems,
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

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error("Error obteniendo reservación:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: { reservationId?: string } }) {
  try {
    const { decoded } = authenticateRequest(request)
    const reservationId = context.params?.reservationId?.trim()

    if (!reservationId) {
      throw new HttpError(400, "Falta el ID de la reservación")
    }

    const database = getDb().db
    const rows = await database
      .update(reservations)
      .set({ status: "cancelled", updatedAt: new Date().toISOString() })
      .where(and(eq(reservations.id, reservationId), eq(reservations.userId, decoded.userId)))
      .returning({ id: reservations.id, status: reservations.status })

    const data = rows[0]
    if (!data) {
      throw new HttpError(404, "No encontramos la reservación solicitada.")
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error("Error actualizando reservación:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
