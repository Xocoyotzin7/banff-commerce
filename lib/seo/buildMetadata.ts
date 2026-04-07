import type { Metadata } from "next"

import { seoConfig } from "@/lib/seo/config"
import { buildCanonicalUrl } from "@/lib/seo/url"
import type { SeoPageMetadataInput, SeoConfig, SeoLocale, SeoRobots } from "@/lib/seo/types"

export function buildLayoutMetadata(config: SeoConfig = seoConfig): Metadata {
  return {
    metadataBase: new URL(config.siteUrl),
    title: {
      default: config.brand.brandName,
      template: `%s | ${config.brand.brandName}`,
    },
    description: config.brand.brandDescription,
    applicationName: config.brand.brandName,
    authors: [{ name: config.brand.brandName, url: config.brand.brandUrl }],
    creator: config.brand.brandName,
    publisher: config.brand.brandName,
    verification: config.verification as Metadata["verification"],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        {
          url: "/icon",
          media: "(prefers-color-scheme: light)",
        },
        {
          url: "/icon",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      apple: "/apple-icon",
    },
  }
}

function buildDefaultRobots(input: SeoPageMetadataInput): SeoRobots {
  if (input.robots) return input.robots

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
}

export function buildPageMetadata(input: SeoPageMetadataInput, config: SeoConfig = seoConfig): Metadata {
  const canonical = buildCanonicalUrl(input.pathname, config.siteUrl)
  const imagePath = input.imagePath ?? config.ogImagePath
  const imageUrl = buildCanonicalUrl(imagePath, config.siteUrl)
  const title = input.title || config.brand.brandName
  const locale = input.locale ?? config.defaultLocale

  return {
    metadataBase: new URL(config.siteUrl),
    title,
    description: input.description,
    alternates: {
      canonical,
      languages: input.alternates,
    },
    keywords: input.keywords,
    robots: buildDefaultRobots(input),
    openGraph: {
      title,
      description: input.description,
      url: canonical,
      siteName: config.brand.brandName,
      type: input.type ?? "website",
      locale: locale === "es" ? "es_MX" : locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: input.imageAlt ?? config.brand.brandName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [imageUrl],
    },
    applicationName: config.brand.brandName,
    authors: [{ name: config.brand.brandName, url: config.brand.brandUrl }],
    creator: config.brand.brandName,
    publisher: config.brand.brandName,
  }
}

export function buildLocalizedAlternates<T extends string>(paths: Record<T, string>) {
  return paths
}

export function buildLocaleMetadataPath(locale: SeoLocale, pathname: string) {
  return locale === seoConfig.defaultLocale ? pathname : `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}
