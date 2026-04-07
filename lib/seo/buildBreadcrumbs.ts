import { buildCanonicalUrl } from "@/lib/seo/url"
import type { SeoBreadcrumbItem, SeoJsonLdObject } from "@/lib/seo/types"

export function buildBreadcrumbList(items: readonly SeoBreadcrumbItem[], siteUrl?: string): SeoJsonLdObject {
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

