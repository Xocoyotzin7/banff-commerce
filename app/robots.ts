import type { MetadataRoute } from "next"

import { getSiteUrl } from "@banff/agency-core/seo"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  // Search engine boundary: robots metadata is derived from the centralized SEO config.
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
