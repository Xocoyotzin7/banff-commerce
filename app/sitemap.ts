import type { MetadataRoute } from "next"

import { getAllBlogPosts } from "@/lib/blog"
import { casePageExamples, servicePageExamples } from "@banff/agency-core/seo/example-pages"
import { buildCanonicalUrl, seoConfig } from "@banff/agency-core/seo"
import { locales } from "@banff/agency-core/lib/locale"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const siteUrl = seoConfig.siteUrl

  // Sitemap stays server-generated so the search index reflects current content and locale routes.
  const localePages = locales.flatMap((locale) => [
    {
      url: buildCanonicalUrl(`/${locale}/about`, siteUrl),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: buildCanonicalUrl(`/${locale}/packages`, siteUrl),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: buildCanonicalUrl(`/${locale}/services`, siteUrl),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: buildCanonicalUrl("/", siteUrl),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildCanonicalUrl("/portfolio", siteUrl),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: buildCanonicalUrl("/blog", siteUrl),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  const blogPages = getAllBlogPosts().map((post) => ({
    url: buildCanonicalUrl(`/blog/${post.slug}`, siteUrl),
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const exampleServicePages = Object.values(servicePageExamples).map((page) => ({
    url: buildCanonicalUrl(`/servicios/${page.slug}`, siteUrl),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  const exampleCasePages = Object.values(casePageExamples).map((page) => ({
    url: buildCanonicalUrl(`/casos/${page.slug}`, siteUrl),
    lastModified: new Date(page.datePublished),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...localePages, ...blogPages, ...exampleServicePages, ...exampleCasePages]
}
