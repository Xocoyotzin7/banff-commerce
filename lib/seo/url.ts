import { seoConfig } from "@/lib/seo/config"

function normalizePathname(pathname: string) {
  if (!pathname) return "/"
  if (pathname.startsWith("http://") || pathname.startsWith("https://")) return pathname

  const cleaned = pathname.startsWith("/") ? pathname : `/${pathname}`
  return cleaned === "" ? "/" : cleaned
}

export function getSiteUrl() {
  return seoConfig.siteUrl
}

export function getMetadataBaseUrl() {
  return new URL(seoConfig.siteUrl)
}

export function buildCanonicalUrl(pathname = "/", siteUrl = seoConfig.siteUrl) {
  const base = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`
  const normalizedPath = normalizePathname(pathname)
  return new URL(normalizedPath, base).toString()
}

export function buildLocalePath(locale: string, pathname: string) {
  if (!pathname || pathname === "/") {
    return locale === seoConfig.defaultLocale ? "/" : `/${locale}`
  }

  const normalizedPath = normalizePathname(pathname)
  if (locale === seoConfig.defaultLocale) return normalizedPath
  return `/${locale}${normalizedPath}`
}

