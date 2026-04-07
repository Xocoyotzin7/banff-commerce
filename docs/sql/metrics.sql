-- page_analytics table
CREATE TABLE IF NOT EXISTS page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users(id),
  "pagePath" TEXT NOT NULL,
  "timeOnPage" INT DEFAULT 0,
  "userAgent" TEXT,
  "referrerUrl" TEXT,
  "conversionEvent" TEXT,
  "conversionValue" NUMERIC,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- inventory_items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  "categoryId" UUID,
  unit VARCHAR(20),
  "minStock" INT DEFAULT 5
);

-- inventory_stock table
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "itemId" UUID NOT NULL REFERENCES inventory_items(id),
  "branchId" VARCHAR(100),
  quantity NUMERIC NOT NULL DEFAULT 0
);

-- inventory_stock_ledger table
CREATE TABLE IF NOT EXISTS inventory_stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "itemId" UUID NOT NULL,
  "branchId" VARCHAR(100),
  "voucherType" VARCHAR(30),
  "postingDate" DATE,
  "inQty" NUMERIC DEFAULT 0,
  "outQty" NUMERIC DEFAULT 0,
  "inValue" NUMERIC DEFAULT 0,
  "outValue" NUMERIC DEFAULT 0,
  "balanceQty" NUMERIC DEFAULT 0,
  "balanceValue" NUMERIC DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
