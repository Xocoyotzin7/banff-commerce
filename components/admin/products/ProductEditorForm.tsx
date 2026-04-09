"use client"

import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AdminProductRecord } from "@/lib/admin/products"
import { getProductAdminCopy } from "@/lib/admin/product-copy"
import { calculateVolumetricWeightKg } from "@/lib/shipping/cart-weight"
import type { Locale } from "@/lib/site-content"
import {
  type ProductPayload,
  useAdjustInventory,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-admin-products"

type FieldErrors = Partial<Record<keyof ProductPayload | "amount" | "reason", string>>

type ProductEditorFormProps = {
  mode: "create" | "edit"
  product?: AdminProductRecord | null
  locale: Locale
  onSuccess?: (productId: string) => void
  onShippingPreviewReady?: (productId: string) => void
  onCancel?: () => void
  submitLabel?: string
}

const emptyValues: ProductPayload = {
  name: "",
  category: "",
  subcategory: "",
  price: 0,
  cost: 0,
  weightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
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
    weightKg: Number(product.weightKg),
    lengthCm: Number(product.lengthCm),
    widthCm: Number(product.widthCm),
    heightCm: Number(product.heightCm),
    imageUrl: product.imageUrl,
    stock: product.stock,
    minStock: product.minStock,
  }
}

function buildProductSchema(copy = getProductAdminCopy("en")) {
  return z.object({
    name: z.string().min(1, copy.form.validation.name),
    category: z.string().min(1, copy.form.validation.category),
    subcategory: z.string().min(1, copy.form.validation.subcategory),
    price: z.coerce.number().nonnegative(copy.form.validation.price),
    cost: z.coerce.number().nonnegative(copy.form.validation.cost),
    weightKg: z.coerce.number().positive(copy.form.validation.weightKg),
    lengthCm: z.coerce.number().positive(copy.form.validation.lengthCm),
    widthCm: z.coerce.number().positive(copy.form.validation.widthCm),
    heightCm: z.coerce.number().positive(copy.form.validation.heightCm),
    imageUrl: z.string().url(copy.form.validation.imageUrl),
    stock: z.coerce.number().int().min(0, copy.form.validation.stock),
    minStock: z.coerce.number().int().min(0, copy.form.validation.minStock),
  })
}

function buildAdjustmentSchema(copy = getProductAdminCopy("en")) {
  return z.object({
    amount: z.coerce.number().int().refine((value) => value !== 0, copy.form.validation.amountZero),
    reason: z.enum(["restock", "damaged", "expired", "sold", "manual-adjustment"]),
  })
}

function resolvePreviewCountry(locale: Locale): "MX" | "CA" {
  return locale === "es" ? "MX" : "CA"
}

function buildMockShippingPreview(locale: Locale) {
  const country = resolvePreviewCountry(locale)
  const customer =
    country === "MX"
      ? {
          fullName: "Andrea Gómez",
          email: "andrea@demo.mx",
          phone: "+52 55 5555 0101",
          street: "126 Calle Banff",
          city: "Ciudad de México",
          region: "CDMX",
          postalCode: "06600",
        }
      : {
          fullName: "Mila Thompson",
          email: "mila@demo.ca",
          phone: "+1 416 555 0101",
          street: "255 King St W",
          city: "Toronto",
          region: "Ontario",
          postalCode: "M5V 3A8",
        }

  return {
    country,
    customer,
  }
}

