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

import { and, asc, eq, inArray, lt, lte, ne } from "drizzle-orm"

import { getDb, reservationFailures, reservations } from "@/lib/db"

export const RESERVATION_ARCHIVE_RETENTION_DAYS = 7

const toDateOnlyString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60 * 1000
  const localMidnight = new Date(date.getTime() - tzOffset)
  return localMidnight.toISOString().split("T")[0] ?? ""
}

const calculateCleanupTimestamp = (reference: Date) => {
  const cleanup = new Date(reference)
  cleanup.setDate(cleanup.getDate() + RESERVATION_ARCHIVE_RETENTION_DAYS)
  return cleanup.toISOString()
}

export function isMissingReservationFailuresTableError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()
  return message.includes("reservation_failures") || message.includes("relation") && message.includes("does not exist")
}

export async function archiveExpiredReservations() {
  try {
    const database = getDb().db
    const todayDate = toDateOnlyString(new Date())
    const expired = await database
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
      })
      .from(reservations)
      .where(and(lt(reservations.reservationDate, todayDate), ne(reservations.status, "completed")))
      .orderBy(asc(reservations.reservationDate), asc(reservations.reservationTime))

    if (!expired.length) {
      return
    }

    const archivedAt = new Date()
    const archivedAtIso = archivedAt.toISOString()
    const cleanupAtIso = calculateCleanupTimestamp(archivedAt)

    await database
      .insert(reservationFailures)
      .values(
        expired.map((reservation) => ({
          originalReservationId: reservation.id,
          userId: reservation.userId,
          reservationCode: reservation.reservationCode,
          reservationDate: reservation.reservationDate,
          reservationTime: reservation.reservationTime,
          branchId: reservation.branchId,
          branchNumber: reservation.branchNumber,
          peopleCount: reservation.peopleCount,
          message: reservation.message,
          preOrderItems: reservation.preOrderItems,
          status: "failed",
          archivedAt: archivedAtIso,
          cleanupAt: cleanupAtIso,
        })),
      )
      .onConflictDoUpdate({
        target: reservationFailures.originalReservationId,
        set: {
          archivedAt: archivedAtIso,
          cleanupAt: cleanupAtIso,
        },
      })

    await database.delete(reservations).where(inArray(reservations.id, expired.map((reservation) => reservation.id)))
  } catch (error) {
    if (isMissingReservationFailuresTableError(error)) {
      return
    }
    console.error("Error general archivando reservaciones vencidas:", error)
  }
}

export async function cleanupFailedReservations() {
  try {
    const database = getDb().db
    const nowIso = new Date().toISOString()
    await database.delete(reservationFailures).where(lte(reservationFailures.cleanupAt, nowIso))
  } catch (error) {
    if (isMissingReservationFailuresTableError(error)) {
      return
    }
    console.error("Error general limpiando reservaciones fallidas:", error)
  }
}

