import { cookies, headers } from "next/headers"

import { locales, type Locale } from "@banff/agency-core/lib/locale"

export async function getLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  if (locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  const headerStore = await headers()
  const acceptLanguage = headerStore.get("accept-language") ?? ""
  const preferredLocales = acceptLanguage
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean)

  for (const preferred of preferredLocales) {
    const base = preferred.split("-")[0] as Locale
    if (locales.includes(base)) {
      return base
    }
  }

  return "en"
}
