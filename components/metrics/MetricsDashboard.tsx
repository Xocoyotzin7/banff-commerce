'use client'

import { useEffect, useRef, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChevronRight } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InventoryAlert } from "@/components/metrics/InventoryAlert"
import { KPICard } from "@/components/metrics/KPICard"
import type { MetricsPayload, MetricsRange } from "@/lib/metrics/types"
import { cn } from "@/lib/utils"

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

const RANGE_OPTIONS: Array<{ value: MetricsRange; label: string }> = [
  { value: "1d", label: "1d" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
  { value: "365d", label: "365d" },
  { value: "month", label: "mes" },
]

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

async function fetchMetrics(range: MetricsRange, signal?: AbortSignal): Promise<MetricsPayload | null> {
  const response = await fetch(`/api/metrics?range=${encodeURIComponent(range)}`, {
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
  const [data, setData] = useState<MetricsPayload>(initialData)
  const [loading, setLoading] = useState(false)
  const lastLoadedRange = useRef<MetricsRange>(initialRange)

  useEffect(() => {
    if (lastLoadedRange.current === range) {
      return
    }

    const controller = new AbortController()
    let mounted = true

    async function load() {
      setLoading(true)
      const nextData = await fetchMetrics(range, controller.signal)
      if (mounted && nextData) {
        setData(nextData)
        lastLoadedRange.current = range
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
  }, [range])

  const salesSeries = data.salesSeries
  const topProducts = data.topProducts
  const lowStockItems = data.inventoryAlerts.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    minStock: item.minStock,
  }))

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
            {RANGE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={range === option.value ? "default" : "outline"}
                className={cn("rounded-full px-4", loading && range === option.value && "opacity-80")}
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.kpis.map((card) => (
            <KPICard
              key={card.label}
              label={card.label}
              value={card.value}
              trend={card.trend}
              trendLabel={card.trendLabel}
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">Sales chart</CardTitle>
                <p className="text-sm text-muted-foreground">Daily revenue for the selected period.</p>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              {salesSeries.length ? (
                <ChartContainer config={salesChartConfig} className="h-full w-full">
                  <LineChart data={salesSeries} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} width={48} tickFormatter={(value) => `$${Number(value).toLocaleString("es-MX")}`} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                  No sales data for this range.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Top products</CardTitle>
              <p className="text-sm text-muted-foreground">Top 5 by units sold.</p>
            </CardHeader>
            <CardContent className="h-[320px]">
              {topProducts.length ? (
                <ChartContainer config={productChartConfig} className="h-full w-full">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Bar dataKey="units" fill="var(--color-units)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                  No sold products yet.
                </div>
              )}
            </CardContent>
          </Card>
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
