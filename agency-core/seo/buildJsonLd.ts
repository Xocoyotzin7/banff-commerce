import { buildCanonicalUrl } from "@banff/agency-core/seo/url"
import type {
  SeoArticleInput,
  SeoJsonLdObject,
  SeoLocalBusinessInput,
  SeoOrganizationInput,
  SeoServiceInput,
  SeoWebsiteInput,
} from "@banff/agency-core/seo/types"

export function escapeJsonLd(value: unknown) {
  // Safe for inline script tags in Server Components: stringify first, then escape "<".
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export function buildOrganizationJsonLd(input: SeoOrganizationInput & { siteUrl: string }): SeoJsonLdObject {
  // Entity builders are intentionally config-driven so the client can swap branding without changing logic.
  const organizationUrl = input.url ?? input.siteUrl
  const organizationId = `${organizationUrl}#organization`

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: input.name,
    url: organizationUrl,
    logo: input.logo,
    sameAs: input.sameAs,
    description: input.description,
    telephone: input.telephone,
    email: input.email,
    contactPoint: input.contactPoint?.map((point) => ({
      "@type": "ContactPoint",
      ...point,
    })),
    address: input.address
      ? {
          "@type": "PostalAddress",
          ...input.address,
        }
      : undefined,
    areaServed: input.serviceArea,
  }
}

export function buildWebSiteJsonLd(input: SeoWebsiteInput & { siteUrl: string; organizationId?: string }): SeoJsonLdObject {
  // SearchAction is only emitted when a site search path exists.
  const websiteUrl = input.url ?? input.siteUrl
  const websiteId = `${websiteUrl}#website`

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: input.name,
    url: websiteUrl,
    inLanguage: input.inLanguage,
    publisher: input.organizationId ? { "@id": input.organizationId } : undefined,
    potentialAction: input.searchPath
      ? {
          "@type": "SearchAction",
          target: `${buildCanonicalUrl(input.searchPath, input.siteUrl)}?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        }
      : undefined,
  }
}

export function buildServiceJsonLd(input: SeoServiceInput & { siteUrl: string; organizationId?: string }): SeoJsonLdObject {
  // Service entities can point back to the Organization by @id to avoid duplication.
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${input.url}#service`,
    name: input.name,
    description: input.description,
    url: input.url,
    serviceType: input.serviceType,
    areaServed: input.areaServed,
    provider: input.provider
      ? {
          "@type": "Organization",
          name: input.provider.name,
          url: input.provider.url,
          logo: input.provider.logo,
          sameAs: input.provider.sameAs,
        }
      : input.organizationId
        ? { "@id": input.organizationId }
        : undefined,
  }
}

export function buildArticleJsonLd(input: SeoArticleInput): SeoJsonLdObject {
  // Article vs BlogPosting stays configurable because CMS content may use either schema type.
  const articleType = input.articleType ?? "Article"

  return {
    "@context": "https://schema.org",
    "@type": articleType,
    "@id": `${input.url}#article`,
    headline: input.headline,
    description: input.description,
    url: input.url,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    image: input.image ? [input.image] : undefined,
    inLanguage: input.inLanguage,
  }
}

export function buildLocalBusinessJsonLd(input: SeoLocalBusinessInput & { siteUrl: string }): SeoJsonLdObject {
  // Only use this when the business actually has a local address or service area.
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${input.url ?? input.siteUrl}#local-business`,
    name: input.name,
    url: input.url ?? input.siteUrl,
    description: input.description,
    telephone: input.telephone,
    email: input.email,
    areaServed: input.areaServed,
    sameAs: input.sameAs,
    logo: input.logo,
    address: input.address
      ? {
          "@type": "PostalAddress",
          ...input.address,
        }
      : undefined,
  }
}

export function compactJsonLd(items: readonly SeoJsonLdObject[]) {
  return items.filter((item) => Object.values(item).some((value) => value !== undefined && value !== null))
}

