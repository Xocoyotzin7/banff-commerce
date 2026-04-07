import { randomUUID } from "node:crypto"

import type { AdminInventoryLedgerRecord, AdminProductRecord } from "@/lib/admin/products"
import type {
  ForecastActivity,
  ForecastPayload,
  ForecastProduction,
  ForecastRestock,
  ForecastSummary,
  MarketingAnomaly,
  MarketingInsights,
  MarketingInventoryInsight,
  MarketingOrderInference,
  MarketingSegment,
  MarketingSuggestion,
  MetricsPayload,
  MetricsProductPoint,
  MetricsRange,
  MetricsSeriesPoint,
  SectionId,
  SectionPayload,
} from "@/lib/metrics/types"
import { buildAvailableMonths } from "@/lib/metrics/service"

export type AdminProductPayload = {
  name: string
  category: string
  subcategory: string
  price: number
  cost: number
  imageUrl: string
  stock: number
  minStock: number
}

type DemoState = {
  products: AdminProductRecord[]
  inventoryHistory: Record<string, AdminInventoryLedgerRecord[]>
}

type SeedProduct = AdminProductRecord & {
  unitsSold: number
}

declare global {
  // eslint-disable-next-line no-var
  var __banffAdminDemoState: DemoState | undefined
}

function isoNow(offsetDays = 0): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() - offsetDays)
  return date.toISOString()
}

function money(value: number): string {
  return value.toFixed(2)
}

type DemoRangeProfile = {
  baseRevenue: number
  growthFactor: number
  productOffset: number
  activeClients: number
  pendingOrders: number
  salesBars: [number, number, number]
  paymentsBars: [number, number, number]
  ordersBars: [number, number, number]
  analyticsBars: [number, number, number]
  inventoryBars: [number, number, number]
  branchPoints: [number, number, number, number]
  topCountries: [number, number, number, number, number]
  topPages: [number, number, number, number, number]
  kpiTrend: [number, number, number, number]
  forecastMultiplier: number
}

