import { NextRequest, NextResponse } from "next/server"

import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth"
import { locales, type Locale } from "@/lib/site-content"

function detectLocale(acceptLanguage: string | null | undefined): Locale {
  const header = acceptLanguage ?? ""
  const preferredLocales = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean)

  for (const preferred of preferredLocales) {
    const base = preferred.split("-")[0]
    if (locales.includes(base as Locale)) {
      return base as Locale
    }
  }

  return "en"
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const response = NextResponse.next()

  if (!request.cookies.get("NEXT_LOCALE")) {
    const firstSegment = pathname.split("/").filter(Boolean)[0]
    if (firstSegment && locales.includes(firstSegment as Locale)) {
      response.cookies.set("NEXT_LOCALE", firstSegment, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      })
    } else {
      response.cookies.set("NEXT_LOCALE", detectLocale(request.headers.get("accept-language")), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      })
    }
  }

  if (pathname === "/admin/login") {
    if (token && (await verifyAdminToken(token))) {
      return NextResponse.redirect(new URL("/admin/products", request.url))
    }
    return response
  }

  if (pathname.startsWith("/admin")) {
    if (!token || !(await verifyAdminToken(token))) {
      const url = new URL("/admin/login", request.url)
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
