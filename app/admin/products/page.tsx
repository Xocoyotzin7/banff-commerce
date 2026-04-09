import { getDb } from "@/lib/db"
import { listAdminProducts } from "@/lib/admin/products"
import { isAdminDemoMode, listDemoAdminProducts } from "@/lib/admin/demo-data"
import { ProductManagementPanel } from "@/components/admin/products/ProductManagementPanel"
import { AdminTravelInsightsPanel } from "@/components/admin/analytics/AdminTravelInsightsPanel"
import { getDemoTravelInsightsPayload } from "@/lib/admin/travel-insights-demo"
import { getAdminTravelInsightsPayload } from "@/lib/admin/travel-insights"
import { AdminReservationsPanel } from "@/components/admin/reservations/AdminReservationsPanel"
import { getDemoAdminReservationsPayload } from "@/lib/admin/reservations-demo"
import { getAdminReservationsPayload } from "@/lib/admin/reservations"
import { getLocaleFromCookies } from "@/lib/locale.server"
import type { Locale } from "@/lib/site-content"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: Promise<{ range?: string; month?: string }> | { range?: string; month?: string }
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const locale = (await getLocaleFromCookies()) as Locale
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const selectedMonth = resolvedSearchParams?.month ?? null
  const range = selectedMonth ? "month" : resolvedSearchParams?.range ?? "30d"

  if (isAdminDemoMode()) {
    const travelInitialData = getDemoTravelInsightsPayload(range, selectedMonth)
    const reservationsInitialData = getDemoAdminReservationsPayload(range, selectedMonth)
    return (
      <div className="space-y-8">
        <ProductManagementPanel initialProducts={listDemoAdminProducts()} locale={locale} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} locale={locale} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  }

  try {
    const database = getDb()
    const initialProducts = database.kind === "sqlite" ? listDemoAdminProducts() : await listAdminProducts(database.db)
    const travelInitialData =
      database.kind === "sqlite"
        ? getDemoTravelInsightsPayload(range, selectedMonth)
        : await getAdminTravelInsightsPayload(database.db, range, selectedMonth)
    const reservationsInitialData =
      database.kind === "sqlite"
        ? getDemoAdminReservationsPayload(range, selectedMonth)
        : await getAdminReservationsPayload(database.db, range, selectedMonth)

    return (
      <div className="space-y-8">
        <ProductManagementPanel initialProducts={initialProducts} locale={locale} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} locale={locale} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  } catch {
    const travelInitialData = getDemoTravelInsightsPayload(range, selectedMonth)
    const reservationsInitialData = getDemoAdminReservationsPayload(range, selectedMonth)
    return (
      <div className="space-y-8">
        <ProductManagementPanel initialProducts={listDemoAdminProducts()} locale={locale} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} locale={locale} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  }
}