function resolveDemoRangeProfile(range: MetricsRange, selectedMonth?: string | null): DemoRangeProfile {
  const monthSeed = selectedMonth ? Number(selectedMonth.replace("-", "")) % 11 : 0

  switch (range) {
    case "1d":
      return {
        baseRevenue: 1200 + monthSeed * 35,
        growthFactor: 0.82,
        productOffset: 2,
        activeClients: 28 + monthSeed,
        pendingOrders: 2,
        salesBars: [34, 18, 8],
        paymentsBars: [82, 12, 6],
        ordersBars: [12, 18, 4],
        analyticsBars: [48, 34, 18],
        inventoryBars: [72, 18, 10],
        branchPoints: [760, 690, 540, 480],
        topCountries: [36, 18, 12, 8, 4],
        topPages: [24, 21, 15, 12, 9],
        kpiTrend: [6.2, 1.9, 4.3, -1.4],
        forecastMultiplier: 0.7,
      }
    case "3d":
      return {
        baseRevenue: 3400 + monthSeed * 45,
        growthFactor: 0.92,
        productOffset: 1,
        activeClients: 52 + monthSeed,
        pendingOrders: 4,
        salesBars: [42, 24, 12],
        paymentsBars: [74, 18, 8],
        ordersBars: [18, 22, 8],
        analyticsBars: [44, 38, 18],
        inventoryBars: [68, 20, 12],
        branchPoints: [960, 840, 700, 620],
        topCountries: [52, 26, 20, 14, 6],
        topPages: [42, 36, 28, 22, 16],
        kpiTrend: [8.8, 3.4, 5.8, -0.8],
        forecastMultiplier: 0.82,
      }
    case "7d":
      return {
        baseRevenue: 6800 + monthSeed * 55,
        growthFactor: 1.06,
        productOffset: 0,
        activeClients: 88 + monthSeed,
        pendingOrders: 6,
        salesBars: [48, 30, 22],
        paymentsBars: [70, 20, 10],
        ordersBars: [20, 52, 10],
        analyticsBars: [40, 36, 24],
        inventoryBars: [60, 26, 14],
        branchPoints: [1420, 1260, 1140, 980],
        topCountries: [72, 34, 28, 18, 12],
        topPages: [68, 60, 44, 34, 26],
        kpiTrend: [11.6, 5.1, 7.5, 2.4],
        forecastMultiplier: 0.94,
      }
    case "14d":
      return {
        baseRevenue: 9800 + monthSeed * 65,
        growthFactor: 1.12,
        productOffset: 3,
        activeClients: 104 + monthSeed,
        pendingOrders: 7,
        salesBars: [56, 28, 16],
        paymentsBars: [68, 20, 12],
        ordersBars: [26, 48, 10],
        analyticsBars: [38, 34, 28],
        inventoryBars: [56, 28, 16],
        branchPoints: [1680, 1540, 1380, 1240],
        topCountries: [88, 46, 34, 22, 14],
        topPages: [84, 72, 58, 46, 32],
        kpiTrend: [13.2, 6.4, 8.7, 1.8],
        forecastMultiplier: 1.02,
      }
    case "30d":
      return {
        baseRevenue: 15600 + monthSeed * 80,
        growthFactor: 1.18,
        productOffset: 4,
        activeClients: 132 + monthSeed,
        pendingOrders: 8,
        salesBars: [58, 34, 18],
        paymentsBars: [64, 22, 14],
        ordersBars: [32, 42, 16],
        analyticsBars: [36, 38, 26],
        inventoryBars: [52, 30, 18],
        branchPoints: [2060, 1880, 1740, 1610],
        topCountries: [108, 62, 48, 30, 20],
        topPages: [96, 84, 70, 52, 38],
        kpiTrend: [15.4, 7.6, 9.8, 0.4],
        forecastMultiplier: 1.14,
      }
    case "90d":
      return {
        baseRevenue: 24800 + monthSeed * 95,
        growthFactor: 1.26,
        productOffset: 5,
        activeClients: 184 + monthSeed,
        pendingOrders: 10,
        salesBars: [62, 30, 18],
        paymentsBars: [60, 26, 14],
        ordersBars: [38, 38, 24],
        analyticsBars: [34, 40, 26],
        inventoryBars: [46, 34, 20],
        branchPoints: [2580, 2400, 2190, 2050],
        topCountries: [132, 84, 58, 42, 26],
        topPages: [122, 104, 84, 62, 40],
        kpiTrend: [17.8, 8.2, 11.2, -0.6],
        forecastMultiplier: 1.28,
      }
    case "365d":
      return {
        baseRevenue: 42800 + monthSeed * 110,
        growthFactor: 1.34,
        productOffset: 6,
        activeClients: 242 + monthSeed,
        pendingOrders: 12,
        salesBars: [66, 28, 16],
        paymentsBars: [58, 28, 14],
        ordersBars: [42, 34, 24],
        analyticsBars: [32, 42, 26],
        inventoryBars: [42, 36, 22],
        branchPoints: [3180, 2900, 2750, 2520],
        topCountries: [166, 112, 76, 52, 34],
        topPages: [148, 126, 102, 76, 50],
        kpiTrend: [20.2, 9.4, 12.6, -1.2],
        forecastMultiplier: 1.4,
      }
    case "month":
      return {
        baseRevenue: selectedMonth ? 11800 + monthSeed * 240 : 12800 + monthSeed * 120,
        growthFactor: selectedMonth ? 1.22 : 1.1,
        productOffset: selectedMonth ? monthSeed % 5 : 0,
        activeClients: selectedMonth ? 118 + monthSeed : 124,
        pendingOrders: selectedMonth ? 5 + (monthSeed % 4) : 6,
        salesBars: selectedMonth ? [38, 46, 16] : [44, 38, 18],
        paymentsBars: selectedMonth ? [76, 14, 10] : [72, 18, 10],
        ordersBars: selectedMonth ? [28, 44, 12] : [24, 48, 12],
        analyticsBars: selectedMonth ? [42, 30, 28] : [38, 34, 28],
        inventoryBars: selectedMonth ? [54, 28, 18] : [58, 26, 16],
        branchPoints: selectedMonth ? [1880, 1760, 1490, 1310] : [1760, 1680, 1460, 1250],
        topCountries: selectedMonth ? [94, 58, 36, 24, 14] : [88, 54, 34, 22, 12],
        topPages: selectedMonth ? [102, 88, 74, 50, 36] : [98, 82, 68, 46, 30],
        kpiTrend: selectedMonth ? [12.8, 6.1, 8.2, 0.8] : [11.1, 5.4, 7.4, -0.2],
        forecastMultiplier: selectedMonth ? 1.08 : 1.0,
      }
  }
}

