import { notFound } from "next/navigation"

import { ProductEditPanel } from "@/components/admin/products/ProductEditPanel"
import { getDb } from "@/lib/db"
import { getAdminProductById, listProductInventoryHistory } from "@/lib/admin/products"
import { getDemoAdminProductById, isAdminDemoMode, listDemoProductInventoryHistory } from "@/lib/admin/demo-data"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params
  if (isAdminDemoMode()) {
    const product = getDemoAdminProductById(id)
    if (!product) {
      notFound()
    }

    return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} />
  }

  try {
    const database = getDb()
    if (database.kind === "sqlite") {
      const product = getDemoAdminProductById(id)
      if (!product) {
        notFound()
      }

      return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} />
    }

    const product = await getAdminProductById(database.db, id)
    if (!product) {
      notFound()
    }

    const initialHistory = await listProductInventoryHistory(database.db, id)

    return <ProductEditPanel product={product} initialHistory={initialHistory} />
  } catch {
    const product = getDemoAdminProductById(id)
    if (!product) {
      notFound()
    }

    return <ProductEditPanel product={product} initialHistory={listDemoProductInventoryHistory(id)} />
  }
}
