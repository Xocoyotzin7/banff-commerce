"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Clock3,
  PackageSearch,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TableScrollRevealRows } from "@/components/admin/TableScrollRevealRows"
import { OrderDetailSheet } from "@/components/admin/orders/OrderDetailSheet"
import type {
  AdminOrderFilterStatus,
  AdminOrderRecord,
  AdminOrderSortDirection,
  AdminOrderSortField,
} from "@/lib/admin/orders"
import { resolveOrderAgeLabel } from "@/lib/admin/orders"
import { cn } from "@/lib/utils"
import { useAdminOrders } from "@/hooks/use-admin-orders"

const PAGE_SIZE = 20
const STATUS_TABS: Array<{ value: AdminOrderFilterStatus; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendientes" },
  { value: "processing", label: "En proceso" },
  { value: "shipped", label: "Enviados" },
  { value: "delivered", label: "Entregados" },
]

function formatWeight(weightKg: number) {
  return `${new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(weightKg)} kg`
}

function formatRelativeMinutes(updatedAt?: string | null) {
  if (!updatedAt) return "Actualizado hace -"
  const elapsed = Math.max(0, Date.now() - new Date(updatedAt).getTime())
  const minutes = Math.max(0, Math.round(elapsed / 60000))
  return `Actualizado hace ${minutes} min`
}

function formatAgeHours(createdAt: string, now: number) {
  return Math.max(0, (now - new Date(createdAt).getTime()) / (1000 * 60 * 60))
}

function getCountryLabel(country: "MX" | "CA") {
  return country === "MX" ? "🇲🇽 Skydropx" : "🇨🇦 Easyship"
}

function getCountryBadgeClass(country: "MX" | "CA") {
  return country === "MX"
    ? "border-primary/25 bg-primary/10 text-primary"
    : "border-blue/25 bg-blue/10 text-blue"
}

function getCarrierBadgeClass(country: "MX" | "CA") {
  return country === "MX"
    ? "border-primary/20 bg-primary/5 text-primary"
    : "border-blue/20 bg-blue/5 text-blue"
}