function createLedgerEntry(
  productId: string,
  name: string,
  balanceQty: number,
  change: number,
  daysAgo: number,
): AdminInventoryLedgerRecord {
  const inQty = change > 0 ? change : 0
  const outQty = change < 0 ? Math.abs(change) : 0

  return {
    id: randomUUID(),
    productId,
    branchId: "demo-main",
    voucherType: change >= 0 ? "restock" : "sold",
    postingDate: isoNow(daysAgo).slice(0, 10),
    inQty,
    outQty,
    balanceQty,
    createdAt: isoNow(daysAgo),
    change,
  }
}

function seedProducts(): SeedProduct[] {
  return [
    {
      id: "demo-product-cancun-starter",
      name: "Paquete Cancún Starter",
      category: "Paquetes",
      subcategory: "Starter",
      price: "1180.00",
      cost: "860.00",
      stock: 12,
      minStock: 4,
      imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(18),
      unitsSold: 24,
    },
    {
      id: "demo-product-cusco-explorer",
      name: "Paquete Cusco Explorer",
      category: "Paquetes",
      subcategory: "Explorer",
      price: "1829.00",
      cost: "1260.00",
      stock: 5,
      minStock: 5,
      imageUrl: "https://images.unsplash.com/photo-IfCTrY-dZA8?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(14),
      unitsSold: 19,
    },
    {
      id: "demo-product-buenos-aires-premium",
      name: "Paquete Buenos Aires Premium",
      category: "Paquetes",
      subcategory: "Premium",
      price: "3009.00",
      cost: "2280.00",
      stock: 2,
      minStock: 4,
      imageUrl: "https://images.unsplash.com/photo-wGron63O8fw?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(11),
      unitsSold: 12,
    },
    {
      id: "demo-product-tikal-tour",
      name: "Tour Tikal al Amanecer",
      category: "Tours",
      subcategory: "Cultural",
      price: "80.00",
      cost: "32.00",
      stock: 16,
      minStock: 6,
      imageUrl: "https://images.unsplash.com/photo-FJUrd_BKsWM?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(9),
      unitsSold: 31,
    },
    {
      id: "demo-product-monteverde-tour",
      name: "Canopy Monteverde",
      category: "Tours",
      subcategory: "Adventure",
      price: "75.00",
      cost: "28.00",
      stock: 7,
      minStock: 6,
      imageUrl: "https://images.unsplash.com/photo-qrNjBApCZBM?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(7),
      unitsSold: 17,
    },
    {
      id: "demo-product-cdmx-tour",
      name: "Tour Gastronómico CDMX",
      category: "Tours",
      subcategory: "Gastronómico",
      price: "70.00",
      cost: "26.00",
      stock: 9,
      minStock: 4,
      imageUrl: "https://images.unsplash.com/photo-1SAdcv9Nnxo?auto=format&fit=crop&w=1920&q=90",
      deletedAt: null,
      createdAt: isoNow(5),
      unitsSold: 22,
    },
  ]
}

