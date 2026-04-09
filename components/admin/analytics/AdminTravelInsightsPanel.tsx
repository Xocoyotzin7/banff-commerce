"use client"

import { useMemo, useRef, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { FileSpreadsheet, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PeriodPicker } from "@/components/admin/PeriodPicker"
import { ChartBuildFrame } from "@/components/admin/charts/ChartBuildFrame"
import { ChartHoverDownloadArea } from "@/components/admin/charts/ChartHoverDownloadArea"
import { ChartPngButton } from "@/components/admin/charts/ChartPngButton"
import { TableScrollRevealRows } from "@/components/admin/TableScrollRevealRows"
import { SequentialBarShape } from "@banff/agency-core/components/shared/SequentialBarShape"
import { ScrollRevealStagger } from "@banff/agency-core/components/shared/ScrollRevealStagger"
import { SequentialChartDataRenderer } from "@banff/agency-core/components/shared/SequentialChartDataRenderer"
import type { TravelInsightsPayload, TravelInsightsRange } from "@/lib/admin/travel-insights"
import { buildTravelInsightsCsv, buildTravelInsightsWorkbook } from "@/lib/admin/travel-insights-export"
import { useAdminInsights } from "@/hooks/use-admin-insights"
import type { Locale } from "@/lib/site-content"

type AdminTravelInsightsPanelProps = {
  initialData: TravelInsightsPayload
  initialRange: TravelInsightsRange
  locale?: Locale
}

const chartColors = ["#E85D26", "#D4A017", "#F97316", "#5b8def", "#8b5cf6", "#14b8a6"]

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

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(value))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getCopy(locale: Locale = "en") {
  return {
    eyebrow: locale === "es" ? "Inteligencia de viajes" : locale === "fr" ? "Intelligence voyage" : "Travel intelligence",
    title:
      locale === "es"
        ? "Analítica de reservas y señales pasivas"
        : locale === "fr"
          ? "Analyses des réservations et signaux passifs"
          : "Reservation and passive analytics",
    description:
      locale === "es"
        ? "Concentración de clientes, país de origen, estacionalidad de destinos, señales pasivas y demanda prevista para el dueño."
        : locale === "fr"
          ? "Concentration clients, pays d’origine, saisonnalité des destinations, signaux passifs et demande prévue pour le propriétaire."
          : "Client concentration, origin country, destination seasonality, passive signals, and forecasted demand for the store owner.",
    reservationsTitle:
      locale === "es" ? "Reservas por destino" : locale === "fr" ? "Réservations par destination" : "Reservations by destination",
    passivePagesTitle:
      locale === "es" ? "Páginas top pasivas" : locale === "fr" ? "Pages passives principales" : "Passive top pages",
    geoTitle: locale === "es" ? "Señales geo y conversión" : locale === "fr" ? "Signaux géo et conversion" : "Geo and conversion signals",
    likelyLabel: locale === "es" ? "Destino más probable" : locale === "fr" ? "Destination la plus probable" : "Most likely destination",
    referrersTitle: locale === "es" ? "Referidores top" : locale === "fr" ? "Référents principaux" : "Top referrers",
    conversionsTitle: locale === "es" ? "Conversiones" : locale === "fr" ? "Conversions" : "Conversions",
    seasonalityTitle: locale === "es" ? "Desglose de estacionalidad" : locale === "fr" ? "Répartition saisonnière" : "Seasonality breakdown",
    seasonalChartTitle: locale === "es" ? "Puntos de estacionalidad" : locale === "fr" ? "Points de saisonnalité" : "Seasonality points",
    emptyDestination: locale === "es" ? "Sin datos" : locale === "fr" ? "Aucune donnée" : "No data",
    emptySignal: locale === "es" ? "Sin señal suficiente" : locale === "fr" ? "Pas assez de signal" : "No sufficient signal",
    topCountries: locale === "es" ? "Países principales" : locale === "fr" ? "Pays principaux" : "Top countries",
    views: locale === "es" ? "vistas" : locale === "fr" ? "vues" : "views",
    directionHint: locale === "es" ? "Destino más probable" : locale === "fr" ? "Destination la plus probable" : "Most likely destination",
    destination: locale === "es" ? "Destino" : locale === "fr" ? "Destination" : "Destination",
    country: locale === "es" ? "País" : locale === "fr" ? "Pays" : "Country",
    peak: locale === "es" ? "Pico" : locale === "fr" ? "Pic" : "Peak",
    low: locale === "es" ? "Bajo" : locale === "fr" ? "Bas" : "Low",
    reservations: locale === "es" ? "Reservas" : locale === "fr" ? "Réservations" : "Reservations",
    liveMock: locale === "es" ? "Mock en vivo" : locale === "fr" ? "Mock en direct" : "Live mock",
    empty: locale === "es" ? "Vacío" : locale === "fr" ? "Vide" : "Empty",
    totalPoints: locale === "es" ? "puntos totales" : locale === "fr" ? "points totaux" : "total points",
    clients: locale === "es" ? "clientes" : locale === "fr" ? "clients" : "clients",
    score: locale === "es" ? "puntuación" : locale === "fr" ? "score" : "score",
    qty: locale === "es" ? "Cant." : locale === "fr" ? "Qté" : "Qty",
    markovTitle: locale === "es" ? "Transiciones de landing" : locale === "fr" ? "Transitions de landing" : "Landing transitions",
    anomaliesTitle: locale === "es" ? "Anomalías" : locale === "fr" ? "Anomalies" : "Anomalies",
    noOutliers: locale === "es" ? "No se detectaron valores atípicos." : locale === "fr" ? "Aucune anomalie détectée." : "No outliers detected.",
    sectionOverview: locale === "es" ? "Resumen por sección" : locale === "fr" ? "Vue par section" : "Section overview",
    restockForecast: locale === "es" ? "Pronóstico de reabastecimiento" : locale === "fr" ? "Prévision de réassort" : "Restock forecast",
  }
}

