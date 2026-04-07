"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { AdminReservationRange, AdminReservationsPayload } from "@/lib/admin/reservations"

type AdminReservationsResponse = {
  success: boolean
  data?: AdminReservationsPayload
  message?: string
}

const adminReservationsKeys = {
  all: ["admin", "reservations"] as const,
  range: (range: AdminReservationRange, month?: string | null) => ["admin", "reservations", range, month ?? ""] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchReservations(
  range: AdminReservationRange,
  month?: string | null,
  signal?: AbortSignal,
): Promise<AdminReservationsPayload> {
  const params = new URLSearchParams({ range })
  if (month) {
    params.set("month", month)
  }
  const response = await fetch(`/api/admin/reservations?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  })

  const json = await parseJson<AdminReservationsResponse>(response)
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Unable to load reservations")
  }

  return json.data
}

export function useAdminReservations(range: AdminReservationRange, initialData?: AdminReservationsPayload, month?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: adminReservationsKeys.range(range, month),
    queryFn: ({ signal }) => fetchReservations(range, month, signal),
    initialData,
  })

  return {
    ...query,
    invalidate: async () => {
      await queryClient.invalidateQueries({ queryKey: adminReservationsKeys.all })
    },
  }
}

export { adminReservationsKeys }