function seedInventoryHistory(products: SeedProduct[]): Record<string, AdminInventoryLedgerRecord[]> {
  return Object.fromEntries(
    products.map((product, index) => {
      const history = [
        createLedgerEntry(product.id, product.name, product.stock, product.stock, index + 1),
        createLedgerEntry(product.id, product.name, Math.max(0, product.stock - 2), -2, index + 2),
      ]

      return [product.id, history]
    }),
  )
}

function seedState(): DemoState {
  const products = seedProducts()
  return {
    products: products.map(({ unitsSold: _unitsSold, ...product }) => product),
    inventoryHistory: seedInventoryHistory(products),
  }
}

function getState(): DemoState {
  if (!globalThis.__banffAdminDemoState) {
    globalThis.__banffAdminDemoState = seedState()
  }
  return globalThis.__banffAdminDemoState
}

export function isAdminDemoMode(): boolean {
  return process.env.ADMIN_DEMO_MODE === "false" ? false : true
}

function cloneProduct(product: AdminProductRecord): AdminProductRecord {
  return { ...product }
}

function cloneLedger(entry: AdminInventoryLedgerRecord): AdminInventoryLedgerRecord {
  return { ...entry }
}

export function listDemoAdminProducts(): AdminProductRecord[] {
  return getState().products.filter((product) => product.deletedAt === null).map(cloneProduct)
}

export function getDemoAdminProductById(productId: string): AdminProductRecord | null {
  const product = getState().products.find((item) => item.id === productId && item.deletedAt === null)
  return product ? cloneProduct(product) : null
}

export function listDemoProductInventoryHistory(productId: string): AdminInventoryLedgerRecord[] {
  return (getState().inventoryHistory[productId] ?? []).map(cloneLedger)
}

export function createDemoAdminProduct(payload: AdminProductPayload): AdminProductRecord {
  const id = `demo-product-${randomUUID()}`
  const now = isoNow()
  const product: AdminProductRecord = {
    id,
    name: payload.name,
    category: payload.category,
    subcategory: payload.subcategory,
    price: money(payload.price),
    cost: money(payload.cost),
    stock: payload.stock,
    minStock: payload.minStock,
    imageUrl: payload.imageUrl,
    deletedAt: null,
    createdAt: now,
  }

  const state = getState()
  state.products = [product, ...state.products]
  state.inventoryHistory[id] = [
    createLedgerEntry(id, payload.name, payload.stock, payload.stock, 0),
  ]

  return cloneProduct(product)
}

export function updateDemoAdminProduct(productId: string, payload: AdminProductPayload): AdminProductRecord | null {
  const state = getState()
  const index = state.products.findIndex((product) => product.id === productId && product.deletedAt === null)
  if (index < 0) {
    return null
  }

  const updated: AdminProductRecord = {
    ...state.products[index],
    name: payload.name,
    category: payload.category,
    subcategory: payload.subcategory,
    price: money(payload.price),
    cost: money(payload.cost),
    stock: payload.stock,
    minStock: payload.minStock,
    imageUrl: payload.imageUrl,
  }

  state.products[index] = updated
  if (!state.inventoryHistory[productId]) {
    state.inventoryHistory[productId] = []
  }

  return cloneProduct(updated)
}

export function deleteDemoAdminProduct(productId: string): AdminProductRecord | null {
  const state = getState()
  const index = state.products.findIndex((product) => product.id === productId && product.deletedAt === null)
  if (index < 0) {
    return null
  }

  const updated: AdminProductRecord = {
    ...state.products[index],
    deletedAt: isoNow(),
  }
  state.products[index] = updated
  return cloneProduct(updated)
}

