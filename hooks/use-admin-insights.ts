"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import type { TravelInsightsPayload, TravelInsightsRange } from "@/lib/admin/travel-insights"

type AdminInsightsResponse = {
  success: boolean
  data?: TravelInsightsPayload
  message?: string
}

const adminInsightsKeys = {
  all: ["admin", "travel-insights"] as const,
  range: (range: TravelInsightsRange, month?: string | null) => ["admin", "travel-insights", range, month ?? ""] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchInsights(
  range: TravelInsightsRange,
  month?: string | null,
  signal?: AbortSignal,
): Promise<TravelInsightsPayload> {
  const params = new URLSearchParams({ range })
  if (month) {
    params.set("month", month)
  }
  const response = await fetch(`/api/admin/insights?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  })

  const json = await parseJson<AdminInsightsResponse>(response)
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Unable to load travel insights")
  }

  return json.data
}

export function useAdminInsights(range: TravelInsightsRange, initialData?: TravelInsightsPayload, month?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: adminInsightsKeys.range(range, month),
    queryFn: ({ signal }) => fetchInsights(range, month, signal),
    initialData,
  })

  return {
    ...query,
    invalidate: async () => {
      await queryClient.invalidateQueries({ queryKey: adminInsightsKeys.all })
    },
  }
}

export { adminInsightsKeys }
