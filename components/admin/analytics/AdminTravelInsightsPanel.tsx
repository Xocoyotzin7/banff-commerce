"use client"

import { useMemo, useRef, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import { ScrollRevealStagger } from "@/components/scroll-reveal-stagger"
import type { TravelInsightsPayload, TravelInsightsRange } from "@/lib/admin/travel-insights"
import { buildTravelInsightsCsv, buildTravelInsightsWorkbook } from "@/lib/admin/travel-insights-export"
import { useAdminInsights } from "@/hooks/use-admin-insights"

type AdminTravelInsightsPanelProps = {
  initialData: TravelInsightsPayload
  initialRange: TravelInsightsRange
}

const chartColors = ["#0A6E6E", "#D4A017", "#E85D26", "#5b8def", "#8b5cf6", "#14b8a6"]

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

export function AdminTravelInsightsPanel({ initialData, initialRange }: AdminTravelInsightsPanelProps) {
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

  const destinationSeasonalityRows = data.destinationSeasonality
  const periodOptions = [
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
      label: "Cliente top",
      value: data.topClient?.name ?? "Sin datos",
      hint: data.topClient ? `${data.topClient.reservations} reservas · ${data.topClient.country}` : "Sin reservas detectadas",
    },
    {
      label: "País origen",
      value: data.topOriginCountry?.country ?? "Sin datos",
      hint: data.topOriginCountry ? `${data.topOriginCountry.reservations} reservas · ${data.topOriginCountry.clients} clientes` : "Sin señal de origen",
    },
    {
      label: "Destino probable",
      value: data.mostLikelyDestination?.destinationName ?? "Sin datos",
      hint: data.mostLikelyDestination
        ? `${formatNumber(data.mostLikelyDestination.score)} score · ${data.mostLikelyDestination.pageViews} vistas`
        : "Sin suficiente señal",
    },
    {
      label: "Engagement",
      value: data.passiveAnalytics.topPages[0] ? `${formatNumber(data.passiveAnalytics.topPages[0].avgScrollDepth)}%` : "0%",
      hint: data.passiveAnalytics.topPages[0]
        ? `${data.passiveAnalytics.topPages[0].label} · ${formatNumber(data.passiveAnalytics.topPages[0].avgTimeOnPage)}s`
        : "Sin tráfico",
    },
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Travel intelligence</p>
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">Reservation and passive analytics</CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Client concentration, origin country, destination seasonality, passive signals, and forecasted demand for the store owner.
            </p>
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
              {exporting === "csv" ? "Exportando..." : "CSV"}
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
              {exporting === "xlsx" ? "Exportando..." : "Excel"}
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

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <div ref={reservationsByDestinationRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Reservations by destination</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={reservationsByDestinationRef}
                    filename={`reservations-by-destination-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    <ChartHoverDownloadArea
                      targetRef={reservationsByDestinationRef}
                      filename={`reservations-by-destination-${chartExportSuffix}`}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.charts.reservationsByDestination} margin={{ left: -12 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#0A6E6E" radius={[8, 8, 0, 0]}>
                            {data.charts.reservationsByDestination.map((entry, index) => (
                              <Cell key={entry.label} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartHoverDownloadArea>
                  </ChartBuildFrame>
                </CardContent>
              </Card>
            </div>

            <div ref={passivePagesRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Passive top pages</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={passivePagesRef}
                    filename={`passive-top-pages-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    <ChartHoverDownloadArea targetRef={passivePagesRef} filename={`passive-top-pages-${chartExportSuffix}`} className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.charts.passivePages} layout="vertical" margin={{ left: 16 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                          <XAxis type="number" tick={{ fontSize: 12 }} />
                          <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={120} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#D4A017" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartHoverDownloadArea>
                  </ChartBuildFrame>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div ref={seasonalityRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Seasonality by month</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={seasonalityRef}
                    filename={`seasonality-by-month-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-72">
                  <ChartBuildFrame className="h-full">
                    <ChartHoverDownloadArea targetRef={seasonalityRef} filename={`seasonality-by-month-${chartExportSuffix}`} className="h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySeries} margin={{ left: -12 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#E85D26" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartHoverDownloadArea>
                  </ChartBuildFrame>
                </CardContent>
              </Card>
            </div>

            <div ref={topCountriesRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Geo and conversion signals</CardTitle>
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
                    <span className="text-muted-foreground">Top countries</span>
                    <Badge variant="outline" className="rounded-full">views</Badge>
                  </div>
                  <div className="h-40">
                    <ChartBuildFrame className="h-full">
                      <ChartHoverDownloadArea targetRef={topCountriesRef} filename={`geo-and-conversion-${chartExportSuffix}`} className="h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.charts.topCountries} layout="vertical" margin={{ left: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="label" type="category" tick={{ fontSize: 12 }} width={90} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#0A6E6E" radius={[0, 8, 8, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartHoverDownloadArea>
                    </ChartBuildFrame>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Most likely destination</p>
                  <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-lg font-semibold">{data.mostLikelyDestination?.destinationName ?? "Sin datos"}</div>
                        <div className="text-sm text-muted-foreground">{data.mostLikelyDestination?.reason ?? "No data"}</div>
                      </div>
                      <Badge variant="secondary" className="rounded-full">
                        {data.mostLikelyDestination ? `${formatNumber(data.mostLikelyDestination.score)} score` : "N/A"}
                      </Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                      <div>Reservas: {data.mostLikelyDestination?.reservations ?? 0}</div>
                      <div>Vistas: {data.mostLikelyDestination?.pageViews ?? 0}</div>
                      <div>Scroll: {data.mostLikelyDestination?.avgScrollDepth ?? 0}%</div>
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
                <CardTitle className="text-base font-semibold">Top referrers</CardTitle>
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
                      <span className="text-sm text-muted-foreground">{formatNumber(entry.views)} views</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No referrer signals yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.passiveAnalytics.conversions.length ? (
                  data.passiveAnalytics.conversions.map((entry) => (
                    <div key={entry.event} className="rounded-2xl border border-border/50 bg-card/50 px-4 py-3">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{entry.event}</div>
                          <div className="text-sm text-muted-foreground">{formatNumber(entry.count)} events</div>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                          {formatCurrency(entry.value)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No conversion events yet.</p>
                )}
              </CardContent>
            </Card>
          </ScrollRevealStagger>

          <Card className="border-border/60 bg-background/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Seasonality breakdown</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Destination</th>
                    <th className="pb-3 pr-4">Country</th>
                    <th className="pb-3 pr-4">Peak</th>
                    <th className="pb-3 pr-4">Low</th>
                    <th className="pb-3 pr-4 text-right">Reservations</th>
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