export function adjustDemoInventory(params: {
  productId: string
  amount: number
  reason: "restock" | "damaged" | "expired" | "sold" | "manual-adjustment"
  branchId?: string
}): { id: string; productId: string; quantity: number } | null {
  const state = getState()
  const productIndex = state.products.findIndex((product) => product.id === params.productId && product.deletedAt === null)
  if (productIndex < 0) {
    return null
  }

  const product = state.products[productIndex]
  const nextStock = Math.max(0, product.stock + params.amount)
  const updatedProduct: AdminProductRecord = { ...product, stock: nextStock }
  state.products[productIndex] = updatedProduct

  const entry: AdminInventoryLedgerRecord = {
    id: randomUUID(),
    productId: params.productId,
    branchId: params.branchId ?? "demo-main",
    voucherType: params.reason,
    postingDate: isoNow().slice(0, 10),
    inQty: params.amount > 0 ? params.amount : 0,
    outQty: params.amount < 0 ? Math.abs(params.amount) : 0,
    balanceQty: nextStock,
    createdAt: isoNow(),
    change: params.amount,
  }

  const history = state.inventoryHistory[params.productId] ?? []
  state.inventoryHistory[params.productId] = [entry, ...history]

  return {
    id: entry.id,
    productId: params.productId,
    quantity: nextStock,
  }
}

function currentDateIso(offsetDays = 0, baseDate?: Date): string {
  const date = baseDate ? new Date(baseDate) : new Date()
  date.setUTCDate(date.getUTCDate() - offsetDays)
  return date.toISOString()
}

function resolveRangeDays(range: MetricsRange): number {
  switch (range) {
    case "1d":
      return 1
    case "3d":
      return 3
    case "7d":
      return 7
    case "14d":
      return 14
    case "30d":
      return 30
    case "90d":
      return 90
    case "365d":
      return 365
    case "month":
      return 30
  }
}

function resolveRangeLabel(range: MetricsRange): string {
  switch (range) {
    case "1d":
      return "Último día"
    case "3d":
      return "Últimos 3 días"
    case "7d":
      return "Últimos 7 días"
    case "14d":
      return "Últimos 14 días"
    case "30d":
      return "Últimos 30 días"
    case "90d":
      return "Últimos 90 días"
    case "365d":
      return "Últimos 365 días"
    case "month":
      return "Mes actual"
  }
}

function buildSeries(range: MetricsRange, selectedMonth?: string | null): MetricsSeriesPoint[] {
  const profile = resolveDemoRangeProfile(range, selectedMonth)
  const days = resolveRangeDays(range)
  const length = Math.min(8, Math.max(1, range === "1d" ? 1 : range === "3d" ? 3 : 7))
  const shapeMap: Record<MetricsRange, number[]> = {
    "1d": [1],
    "3d": [0.74, 1, 1.22],
    "7d": [0.68, 0.76, 0.94, 1.08, 1.18, 1.02, 0.9],
    "14d": [0.62, 0.7, 0.84, 0.98, 1.12, 1.2, 1.08],
    "30d": [0.58, 0.68, 0.84, 0.96, 1.1, 1.18, 1.04],
    "90d": [0.52, 0.64, 0.8, 0.98, 1.14, 1.26, 1.08],
    "365d": [0.48, 0.62, 0.78, 0.94, 1.08, 1.22, 1.16],
    month: selectedMonth ? [0.62, 0.78, 0.92, 1.06, 1.16, 1.08, 0.96] : [0.64, 0.8, 0.96, 1.08, 1.14, 1.02, 0.88],
  }
  const shape = shapeMap[range]
  const base = profile.baseRevenue + days * 45
  const baseDate = range === "month" && selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)
    ? new Date(`${selectedMonth}-01T00:00:00Z`)
    : new Date()

  return Array.from({ length }, (_, index) => {
    const scale = shape[index] ?? shape[shape.length - 1] ?? 1
    const revenue = Math.round(base * scale)
    const date = new Date(baseDate)
    date.setUTCDate(date.getUTCDate() + index)
    return {
      date: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("es-MX", {
        month: "short",
        day: "2-digit",
        timeZone: "UTC",
      }),
      revenue,
    }
  })
}

