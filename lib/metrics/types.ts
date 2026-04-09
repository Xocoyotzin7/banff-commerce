export const METRICS_RANGE_KEYS = ["1d", "3d", "7d", "14d", "30d", "90d", "365d", "month"] as const

export type MetricsRangeKey = (typeof METRICS_RANGE_KEYS)[number]

export type MetricsRange = MetricsRangeKey | "month"

export const METRICS_RANGE_LABELS: Record<MetricsRange, string> = {
  "1d": "1 día",
  "3d": "3 días",
  "7d": "7 días",
  "14d": "14 días",
  "30d": "30 días",
  "90d": "90 días",
  "365d": "365 días",
  month: "Mes",
}

export const SECTION_IDS = ["clients", "sales", "payments", "orders", "analytics", "employees", "inventory"] as const

export type SectionId = (typeof SECTION_IDS)[number]

export type ChartBar = {
  label: string
  value: number
  secondary?: number
}

export type MetricCard = {
  label: string
  value: string | number
  hint?: string
}

export type SectionTable = {
  columns: string[]
  rows: Array<Record<string, string | number>>
}

export type SectionPayload = {
  title: string
  hasData: boolean
  cards: MetricCard[]
  bars: ChartBar[]
  table?: SectionTable
  extraTables?: Array<{ title: string; table: SectionTable }>
  message?: string
}

export type ForecastRestock = {
  id: string
  name: string
  quantity: number
  avgDailyUse: number
  daysRemaining: number | null
  nextRestock?: string | null
}

export type ForecastProduction = {
  id: string
  name: string
  dailyAverage: number
  weeklyDemand: number
  peakHour: string
}

export type ForecastActivity = {
  day: string
  hour: string
  count: number
}

export type ForecastSummary = {
  label: string
  days: number
  revenue: number
  orders: number
  busiestDay: string
  topActivity: ForecastActivity[]
}

export type MarketingSegment = {
  name: string
  description: string
  count: number
  avgTicket: number
  chart: {
    points: Array<{ orders: number; spent: number }>
    centroid: { orders: number; spent: number }
  }
}

export type MarketingSuggestion = {
  product: string
  reason: string
}

export type MarketingOrderInference = {
  from: string
  to: string
  probability: number
}

export type MarketingInventoryInsight = {
  item: string
  risk: string
  recommendation: string
}

export type MarketingAnomaly = {
  label: string
  description: string
}

export type MarketingInsights = {
  salesClusters: MarketingSegment[]
  productSuggestions: MarketingSuggestion[]
  bestHours: ForecastActivity[]
  orderInference: MarketingOrderInference[]
  inventoryBayesian: MarketingInventoryInsight[]
  anomalies: MarketingAnomaly[]
}

export type ForecastPayload = {
  restock: ForecastRestock[]
  production: ForecastProduction[]
  salesWindows: ForecastSummary[]
  branchDemand: Array<{ branch: string; points: Array<{ date: string; revenue: number }> }>
}

export type MetricsKpi = {
  label: string
  value: number
  trend: number | null
  trendLabel: string
}

export type MetricsSeriesPoint = {
  date: string
  label: string
  grossTotal: number
  taxAmount: number
  shippingAmount: number
  netSales: number
}

export type MetricsProductPoint = {
  name: string
  units: number
  revenue: number
}

export type MetricsInventoryAlert = {
  id: string
  name: string
  quantity: number
  minStock: number
}

export type MetricsPayload = {
  range: MetricsRange
  rangeLabel: string
  since: string
  until: string
  selectedMonth?: string | null
  hasData: boolean
  sections: Record<SectionId, SectionPayload>
  forecasts: ForecastPayload
  marketing: MarketingInsights
  kpis: MetricsKpi[]
  salesSeries: MetricsSeriesPoint[]
  topProducts: MetricsProductPoint[]
  inventoryAlerts: MetricsInventoryAlert[]
  availableMonths?: Array<{ month: string; label: string }>
}

export type ProductStockSnapshot = {
  id: string
  handle: string
  name: string
  stock: number
  minStock: number
}
