import { seoConfig } from "@banff/agency-core/seo/config"

export { seoConfig } from "@banff/agency-core/seo/config"
export { buildBreadcrumbList } from "@banff/agency-core/seo/buildBreadcrumbs"
export {
  buildArticleJsonLd,
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildServiceJsonLd,
  buildWebSiteJsonLd,
  compactJsonLd,
  escapeJsonLd,
} from "@banff/agency-core/seo/buildJsonLd"
export { buildLayoutMetadata, buildLocaleMetadataPath, buildPageMetadata, buildLocalizedAlternates } from "@banff/agency-core/seo/buildMetadata"
export { getMetadataBaseUrl, getSiteUrl, buildCanonicalUrl, buildLocalePath } from "@banff/agency-core/seo/url"
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
} from "@banff/agency-core/seo/types"