function buildTopProducts(products: AdminProductRecord[]): MetricsProductPoint[] {
  return products.slice(0, 5).map((product, index) => ({
    name: product.name,
    units: Math.max(4, product.stock + 8 - index * 2),
    revenue: Math.round(Number(product.price) * Math.max(4, product.stock + 2 - index)),
  }))
}

function buildSections(products: AdminProductRecord[], profile: DemoRangeProfile): Record<SectionId, SectionPayload> {
  const lowStock = products.filter((product) => product.stock <= product.minStock)
  const cards = [
    { label: "Productos activos", value: products.length + Math.round(profile.growthFactor * 3), hint: "Mock dataset" },
    { label: "Bajo inventario", value: lowStock.length + Math.max(0, profile.productOffset - 2), hint: "Requiere atención" },
  ]

  return {
    clients: {
      title: "Clientes",
      hasData: true,
      cards,
      bars: [
        { label: "LatAm", value: profile.salesBars[0] },
        { label: "CA", value: profile.salesBars[1] },
        { label: "US", value: profile.salesBars[2] },
      ],
    },
    sales: {
      title: "Ventas",
      hasData: true,
      cards,
      bars: [
        { label: "Paquetes", value: profile.ordersBars[0] },
        { label: "Tours", value: profile.ordersBars[1] },
        { label: "Add-ons", value: profile.ordersBars[2] },
      ],
    },
    payments: {
      title: "Pagos",
      hasData: true,
      cards,
      bars: [
        { label: "Stripe", value: profile.paymentsBars[0] },
        { label: "Openpay", value: profile.paymentsBars[1] },
        { label: "Other", value: profile.paymentsBars[2] },
      ],
    },
    orders: {
      title: "Pedidos",
      hasData: true,
      cards,
      bars: [
        { label: "Pendientes", value: profile.pendingOrders },
        { label: "Confirmados", value: Math.round(42 * profile.growthFactor) },
        { label: "Cancelados", value: Math.max(1, Math.round(5 * profile.growthFactor)) },
      ],
    },
    analytics: {
      title: "Analítica",
      hasData: true,
      cards,
      bars: [
        { label: "/destinations", value: profile.analyticsBars[0] },
        { label: "/packages", value: profile.analyticsBars[1] },
        { label: "/checkout", value: profile.analyticsBars[2] },
      ],
    },
    employees: {
      title: "Colaboradores",
      hasData: true,
      cards,
      bars: [
        { label: "Sales", value: profile.activeClients },
        { label: "Ops", value: Math.max(10, profile.activeClients - 22) },
        { label: "Support", value: Math.max(8, profile.activeClients - 34) },
      ],
    },
    inventory: {
      title: "Inventario",
      hasData: true,
      cards,
      bars: [
        { label: "Healthy", value: profile.inventoryBars[0] },
        { label: "Watch", value: profile.inventoryBars[1] },
        { label: "Critical", value: profile.inventoryBars[2] },
      ],
      table: {
        columns: ["Item", "Qty", "Min"],
        rows: lowStock.slice(0, 4).map((product) => ({
          Item: product.name,
          Qty: product.stock,
          Min: product.minStock,
        })),
      },
    },
  }
}

