"use client"

import { useMemo, useRef, useState } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
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
import { ReservationReceiptDialog } from "@/components/reservations/ReservationReceiptDialog"
import { SequentialBarShape } from "@banff/agency-core/components/shared/SequentialBarShape"
import { SequentialChartDataRenderer } from "@banff/agency-core/components/shared/SequentialChartDataRenderer"
import type { AdminReservationRange, AdminReservationsPayload } from "@/lib/admin/reservations"
import { buildReservationsCsv, buildReservationsWorkbook } from "@/lib/admin/reservations-export"
import { buildReservationReceipt, type ReservationReceiptPayload } from "@/lib/reservations-receipt"
import { useAdminReservations } from "@/hooks/use-admin-reservations"
import { ScrollRevealStagger } from "@banff/agency-core/components/shared/ScrollRevealStagger"

type AdminReservationsPanelProps = {
  initialData: AdminReservationsPayload
  initialRange: AdminReservationRange
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-MX").format(Math.round(value))
}

function formatDate(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`)
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
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

export function AdminReservationsPanel({ initialData, initialRange }: AdminReservationsPanelProps) {
  const [range, setRange] = useState<AdminReservationRange>(initialRange)
  const [useRange, setUseRange] = useState(initialRange !== "month")
  const [selectedMonth, setSelectedMonth] = useState<string | null>(initialData.selectedMonth ?? null)
  const effectiveRange = useRange ? range : "month"
  const { data = initialData, isFetching } = useAdminReservations(effectiveRange, initialData, selectedMonth)
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null)
  const [selectedReceipt, setSelectedReceipt] = useState<ReservationReceiptPayload | null>(null)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const byDayRef = useRef<HTMLDivElement | null>(null)
  const byHourRef = useRef<HTMLDivElement | null>(null)
  const byStatusRef = useRef<HTMLDivElement | null>(null)
  const byTypeRef = useRef<HTMLDivElement | null>(null)

  const topRows = useMemo(() => data.reservations.slice(0, 8), [data.reservations])
  const chartExportSuffix = data.selectedMonth ? `${data.range}-${data.selectedMonth}` : data.range
  const periodOptions = [
    { value: "7d", label: "1 sem" },
    { value: "14d", label: "2 sem" },
    { value: "30d", label: "1 mes" },
    { value: "90d", label: "3 meses" },
    { value: "365d", label: "1 año" },
    { value: "month", label: "Mes" },
  ] as const

  async function download(format: "csv" | "xlsx") {
    setExporting(format)
    try {
      if (format === "csv") {
        const csv = buildReservationsCsv(data)
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `reservations-${data.range}.csv`
        link.click()
        URL.revokeObjectURL(url)
      } else {
        const workbook = buildReservationsWorkbook(data)
        const array = XLSX.write(workbook, { bookType: "xlsx", type: "array", compression: true })
        const blob = new Blob([array], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `reservations-${data.range}.xlsx`
        link.click()
        URL.revokeObjectURL(url)
      }
      toast.success(format === "csv" ? "Reservas CSV exportadas" : "Reservas Excel exportadas")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo exportar")
    } finally {
      setExporting(null)
    }
  }

  const summaryCards = [
    { label: "Reservas", value: data.summary.total, hint: "Total del rango" },
    { label: "Clientes únicos", value: data.summary.uniqueClients, hint: "Usuarios distintos" },
    { label: "Citas", value: data.summary.appointments, hint: "Reserva presencial" },
    { label: "Viajes", value: data.summary.travelBookings, hint: "Booking de paquete" },
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Reservas operativas</p>
            <CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">Reservas de clientes</CardTitle>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              Aquí ves quién reservó, para qué fecha y a qué hora. El panel mezcla citas y reservas de viaje en una sola cola operativa.
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
            rangeOptions={periodOptions as unknown as Array<{ value: AdminReservationRange; label: string }>}
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
                  <div className="text-2xl font-semibold tracking-tight">{formatNumber(Number(card.value))}</div>
                  <p className="text-sm leading-6 text-muted-foreground">{card.hint}</p>
                </CardContent>
              </Card>
            ))}
          </ScrollRevealStagger>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <div ref={byDayRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Reservas por día</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={byDayRef}
                    filename={`reservas-por-dia-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea targetRef={byDayRef} filename={`reservas-por-dia-${chartExportSuffix}`} className="h-full">
                        <SequentialChartDataRenderer data={data.charts.byDay} active={isVisible} reduceMotion={shouldReduceMotion} stepMs={110}>
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart key={`reservas-dia-${chartData.length}`} data={chartData} margin={{ left: -8 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="#0A6E6E"
                                  strokeWidth={3}
                                  dot={{ r: 4, fill: "#0A6E6E", strokeWidth: 0 }}
                                  baseLine={0}
                                  isAnimationActive={!shouldReduceMotion}
                                  animationBegin={0}
                                  animationDuration={900}
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

            <div ref={byHourRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Reservas por hora</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={byHourRef}
                    filename={`reservas-por-hora-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-80">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea targetRef={byHourRef} filename={`reservas-por-hora-${chartExportSuffix}`} className="h-full">
                        <SequentialChartDataRenderer
                          data={data.charts.byHour}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={75}
                        >
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ left: -4 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#D4A017"
                                  radius={[8, 8, 0, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical")}
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

          <div className="grid gap-4 xl:grid-cols-2">
            <div ref={byStatusRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Estados</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={byStatusRef}
                    filename={`reservas-por-estado-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-72">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea targetRef={byStatusRef} filename={`reservas-por-estado-${chartExportSuffix}`} className="h-full">
                        <SequentialChartDataRenderer
                          data={data.charts.byStatus}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={75}
                        >
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ left: -4 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#E85D26"
                                  radius={[8, 8, 0, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical")}
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

            <div ref={byTypeRef}>
              <Card className="border-border/60 bg-background/60">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                  <div>
                    <CardTitle className="text-base font-semibold">Tipo de reserva</CardTitle>
                  </div>
                  <ChartPngButton
                    targetRef={byTypeRef}
                    filename={`reservas-por-tipo-${chartExportSuffix}`}
                    className="hidden md:inline-flex shrink-0"
                  />
                </CardHeader>
                <CardContent className="h-72">
                  <ChartBuildFrame className="h-full">
                    {({ isVisible, shouldReduceMotion }) => (
                      <ChartHoverDownloadArea targetRef={byTypeRef} filename={`reservas-por-tipo-${chartExportSuffix}`} className="h-full">
                        <SequentialChartDataRenderer
                          data={data.charts.byType}
                          active={isVisible}
                          reduceMotion={shouldReduceMotion}
                          stepMs={75}
                        >
                          {({ data: chartData }) => (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartData} margin={{ left: -4 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.12} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar
                                  dataKey="value"
                                  fill="#0A6E6E"
                                  radius={[8, 8, 0, 0]}
                                  isAnimationActive={false}
                                  shape={createSequentialBarShape(shouldReduceMotion, "vertical")}
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

          <Card className="border-border/60 bg-background/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Reservas recientes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <tr>
                    <th className="pb-3 pr-4">Cliente</th>
                    <th className="pb-3 pr-4">País</th>
                    <th className="pb-3 pr-4">Fecha</th>
                    <th className="pb-3 pr-4">Hora</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Destino</th>
                    <th className="pb-3 pr-4 text-right">Personas</th>
                    <th className="pb-3 pr-4">Estado</th>
                    <th className="pb-3 pr-4">Acciones</th>
                  </tr>
                </thead>
                <TableScrollRevealRows>
                  {topRows.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className="border-t border-border/60 transition hover:bg-muted/40"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium">{reservation.clientName}</div>
                        <div className="text-xs text-muted-foreground">{reservation.clientEmail}</div>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{reservation.clientCountry ?? "Sin dato"}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{formatDate(reservation.reservationDate)}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{reservation.reservationTime}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline" className="rounded-full">
                          {reservation.reservationType}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{reservation.destinationName}</td>
                      <td className="py-3 pr-4 text-right tabular-nums">{reservation.peopleCount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="rounded-full capitalize">
                          {reservation.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => {
                            setSelectedReceipt(
                              buildReservationReceipt({
                                id: reservation.id,
                                reservationCode: reservation.reservationCode,
                                reservationType: reservation.reservationType,
                                reservationDate: reservation.reservationDate,
                                reservationTime: reservation.reservationTime,
                                branchId: reservation.branchId,
                                branchNumber: reservation.branchNumber,
                                destinationSlug: reservation.destinationSlug,
                                packageId: reservation.packageId,
                                peopleCount: reservation.peopleCount,
                                status: reservation.status,
                                createdAt: reservation.createdAt,
                                updatedAt: reservation.updatedAt,
                                clientName: reservation.clientName,
                                clientEmail: reservation.clientEmail,
                                clientCountry: reservation.clientCountry,
                                message: reservation.message,
                                preOrderItems: reservation.preOrderItems,
                              }),
                            )
                            setReceiptOpen(true)
                          }}
                        >
                          Ver QR
                        </Button>
                      </td>
                    </tr>
                  ))}
                </TableScrollRevealRows>
              </table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <ReservationReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={selectedReceipt}
        title="Detalle de la reservación"
        description="El admin ve la misma ficha que el cliente, con QR y resumen operativo."
        actionLabel="Copiar código"
      />
    </section>
  )
}