export function AdminTravelInsightsPanel({ initialData, initialRange, locale = "en" }: AdminTravelInsightsPanelProps) {
  const [range, setRange] = useState<TravelInsightsRange>(initialRange)
  const [useRange, setUseRange] = useState(initialRange !== "month")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(initialData.selectedMonth ?? null)
  const effectiveRange = useRange ? range : "month"
  const { data = initialData, isFetching } = useAdminInsights(effectiveRange, initialData, selectedMonth)
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)
  const reservationsByDestinationRef = useRef<HTMLDivElement | null>(null)
  const passivePagesRef = useRef<HTMLDivElement | null>(null)
  const seasonalityRef = useRef<HTMLDivElement | null>(null)
  const topCountriesRef = useRef<HTMLDivElement | null>(null)
  const seasonalPointsRef = useRef<HTMLDivElement | null>(null)
  const copy = getCopy(locale)

  const destinationSeasonalityRows = data.destinationSeasonality
  const periodOptions: Array<{ value: TravelInsightsRange; label: string }> = [
    { value: "7d", label: "1 sem" },
    { value: "14d", label: "2 sem" },
    { value: "30d", label: "1 mes" },
    { value: "90d", label: "3 meses" },
    { value: "365d", label: "1 año" },
    { value: "month", label: "Mes" },
  ] as const
  const monthlySeries = useMemo(() => {
    const monthMap = new Map<string, number>()
    for (const entry of destinationSeasonalityRows) {
      for (const month of entry.monthly) {
        monthMap.set(month.label, (monthMap.get(month.label) ?? 0) + month.count)
      }
    }
    return Array.from(monthMap.entries())
      .map(([label, value]) => ({ label, value }))
      .slice(0, 12)
  }, [destinationSeasonalityRows])
  const chartExportSuffix = data.selectedMonth ? `${data.range}-${data.selectedMonth}` : data.range

  async function download(format: "csv" | "xlsx") {
    setExporting(format)
    try {
      if (format === "csv") {
        const csv = buildTravelInsightsCsv(data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `travel-insights-${data.range}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const workbook = buildTravelInsightsWorkbook(data)
        const array = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true })
        const blob = new Blob([array], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `travel-insights-${data.range}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
      }
      toast.success(format === "csv" ? "Insights CSV exportados" : "Insights Excel exportados")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar")
    } finally {
      setExporting(null)
    }
  }

  const summaryCards = [
    {
      label: locale === "es" ? "Cliente top" : locale === "fr" ? "Client principal" : "Top client",
      value: data.topClient?.name ?? copy.emptyDestination,
      hint: data.topClient ? `${data.topClient.reservations} ${copy.reservations} · ${data.topClient.country}` : locale === "es" ? "Sin reservas detectadas" : locale === "fr" ? "Aucune réservation détectée" : "No reservations detected",
    },
    {
      label: locale === "es" ? "País origen" : locale === "fr" ? "Pays d'origine" : "Origin country",
      value: data.topOriginCountry?.country ?? copy.emptyDestination,
      hint: data.topOriginCountry ? `${data.topOriginCountry.reservations} ${copy.reservations} · ${data.topOriginCountry.clients} ${copy.clients}` : locale === "es" ? "Sin señal de origen" : locale === "fr" ? "Aucun signal d'origine" : "No origin signal",
    },
    {
      label: locale === "es" ? "Destino probable" : locale === "fr" ? "Destination probable" : "Likely destination",
      value: data.mostLikelyDestination?.destinationName ?? copy.emptyDestination,
      hint: data.mostLikelyDestination
        ? `${formatNumber(data.mostLikelyDestination.score)} ${copy.score} · ${data.mostLikelyDestination.pageViews} ${copy.views}`
        : copy.emptySignal,
    },
    {
      label: locale === "es" ? "Engagement" : locale === "fr" ? "Engagement" : "Engagement",
      value: data.passiveAnalytics.topPages[0] ? `${formatNumber(data.passiveAnalytics.topPages[0].avgScrollDepth)}%` : "0%",
      hint: data.passiveAnalytics.topPages[0]
        ? `${data.passiveAnalytics.topPages[0].label} · ${formatNumber(data.passiveAnalytics.topPages[0].avgTimeOnPage)}s`
        : locale === "es" ? "Sin tráfico" : locale === "fr" ? "Aucun trafic" : "No traffic",
    },
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{copy.eyebrow}</p>
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">{copy.title}</CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">{copy.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full px-4 md:hidden"
              onClick={() => void download("csv")}
              disabled={exporting !== null}
            >
              <FileText className="mr-2 h-4 w-4" />
              {exporting === "csv" ? (locale === "es" ? "Exportando..." : locale === "fr" ? "Exportation..." : "Exporting...") : "CSV"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-full px-4 md:hidden"
              onClick={() => void download("xlsx")}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              {exporting === "xlsx" ? (locale === "es" ? "Exportando..." : locale === "fr" ? "Exportation..." : "Exporting...") : "Excel"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <PeriodPicker
            range={effectiveRange}
            rangeOptions={periodOptions as unknown as Array<{ value: TravelInsightsRange; label: string }>}
            selectedMonth={selectedMonth}
            availableMonths={data.availableMonths ?? []}
            useRange={useRange}
            onToggleRange={(value) => {
              setUseRange(value)
              if (!value && !selectedMonth) {
                setSelectedMonth(data.availableMonths?.[0]?.month ?? null)
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
            isFetching={isFetching}
          />

          <ScrollRevealStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <Card key={card.label} className="border-border/60 bg-background/60">
                <CardContent className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">{card.label}</p>
                  <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{card.hint}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollRevealStagger>

          <div ref={seasonalPointsRef}>
            <Card className="border-border/60 bg-background/60">
              <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                <div>
                  <CardTitle className="text-base font-semibold">{copy.seasonalChartTitle}</CardTitle>
                </div>
                <ChartPngButton
                  targetRef={seasonalPointsRef}
                  filename={`seasonality-points-${chartExportSuffix}`}
                  className="hidden md:inline-flex shrink-0"
                />
              </CardHeader>
              <CardContent className="h-72">
                <ChartBuildFrame className="h-full">
                  {({ isVisible, shouldReduceMotion }) => (
                    <ChartHoverDownloadArea
                      targetRef={seasonalPointsRef}
                      filename={`seasonality-points-${chartExportSuffix}`}
                      className="h-full"
                    >
                      <SequentialChartDataRenderer
                        data={monthlySeries}
                        active={isVisible}
                        reduceMotion={shouldReduceMotion}
                        stepMs={70}
                      >
                        {({ data: chartData }) => (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...chartData]} margin={{ left: 4, right: 12, top: 8 }}>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                              <YAxis tick={{ fontSize: 12 }} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#E85D26"
                                strokeWidth={3}
                                dot={{ r: 5, stroke: "#E85D26", strokeWidth: 2, fill: "#020617" }}
                                activeDot={{ r: 7, stroke: "#E85D26", strokeWidth: 2, fill: "#E85D26" }}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </SequentialChartDataRenderer>
                    </ChartHoverDownloadArea>
                  )}
                </ChartBuildFrame>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div ref={reservationsByDestinationRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">{copy.reservationsTitle}</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={reservationsByDestinationRef}
                    filename={`reservations-by-destination-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea
                        targetRef={reservationsByDestinationRef}
                        filename={`reservations-by-destination-${chartExportSuffix}`}
                        className="h-full"
                      >
                        <SequentialChartDataRenderer
                          data={data.charts.reservationsByDestination}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={80}
                        >
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[...chartData]} margin={{ left: -12 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#E85D26"
                                  radius={[8, 8, 0, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical") as any}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </SequentialChartDataRenderer>
                      </ChartHoverDownloadArea>
                    )}
                  </ChartBuildFrame>
                </CardContent>
              </Card>
            </div>

            <div ref={passivePagesRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">{copy.passivePagesTitle}</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={passivePagesRef}
                    filename={`passive-top-pages-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea targetRef={passivePagesRef} filename={`passive-top-pages-${chartExportSuffix}`} className="h-full">
                        <SequentialChartDataRenderer
                          data={data.charts.passivePages}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={85}
                        >
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={[...chartData]} layout="vertical" margin={{ left: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={120} />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#D4A017"
                                  radius={[0, 8, 8, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "horizontal") as any}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </SequentialChartDataRenderer>
                      </ChartHoverDownloadArea>
                    )}
                  </ChartBuildFrame>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div ref={topCountriesRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">{copy.geoTitle}</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={topCountriesRef}
                    filename={`geo-and-conversion-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{copy.topCountries}</span>
                      <Badge variant="outline" className="rounded-full">{copy.views}</Badge>
                    </div>
                    <div className="h-40">
                      <ChartBuildFrame className="h-full">
                        {({ isVisible, shouldReduceMotion }) => (
                          <ChartHoverDownloadArea targetRef={topCountriesRef} filename={`geo-and-conversion-${chartExportSuffix}`} className="h-full">
                            <SequentialChartDataRenderer
                              data={data.charts.topCountries}
                              active={isVisible}
                              reduceMotion={shouldReduceMotion}
                              stepMs={80}
                            >
                              {({ data: chartData }) => (
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={[...chartData]} layout="vertical" margin={{ left: 16 }}>
                                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                    <XAxis type="number" tick={{ fontSize: 12 }} />
                                    <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={90} />
                                    <Tooltip />
                                    <Bar
                                      dataKey="value"
                                      fill="#0A6E6E"
                                      radius={[0, 8, 8, 0]}
                                      isAnimationActive={false}
                                      shape={createSequentialBarShape(shouldReduceMotion, "horizontal") as any}
                                    />
                                  </BarChart>
                                </ResponsiveContainer>
                              )}
                            </SequentialChartDataRenderer>
                          </ChartHoverDownloadArea>
                        )}
                      </ChartBuildFrame>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{copy.likelyLabel}</p>
                    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="text-lg font-semibold">{data.mostLikelyDestination?.destinationName ?? copy.emptyDestination}</div>
                          <div className="text-sm text-muted-foreground">{data.mostLikelyDestination?.reason ?? copy.emptySignal}</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {data.mostLikelyDestination ? `${formatNumber(data.mostLikelyDestination.score)} ${copy.score}` : "N/A"}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <div>{copy.reservations}: {data.mostLikelyDestination?.reservations ?? 0}</div>
                        <div>{copy.views}: {data.mostLikelyDestination?.pageViews ?? 0}</div>
                        <div>{locale === "es" ? "Scroll" : locale === "fr" ? "Scroll" : "Scroll"}: {data.mostLikelyDestination?.avgScrollDepth ?? 0}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <ScrollRevealStagger className="grid gap-4 xl:grid-cols-2">
            <Card className="border-border/60 bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{copy.referrersTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.passiveAnalytics.topReferrers.length ? (
                  data.passiveAnalytics.topReferrers.map((entry, index) => (
                    <div key={entry.referrer} className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{entry.referrer}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatNumber(entry.views)} {copy.views}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{locale === "es" ? "Todavía no hay señales de referidores." : locale === "fr" ? "Aucun signal référent pour le moment." : "No referrer signals yet."}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/60">
              <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{copy.conversionsTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.passiveAnalytics.conversions.length ? (
                  data.passiveAnalytics.conversions.map((entry) => (
                    <div key={entry.event} className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{entry.event}</div>
                          <div className="text-sm text-muted-foreground">{formatNumber(entry.count)} {locale === "es" ? "eventos" : locale === "fr" ? "événements" : "events"}</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {formatCurrency(entry.value)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">{locale === "es" ? "Todavía no hay eventos de conversión." : locale === "fr" ? "Aucun événement de conversion pour le moment." : "No conversion events yet."}</p>
                )}
              </CardContent>
            </Card>
          </ScrollRevealStagger>

          <Card className="border-border/60 bg-background/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{copy.seasonalityTitle}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">{copy.destination}</th>
                    <th className="pb-3 pr-4">{copy.country}</th>
                    <th className="pb-3 pr-4">{copy.peak}</th>
                    <th className="pb-3 pr-4">{copy.low}</th>
                    <th className="pb-3 pr-4 text-right">{copy.reservations}</th>
                  </tr>
                </thead>
                <TableScrollRevealRows>
                  {destinationSeasonalityRows.slice(0, 8).map((entry) => (
                    <tr key={entry.destinationSlug} className="border-t border-border/60">
                      <td className="py-3 pr-4 font-medium">{entry.destinationName}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{entry.country}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {entry.peakMonth} ({entry.peakCount})
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {entry.lowMonth} ({entry.lowCount})
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">{formatNumber(entry.reservations)}</td>
                    </tr>
                  ))}
                </TableScrollRevealRows>
              </table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  )
}