function buildForecasts(products: AdminProductRecord[], range: MetricsRange, selectedMonth?: string | null): ForecastPayload {
  const profile = resolveDemoRangeProfile(range, selectedMonth)
  const lowStock = products.filter((product) => product.stock <= product.minStock)
  const baseDate = range === "month" && selectedMonth && /^\d{4}-\d{2}$/.test(selectedMonth)
    ? new Date(`${selectedMonth}-01T00:00:00Z`)
    : new Date()

  const restock: ForecastRestock[] = lowStock.map((product, index) => ({
    id: product.id,
    name: product.name,
    quantity: product.stock,
    avgDailyUse: Math.max(1, Math.round((2 + index) * profile.forecastMultiplier)),
    daysRemaining: product.stock === 0 ? 0 : Math.max(1, Math.round(product.stock / Math.max(1, (2 + index) * profile.forecastMultiplier))),
    nextRestock: currentDateIso(index + 1, baseDate).slice(0, 10),
  }))

  const production: ForecastProduction[] = products.slice(0, 3).map((product, index) => ({
    id: product.id,
    name: product.name,
    dailyAverage: Math.max(2, Math.round((3 + index) * profile.growthFactor)),
    weeklyDemand: Math.max(10, Math.round((18 + index * 4) * profile.growthFactor)),
    peakHour: `${String(11 + index).padStart(2, "0")}:00`,
  }))

  const salesWindows: ForecastSummary[] = [
    {
      label: resolveRangeLabel(range),
      days: resolveRangeDays(range),
      revenue: Math.round(profile.baseRevenue * 1.12),
      orders: Math.round(22 + resolveRangeDays(range) * profile.growthFactor),
      busiestDay: range === "1d" ? "Thursday" : range === "3d" ? "Friday" : range === "7d" ? "Saturday" : "Friday",
      topActivity: [
        { day: "Mon", hour: "10:00", count: Math.max(3, Math.round(6 * profile.growthFactor)) },
        { day: "Fri", hour: "18:00", count: Math.max(5, Math.round(12 * profile.growthFactor)) },
      ],
    },
  ]

  const branchDemand = [
    {
      branch: "Cancún",
      points: Array.from({ length: 4 }, (_, index) => ({
        date: currentDateIso(index, baseDate).slice(0, 10),
        revenue: Math.round(profile.branchPoints[index] * 1.03),
      })),
    },
    {
      branch: "CDMX",
      points: Array.from({ length: 4 }, (_, index) => ({
        date: currentDateIso(index, baseDate).slice(0, 10),
        revenue: Math.round(profile.branchPoints[index] * 0.86),
      })),
    },
  ]

  return {
    restock,
    production,
    salesWindows,
    branchDemand,
  }
}

function buildMarketing(products: AdminProductRecord[], profile: DemoRangeProfile): MarketingInsights {
  const lowStock = products.filter((product) => product.stock <= product.minStock)

  const salesClusters: MarketingSegment[] = [
    {
      name: "K1",
      description: "Travel buyers with short booking windows and a preference for package bundles.",
      count: Math.round(42 * profile.growthFactor),
      avgTicket: Math.round(1180 * profile.growthFactor),
      chart: {
        points: [
          { orders: 4, spent: 850 },
          { orders: 7, spent: 1200 },
          { orders: 10, spent: 1500 },
        ],
        centroid: { orders: 7, spent: 1180 },
      },
    },
    {
      name: "K2",
      description: "High-intent travelers comparing 4-star and 5-star upgrades.",
      count: Math.round(29 * profile.growthFactor),
      avgTicket: Math.round(1829 * profile.growthFactor),
      chart: {
        points: [
          { orders: 5, spent: 1500 },
          { orders: 8, spent: 1900 },
          { orders: 12, spent: 2400 },
        ],
        centroid: { orders: 8, spent: 1829 },
      },
    },
    {
      name: "K3",
      description: "Premium travelers who book longer itineraries and ask for private transfers.",
      count: Math.round(18 * profile.growthFactor),
      avgTicket: Math.round(3009 * profile.growthFactor),
      chart: {
        points: [
          { orders: 2, spent: 2100 },
          { orders: 4, spent: 2900 },
          { orders: 6, spent: 3600 },
        ],
        centroid: { orders: 4, spent: 3009 },
      },
    },
  ]

  const rotatedProducts = [...products.slice(profile.productOffset), ...products.slice(0, profile.productOffset)]
  const productSuggestions: MarketingSuggestion[] = rotatedProducts.slice(0, 3).map((product) => ({
    product: product.name,
    reason: `Strong match for ${product.category.toLowerCase()} demand and current merchandising mix.`,
  }))

  const bestHours: ForecastActivity[] = [
    { day: "Mon", hour: "11:00", count: Math.max(8, Math.round(12 * profile.growthFactor)) },
    { day: "Wed", hour: "15:00", count: Math.max(10, Math.round(18 * profile.growthFactor)) },
    { day: "Fri", hour: "18:00", count: Math.max(14, Math.round(24 * profile.growthFactor)) },
  ]

  const orderInference: MarketingOrderInference[] = [
    { from: "Homepage", to: "Packages", probability: Math.round(38 * profile.growthFactor) },
    { from: "Packages", to: "Checkout", probability: Math.round(24 * profile.growthFactor) },
    { from: "Destinations", to: "Blog", probability: Math.round(18 * profile.growthFactor) },
    { from: "Blog", to: "Packages", probability: Math.round(14 * profile.growthFactor) },
    { from: "Checkout", to: "Success", probability: Math.round(72 * profile.growthFactor) },
  ]

  const inventoryBayesian: MarketingInventoryInsight[] = lowStock.slice(0, 3).map((product, index) => ({
    item: product.name,
    risk: index === 0 ? "High" : "Medium",
    recommendation: product.stock === 0 ? "Pause checkout and trigger restock." : "Reorder before the weekend spike.",
  }))

  const anomalies: MarketingAnomaly[] = [
    { label: "Friday spike", description: `Revenue rose above the expected range by ${Math.round(profile.growthFactor * 10)}% on Friday evening.` },
    { label: "CDMX traffic dip", description: `Visitors dropped slightly for the city package segment in the selected window.` },
  ]

  return {
    salesClusters,
    productSuggestions,
    bestHours,
    orderInference,
    inventoryBayesian,
    anomalies,
  }
}

