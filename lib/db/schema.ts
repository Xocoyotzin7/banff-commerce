import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const reservationStatusEnum = pgEnum("reservation_status", ["pending", "confirmed", "cancelled", "completed"])
export const reservationTypeEnum = pgEnum("reservation_type", ["appointment", "travel"])
export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "cancelled", "completed"])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  clientId: text("client_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reservationCode: varchar("reservation_code", { length: 3 }).notNull(),
  reservationType: reservationTypeEnum("reservation_type").notNull().default("appointment"),
  reservationDate: date("reservation_date").notNull(),
  reservationTime: varchar("reservation_time", { length: 5 }).notNull(),
  branchId: varchar("branch_id", { length: 100 }).notNull(),
  branchNumber: varchar("branch_number", { length: 8 }),
  destinationSlug: text("destination_slug"),
  packageId: text("package_id"),
  peopleCount: integer("people_count").notNull(),
  message: text("message"),
  preOrderItems: text("pre_order_items"),
  status: reservationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const reservationFailures = pgTable("reservation_failures", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalReservationId: uuid("original_reservation_id"),
  userId: uuid("user_id").references(() => users.id),
  reservationCode: varchar("reservation_code", { length: 3 }),
  reservationType: reservationTypeEnum("reservation_type"),
  reservationDate: date("reservation_date"),
  reservationTime: varchar("reservation_time", { length: 5 }),
  branchId: varchar("branch_id", { length: 100 }),
  branchNumber: varchar("branch_number", { length: 8 }),
  destinationSlug: text("destination_slug"),
  packageId: text("package_id"),
  peopleCount: integer("people_count"),
  message: text("message"),
  preOrderItems: text("pre_order_items"),
  status: varchar("status", { length: 20 }),
  archivedAt: timestamp("archived_at", { withTimezone: true }).notNull().defaultNow(),
  cleanupAt: timestamp("cleanup_at", { withTimezone: true }),
})

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(5),
  imageUrl: text("image_url").notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  orderNumber: varchar("order_number", { length: 64 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  vatAmount: numeric("vat_amount", { precision: 12, scale: 2 }).notNull(),
  tipAmount: numeric("tip_amount", { precision: 12, scale: 2 }).notNull(),
  sourceType: varchar("source_type", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
})

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  method: varchar("method", { length: 32 }).notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const pageAnalytics = pgTable("page_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  sessionId: text("session_id"),
  visitorId: text("visitor_id"),
  pagePath: text("page_path").notNull(),
  pageType: text("page_type"),
  destinationSlug: text("destination_slug"),
  packageId: text("package_id"),
  timeOnPage: integer("time_on_page").notNull().default(0),
  scrollDepth: integer("scroll_depth").notNull().default(0),
  locale: varchar("locale", { length: 8 }),
  country: varchar("country", { length: 8 }),
  userAgent: text("user_agent"),
  referrerUrl: text("referrer_url"),
  conversionEvent: text("conversion_event"),
  conversionValue: numeric("conversion_value", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  categoryId: uuid("category_id"),
  unit: varchar("unit", { length: 20 }),
  minStock: integer("min_stock").notNull().default(5),
})

export const inventoryStock = pgTable("inventory_stock", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => inventoryItems.id, { onDelete: "cascade" }),
  branchId: varchar("branch_id", { length: 100 }),
  quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull().default("0"),
})

export const inventoryStockLedger = pgTable("inventory_stock_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id").notNull(),
  branchId: varchar("branch_id", { length: 100 }),
  voucherType: varchar("voucher_type", { length: 30 }),
  postingDate: date("posting_date"),
  inQty: numeric("in_qty", { precision: 12, scale: 2 }).notNull().default("0"),
  outQty: numeric("out_qty", { precision: 12, scale: 2 }).notNull().default("0"),
  inValue: numeric("in_value", { precision: 12, scale: 2 }).notNull().default("0"),
  outValue: numeric("out_value", { precision: 12, scale: 2 }).notNull().default("0"),
  balanceQty: numeric("balance_qty", { precision: 12, scale: 2 }).notNull().default("0"),
  balanceValue: numeric("balance_value", { precision: 12, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const dbSchema = {
  users,
  reservations,
  reservationFailures,
  products,
  orders,
  orderItems,
  payments,
  pageAnalytics,
  inventoryItems,
  inventoryStock,
  inventoryStockLedger,
} as const

export type DbSchema = typeof dbSchema
