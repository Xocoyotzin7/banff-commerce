"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AdminProductRecord } from "@/lib/admin/products"
import {
  type ProductPayload,
  useAdjustInventory,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-admin-products"

const ProductSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  subcategory: z.string().min(1, "La subcategoría es obligatoria"),
  price: z.coerce.number().nonnegative("El precio no puede ser negativo"),
  cost: z.coerce.number().nonnegative("El costo no puede ser negativo"),
  imageUrl: z.string().url("Ingresa una URL válida"),
  stock: z.coerce.number().int().min(0, "El stock no puede ser negativo"),
  minStock: z.coerce.number().int().min(0, "El stock mínimo no puede ser negativo"),
})

const AdjustmentSchema = z.object({
  amount: z.coerce.number().int().refine((value) => value !== 0, "La cantidad no puede ser cero"),
  reason: z.enum(["restock", "damaged", "expired", "sold", "manual-adjustment"]),
})

type FieldErrors = Partial<Record<keyof ProductPayload | "amount" | "reason", string>>

type ProductEditorFormProps = {
  mode: "create" | "edit"
  product?: AdminProductRecord | null
  onSuccess?: (productId: string) => void
  onCancel?: () => void
  submitLabel?: string
}

const emptyValues: ProductPayload = {
  name: "",
  category: "",
  subcategory: "",
  price: 0,
  cost: 0,
  imageUrl: "",
  stock: 0,
  minStock: 5,
}

function serializePayload(product?: AdminProductRecord | null): ProductPayload {
  if (!product) {
    return emptyValues
  }

  return {
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: Number(product.price),
    cost: Number(product.cost),
    imageUrl: product.imageUrl,
    stock: product.stock,
    minStock: product.minStock,
  }
}