function buildKpis(
  products: AdminProductRecord[],
  salesSeries: MetricsSeriesPoint[],
  profile: DemoRangeProfile,
): MetricsPayload["kpis"] {
  const totalSales = salesSeries.reduce((sum, point) => sum + point.revenue, 0)
  const avgTicket = products.length ? Math.round(totalSales / products.length) : 0
  const activeClients = profile.activeClients
  const pendingOrders = profile.pendingOrders

  return [
    { label: "Total Sales", value: totalSales, trend: profile.kpiTrend[0], trendLabel: "vs previous period" },
    { label: "Avg Ticket", value: avgTicket, trend: profile.kpiTrend[1], trendLabel: "vs previous period" },
    { label: "Active Clients", value: activeClients, trend: profile.kpiTrend[2], trendLabel: "vs previous period" },
    { label: "Pending Orders", value: pendingOrders, trend: profile.kpiTrend[3], trendLabel: "vs previous period" },
  ]
}

export function getDemoMetricsPayload(range: MetricsRange, selectedMonth?: string | null): MetricsPayload {
  const products = listDemoAdminProducts()
  const profile = resolveDemoRangeProfile(range, selectedMonth)
  const salesSeries = buildSeries(range, selectedMonth)
  const rotatedProducts = [...products.slice(profile.productOffset), ...products.slice(0, profile.productOffset)]
  const topProducts = buildTopProducts(rotatedProducts)
  const inventoryAlerts = products
    .filter((product) => product.stock <= product.minStock)
    .map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.stock,
      minStock: product.minStock,
    }))

  return {
    range,
    rangeLabel: resolveRangeLabel(range),
    since: currentDateIso(6).slice(0, 10),
    until: currentDateIso().slice(0, 10),
    selectedMonth: selectedMonth ?? null,
    hasData: true,
    sections: buildSections(products, profile),
    forecasts: buildForecasts(products, range, selectedMonth),
    marketing: buildMarketing(products, profile),
    kpis: buildKpis(products, salesSeries, profile),
    salesSeries,
    topProducts,
    inventoryAlerts,
    availableMonths: buildAvailableMonths(3),
  }
}
