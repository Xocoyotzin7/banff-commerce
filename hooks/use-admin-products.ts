"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { AdminInventoryLedgerRecord, AdminProductRecord } from "@/lib/admin/products"

type ProductPayload = {
  name: string
  category: string
  subcategory: string
  price: number
  cost: number
  weightKg: number
  lengthCm: number
  widthCm: number
  heightCm: number
  imageUrl: string
  stock: number
  minStock: number
}

type AdminListResponse = {
  success: boolean
  data?: AdminProductRecord[]
  message?: string
}

type AdminItemResponse = {
  success: boolean
  data?: AdminProductRecord
  message?: string
}

type AdminHistoryResponse = {
  success: boolean
  data?: AdminInventoryLedgerRecord[]
  message?: string
}

type MutationResponse = {
  success: boolean
  data?: { id: string }
  message?: string
}

type InventoryAdjustmentPayload = {
  productId: string
  amount: number
  reason: "restock" | "damaged" | "expired" | "sold" | "manual-adjustment"
}

const adminProductsKeys = {
  all: ["admin", "products"] as const,
  detail: (id: string) => ["admin", "products", id] as const,
  inventory: (id: string) => ["admin", "inventory", id] as const,
}

async function parseJson<T>(response: Response): Promise<T> {
  const json = (await response.json()) as T
  return json
}

export function useAdminProducts(initialData?: AdminProductRecord[]) {
  return useQuery({
    queryKey: adminProductsKeys.all,
    queryFn: async () => {
      const response = await fetch("/api/admin/products", {
        method: "GET",
        cache: "no-store",
      })
      const json = await parseJson<AdminListResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to load products")
      }

      return json.data
    },
    initialData,
  })
}

export function useAdminProduct(id: string, initialData?: AdminProductRecord | null) {
  return useQuery({
    queryKey: adminProductsKeys.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      })
      const json = await parseJson<AdminItemResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to load product")
      }

      return json.data
    },
    initialData: initialData ?? undefined,
    enabled: id.length > 0,
  })
}

export function useAdminInventoryHistory(id: string, initialData?: AdminInventoryLedgerRecord[]) {
  return useQuery({
    queryKey: adminProductsKeys.inventory(id),
    queryFn: async () => {
      const response = await fetch(`/api/admin/inventory?productId=${encodeURIComponent(id)}`, {
        method: "GET",
        cache: "no-store",
      })
      const json = await parseJson<AdminHistoryResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to load inventory history")
      }

      return json.data
    },
    initialData,
    enabled: id.length > 0,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ProductPayload) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const json = await parseJson<MutationResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to create product")
      }

      return json.data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: ProductPayload
    }) => {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const json = await parseJson<MutationResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to update product")
      }

      return json.data
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.all })
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(variables.id) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      const json = await parseJson<MutationResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to delete product")
      }

      return json.data
    },
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.all })
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(id) })
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.inventory(id) })
    },
  })
}

export function useAdjustInventory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: InventoryAdjustmentPayload) => {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      const json = await parseJson<MutationResponse>(response)

      if (!response.ok || !json.success || !json.data) {
        throw new Error(json.message ?? "Unable to adjust inventory")
      }

      return json.data
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.all })
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(variables.productId) })
      await queryClient.invalidateQueries({ queryKey: adminProductsKeys.inventory(variables.productId) })
    },
  })
}

export { adminProductsKeys }
export type { ProductPayload, InventoryAdjustmentPayload }