export function ProductEditorForm({
  mode,
  product,
  locale,
  onSuccess,
  onShippingPreviewReady,
  onCancel,
  submitLabel,
}: ProductEditorFormProps) {
  const copy = useMemo(() => getProductAdminCopy(locale), [locale])
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
  const productSchema = useMemo(() => buildProductSchema(copy), [copy])
  const adjustmentSchema = useMemo(() => buildAdjustmentSchema(copy), [copy])

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

  const volumetricWeightKg = useMemo(
    () => calculateVolumetricWeightKg(values.lengthCm, values.widthCm, values.heightCm),
    [values.heightCm, values.lengthCm, values.widthCm],
  )
  const usesVolumetricWeight = volumetricWeightKg > values.weightKg
  const mockShippingPreview = useMemo(() => buildMockShippingPreview(locale), [locale])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const parsed = productSchema.safeParse(values)
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
        toast.success(copy.form.toasts.created)
        onSuccess?.(created.id)
        onShippingPreviewReady?.(created.id)
        return
      }

      if (!product) {
        throw new Error("Missing product data")
      }

      const updated = await updateProduct.mutateAsync({
        id: product.id,
        payload,
      })
      toast.success(copy.form.toasts.updated)
      onSuccess?.(updated.id)
      onShippingPreviewReady?.(updated.id)
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save product")
    }
  }

  async function handleAdjustmentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!product) {
      return
    }

    setAdjustmentErrors({})
    const parsed = adjustmentSchema.safeParse({
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
      toast.success(copy.form.toasts.adjusted)
      setAdjustmentAmount("")
      setAdjustmentReason("manual-adjustment")
    } catch (error) {
      setAdjustmentErrors({
        amount: error instanceof Error ? error.message : copy.form.validation.amountZero,
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
            {copy.edit.stockLabel}: {product.stock}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {copy.form.labels.minStock}: {product.minStock}
          </span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="product-name">{copy.form.labels.name}</Label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            />
            {fieldErrors.name ? <p className="text-xs text-destructive">{fieldErrors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">{copy.form.labels.category}</Label>
            <Input
              id="product-category"
              value={values.category}
              onChange={(event) => setValues((current) => ({ ...current, category: event.target.value }))}
            />
            {fieldErrors.category ? <p className="text-xs text-destructive">{fieldErrors.category}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-subcategory">{copy.form.labels.subcategory}</Label>
            <Input
              id="product-subcategory"
              value={values.subcategory}
              onChange={(event) => setValues((current) => ({ ...current, subcategory: event.target.value }))}
            />
            {fieldErrors.subcategory ? <p className="text-xs text-destructive">{fieldErrors.subcategory}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-image">{copy.form.labels.imageUrl}</Label>
            <Input
              id="product-image"
              type="url"
              value={values.imageUrl}
              onChange={(event) => setValues((current) => ({ ...current, imageUrl: event.target.value }))}
            />
            {fieldErrors.imageUrl ? <p className="text-xs text-destructive">{fieldErrors.imageUrl}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">{copy.form.labels.price}</Label>
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
          <div className="sm:col-span-2">
            <Collapsible defaultOpen>
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 shadow-none">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 text-left">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">📦 {copy.form.labels.shippingSection}</div>
                    <p className="text-xs text-muted-foreground">{copy.form.labels.shippingHelp}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="product-weight">{copy.form.labels.weightKg}</Label>
                      <Input
                        id="product-weight"
                        type="number"
                        inputMode="decimal"
                        step="0.001"
                        min="0.001"
                        required
                        value={values.weightKg}
                        onChange={(event) => setValues((current) => ({ ...current, weightKg: Number(event.target.value) }))}
                      />
                      {fieldErrors.weightKg ? <p className="text-xs text-destructive">{fieldErrors.weightKg}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-length">{copy.form.labels.lengthCm}</Label>
                      <Input
                        id="product-length"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0.1"
                        required
                        value={values.lengthCm}
                        onChange={(event) => setValues((current) => ({ ...current, lengthCm: Number(event.target.value) }))}
                      />
                      {fieldErrors.lengthCm ? <p className="text-xs text-destructive">{fieldErrors.lengthCm}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-width">{copy.form.labels.widthCm}</Label>
                      <Input
                        id="product-width"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0.1"
                        required
                        value={values.widthCm}
                        onChange={(event) => setValues((current) => ({ ...current, widthCm: Number(event.target.value) }))}
                      />
                      {fieldErrors.widthCm ? <p className="text-xs text-destructive">{fieldErrors.widthCm}</p> : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-height">{copy.form.labels.heightCm}</Label>
                      <Input
                        id="product-height"
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0.1"
                        required
                        value={values.heightCm}
                        onChange={(event) => setValues((current) => ({ ...current, heightCm: Number(event.target.value) }))}
                      />
                      {fieldErrors.heightCm ? <p className="text-xs text-destructive">{fieldErrors.heightCm}</p> : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    {usesVolumetricWeight ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge asChild variant="outline" className="cursor-help border-amber-500/30 bg-amber-500/15 text-amber-200">
                              <button type="button" className="rounded-md px-2 py-0.5 text-xs font-medium">
                                {copy.form.labels.volumetricWeight}: {volumetricWeightKg.toFixed(2)} kg
                              </button>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>{copy.form.labels.volumetricWarning}</TooltipContent>
                        </Tooltip>
                    ) : (
                      <Badge variant="outline" className="border-border/70 bg-background text-foreground">
                        {copy.form.labels.volumetricWeight}: {volumetricWeightKg.toFixed(2)} kg
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.customer}</p>
                        <p className="mt-1 font-medium">{mockShippingPreview.customer.fullName}</p>
                        <p className="text-xs text-muted-foreground">{mockShippingPreview.customer.email}</p>
                      </div>
                      <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px]">
                        {mockShippingPreview.country === "MX" ? copy.preview.countryLabelMX : copy.preview.countryLabelCA}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.address}</p>
                        <p className="mt-1 font-medium">{mockShippingPreview.customer.street}</p>
                        <p className="text-muted-foreground">
                          {mockShippingPreview.customer.city}, {mockShippingPreview.customer.region} {mockShippingPreview.customer.postalCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{copy.preview.phone}</p>
                        <p className="mt-1 text-muted-foreground">{mockShippingPreview.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-cost">{copy.form.labels.cost}</Label>
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
            <Label htmlFor="product-stock">{copy.form.labels.stock}</Label>
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
            <Label htmlFor="product-min-stock">{copy.form.labels.minStock}</Label>
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
            {submitLabel ?? (mode === "create" ? copy.form.actions.create : copy.form.actions.update)}
          </Button>
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              {copy.form.actions.cancel}
            </Button>
          ) : null}
        </div>
      </form>

      {mode === "edit" && product ? (
        <Card className="border-border/70 bg-muted/20 shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">{copy.form.labels.stockAdjustmentTitle}</CardTitle>
            <CardDescription>{copy.form.labels.stockAdjustmentDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" onSubmit={handleAdjustmentSubmit}>
              <div className="space-y-2">
                <Label htmlFor="adjustment-amount">{copy.form.labels.adjustmentAmount}</Label>
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
                <Label htmlFor="adjustment-reason">{copy.form.labels.adjustmentReason}</Label>
                <Select value={adjustmentReason} onValueChange={(value) => setAdjustmentReason(value as typeof adjustmentReason)}>
                  <SelectTrigger id="adjustment-reason" className="w-full">
                    <SelectValue placeholder={copy.form.labels.adjustmentReason} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">{copy.form.options.restock}</SelectItem>
                    <SelectItem value="damaged">{copy.form.options.damaged}</SelectItem>
                    <SelectItem value="expired">{copy.form.options.expired}</SelectItem>
                    <SelectItem value="sold">{copy.form.options.sold}</SelectItem>
                    <SelectItem value="manual-adjustment">{copy.form.options.manualAdjustment}</SelectItem>
                  </SelectContent>
                </Select>
                {adjustmentErrors.reason ? <p className="text-xs text-destructive">{adjustmentErrors.reason}</p> : null}
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={isAdjusting}>
                  {copy.form.labels.applyAdjustment}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
