"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"

import type {
  AdminOrderFilterStatus,
  AdminOrderSortDirection,
  AdminOrderSortField,
  AdminOrdersPayload,
} from "@/lib/admin/orders"

type AdminOrdersResponse = {
  success: boolean
  data?: AdminOrdersPayload
  message?: string
}

const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  page: (
    status: AdminOrderFilterStatus,
    page: number,
    limit: number,
    sortBy: AdminOrderSortField,
    sortDir: AdminOrderSortDirection,
  ) => ["admin", "orders", status, page, limit, sortBy, sortDir] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchOrders(
  status: AdminOrderFilterStatus,
  page: number,
  limit: number,
  sortBy: AdminOrderSortField,
  sortDir: AdminOrderSortDirection,
  signal?: AbortSignal,
): Promise<AdminOrdersPayload> {
  const params = new URLSearchParams({
    status,
    page: String(page),
    limit: String(limit),
    sortBy,
    sortDir,
  })

  const response = await fetch(`/api/admin/orders?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  })

  const json = await parseJson<AdminOrdersResponse>(response)

  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Unable to load orders")
  }

  return json.data
}

export function useAdminOrders(
  status: AdminOrderFilterStatus,
  page: number,
  limit: number,
  sortBy: AdminOrderSortField,
  sortDir: AdminOrderSortDirection,
  initialData?: AdminOrdersPayload,
) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: adminOrdersKeys.page(status, page, limit, sortBy, sortDir),
    queryFn: ({ signal }) => fetchOrders(status, page, limit, sortBy, sortDir, signal),
    initialData,
    refetchInterval: 60_000,
  })

  return {
    ...query,
    invalidate: async () => {
      await queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all })
    },
  }
}

export { adminOrdersKeys }
