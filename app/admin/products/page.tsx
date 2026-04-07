import { getDb, NotImplementedError } from "@/lib/db"
import { listAdminProducts } from "@/lib/admin/products"
import { ProductManagementPanel } from "@/components/admin/products/ProductManagementPanel"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  const database = getDb()

  if (database.kind === "sqlite") {
    throw new NotImplementedError("SQLite adapter not connected yet")
  }

  const initialProducts = await listAdminProducts(database.db)

  return <ProductManagementPanel initialProducts={initialProducts} />
}
