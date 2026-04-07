import { NextRequest, NextResponse } from "next/server"

import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const pathname = request.nextUrl.pathname

  if (pathname === "/admin/login") {
    if (token && (await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL("/admin/products", request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (!token || !(await verifyAdminToken(token))) {
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
