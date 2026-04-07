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
 *
 * SQL reference for Neon:
 *
 * -- reservations table
 * CREATE TABLE IF NOT EXISTS reservations (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 *   "reservationCode" CHAR(3) NOT NULL UNIQUE,
 *   "reservationDate" DATE NOT NULL,
 *   "reservationTime" VARCHAR(5) NOT NULL,
 *   "branchId" VARCHAR(100) NOT NULL,
 *   "branchNumber" VARCHAR(8),
 *   "peopleCount" INT NOT NULL CHECK ("peopleCount" BETWEEN 1 AND 15),
 *   message TEXT,
 *   "preOrderItems" TEXT,
 *   status VARCHAR(20) NOT NULL DEFAULT 'pending'
 *     CHECK (status IN ('pending','confirmed','cancelled','completed')),
 *   "createdAt" TIMESTAMPTZ DEFAULT NOW(),
 *   "updatedAt" TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_slot
 *   ON reservations ("branchId", "reservationDate", "reservationTime")
 *   WHERE status NOT IN ('cancelled');
 *
 * -- reservation_failures table
 * CREATE TABLE IF NOT EXISTS reservation_failures (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "originalReservationId" UUID,
 *   "userId" UUID REFERENCES users(id),
 *   "reservationCode" CHAR(3),
 *   "reservationDate" DATE,
 *   "reservationTime" VARCHAR(5),
 *   "branchId" VARCHAR(100),
 *   "branchNumber" VARCHAR(8),
 *   "peopleCount" INT,
 *   message TEXT,
 *   "preOrderItems" TEXT,
 *   status VARCHAR(20),
 *   "archivedAt" TIMESTAMPTZ DEFAULT NOW(),
 *   "cleanupAt" TIMESTAMPTZ
 * );
 */

import { randomUUID } from "node:crypto"

import { and, asc, eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { verifyToken, getUserById } from "@/lib/auth"
import { getDb, reservationFailures, reservations } from "@/lib/db"
import { DEFAULT_BRANCH_ID, isDateWithinRange, normalizeDateOnly } from "@/lib/reservations"
import {
  archiveExpiredReservations,
  cleanupFailedReservations,
  isMissingReservationFailuresTableError,
} from "@/lib/reservations-server"
import { sendReservationConfirmed } from "@/lib/mailer/triggers"

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

  return { token, decoded }
}

const ReservationPayloadSchema = z.object({
  numPeople: z.coerce.number().int().min(1).max(15),
  reservationDate: z.string().min(1),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido. Usa HH:MM"),
  branchId: z.string().min(1),
  branchNumber: z.string().trim().max(8, "El número de sucursal es demasiado largo").optional().nullable(),
  message: z.string().trim().max(500, "Mensaje demasiado largo").optional().nullable(),
  preOrderItems: z
    .string()
    .trim()
    .max(1000, "Lista de alimentos/bebidas demasiado larga")
    .optional()
    .nullable(),
})

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const MAX_CODE_ATTEMPTS = 25

async function generateReservationCode(): Promise<string> {
  const database = getDb().db
  const buildCode = () =>
    Array.from({ length: 3 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join("")

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = buildCode()

    try {
      const existing = await database
        .select({ id: reservations.id })
        .from(reservations)
        .where(eq(reservations.reservationCode, code))
        .limit(1)

      if (existing.length === 0) {
        try {
          const archived = await database
            .select({ id: reservationFailures.id })
            .from(reservationFailures)
            .where(eq(reservationFailures.reservationCode, code))
            .limit(1)

          if (archived.length === 0) {
            return code
          }
        } catch (error) {
          if (isMissingReservationFailuresTableError(error)) {
            return code
          }
          throw error
        }
      }
    } catch (error) {
      if (error instanceof HttpError) {
        throw error
      }
      throw new HttpError(500, "No pudimos validar el código de reserva.")
    }
  }

  throw new HttpError(500, "No pudimos generar un código de reserva único. Intenta de nuevo.")
}

export async function GET(request: NextRequest) {
  try {
    const { decoded } = authenticateRequest(request)
    void archiveExpiredReservations()
    void cleanupFailedReservations()

    const database = getDb().db

    const reservationsQuery = database
      .select({
        id: reservations.id,
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
      .where(eq(reservations.userId, decoded.userId))
      .orderBy(asc(reservations.reservationDate), asc(reservations.reservationTime))

    const failedQuery = database
      .select({
        id: reservationFailures.id,
        originalReservationId: reservationFailures.originalReservationId,
        userId: reservationFailures.userId,
        reservationCode: reservationFailures.reservationCode,
        reservationDate: reservationFailures.reservationDate,
        reservationTime: reservationFailures.reservationTime,
        branchId: reservationFailures.branchId,
        branchNumber: reservationFailures.branchNumber,
        peopleCount: reservationFailures.peopleCount,
        message: reservationFailures.message,
        preOrderItems: reservationFailures.preOrderItems,
        status: reservationFailures.status,
        archivedAt: reservationFailures.archivedAt,
        cleanupAt: reservationFailures.cleanupAt,
      })
      .from(reservationFailures)
      .where(eq(reservationFailures.userId, decoded.userId))
      .orderBy(asc(reservationFailures.archivedAt))

    const [activeReservations, failedReservations] = await Promise.all([
      reservationsQuery,
      failedQuery.catch((error: unknown) => {
        if (isMissingReservationFailuresTableError(error)) {
          return []
        }
        throw error
      }),
    ])

    return NextResponse.json({
      success: true,
      data: activeReservations,
      failed: failedReservations,
    })
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error("Error listando reservaciones:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { decoded } = authenticateRequest(request)
    const database = getDb().db

    const body: unknown = await request.json()
    const parsed = ReservationPayloadSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Datos de reservación inválidos"
      return NextResponse.json({ success: false, message: firstError }, { status: 400 })
    }

    const payload = parsed.data
    const branchId = payload.branchId || DEFAULT_BRANCH_ID
    const reservationDate = normalizeDateOnly(payload.reservationDate)
    const normalizedBranchNumber = payload.branchNumber?.trim() || null

    if (!isDateWithinRange(reservationDate)) {
      return NextResponse.json(
        { success: false, message: "Selecciona una fecha válida dentro del rango permitido." },
        { status: 400 },
      )
    }

    const slotTime = payload.reservationTime
    const existingReservation = await database
      .select({ id: reservations.id })
      .from(reservations)
      .where(
        and(
          eq(reservations.branchId, branchId),
          eq(reservations.reservationDate, reservationDate),
          eq(reservations.reservationTime, slotTime),
        ),
      )
      .limit(1)

    if (existingReservation.length > 0) {
      return NextResponse.json(
        { success: false, message: "Ese horario ya fue reservado. Elige otro." },
        { status: 409 },
      )
    }

    const reservationCode = await generateReservationCode()

    let insertedRows
    try {
      insertedRows = await database
        .insert(reservations)
        .values({
          id: randomUUID(),
          userId: decoded.userId,
          peopleCount: payload.numPeople,
          reservationDate,
          reservationTime: slotTime,
          branchId,
          branchNumber: normalizedBranchNumber,
          message: payload.message ?? null,
          preOrderItems: payload.preOrderItems ?? null,
          reservationCode,
          status: "pending",
        })
        .returning({
          id: reservations.id,
          reservationCode: reservations.reservationCode,
        })
    } catch (error: unknown) {
      console.error("Error guardando reservación:", error)
      return NextResponse.json({ success: false, message: "No pudimos crear tu reservación" }, { status: 500 })
    }

    const data = insertedRows[0]
    if (!data) {
      return NextResponse.json({ success: false, message: "No pudimos crear tu reservación" }, { status: 500 })
    }

    const profile = await getUserById(decoded.userId).catch(() => null)
    if (profile?.email) {
      void sendReservationConfirmed({
        to: profile.email,
        reservationCode: data.reservationCode,
        date: reservationDate,
        time: slotTime,
        peopleCount: payload.numPeople,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        reservationId: data.id,
        reservationCode: data.reservationCode,
      },
    })
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.status })
    }
    console.error("Error creando reservación:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
