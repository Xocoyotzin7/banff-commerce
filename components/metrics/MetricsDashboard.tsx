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
import type { Locale } from "@/lib/site-content"
import type { MetricsPayload, MetricsRange } from "@/lib/metrics/types"

type MetricsDashboardProps = {
  initialData: MetricsPayload
  initialRange: MetricsRange
  locale?: Locale
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

function getMetricsCopy(locale: Locale = "en") {
  return {
    badge: locale === "es" ? "Métricas admin" : locale === "fr" ? "Métriques admin" : "Admin metrics",
    title:
      locale === "es"
        ? "Panel avanzado de métricas"
        : locale === "fr"
          ? "Tableau de bord analytique avancé"
          : "Advanced metrics dashboard",
    description:
      locale === "es"
        ? "Vista operativa para el dueño del negocio. Los paneles siguen ingresos, ticket promedio, presión de stock y señales de tráfico."
        : locale === "fr"
          ? "Vue opérationnelle pour le propriétaire. Les panneaux suivent le revenu, le panier moyen, la pression sur le stock et les signaux de trafic."
          : "Operational view for the store owner. The panels track revenue, ticket size, stock pressure, and traffic signals.",
    salesChartTitle:
      locale === "es" ? "Desglose de ventas" : locale === "fr" ? "Répartition des ventes" : "Revenue breakdown",
    salesChartDescription:
      locale === "es"
        ? "Ventas brutas, impuestos, envíos y neto para el periodo seleccionado."
        : locale === "fr"
          ? "Ventes brutes, taxes, expédition et net pour la période sélectionnée."
          : "Gross sales, taxes, shipping, and net sales for the selected period.",
    topProductsTitle: locale === "es" ? "Productos top" : locale === "fr" ? "Produits phares" : "Top products",
    topProductsDescription:
      locale === "es" ? "Top 5 por unidades vendidas." : locale === "fr" ? "Top 5 par unités vendues." : "Top 5 by units sold.",
    branchTitle: locale === "es" ? "Ingresos por sucursal" : locale === "fr" ? "Revenus par succursale" : "Revenue by branch",
    branchDescription:
      locale === "es"
        ? "Demanda agregada desde ventanas de forecast."
        : locale === "fr"
          ? "Demande agrégée à partir des fenêtres de prévision."
          : "Aggregated demand from forecast windows.",
    restockTitle: locale === "es" ? "Presión de reabastecimiento" : locale === "fr" ? "Pression de réassort" : "Restock pressure",
    restockDescription:
      locale === "es"
        ? "Días restantes por cada artículo con stock bajo."
        : locale === "fr"
          ? "Jours restants par article en faible stock."
          : "Days remaining per low-stock item.",
    insightsTitle: locale === "es" ? "Insights IA" : locale === "fr" ? "Insights IA" : "AI Insights",
    insightsTrigger: locale === "es" ? "Abrir insights" : locale === "fr" ? "Ouvrir les insights" : "Open insights",
    salesClusters: locale === "es" ? "Clusters de ventas" : locale === "fr" ? "Clusters de ventes" : "Sales clusters",
    csv: locale === "es" ? "CSV" : locale === "fr" ? "CSV" : "CSV",
    excel: locale === "es" ? "Excel" : locale === "fr" ? "Excel" : "Excel",
    exporting: locale === "es" ? "Exportando..." : locale === "fr" ? "Exportation..." : "Exporting...",
    noSalesData: locale === "es" ? "No hay datos de ventas para este periodo." : locale === "fr" ? "Aucune donnée de ventes pour cette période." : "No sales data for this range.",
    noProductsData: locale === "es" ? "Todavía no hay productos vendidos." : locale === "fr" ? "Aucun produit vendu pour l’instant." : "No sold products yet.",
    noBranchData: locale === "es" ? "No hay datos por sucursal." : locale === "fr" ? "Aucune donnée par succursale." : "No branch data available.",
    noRestockData: locale === "es" ? "No se detectaron problemas de reabastecimiento." : locale === "fr" ? "Aucun problème de réassort détecté." : "No restock issues detected.",
    topCountries: locale === "es" ? "Países top" : locale === "fr" ? "Pays principaux" : "Top countries",
    views: locale === "es" ? "vistas" : locale === "fr" ? "vues" : "views",
    destination: locale === "es" ? "Destino" : locale === "fr" ? "Destination" : "Destination",
    country: locale === "es" ? "País" : locale === "fr" ? "Pays" : "Country",
    peak: locale === "es" ? "Pico" : locale === "fr" ? "Pic" : "Peak",
    low: locale === "es" ? "Bajo" : locale === "fr" ? "Bas" : "Low",
    reservations: locale === "es" ? "Reservas" : locale === "fr" ? "Réservations" : "Reservations",
    score: locale === "es" ? "puntuación" : locale === "fr" ? "score" : "score",
    clients: locale === "es" ? "clientes" : locale === "fr" ? "clients" : "clients",
    totalPoints: locale === "es" ? "puntos totales" : locale === "fr" ? "points totaux" : "total points",
    markovTitle: locale === "es" ? "Transiciones de landing" : locale === "fr" ? "Transitions de landing" : "Landing transitions",
    anomaliesTitle: locale === "es" ? "Anomalías" : locale === "fr" ? "Anomalies" : "Anomalies",
    noOutliers: locale === "es" ? "No se detectaron valores atípicos." : locale === "fr" ? "Aucune anomalie détectée." : "No outliers detected.",
    sectionOverview: locale === "es" ? "Resumen por sección" : locale === "fr" ? "Vue par section" : "Section overview",
    liveMock: locale === "es" ? "Mock en vivo" : locale === "fr" ? "Mock en direct" : "Live mock",
    empty: locale === "es" ? "Vacío" : locale === "fr" ? "Vide" : "Empty",
    restockForecast: locale === "es" ? "Pronóstico de reabastecimiento" : locale === "fr" ? "Prévision de réassort" : "Restock forecast",
    qty: locale === "es" ? "Cant." : locale === "fr" ? "Qté" : "Qty",
  }
}

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

export function MetricsDashboard({ initialData, initialRange, locale = "en" }: MetricsDashboardProps) {
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
  const copy = getMetricsCopy(locale)
  const salesChartConfig = {
    grossTotal: {
      label: locale === "es" ? "Ventas brutas" : locale === "fr" ? "Ventes brutes" : "Gross sales",
      color: "hsl(var(--primary))",
    },
    taxAmount: {
      label: locale === "es" ? "Taxes" : locale === "fr" ? "Taxes" : "Taxes",
      color: "hsl(var(--destructive))",
    },
    shippingAmount: {
      label: locale === "es" ? "Envíos" : locale === "fr" ? "Expédition" : "Shipping",
      color: "hsl(var(--secondary))",
    },
    netSales: {
      label: locale === "es" ? "Ventas netas" : locale === "fr" ? "Ventes nettes" : "Net sales",
      color: "hsl(var(--accent))",
    },
  }
  const productChartConfig = {
    units: {
      label: locale === "es" ? "Unidades" : locale === "fr" ? "Unités" : "Units",
      color: "hsl(var(--accent))",
    },
  }
  const branchChartConfig = {
    revenue: {
      label: locale === "es" ? "Ingresos" : locale === "fr" ? "Revenu" : "Revenue",
      color: "hsl(var(--secondary))",
    },
  }
  const restockChartConfig = {
    days: {
      label: locale === "es" ? "Días restantes" : locale === "fr" ? "Jours restants" : "Days remaining",
      color: "hsl(var(--primary))",
    },
  }

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
      toast.success(
        format === "csv"
          ? locale === "es"
            ? "CSV exportado"
            : locale === "fr"
              ? "CSV exporté"
              : "CSV exported"
          : locale === "es"
            ? "Excel exportado"
            : locale === "fr"
              ? "Excel exporté"
              : "Excel exported",
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos exportar los datos")
    } finally {
      setExporting(null)
    }
  }

  const periodOptions: Array<{ value: MetricsRange; label: string }> = [
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
              {copy.badge}
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{copy.description}</p>
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
              {exporting === "csv" ? copy.exporting : copy.csv}
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
              {exporting === "xlsx" ? copy.exporting : copy.excel}
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
                  <CardTitle className="text-base font-semibold">{copy.salesChartTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{copy.salesChartDescription}</p>
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
                              <LineChart key={`sales-line-${chartData.length}`} data={[...chartData]} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis
                                  tickLine={false}
                                  axisLine={false}
                                  width={48}
                                  tickFormatter={(value) => `$${Number(value).toLocaleString("es-MX")}`}
                                />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Line type="monotone" dataKey="grossTotal" stroke="var(--color-grossTotal)" strokeWidth={3} dot={{ r: 3, fill: "var(--color-grossTotal)", strokeWidth: 0 }} baseLine={0} isAnimationActive={!shouldReduceMotion} animationBegin={0} animationDuration={900} />
                                <Line type="monotone" dataKey="taxAmount" stroke="var(--color-taxAmount)" strokeWidth={2} dot={false} baseLine={0} isAnimationActive={!shouldReduceMotion} animationBegin={100} animationDuration={900} />
                                <Line type="monotone" dataKey="shippingAmount" stroke="var(--color-shippingAmount)" strokeWidth={2} dot={false} baseLine={0} isAnimationActive={!shouldReduceMotion} animationBegin={150} animationDuration={900} />
                                <Line type="monotone" dataKey="netSales" stroke="var(--color-netSales)" strokeWidth={2.5} dot={false} baseLine={0} isAnimationActive={!shouldReduceMotion} animationBegin={200} animationDuration={900} />
                              </LineChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          {copy.noSalesData}
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
                  <CardTitle className="text-base font-semibold">{copy.topProductsTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{copy.topProductsDescription}</p>
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
                              <BarChart data={[...chartData]} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Bar
                                  dataKey="units"
                                  fill="var(--color-units)"
                                  radius={[0, 8, 8, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "horizontal") as any}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          {copy.noProductsData}
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
                  <CardTitle className="text-base font-semibold">{copy.branchTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{copy.branchDescription}</p>
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
                              <BarChart data={[...chartData]} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
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
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical") as any}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          {copy.noBranchData}
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
                  <CardTitle className="text-base font-semibold">{copy.restockTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{copy.restockDescription}</p>
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
                              <BarChart data={[...chartData]} layout="vertical" margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" width={140} tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                                <Bar
                                  dataKey="daysRemaining"
                                  fill="var(--color-days)"
                                  radius={[0, 8, 8, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "horizontal") as any}
                                />
                              </BarChart>
                            </ChartContainer>
                          )}
                        </SequentialChartDataRenderer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/70 text-sm text-muted-foreground">
                          {copy.noRestockData}
                        </div>
                      )}
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>
        </div>

        <InventoryAlert items={lowStockItems} locale={locale} />

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">{copy.insightsTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {locale === "es"
                ? "Colapsado por defecto. Heurísticas operativas para el dueño."
                : locale === "fr"
                  ? "Replié par défaut. Heuristiques opérationnelles pour le propriétaire."
                  : "Collapsed by default. Operational heuristics for the owner."}
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="insights">
                <AccordionTrigger>{copy.insightsTrigger}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {copy.salesClusters}
                      </h3>
                      <div className="space-y-2">
                        {data.marketing.salesClusters.map((cluster) => (
                          <div key={cluster.name} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">{cluster.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {cluster.count} {copy.clients}
                              </div>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{cluster.description}</p>
                            <div className="mt-2 text-sm">
                              {locale === "es" ? "Ticket promedio" : locale === "fr" ? "Ticket moyen" : "Avg ticket"}:{" "}
                              <span className="font-medium">${cluster.avgTicket.toLocaleString("es-MX")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {locale === "es" ? "Transiciones de landing" : locale === "fr" ? "Transitions de landing" : "Landing transitions"}
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
                        {locale === "es" ? "Anomalías" : locale === "fr" ? "Anomalies" : "Anomalies"}
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
                            {locale === "es" ? "No se detectaron valores atípicos." : locale === "fr" ? "Aucune anomalie détectée." : "No outliers detected."}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 lg:col-span-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {locale === "es" ? "Resumen por sección" : locale === "fr" ? "Vue par section" : "Section overview"}
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {Object.entries(data.sections).map(([key, section]) => {
                          const total = section.bars.reduce((sum, bar) => sum + bar.value, 0)
                          return (
                            <div key={key} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium">{section.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {section.hasData
                                    ? locale === "es"
                                      ? "Mock en vivo"
                                      : locale === "fr"
                                        ? "Mock en direct"
                                        : "Live mock"
                                    : locale === "es"
                                      ? "Vacío"
                                      : locale === "fr"
                                        ? "Vide"
                                        : "Empty"}
                                </div>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-[color:var(--primary)]"
                                  style={{ width: `${Math.max(8, Math.min(100, total))}%` }}
                                />
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                {total} {locale === "es" ? "puntos totales" : locale === "fr" ? "points totaux" : "total points"}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {locale === "es" ? "Pronóstico de reabastecimiento" : locale === "fr" ? "Prévision de réassort" : "Restock forecast"}
                      </h3>
                      <div className="space-y-2">
                        {data.forecasts.restock.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-border/70 bg-background/80 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.daysRemaining !== null
                                  ? `${item.daysRemaining} ${locale === "es" ? "días" : locale === "fr" ? "jours" : "days"}`
                                  : "N/A"}
                              </div>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {locale === "es" ? "Cant." : locale === "fr" ? "Qté" : "Qty"} {item.quantity} ·{" "}
                              {locale === "es" ? "Uso diario promedio" : locale === "fr" ? "Utilisation quotidienne moyenne" : "Avg daily use"} {item.avgDailyUse}
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
