import { buildCanonicalUrl } from "@banff/agency-core/seo/url"
import type { SeoBreadcrumbItem, SeoJsonLdObject } from "@banff/agency-core/seo/types"

export function buildBreadcrumbList(items: readonly SeoBreadcrumbItem[], siteUrl?: string): SeoJsonLdObject {
  // Breadcrumb URLs should always be absolute so crawlers can resolve them without context.
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.pathname, siteUrl),
    })),
  }
}

