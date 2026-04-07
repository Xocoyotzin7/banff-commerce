"use client"

import { useEffect, useRef, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChevronRight, FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PeriodPicker } from "@/components/admin/PeriodPicker"
import { ChartBuildFrame } from "@/components/admin/charts/ChartBuildFrame"
import { ChartHoverDownloadArea } from "@/components/admin/charts/ChartHoverDownloadArea"
import { ChartPngButton } from "@/components/admin/charts/ChartPngButton"
import { InventoryAlert } from "@/components/metrics/InventoryAlert"
import { KPICard } from "@/components/metrics/KPICard"
import { SequentialBarShape } from "@banff/agency-core/components/shared/SequentialBarShape"
import { ScrollRevealStagger } from "@banff/agency-core/components/shared/ScrollRevealStagger"
import { SequentialChartDataRenderer } from "@banff/agency-core/components/shared/SequentialChartDataRenderer"
import { buildMetricsCsv, buildMetricsWorkbook } from "@/lib/metrics/export"
import type { MetricsPayload, MetricsRange } from "@/lib/metrics/types"

type MetricsDashboardProps = {
  initialData: MetricsPayload
  initialRange: MetricsRange
}

type MetricsResponse = {
  success: boolean
  data?: MetricsPayload & {
    selectedRange?: MetricsRange
  }
}

function createSequentialBarShape(shouldReduceMotion: boolean, orientation: "vertical" | "horizontal") {
  return function SequentialBarShapeRenderer(props: {
    x?: number
    y?: number
    width?: number
    height?: number
    fill?: string
    index?: number
  }) {
    return <SequentialBarShape {...props} reduceMotion={shouldReduceMotion} orientation={orientation} />
  }
}

const salesChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
} as const

const productChartConfig = {
  units: {
    label: "Units",
    color: "hsl(var(--accent))",
  },
} as const

const branchChartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--secondary))",
  },
} as const

const restockChartConfig = {
  days: {
    label: "Days remaining",
    color: "hsl(var(--primary))",
  },
} as const

