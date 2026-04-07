"use client"

import * as React from "react"
import { z } from "zod"

import { DEFAULT_BRANCH_ID } from "@/lib/reservations"

export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed"

export type ReservationRecord = {
  id: string
  reservationCode: string
  reservationDate: string
  reservationTime: string
  branchId: string
  branchNumber: string | null
  peopleCount: number
  message: string | null
  preOrderItems: string | null
  status: ReservationStatus
  createdAt: string | null
  updatedAt: string | null
}

export type ReservationFailureRecord = {
  id: string
  originalReservationId: string | null
  userId: string | null
  reservationCode: string | null
  reservationDate: string | null
  reservationTime: string | null
  branchId: string | null
  branchNumber: string | null
  peopleCount: number | null
  message: string | null
  preOrderItems: string | null
  status: string | null
  archivedAt: string | null
  cleanupAt: string | null
}

export type ReservationListResponse = {
  reservations: ReservationRecord[]
  failed: ReservationFailureRecord[]
}

export type CreateReservationInput = {
  numPeople: number
  reservationDate: string
  reservationTime: string
  branchId?: string
  branchNumber?: string | null
  message?: string | null
  preOrderItems?: string | null
}

export type CreateReservationResult = {
  reservationId: string
  reservationCode: string
}

const reservationFormSchema = z.object({
  numPeople: z.coerce.number().int().min(1).max(15),
  reservationDate: z.string().min(1, "Selecciona una fecha"),
  reservationTime: z.string().regex(/^\d{2}:\d{2}$/, "Selecciona un horario válido"),
  branchId: z.string().min(1),
  branchNumber: z.string().trim().max(8).optional().nullable(),
  message: z.string().trim().max(500).optional().nullable(),
  preOrderItems: z.string().trim().max(1000).optional().nullable(),
})

type ReservationCacheEntry = {
  reservations: ReservationRecord[]
  failed: ReservationFailureRecord[]
  listeners: Set<() => void>
}

const reservationCache = new Map<string, ReservationCacheEntry>()

function getCacheEntry(token: string) {
  let entry = reservationCache.get(token)
  if (!entry) {
    entry = { reservations: [], failed: [], listeners: new Set() }
    reservationCache.set(token, entry)
  }
  return entry
}

function notifyCache(token: string) {
  const entry = reservationCache.get(token)
  if (!entry) {
    return
  }

  entry.listeners.forEach((listener) => listener())
}

function upsertCacheSnapshot(token: string, snapshot: ReservationListResponse) {
  const entry = getCacheEntry(token)
  entry.reservations = snapshot.reservations
  entry.failed = snapshot.failed
  notifyCache(token)
}

function updateReservationCache(token: string, updater: (entry: ReservationCacheEntry) => void) {
  const entry = getCacheEntry(token)
  updater(entry)
  notifyCache(token)
}

function getAuthToken() {
  if (typeof window === "undefined") {
    return null
  }

  return window.localStorage.getItem("authToken") ?? window.localStorage.getItem("token")
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    throw new Error("Respuesta vacía del servidor")
  }

  return JSON.parse(text) as T
}

async function fetchReservations(token: string): Promise<ReservationListResponse> {
  const response = await fetch("/api/reservations", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  const payload = (await readJson<{ success?: boolean; data?: ReservationRecord[]; failed?: ReservationFailureRecord[]; message?: string }>(response))

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "No pudimos cargar tus reservaciones.")
  }

  return {
    reservations: payload.data ?? [],
    failed: payload.failed ?? [],
  }
}

async function postReservation(token: string, input: CreateReservationInput): Promise<CreateReservationResult> {
  const response = await fetch("/api/reservations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numPeople: input.numPeople,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      branchId: input.branchId ?? DEFAULT_BRANCH_ID,
      branchNumber: input.branchNumber ?? null,
      message: input.message ?? null,
      preOrderItems: input.preOrderItems ?? null,
    }),
  })

  const payload = (await readJson<{ success?: boolean; data?: CreateReservationResult; message?: string }>(response))

  if (!response.ok || payload.success === false || !payload.data) {
    throw new Error(payload.message || "No pudimos crear tu reservación.")
  }

  return payload.data
}

