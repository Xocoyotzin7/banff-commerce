import { getDb } from "@/lib/db"
import { getDemoMetricsPayload, isAdminDemoMode } from "@/lib/admin/demo-data"
import { getMetricsPayload, resolveMetricsWindow } from "@/lib/metrics/service"
import { MetricsDashboard } from "@/components/metrics/MetricsDashboard"
import { AdminTravelInsightsPanel } from "@/components/admin/analytics/AdminTravelInsightsPanel"
import { getDemoTravelInsightsPayload } from "@/lib/admin/travel-insights-demo"
import { getAdminTravelInsightsPayload } from "@/lib/admin/travel-insights"
import { AdminReservationsPanel } from "@/components/admin/reservations/AdminReservationsPanel"
import { getDemoAdminReservationsPayload } from "@/lib/admin/reservations-demo"
import { getAdminReservationsPayload } from "@/lib/admin/reservations"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: Promise<{
    range?: string
    month?: string
  }> | {
    range?: string
    month?: string
  }
}

export default async function MetricsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const selectedMonth = resolvedSearchParams?.month ?? null
  const range = selectedMonth ? "month" : resolveMetricsWindow(resolvedSearchParams?.range).range
  if (isAdminDemoMode()) {
    const travelInitialData = getDemoTravelInsightsPayload(range, selectedMonth)
    const reservationsInitialData = getDemoAdminReservationsPayload(range, selectedMonth)
    return (
      <div className="space-y-8">
        <MetricsDashboard initialData={getDemoMetricsPayload(range, selectedMonth)} initialRange={range} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  }

  try {
    const database = getDb()
    const initialData =
      database.kind === "sqlite" ? getDemoMetricsPayload(range, selectedMonth) : await getMetricsPayload(database.db, range, selectedMonth)
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
        <MetricsDashboard initialData={initialData} initialRange={range} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  } catch {
    const travelInitialData = getDemoTravelInsightsPayload(range, selectedMonth)
    const reservationsInitialData = getDemoAdminReservationsPayload(range, selectedMonth)
    return (
      <div className="space-y-8">
        <MetricsDashboard initialData={getDemoMetricsPayload(range, selectedMonth)} initialRange={range} />
        <AdminTravelInsightsPanel initialData={travelInitialData} initialRange={travelInitialData.range} />
        <AdminReservationsPanel initialData={reservationsInitialData} initialRange={reservationsInitialData.range} />
      </div>
    )
  }
}
