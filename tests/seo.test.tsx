import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { JsonLd } from "@/components/seo/JsonLd"
import {
  buildArticleJsonLd,
  buildBreadcrumbList,
  buildCanonicalUrl,
  buildOrganizationJsonLd,
  buildPageMetadata,
  buildServiceJsonLd,
  escapeJsonLd,
  seoConfig,
} from "@/lib/seo"

describe("seo helpers", () => {
  it("builds canonical urls from relative paths", () => {
    expect(buildCanonicalUrl("/blog/seo")).toBe(`${seoConfig.siteUrl}/blog/seo`)
  })

  it("builds page metadata with canonical and open graph data", () => {
    const metadata = buildPageMetadata({
      title: "SEO Services",
      description: "SEO metadata for a service page.",
      pathname: "/services/seo",
      locale: "en",
    })

    expect(metadata.alternates?.canonical).toBe(`${seoConfig.siteUrl}/services/seo`)
    expect(metadata.openGraph?.url).toBe(`${seoConfig.siteUrl}/services/seo`)
    expect(metadata.twitter?.card).toBe("summary_large_image")
  })

  it("escapes less-than characters in JSON-LD", () => {
    const escaped = escapeJsonLd({ name: "<script>alert(1)</script>" })
    expect(escaped).toContain("\\u003cscript>")
    expect(escaped).not.toContain("<script>")
  })

  it("renders JsonLd as a script tag", () => {
    const markup = renderToStaticMarkup(
      React.createElement(JsonLd, {
        data: {
          "@context": "https://schema.org",
          "@type": "Thing",
          name: "<unsafe>",
        },
      }),
    )

    expect(markup).toContain('type="application/ld+json"')
    expect(markup).toContain("\\u003cunsafe>")
  })

  it("builds breadcrumb lists with absolute urls", () => {
    const breadcrumbs = buildBreadcrumbList([
      { name: "Home", pathname: "/" },
      { name: "Blog", pathname: "/blog" },
    ])

    expect(breadcrumbs.itemListElement).toHaveLength(2)
    expect(breadcrumbs.itemListElement?.[1]?.item).toBe(`${seoConfig.siteUrl}/blog`)
  })

  it("builds organization and service entities from config-driven inputs", () => {
    const organization = buildOrganizationJsonLd({
      siteUrl: seoConfig.siteUrl,
      name: seoConfig.brand.brandName,
      url: seoConfig.brand.brandUrl,
      logo: `${seoConfig.siteUrl}${seoConfig.brand.brandLogoPath}`,
      sameAs: seoConfig.brand.brandSameAs,
      description: seoConfig.brand.brandDescription,
    })

    const service = buildServiceJsonLd({
      siteUrl: seoConfig.siteUrl,
      name: "Website design",
      description: "Service page example",
      url: `${seoConfig.siteUrl}/services/website-design`,
      serviceType: "Website design",
      areaServed: "Canada and Mexico",
      organizationId: `${seoConfig.brand.brandUrl}#organization`,
    })

    const article = buildArticleJsonLd({
      headline: "SEO content",
      description: "Article example",
      url: `${seoConfig.siteUrl}/blog/seo-content`,
      datePublished: "2025-01-01",
      authorName: seoConfig.brand.brandName,
    })

    expect(organization["@type"]).toBe("Organization")
    expect(service["@type"]).toBe("Service")
    expect(article["@type"]).toBe("Article")
  })
})
