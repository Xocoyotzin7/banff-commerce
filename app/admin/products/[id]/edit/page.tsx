import { notFound } from "next/navigation"

import { ProductEditPanel } from "@/components/admin/products/ProductEditPanel"
import { getDb } from "@/lib/db"
import { getAdminProductById, listProductInventoryHistory } from "@/lib/admin/products"
import { getDemoAdminProductById, isAdminDemoMode, listDemoProductInventoryHistory } from "@/lib/admin/demo-data"
import { getLocaleFromCookies } from "@/lib/locale.server"
import type { Locale } from "@/lib/site-content"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params
  const locale = (await getLocaleFromCookies()) as Locale
  if (isAdminDemoMode()) {
    const product = getDemoAdminProductById(id)
    if (!product) {
      notFound()
    }

    return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} locale={locale} />
  }

  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      const product = getDemoAdminProductById(id)
      if (!product) {
        notFound()
      }

      return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} locale={locale} />
    }

    const product = await getAdminProductById(database.db, id)
    if (!product) {
      notFound()
    }

    const initialHistory = await listProductInventoryHistory(database.db, id)

    return <ProductEditPanel product={product} initialHistory={initialHistory} locale={locale} />
  } catch {
    const product = getDemoAdminProductById(id)
    if (!product) {
      notFound()
    }

    return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} locale={locale} />
  }
}
