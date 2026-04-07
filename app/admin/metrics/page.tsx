import { getDb, NotImplementedError } from "@/lib/db"
import { getMetricsPayload, resolveMetricsWindow } from "@/lib/metrics/service"
import { MetricsDashboard } from "@/components/metrics/MetricsDashboard"

export const dynamic = "force-dynamic"

type PageProps = {
  searchParams?: Promise<{
    range?: string
  }> | {
    range?: string
  }
}

export default async function MetricsPage({ searchParams }: PageProps) {
  const database = getDb()

  if (database.kind === "sqlite") {
    throw new NotImplementedError("SQLite adapter not connected yet")
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const range = resolveMetricsWindow(resolvedSearchParams?.range).range
  const initialData = await getMetricsPayload(database.db, range)

  return <MetricsDashboard initialData={initialData} initialRange={range} />
}
