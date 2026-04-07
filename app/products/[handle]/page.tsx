import { notFound } from "next/navigation"

import { ProductDetail } from "@/components/products/ProductDetail"
import { getDb, NotImplementedError } from "@/lib/db"
import { getProductStockSnapshot } from "@/lib/metrics/service"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{
    handle: string
  }>
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  const database = getDb()

  if (database.kind === "sqlite") {
    throw new NotImplementedError("SQLite adapter not connected yet")
  }

  const product = await getProductStockSnapshot(database.db, handle)
  if (!product) {
    notFound()
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <ProductDetail product={product} />
    </main>
  )
}