function getAvailableTimeSlots() {
  const slots: string[] = []
  for (let hour = 10; hour <= 21; hour += 1) {
    for (const minute of [0, 30] as const) {
      if (hour === 21 && minute === 30) {
        continue
      }
      slots.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`)
    }
  }
  return slots
}

export function useReservations() {
  const [token, setToken] = React.useState<string | null>(null)
  const [reservations, setReservations] = React.useState<ReservationRecord[]>([])
  const [failed, setFailed] = React.useState<ReservationFailureRecord[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setToken(getAuthToken())
  }, [])

  React.useEffect(() => {
    if (!token) {
      setIsLoading(false)
      setError("No encontramos un token de acceso.")
      return
    }

    const cacheEntry = getCacheEntry(token)
    const syncFromCache = () => {
      setReservations([...cacheEntry.reservations])
      setFailed([...cacheEntry.failed])
    }

    cacheEntry.listeners.add(syncFromCache)
    syncFromCache()

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        const snapshot = await fetchReservations(token)
        if (cancelled) {
          return
        }
        upsertCacheSnapshot(token, snapshot)
        setError(null)
      } catch (loadError) {
        if (cancelled) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : "No pudimos cargar tus reservaciones.")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      cacheEntry.listeners.delete(syncFromCache)
    }
  }, [token])

  const refetch = async () => {
    if (!token) {
      throw new Error("No encontramos un token de acceso.")
    }

    setIsLoading(true)
    try {
      const snapshot = await fetchReservations(token)
      upsertCacheSnapshot(token, snapshot)
      setError(null)
      return snapshot
    } finally {
      setIsLoading(false)
    }
  }

  return {
    reservations,
    failed,
    isLoading,
    error,
    refetch,
  }
}

export function useCreateReservation() {
  const [token, setToken] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setToken(getAuthToken())
  }, [])

  const createReservation = async (input: CreateReservationInput): Promise<CreateReservationResult> => {
    if (!token) {
      throw new Error("No encontramos un token de acceso.")
    }

    const parsed = reservationFormSchema.safeParse({
      numPeople: input.numPeople,
      reservationDate: input.reservationDate,
      reservationTime: input.reservationTime,
      branchId: input.branchId ?? DEFAULT_BRANCH_ID,
      branchNumber: input.branchNumber ?? null,
      message: input.message ?? null,
      preOrderItems: input.preOrderItems ?? null,
    })

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos")
    }

    const optimisticId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    const nowIso = new Date().toISOString()
    const optimisticReservation: ReservationRecord = {
      id: optimisticId,
      reservationCode: "---",
      reservationDate: parsed.data.reservationDate,
      reservationTime: parsed.data.reservationTime,
      branchId: parsed.data.branchId,
      branchNumber: parsed.data.branchNumber ?? null,
      peopleCount: parsed.data.numPeople,
      message: parsed.data.message ?? null,
      preOrderItems: parsed.data.preOrderItems ?? null,
      status: "pending",
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    updateReservationCache(token, (entry) => {
      entry.reservations = [optimisticReservation, ...entry.reservations]
    })

    setIsPending(true)
    setError(null)

    try {
      const result = await postReservation(token, {
        numPeople: parsed.data.numPeople,
        reservationDate: parsed.data.reservationDate,
        reservationTime: parsed.data.reservationTime,
        branchId: parsed.data.branchId,
        branchNumber: parsed.data.branchNumber ?? null,
        message: parsed.data.message ?? null,
        preOrderItems: parsed.data.preOrderItems ?? null,
      })

      updateReservationCache(token, (entry) => {
        entry.reservations = entry.reservations.map((reservation) =>
          reservation.id === optimisticId
            ? {
                ...reservation,
                id: result.reservationId,
                reservationCode: result.reservationCode,
              }
            : reservation,
        )
      })

      return result
    } catch (mutationError) {
      updateReservationCache(token, (entry) => {
        entry.reservations = entry.reservations.filter((reservation) => reservation.id !== optimisticId)
      })
      const message = mutationError instanceof Error ? mutationError.message : "No pudimos crear tu reservación."
      setError(message)
      throw mutationError instanceof Error ? mutationError : new Error(message)
    } finally {
      setIsPending(false)
    }
  }

  return {
    createReservation,
    isPending,
    error,
  }
}

export function useAvailability(branchId?: string | null, date?: string | null) {
  const [takenSlots, setTakenSlots] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!branchId || !date) {
      setTakenSlots([])
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()

    const load = async () => {
      setIsLoading(true)
      try {
        const query = new URLSearchParams({ branchId, date })
        const response = await fetch(`/api/reservations/availability?${query.toString()}`, {
          method: "GET",
          signal: controller.signal,
        })

        const payload = (await readJson<unknown>(response))
        if (!response.ok) {
          const message = typeof payload === "object" && payload && "message" in payload ? String((payload as { message?: unknown }).message ?? "") : ""
          throw new Error(message || "No pudimos obtener la disponibilidad.")
        }

        if (!Array.isArray(payload)) {
          throw new Error("No pudimos obtener la disponibilidad.")
        }

        setTakenSlots(payload.filter((slot): slot is string => typeof slot === "string"))
        setError(null)
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === "AbortError") {
          return
        }
        setError(loadError instanceof Error ? loadError.message : "No pudimos obtener la disponibilidad.")
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [branchId, date])

  const availableSlots = getAvailableTimeSlots().filter((slot) => !takenSlots.includes(slot))

  return {
    takenSlots,
    availableSlots,
    isLoading,
    error,
  }
}

export { reservationFormSchema, getAvailableTimeSlots }