export function ProductEditorForm({
  mode,
  product,
  onSuccess,
  onCancel,
  submitLabel,
}: ProductEditorFormProps) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const adjustInventory = useAdjustInventory()

  const [values, setValues] = useState<ProductPayload>(() => serializePayload(product))
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState<"restock" | "damaged" | "expired" | "sold" | "manual-adjustment">(
    "manual-adjustment",
  )
  const [adjustmentErrors, setAdjustmentErrors] = useState<FieldErrors>({})

  useEffect(() => {
    setValues(serializePayload(product))
    setFieldErrors({})
    setFormError(null)
    setAdjustmentAmount("")
    setAdjustmentReason("manual-adjustment")
    setAdjustmentErrors({})
  }, [product, mode])

  const currentStockTone: "secondary" | "destructive" | "outline" = useMemo(() => {
    if (!product) return "secondary"
    if (product.stock === 0) return "destructive"
    if (product.stock <= product.minStock) return "secondary"
    return "outline"
  }, [product])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const parsed = ProductSchema.safeParse(values)
    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string") {
          nextErrors[key as keyof FieldErrors] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    try {
      const payload = parsed.data
      if (mode === "create") {
        const created = await createProduct.mutateAsync(payload)
        toast.success("Producto creado")
        onSuccess?.(created.id)
        return
      }

      if (!product) {
        throw new Error("Missing product data")
      }

      const updated = await updateProduct.mutateAsync({
        id: product.id,
        payload,
      })
      toast.success("Producto actualizado")
      onSuccess?.(updated.id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo guardar el producto")
    }
  }

  async function handleAdjustmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!product) {
      return
    }

    setAdjustmentErrors({})
    const parsed = AdjustmentSchema.safeParse({
      amount: adjustmentAmount,
      reason: adjustmentReason,
    })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (typeof key === "string") {
          nextErrors[key as keyof FieldErrors] = issue.message
        }
      }
      setAdjustmentErrors(nextErrors)
      return
    }

    try {
      const { amount, reason } = parsed.data
      await adjustInventory.mutateAsync({
        productId: product.id,
        amount,
        reason,
      })
      toast.success("Inventario actualizado")
      setAdjustmentAmount("")
      setAdjustmentReason("manual-adjustment")
    } catch (error) {
      setAdjustmentErrors({
        amount: error instanceof Error ? error.message : "No se pudo ajustar el inventario",
      })
    }
  }

  const isSaving = createProduct.isPending || updateProduct.isPending
  const isAdjusting = adjustInventory.isPending

  return (
    <div className="space-y-6">
      {formError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      {product ? (
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={currentStockTone === "destructive" ? "destructive" : currentStockTone === "secondary" ? "secondary" : "outline"}>
            Stock actual: {product.stock}
          </Badge>
          <span className="text-sm text-muted-foreground">Min stock: {product.minStock}</span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">Name</Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            />
            {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Input
              id="product-category"
              value={values.category}
              onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
            />
            {fieldErrors.category ? <p className="text-xs text-destructive">{fieldErrors.category}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-subcategory">Subcategory</Label>
            <Input
              id="product-subcategory"
              value={values.subcategory}
              onChange={(event) => setValues((current) => ({ ...current, subcategory: event.target.value }))}
            />
            {fieldErrors.subcategory ? <p className="text-xs text-destructive">{fieldErrors.subcategory}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-image">Image URL</Label>
            <Input
              id="product-image"
              type="url"
              value={values.imageUrl}
              onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
            />
            {fieldErrors.imageUrl ? <p className="text-xs text-destructive">{fieldErrors.imageUrl}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              value={values.price}
              onChange={(event) => setValues((current) => ({ ...current, price: Number(event.target.value) }))}
            />
            {fieldErrors.price ? <p className="text-xs text-destructive">{fieldErrors.price}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-cost">Cost</Label>
            <Input
              id="product-cost"
              type="number"
              step="0.01"
              min="0"
              value={values.cost}
              onChange={(event) => setValues((current) => ({ ...current, cost: Number(event.target.value) }))}
            />
            {fieldErrors.cost ? <p className="text-xs text-destructive">{fieldErrors.cost}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-stock">Stock</Label>
            <Input
              id="product-stock"
              type="number"
              step="1"
              min="0"
              value={values.stock}
              onChange={(event) => setValues((current) => ({ ...current, stock: Number(event.target.value) }))}
            />
            {fieldErrors.stock ? <p className="text-xs text-destructive">{fieldErrors.stock}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-min-stock">Min Stock</Label>
            <Input
              id="product-min-stock"
              type="number"
              step="1"
              min="0"
              value={values.minStock}
              onChange={(event) => setValues((current) => ({ ...current, minStock: Number(event.target.value) }))}
            />
            {fieldErrors.minStock ? <p className="text-xs text-destructive">{fieldErrors.minStock}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={isSaving}>
            {submitLabel ?? (mode === "create" ? "Create product" : "Save changes")}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>

      {mode === "edit" && product ? (
        <Card className="border-border/70 bg-muted/20 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">Stock adjustment</CardTitle>
            <CardDescription>Positive amounts restock. Negative amounts consume stock.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleAdjustmentSubmit}>
              <div className="space-y-2">
                <Label htmlFor="adjustment-amount">Adjustment amount</Label>
                <Input
                  id="adjustment-amount"
                  type="number"
                  step="1"
                  value={adjustmentAmount}
                  onChange={(event) => setAdjustmentAmount(event.target.value)}
                />
                {adjustmentErrors.amount ? <p className="text-xs text-destructive">{adjustmentErrors.amount}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adjustment-reason">Reason</Label>
                <Select value={adjustmentReason} onValueChange={(value) => setAdjustmentReason(value as typeof adjustmentReason)}>
                  <SelectTrigger id="adjustment-reason" className="w-full">
                    <SelectValue placeholder="Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">restock</SelectItem>
                    <SelectItem value="damaged">damaged</SelectItem>
                    <SelectItem value="expired">expired</SelectItem>
                    <SelectItem value="sold">sold</SelectItem>
                    <SelectItem value="manual-adjustment">manual-adjustment</SelectItem>
                  </SelectContent>
                </Select>
                {adjustmentErrors.reason ? <p className="text-xs text-destructive">{adjustmentErrors.reason}</p> : null}
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={isAdjusting}>
                  Apply
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
