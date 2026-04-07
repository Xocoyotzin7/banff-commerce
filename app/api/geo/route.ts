import { NextRequest, NextResponse } from "next/server"

import { detectCountry } from "@/lib/geo"

export async function GET(request: NextRequest) {
  const geo = await detectCountry(request.headers)

  return NextResponse.json(
    geo,
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  )
}
