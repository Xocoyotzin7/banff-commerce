"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { AdminOrderDetail, AdminOrderRecord } from "@/lib/admin/orders"
import { adminOrdersKeys } from "@/hooks/use-admin-orders"

type AdminOrderResponse = {
  success: boolean
  data?: AdminOrderDetail
  message?: string
}

type ShipPayload = {
  carrier: string
  tracking_id: string
  tracking_url: string
}

type ShipResponse = {
  success: boolean
  data?: AdminOrderDetail
  message?: string
}

const adminOrderKeys = {
  detail: (id: string) => ["admin", "orders", id] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchOrder(id: string, signal?: AbortSignal): Promise<AdminOrderDetail> {
  const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
    signal,
  })

  const json = await parseJson<AdminOrderResponse>(response)
  if (!response.ok || !json.success || !json.data) {
    throw new Error(json.message ?? "Unable to load order")
  }

  return json.data
}

export function useAdminOrder(id: string, enabled: boolean) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: ({ signal }) => fetchOrder(id, signal),
    enabled: enabled && id.length > 0,
  })
}

function updateOrderCaches(queryClient: ReturnType<typeof useQueryClient>, updater: (order: AdminOrderRecord) => AdminOrderRecord) {
  queryClient.setQueriesData({ queryKey: adminOrdersKeys.all }, (current: unknown) => {
    if (!current || typeof current !== "object") return current
    const payload = current as { orders?: AdminOrderRecord[] }
    if (!Array.isArray(payload.orders)) return current
    return {
      ...payload,
      orders: payload.orders.map((order) => updater(order)),
    }
  })
}

export function useShipAdminOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ShipPayload }) => {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(id)}/ship`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const json = await parseJson<ShipResponse>(response)
      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to confirm shipment")
      }
      return json.data
    },
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: adminOrdersKeys.all })
      await queryClient.cancelQueries({ queryKey: adminOrderKeys.detail(id) })

      const previousListQueries = queryClient.getQueriesData({ queryKey: adminOrdersKeys.all })
      const previousDetail = queryClient.getQueryData<AdminOrderDetail>(adminOrderKeys.detail(id))

      updateOrderCaches(queryClient, (order) =>
        order.id === id
          ? {
              ...order,
              status: "shipped",
              selectedCarrier: payload.carrier,
            }
          : order,
      )

      queryClient.setQueryData(adminOrderKeys.detail(id), (current: AdminOrderDetail | undefined) =>
        current
          ? {
              ...current,
              status: "shipped",
              selectedCarrier: payload.carrier,
              carrier: payload.carrier,
              trackingId: payload.tracking_id,
              trackingUrl: payload.tracking_url,
              shippedAt: new Date().toISOString(),
            }
          : current,
      )

      return { previousListQueries, previousDetail }
    },
    onError: (_error, variables, context) => {
      if (!context) return
      for (const [key, data] of context.previousListQueries) {
        queryClient.setQueryData(key, data)
      }
      if (context.previousDetail) {
        queryClient.setQueryData(adminOrderKeys.detail(variables.id), context.previousDetail)
      }
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData(adminOrderKeys.detail(variables.id), data)
      updateOrderCaches(queryClient, (order) => (order.id === variables.id ? { ...order, status: "shipped", selectedCarrier: data.carrier } : order))
      await queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all })
      await queryClient.invalidateQueries({ queryKey: adminOrderKeys.detail(variables.id) })
    },
  })
}

export { adminOrderKeys }

