import { NextRequest, NextResponse } from "next/server"

import { getDb, NotImplementedError } from "@/lib/db"
import { getProductStockSnapshot } from "@/lib/metrics/service"

type Params = {
  params: {
    handle?: string
  }
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const handle = params.handle?.trim()
    if (!handle) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }
    const database = getDb()

    if (database.kind === "sqlite") {
      throw new NotImplementedError("SQLite adapter not connected yet")
    }

    const product = await getProductStockSnapshot(database.db, handle)
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos cargar el stock."
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
