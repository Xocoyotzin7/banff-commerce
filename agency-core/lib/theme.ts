import { cookies, headers } from "next/headers"

export type ThemeMode = "dark" | "light"

function normalizeTheme(value: string | undefined | null): ThemeMode | null {
  if (value === "dark" || value === "light") return value
  return null
}

export async function getThemeFromRequest(): Promise<ThemeMode> {
  const cookieStore = await cookies()
  const cookieTheme = normalizeTheme(cookieStore.get("NEXT_THEME")?.value)
  if (cookieTheme) {
    return cookieTheme
  }

  const headerStore = await headers()
  const hintedTheme = normalizeTheme(headerStore.get("sec-ch-prefers-color-scheme"))
  return hintedTheme ?? "dark"
}

