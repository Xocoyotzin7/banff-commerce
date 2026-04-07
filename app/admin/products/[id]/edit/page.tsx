import { notFound } from "next/navigation"

import { ProductEditPanel } from "@/components/admin/products/ProductEditPanel"
import { getDb, NotImplementedError } from "@/lib/db"
import { getAdminProductById, listProductInventoryHistory } from "@/lib/admin/products"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params
  const database = getDb()

  if (database.kind === "sqlite") {
    throw new NotImplementedError("SQLite adapter not connected yet")
  }

  const product = await getAdminProductById(database.db, id)
  if (!product) {
    notFound()
  }

  const initialHistory = await listProductInventoryHistory(database.db, id)

  return <ProductEditPanel product={product} initialHistory={initialHistory} />
}
