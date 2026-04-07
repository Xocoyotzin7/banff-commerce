import { buildCanonicalUrl } from "@/lib/seo/url"
import type {
  SeoArticleInput,
  SeoJsonLdObject,
  SeoLocalBusinessInput,
  SeoOrganizationInput,
  SeoServiceInput,
  SeoWebsiteInput,
} from "@/lib/seo/types"

export function escapeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c")
}

export function buildOrganizationJsonLd(input: SeoOrganizationInput & { siteUrl: string }): SeoJsonLdObject {
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