async function fetchMetrics(range: MetricsRange, month: string | null, signal?: AbortSignal): Promise<MetricsPayload | null> {
  const params = new URLSearchParams({ range })
  if (month) {
    params.set("month", month)
  }
  const response = await fetch(`/api/metrics?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  })
  if (!response.ok) {
    return null
  }
  const json = (await response.json()) as MetricsResponse
  if (!json.success || !json.data) {
    return null
  }
  return json.data
}

export function MetricsDashboard({ initialData, initialRange }: MetricsDashboardProps) {
  const [range, setRange] = useState<MetricsRange>(initialRange)
  const [useRange, setUseRange] = useState(initialRange !== "month")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(initialData.selectedMonth ?? null)
  const [data, setData] = useState<MetricsPayload>(initialData)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)
  const lastLoadedKey = useRef<string>(`${initialRange}:${initialData.selectedMonth ?? ""}`)
  const salesChartRef = useRef<HTMLDivElement | null>(null)
  const topProductsChartRef = useRef<HTMLDivElement | null>(null)
  const branchRevenueChartRef = useRef<HTMLDivElement | null>(null)
  const restockChartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const key = `${useRange ? range : "month"}:${useRange ? "" : selectedMonth ?? ""}`
    if (lastLoadedKey.current === key) {
      return
    }

    const controller = new AbortController()
    let mounted = true

    async function load() {
      setLoading(true)
      const nextData = await fetchMetrics(useRange ? range : "month", useRange ? null : selectedMonth, controller.signal)
      if (mounted && nextData) {
        setData(nextData)
        lastLoadedKey.current = key
      }
      if (mounted) {
        setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [range, selectedMonth, useRange])

  const salesSeries = data.salesSeries
  const topProducts = data.topProducts
  const lowStockItems = data.inventoryAlerts.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    minStock: item.minStock,
  }))
  const branchRevenue = data.forecasts.branchDemand.map((branch) => ({
    branch: branch.branch,
    revenue: branch.points.reduce((sum, point) => sum + point.revenue, 0),
  }))
  const restockChart = data.forecasts.restock.map((item) => ({
    name: item.name,
    daysRemaining: item.daysRemaining ?? 0,
    quantity: item.quantity,
  }))
  const chartExportSuffix = data.selectedMonth ? `${data.range}-${data.selectedMonth}` : data.range

  async function downloadMetrics(format: "csv" | "xlsx") {
    setExporting(format)
    try {
      if (format === "csv") {
        const csv = buildMetricsCsv(data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `metrics-${data.range}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const workbook = buildMetricsWorkbook(data)
        const array = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true })
        const blob = new Blob([array], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `metrics-${data.range}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
      }
      toast.success(format === "csv" ? "CSV exportado" : "Excel exportado")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos exportar los datos")
    } finally {
      setExporting(null)
    }
  }

  const periodOptions = [
    { value: "1d", label: "24h" },
    { value: "7d", label: "7d" },
    { value: "30d", label: "30d" },
    { value: "90d", label: "90d" },
    { value: "365d", label: "365d" },
    { value: "month", label: "Mes" },
  ] as const

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit rounded-full border-border/70 px-3 py-1 text-[11px] uppercase tracking-[0.28em]">
              Admin metrics
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Advanced metrics dashboard</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Operational view for the store owner. The panels below track revenue, ticket size, stock pressure, and traffic signals without adding a premium veneer.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4 md:hidden"
              onClick={() => void downloadMetrics("csv")}
              disabled={exporting !== null}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "csv" ? "Exportando..." : "CSV"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full px-4 md:hidden"
              onClick={() => void downloadMetrics("xlsx")}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {exporting === "xlsx" ? "Exportando..." : "Excel"}
            </Button>
          </div>
        </div>

        <PeriodPicker
          range={useRange ? range : "month"}
          rangeOptions={periodOptions}
          selectedMonth={selectedMonth}
          availableMonths={data.availableMonths ?? []}
          useRange={useRange}
          onToggleRange={(value) => {
            setUseRange(value)
            if (!value && !selectedMonth) {
              const fallback = data.availableMonths?.[0]?.month ?? null
              setSelectedMonth(fallback)
            }
          }}
          onRangeChange={(value) => {
            setRange(value)
            setUseRange(value !== "month")
            if (value === "month") {
              setSelectedMonth((prev) => prev ?? data.availableMonths?.[0]?.month ?? null)
            }
          }}
          onMonthChange={(value) => {
            setSelectedMonth(value)
            setUseRange(false)
          }}
          isFetching={loading}
        />

        <ScrollRevealStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.kpis.map((card) => (
            <KPICard
              key={card.label}
              label={card.label}
              value={card.value}
              trend={card.trend}
              trendLabel={card.trendLabel}
            />
          ))}
        </ScrollRevealStagger>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <div ref={salesChartRef}>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Sales chart</CardTitle>
                  <p className="text-sm text-muted-foreground">Daily revenue for the selected period.</p>
                </div>
                <ChartPngButton targetRef={salesChartRef} filename={`sales-chart-${chartExportSuffix}`} className="hidden md:inline-flex" />
              </CardHeader>
              <CardContent className="h-[320px]">
                <ChartBuildFrame className="h-full">
                  {({ isVisible, shouldReduceMotion }) => (
                  <ChartHoverDownloadArea targetRef={salesChartRef} filename={`sales-chart-${chartExportSuffix}`} className="h-full">
                      {salesSeries.length ? (
                        <SequentialChartDataRenderer data={salesSeries} active={isVisible} reduceMotion={shouldReduceMotion} stepMs={110}>
                          {({ data: chartData }) => (
                            <ChartContainer config={salesChartConfig} className="h-full w-full">
                              <LineChart key={`sales-line-${chartData.length}`} data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  width={48}
                                  tickFormatter={(value) => `$${Number(value).toLocaleString("es-MX")}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Line
                                  type="monotone"
                                  dataKey="revenue"
                                  stroke="var(--color-revenue)"
                                  strokeWidth={3}
                                  dot={{ r: 4, fill: "var(--color-revenue)", strokeWidth: 0 }}
                                  baseLine={0}
                                  isAnimationActive={!shouldReduceMotion}
                                  animationBegin={0}
                                  animationDuration={900}
                                />
                              </LineChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          No sales data for this range.
                        </div>
                      )}
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>

          <div ref={topProductsChartRef}>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Top products</CardTitle>
                  <p className="text-sm text-muted-foreground">Top 5 by units sold.</p>
                </div>
                <ChartPngButton targetRef={topProductsChartRef} filename={`top-products-${chartExportSuffix}`} className="hidden md:inline-flex" />
              </CardHeader>
              <CardContent className="h-[320px]">
                <ChartBuildFrame className="h-full">
                  {({ isVisible, shouldReduceMotion }) => (
                    <ChartHoverDownloadArea targetRef={topProductsChartRef} filename={`top-products-${chartExportSuffix}`} className="h-full">
                      {topProducts.length ? (
                        <SequentialChartDataRenderer
                          data={topProducts}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={80}
                        >
                          {({ data: chartData, complete }) => (
                            <ChartContainer config={productChartConfig} className="h-full w-full">
                              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Bar
                                  dataKey="units"
                                  fill="var(--color-units)"
                                  radius={[0, 8, 8, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "horizontal")}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          No sold products yet.
                        </div>
                      )}
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div ref={branchRevenueChartRef}>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Revenue by branch</CardTitle>
                  <p className="text-sm text-muted-foreground">Aggregated demand from forecast windows.</p>
                </div>
                <ChartPngButton targetRef={branchRevenueChartRef} filename={`revenue-by-branch-${chartExportSuffix}`} className="hidden md:inline-flex" />
              </CardHeader>
              <CardContent className="h-[280px]">
                <ChartBuildFrame className="h-full">
                  {({ isVisible, shouldReduceMotion }) => (
                    <ChartHoverDownloadArea targetRef={branchRevenueChartRef} filename={`revenue-by-branch-${chartExportSuffix}`} className="h-full">
                      {branchRevenue.length ? (
                        <SequentialChartDataRenderer
                          data={branchRevenue}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={80}
                        >
                          {({ data: chartData }) => (
                            <ChartContainer config={branchChartConfig} className="h-full w-full">
                              <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="branch" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  width={52}
                                  tickFormatter={(value) => `$${Number(value).toLocaleString("es-MX")}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Bar
                                  dataKey="revenue"
                                  fill="var(--color-revenue)"
                                  radius={[8, 8, 0, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical")}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          No branch data available.
                        </div>
                      )}
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>

          <div ref={restockChartRef}>
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">Restock pressure</CardTitle>
                  <p className="text-sm text-muted-foreground">Days remaining per low-stock item.</p>
                </div>
                <ChartPngButton targetRef={restockChartRef} filename={`restock-pressure-${chartExportSuffix}`} className="hidden md:inline-flex" />
              </CardHeader>
              <CardContent className="h-[280px]">
                <ChartBuildFrame className="h-full">
                  {({ isVisible, shouldReduceMotion }) => (
                    <ChartHoverDownloadArea targetRef={restockChartRef} filename={`restock-pressure-${chartExportSuffix}`} className="h-full">
                      {restockChart.length ? (
                        <SequentialChartDataRenderer
                          data={restockChart}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={80}
                        >
                          {({ data: chartData }) => (
                            <ChartContainer config={restockChartConfig} className="h-full w-full">
                              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={140} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Bar
                                  dataKey="daysRemaining"
                                  fill="var(--color-days)"
                                  radius={[0, 8, 8, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "horizontal")}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          No restock issues detected.
                        </div>
                      )}
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>
        </div>

        <InventoryAlert items={lowStockItems} />

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">AI Insights</CardTitle>
            <p className="text-sm text-muted-foreground">Collapsed by default. Operational heuristics for the owner.</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="insights">
                <AccordionTrigger>Open insights</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Sales clusters
                      </h3>
                      <div className="space-y-2">
                        {data.marketing.salesClusters.map((cluster) => (
                          <div key={cluster.name} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">{cluster.name}</div>
                              <div className="text-xs text-muted-foreground">{cluster.count} clients</div>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{cluster.description}</p>
                            <div className="mt-2 text-sm">
                              Avg ticket: <span className="font-medium">${cluster.avgTicket.toLocaleString("es-MX")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Markov chain landing transitions
                      </h3>
                      <div className="space-y-2">
                        {data.marketing.orderInference.slice(0, 5).map((transition) => (
                          <div key={`${transition.from}-${transition.to}`} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{transition.from}</span>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{transition.to}</span>
                            </div>
                            <span className="text-muted-foreground">{transition.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Anomalies
                      </h3>
                      <div className="space-y-2">
                        {data.marketing.anomalies.length ? (
                          data.marketing.anomalies.map((anomaly) => (
                            <div key={anomaly.label} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                              <div className="font-medium">{anomaly.label}</div>
                              <div className="text-sm text-muted-foreground">{anomaly.description}</div>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border/70 bg-background/60 p-3 text-sm text-muted-foreground">
                            No outliers detected.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 lg:col-span-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Section overview
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Object.entries(data.sections).map(([key, section]) => {
                          const total = section.bars.reduce((sum, bar) => sum + bar.value, 0)
                          return (
                            <div key={key} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium">{section.title}</div>
                                <div className="text-xs text-muted-foreground">{section.hasData ? "Live mock" : "Empty"}</div>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-[color:var(--primary)]"
                                  style={{ width: `${Math.max(8, Math.min(100, total))}%` }}
                                />
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">{total} total points</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        Restock forecast
                      </h3>
                      <div className="space-y-2">
                        {data.forecasts.restock.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.daysRemaining !== null ? `${item.daysRemaining} days` : "N/A"}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              Qty {item.quantity} · Avg daily use {item.avgDailyUse}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
