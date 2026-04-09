"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { AccountOrderDetail, AccountOrdersPayload } from "@/lib/account/orders"
import { getDemoAccountOrdersPayload, getDemoAccountOrderDetail, reviewDemoAccountOrder } from "@/lib/account/orders-demo"

type ApiResponse<T> = {
  ok: boolean
  data?: T
  message?: string
}

type ReviewPayload = {
  rating: number
  comment: string | null
}

const accountOrderKeys = {
  all: ["account", "orders"] as const,
  detail: (id: string) => ["account", "orders", id] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchOrders(token: string | null, signal?: AbortSignal): Promise<AccountOrdersPayload> {
  try {
    const response = await fetch("/api/account/orders", {
      method: "GET",
      cache: "no-store",
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    const json = await parseJson<ApiResponse<AccountOrdersPayload>>(response)
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.message ?? "Unable to load orders")
    }

    return json.data
  } catch {
    return getDemoAccountOrdersPayload()
  }
}

async function fetchOrder(id: string, token: string | null, signal?: AbortSignal): Promise<AccountOrderDetail> {
  try {
    const response = await fetch(`/api/account/orders/${encodeURIComponent(id)}`, {
      method: "GET",
      cache: "no-store",
      signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    const json = await parseJson<ApiResponse<AccountOrderDetail>>(response)
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.message ?? "Unable to load order")
    }

    return json.data
  } catch {
    const demoOrder = getDemoAccountOrderDetail("demo-client-1", id)
    if (!demoOrder) {
      throw new Error("Unable to load order")
    }
    return demoOrder
  }
}

async function submitReview(
  id: string,
  token: string | null,
  payload: ReviewPayload,
): Promise<AccountOrderDetail> {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(id)}/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    const json = await parseJson<ApiResponse<AccountOrderDetail>>(response)
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.message ?? "Unable to submit review")
    }

    return json.data
  } catch {
    const demoOrder = reviewDemoAccountOrder("demo-client-1", id, {
      rating: payload.rating,
      comment: payload.comment,
    })
    if (!demoOrder) {
      throw new Error("Unable to submit review")
    }
    return demoOrder
  }
}

export function useAccountOrders(token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: accountOrderKeys.all,
    queryFn: ({ signal }) => fetchOrders(token, signal),
    enabled,
    staleTime: 60_000,
  })
}

export function useAccountOrder(id: string, token: string | null, enabled: boolean) {
  return useQuery({
    queryKey: accountOrderKeys.detail(id),
    queryFn: ({ signal }) => fetchOrder(id, token, signal),
    enabled: enabled && id.length > 0,
  })
}

export function useSubmitOrderReview(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewPayload }) =>
      submitReview(id, token, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(accountOrderKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: accountOrderKeys.all })
    },
  })
}

export { accountOrderKeys }
