import { seoConfig } from "@/lib/seo/config"

export { seoConfig } from "@/lib/seo/config"
export { buildBreadcrumbList } from "@/lib/seo/buildBreadcrumbs"
export {
  buildArticleJsonLd,
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildServiceJsonLd,
  buildWebSiteJsonLd,
  compactJsonLd,
  escapeJsonLd,
} from "@/lib/seo/buildJsonLd"
export { buildLayoutMetadata, buildLocaleMetadataPath, buildPageMetadata, buildLocalizedAlternates } from "@/lib/seo/buildMetadata"
export { getMetadataBaseUrl, getSiteUrl, buildCanonicalUrl, buildLocalePath } from "@/lib/seo/url"
export const SITE_NAME = seoConfig.brand.brandName
export const SITE_DESCRIPTION = seoConfig.brand.brandDescription
export const OG_IMAGE_PATH = seoConfig.ogImagePath
export const SOCIAL_LINKS = seoConfig.brand.brandSameAs
export type {
  SeoArticleInput,
  SeoBreadcrumbItem,
  SeoBrandConfig,
  SeoCanonicalAlternates,
  SeoConfig,
  SeoContactPoint,
  SeoJsonLdObject,
  SeoLocale,
  SeoLocalBusinessInput,
  SeoOrganizationInput,
  SeoPageMetadataInput,
  SeoPostalAddress,
  SeoRobots,
  SeoServiceInput,
  SeoWebsiteInput,
} from "@/lib/seo/types"
