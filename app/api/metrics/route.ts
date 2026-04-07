/*
 * --------------------------------------------------------------------
 *  Xoco POS — Point of Sale System
 *  Software Property of Xoco Café
 *  Copyright (c) 2025 Xoco Café
 *  Principal Developer: Donovan Riaño
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * --------------------------------------------------------------------
 *
 * SQL reference for the Neon metrics layer:
 *
 * -- page_analytics table
 * CREATE TABLE IF NOT EXISTS page_analytics (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "userId" UUID REFERENCES users(id),
 *   "pagePath" TEXT NOT NULL,
 *   "timeOnPage" INT DEFAULT 0,
 *   "userAgent" TEXT,
 *   "referrerUrl" TEXT,
 *   "conversionEvent" TEXT,
 *   "conversionValue" NUMERIC,
 *   "createdAt" TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- inventory_items table
 * CREATE TABLE IF NOT EXISTS inventory_items (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   name TEXT NOT NULL,
 *   "categoryId" UUID,
 *   unit VARCHAR(20),
 *   "minStock" INT DEFAULT 5
 * );
 *
 * -- inventory_stock table
 * CREATE TABLE IF NOT EXISTS inventory_stock (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "itemId" UUID NOT NULL REFERENCES inventory_items(id),
 *   "branchId" VARCHAR(100),
 *   quantity NUMERIC NOT NULL DEFAULT 0
 * );
 *
 * -- inventory_stock_ledger table
 * CREATE TABLE IF NOT EXISTS inventory_stock_ledger (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   "itemId" UUID NOT NULL,
 *   "branchId" VARCHAR(100),
 *   "voucherType" VARCHAR(30),
 *   "postingDate" DATE,
 *   "inQty" NUMERIC DEFAULT 0,
 *   "outQty" NUMERIC DEFAULT 0,
 *   "inValue" NUMERIC DEFAULT 0,
 *   "outValue" NUMERIC DEFAULT 0,
 *   "balanceQty" NUMERIC DEFAULT 0,
 *   "balanceValue" NUMERIC DEFAULT 0,
 *   "createdAt" TIMESTAMPTZ DEFAULT NOW()
 * );
 * --------------------------------------------------------------------
 */

import { NextRequest, NextResponse } from "next/server"

import { getDb, NotImplementedError } from "@/lib/db"
import { getMetricsPayload, resolveMetricsWindow } from "@/lib/metrics/service"

export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get("range")

  try {
    const database = getDb()

    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }

    const payload = await getMetricsPayload(database.db, range)
    return NextResponse.json({
      success: true,
      data: {
        ...payload,
        rangeAvailability: {
          "1d": true,
          "3d": true,
          "7d": true,
          "14d": true,
          "30d": true,
          "90d": true,
          "365d": true,
          month: true,
        },
        selectedRange: resolveMetricsWindow(range).range,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos calcular las métricas."
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
