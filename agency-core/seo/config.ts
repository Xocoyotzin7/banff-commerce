// Agency-owned SEO configuration. Keep brand values centralized here and inject
// client-specific values through env or props instead of hardcoding them in builders.
const DEFAULT_SITE_URL = "http://localhost:3000"

function normalizeSiteUrl(value: string | undefined) {
  const raw = value?.trim()
  if (!raw) return DEFAULT_SITE_URL

  return raw.endsWith("/") ? raw.slice(0, -1) : raw
}

function readVerificationEnv() {
  const verification: Record<string, string> = {}

  if (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION) {
    verification.google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  }

  if (process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION) {
    verification["msvalidate.01"] = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
  }

  if (process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION) {
    verification["facebook-domain-verification"] = process.env.NEXT_PUBLIC_FACEBOOK_DOMAIN_VERIFICATION
  }

  return verification
}

export const seoConfig = {
  siteUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  defaultLocale: "en" as const,
  locales: ["en", "fr", "es"] as const,
  brand: {
    brandName: process.env.NEXT_PUBLIC_BRAND_NAME?.trim() || "Banff Studio",
    brandUrl: normalizeSiteUrl(process.env.NEXT_PUBLIC_BRAND_URL ?? process.env.NEXT_PUBLIC_SITE_URL),
    brandLogoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH?.trim() || "/apple-icon",
    brandDescription:
      process.env.NEXT_PUBLIC_BRAND_DESCRIPTION?.trim() ||
      "Banff Studio builds bilingual websites and mobile products for businesses that need better UX, SEO, and execution.",
    brandSameAs: [
      "https://github.com/driano7",
      "https://t.me/driano7",
      "https://t.me/riaygarcia4",
    ],
    brandTelephone: process.env.NEXT_PUBLIC_BRAND_TELEPHONE?.trim() || undefined,
    brandEmail: process.env.NEXT_PUBLIC_BRAND_EMAIL?.trim() || undefined,
    brandLocation: process.env.NEXT_PUBLIC_BRAND_LOCATION?.trim() || undefined,
    brandServiceArea: process.env.NEXT_PUBLIC_BRAND_SERVICE_AREA?.trim() || undefined,
  },
  searchPath: "/blog",
  ogImagePath: "/opengraph-image",
  verification: readVerificationEnv(),
} as const