function getStatusBadgeMeta(status: AdminOrderRecord["status"]) {
  switch (status) {
    case "processing":
      return { label: "En preparación", className: "border-border/60 bg-muted/70 text-muted-foreground" }
    case "shipped":
      return { label: "Enviado", className: "border-blue/25 bg-blue/10 text-blue" }
    case "out_for_delivery":
      return { label: "Recogido por paquetería", className: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" }
    case "delivered":
      return { label: "Entregado", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" }
    case "confirmed":
      return { label: "Confirmado", className: "border-primary/20 bg-primary/10 text-primary" }
    case "cancelled":
      return { label: "Cancelado", className: "border-destructive/20 bg-destructive/10 text-destructive" }
    default:
      return { label: "Pendiente", className: "border-border/60 bg-muted/70 text-muted-foreground" }
  }
}

function getAgeBadgeClass(tone: "success" | "warning" | "destructive") {
  switch (tone) {
    case "success":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "warning":
      return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "destructive":
      return "border-destructive/20 bg-destructive/10 text-destructive"
  }
}

function sortIndicator(
  sortBy: AdminOrderSortField,
  currentSortBy: AdminOrderSortField,
  currentSortDir: AdminOrderSortDirection,
) {
  if (sortBy !== currentSortBy) return <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 opacity-60" />
  return currentSortDir === "asc" ? (
    <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
  ) : (
    <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
  )
}

function buildPaginationWindow(page: number, totalPages: number) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", totalPages]
  if (page >= totalPages - 3) return [1, "ellipsis", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages]
}

function isUrgent(order: AdminOrderRecord, now: number) {
  const ageHours = formatAgeHours(order.createdAt, now)
  return ageHours > 72 && (order.status === "pending" || order.status === "processing" || order.status === "shipped" || order.status === "out_for_delivery")
}

function OrderAgeBadge({ order, now }: { order: AdminOrderRecord; now: number }) {
  const ageHours = formatAgeHours(order.createdAt, now)
  const band = resolveOrderAgeLabel(ageHours)

  if (band.icon === null) {
    return (
      <Badge className={cn("gap-1.5 border", getAgeBadgeClass(band.tone))}>
        <span className="order-age-dot size-2 bg-emerald-600" />
        {band.label}
      </Badge>
    )
  }

  if (band.icon === "warning") {
    return (
      <Badge className={cn("gap-1.5 border", getAgeBadgeClass(band.tone))}>
        <AlertTriangle className="h-3.5 w-3.5" />
        {band.label}
      </Badge>
    )
  }

  if (band.icon === "pulse") {
    return (
      <Badge className={cn("gap-1.5 border", getAgeBadgeClass(band.tone))}>
        <span className="order-age-dot order-age-pulse size-2 bg-destructive" />
        {band.label}
      </Badge>
    )
  }

  return (
    <Badge className={cn("gap-1.5 border font-semibold", getAgeBadgeClass(band.tone))}>
      <span className="order-age-dot order-age-pulse-strong size-2 bg-destructive" />
      {band.label}
    </Badge>
  )
}

function EmptyState({ pending }: { pending: boolean }) {
  return (
    <Card className="border-border/60 bg-background/60">
      <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-6 p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm">
          <PackageSearch className="h-9 w-9" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">
            {pending ? "No hay pedidos pendientes. ¡Todo al día! 🎉" : "No hay pedidos para mostrar"}
          </h3>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {pending
              ? "La cola está vacía por ahora. Cuando lleguen nuevos pedidos los verás aquí con su prioridad, país y paquetería."
              : "Prueba otro filtro o ajusta la búsqueda para revisar la cola de fulfillment."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="border-border/60 bg-background/60">
      <CardHeader className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent className="space-y-4 py-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SortableHead({
  label,
  sortKey,
  sortBy,
  sortDir,
  onSort,
  className,
}: {
  label: string
  sortKey: AdminOrderSortField
  sortBy: AdminOrderSortField
  sortDir: AdminOrderSortDirection
  onSort: (sortKey: AdminOrderSortField) => void
  className?: string
}) {
  return (
    <TableHead className={className}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onSort(sortKey)}
        className="h-8 justify-start gap-1.5 px-2 font-medium text-foreground hover:bg-muted/70"
      >
        <span>{label}</span>
        {sortIndicator(sortKey, sortBy, sortDir)}
      </Button>
    </TableHead>
  )
}

function OrdersTable({
  orders,
  now,
  sortBy,
  sortDir,
  onSort,
  onSelectOrder,
  countryAccent = "mx",
  compact = false,
}: {
  orders: AdminOrderRecord[]
  now: number
  sortBy: AdminOrderSortField
  sortDir: AdminOrderSortDirection
  onSort: (sortKey: AdminOrderSortField) => void
  onSelectOrder: (order: AdminOrderRecord) => void
  countryAccent?: "mx" | "ca"
  compact?: boolean
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 bg-background/65", countryAccent === "mx" ? "shadow-[0_20px_60px_rgba(10,110,110,0.08)]" : "shadow-[0_20px_60px_rgba(0,100,148,0.08)]")}>
      <div className={cn("border-l-4 px-4 py-3", countryAccent === "mx" ? "border-l-primary" : "border-l-blue")}>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className={cn("text-xs uppercase tracking-[0.28em]", countryAccent === "mx" ? "text-primary" : "text-blue")}>
              {countryAccent === "mx" ? "🇲🇽 Envío con Skydropx" : "🇨🇦 Shipping via Easyship"}
            </p>
            <p className="text-sm text-muted-foreground">
              {countryAccent === "mx"
                ? "Servicio operado por Skydropx · Cargos en MXN"
                : "Powered by Easyship · Charges in CAD"}
            </p>
          </div>
          <Badge className={cn("rounded-full border px-3 py-1 text-xs", countryAccent === "mx" ? "border-primary/20 bg-primary/10 text-primary" : "border-blue/20 bg-blue/10 text-blue")}>
            {orders.length} pedidos
          </Badge>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <SortableHead label="ID" sortKey="orderNumber" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Cliente" sortKey="clientName" sortBy={sortBy} sortDir={sortDir} onSort={onSort} />
            <SortableHead label="Items" sortKey="itemCount" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-24" />
            <SortableHead label="Peso total" sortKey="totalWeight" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-36" />
            <SortableHead label="País" sortKey="country" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-40" />
            <SortableHead label="Paquetería" sortKey="selectedCarrier" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-44" />
            <TableHead className="w-40">Estado</TableHead>
            <SortableHead label="Antigüedad" sortKey="createdAt" sortBy={sortBy} sortDir={sortDir} onSort={onSort} className="w-40" />
            <TableHead className="w-40">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableScrollRevealRows className={cn(compact ? "divide-y divide-border/50" : "divide-y divide-border/60")}>
          {orders.map((order) => (
            <TableRow key={order.id} className="bg-background/40">
              <TableCell className="font-mono text-sm font-semibold text-foreground">
                <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/50 px-2 py-1">#{order.orderNumber}</span>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{order.clientName}</p>
                  <p className="text-xs text-muted-foreground">{order.clientEmail ?? "Sin email"}</p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{order.itemCount}</TableCell>
              <TableCell className="text-muted-foreground">{formatWeight(order.totalWeight)}</TableCell>
              <TableCell>
                <Badge className={cn("rounded-full border px-3 py-1 text-xs font-medium", getCountryBadgeClass(order.country))}>
                  {getCountryLabel(order.country)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={cn("rounded-full px-3 py-1 text-xs font-medium", getCarrierBadgeClass(order.country))}>
                  {order.selectedCarrier}
                </Badge>
              </TableCell>
              <TableCell>
                {(() => {
                  const meta = getStatusBadgeMeta(order.status)
                  return (
                    <Badge className={cn("rounded-full border px-3 py-1 text-xs font-medium", meta.className)}>
                      {meta.label}
                    </Badge>
                  )
                })()}
              </TableCell>
              <TableCell>
                <OrderAgeBadge order={order} now={now} />
              </TableCell>
              <TableCell>
                {order.status === "shipped" || order.status === "out_for_delivery" ? (
                  <Badge variant="outline" className="rounded-full border-blue/25 bg-blue/10 px-3 py-1 text-blue">
                    <Truck className="h-3.5 w-3.5" />
                    Tracking
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-full px-3 text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => onSelectOrder(order)}
                  >
                    Ver detalle →
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableScrollRevealRows>
      </Table>
    </div>
  )
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<AdminOrderFilterStatus>("pending")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<AdminOrderSortField>("createdAt")
  const [sortDir, setSortDir] = useState<AdminOrderSortDirection>("desc")
  const [search, setSearch] = useState("")
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const deferredSearch = useDeferredValue(search.trim().toLowerCase())

  const { data, isLoading, isFetching, isError, error, refetch } = useAdminOrders(status, page, PAGE_SIZE, sortBy, sortDir)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setPage(1)
  }, [status, sortBy, sortDir])

  const visibleOrders = useMemo(() => {
    const rows = data?.orders ?? []
    if (!deferredSearch) return rows
    return rows.filter((order) => {
      const haystack = [order.id, order.orderNumber, order.clientName, order.clientEmail ?? ""]
        .join(" ")
        .toLowerCase()
      return haystack.includes(deferredSearch)
    })
  }, [data?.orders, deferredSearch])

  const urgentOrders = useMemo(() => visibleOrders.filter((order) => isUrgent(order, now)), [visibleOrders, now])
  const regularOrders = useMemo(() => visibleOrders.filter((order) => !isUrgent(order, now)), [visibleOrders, now])
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.total ?? 0
  const activeUpdatedAt = data?.updatedAt ?? null
  const paginationWindow = buildPaginationWindow(page, totalPages)
  const pendingEmpty = status === "pending" && !isLoading && totalCount === 0
  const hasSearchResults = visibleOrders.length > 0
  const noSearchMatches = !isLoading && !isError && !hasSearchResults && totalCount > 0

  function toggleSort(nextSortBy: AdminOrderSortField) {
    setSortBy((current) => {
      if (current === nextSortBy) {
        setSortDir((currentDir) => (currentDir === "asc" ? "desc" : "asc"))
        return current
      }
      setSortDir(nextSortBy === "createdAt" ? "desc" : "asc")
      return nextSortBy
    })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Fulfillment operativo</p>
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">Cola de pedidos</CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-7">
              Revisa pedidos pendientes, prioriza los más viejos y cambia entre estados sin salir del dashboard.
            </CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRelativeMinutes(activeUpdatedAt)}
            </Badge>
            <Badge variant="outline" className="rounded-full border-border/70 bg-background/70 px-3 py-1">
              {totalCount} pedidos
            </Badge>
            <Button type="button" variant="outline" size="sm" className="rounded-full px-4" onClick={() => void refetch()}>
              <RefreshCcw className={cn("mr-2 h-4 w-4", isFetching ? "animate-spin" : "")} />
              Refrescar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <Tabs value={status} onValueChange={(value) => setStatus(value as AdminOrderFilterStatus)} className="w-full xl:w-auto">
              <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-2xl p-1 sm:grid-cols-5 xl:w-auto">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="rounded-xl px-4 py-2">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative w-full xl:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por ID, cliente o email"
                className="h-11 rounded-full pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No pudimos cargar los pedidos</h3>
                  <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                    {error instanceof Error ? error.message : "Intenta refrescar la cola de fulfillment."}
                  </p>
                </div>
                <Button type="button" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : pendingEmpty ? (
            <EmptyState pending />
          ) : (
            <div className="space-y-6">
              {urgentOrders.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-destructive">
                        <span className="order-age-dot order-age-pulse-strong size-2 bg-destructive" />
                        Urgente
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Pedidos de más de 72 horas que requieren atención inmediata.
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{urgentOrders.length} en cola crítica</p>
                  </div>
                  <OrdersTable
                    orders={urgentOrders}
                    now={now}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    onSelectOrder={(order) => setSelectedOrderId(order.id)}
                    countryAccent={urgentOrders[0]?.country === "CA" ? "ca" : "mx"}
                    compact
                  />
                </div>
              ) : null}

              {regularOrders.length > 0 ? (
                <OrdersTable
                  orders={regularOrders}
                  now={now}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  onSelectOrder={(order) => setSelectedOrderId(order.id)}
                  countryAccent={regularOrders[0]?.country === "CA" ? "ca" : "mx"}
                />
              ) : urgentOrders.length === 0 ? (
                noSearchMatches ? <EmptyState pending={false} /> : <EmptyState pending={status === "pending"} />
              ) : null}
            </div>
          )}

          {!isLoading && !isError && totalPages > 1 ? (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((current) => Math.max(1, current - 1))
                    }}
                    className={cn(page === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {paginationWindow.map((item, index) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        href="#"
                        isActive={item === page}
                        onClick={(event) => {
                          event.preventDefault()
                          setPage(item as number)
                        }}
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      setPage((current) => Math.min(totalPages, current + 1))
                    }}
                    className={cn(page === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </CardContent>
      </Card>

      <OrderDetailSheet
        open={selectedOrderId !== null}
        orderId={selectedOrderId}
        onOpenChange={(open) => {
          if (!open) setSelectedOrderId(null)
        }}
      />
    </section>
  )
}
