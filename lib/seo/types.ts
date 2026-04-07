export type SeoLocale = "en" | "fr" | "es"

export type SeoBrandConfig = {
  brandName: string
  brandUrl: string
  brandLogoPath: string
  brandDescription: string
  brandSameAs: readonly string[]
  brandTelephone?: string
  brandEmail?: string
  brandLocation?: string
  brandServiceArea?: string
}

export type SeoConfig = {
  siteUrl: string
  defaultLocale: SeoLocale
  locales: readonly SeoLocale[]
  brand: SeoBrandConfig
  searchPath: string
  ogImagePath: string
  verification: Record<string, string>
}

export type SeoRobots = {
  index?: boolean
  follow?: boolean
  noarchive?: boolean
  nocache?: boolean
  noimageindex?: boolean
  googleBot?: {
    index?: boolean
    follow?: boolean
    "max-video-preview"?: number
    "max-image-preview"?: "none" | "standard" | "large"
    "max-snippet"?: number
  }
}

export type SeoCanonicalAlternates = Partial<Record<string, string>>

export type SeoPageMetadataInput = {
  title: string
  description: string
  pathname: string
  locale?: string
  alternates?: SeoCanonicalAlternates
  imagePath?: string
  imageAlt?: string
  type?: "website" | "article"
  robots?: SeoRobots
  keywords?: string[]
}

export type SeoBreadcrumbItem = {
  name: string
  pathname: string
}

export type SeoContactPoint = {
  contactType: string
  telephone?: string
  email?: string
  areaServed?: string
  availableLanguage?: string | readonly string[]
}

export type SeoPostalAddress = {
  streetAddress?: string
  addressLocality?: string
  addressRegion?: string
  postalCode?: string
  addressCountry?: string
}

export type SeoOrganizationInput = {
  name?: string
  url?: string
  logo?: string
  sameAs?: readonly string[]
  description?: string
  telephone?: string
  email?: string
  contactPoint?: readonly SeoContactPoint[]
  address?: SeoPostalAddress
  serviceArea?: string
}

export type SeoWebsiteInput = {
  name?: string
  url?: string
  searchPath?: string
  inLanguage?: string
}

export type SeoServiceInput = {
  name: string
  description: string
  url: string
  serviceType?: string
  areaServed?: string
  provider?: {
    name: string
    url: string
    logo?: string
    sameAs?: readonly string[]
  }
}

export type SeoArticleInput = {
  headline: string
  description: string
  url: string
  datePublished: string
  dateModified?: string
  authorName: string
  image?: string
  inLanguage?: string
  articleType?: "Article" | "BlogPosting"
}

export type SeoLocalBusinessInput = {
  name?: string
  url?: string
  description?: string
  telephone?: string
  email?: string
  areaServed?: string
  address?: SeoPostalAddress
  sameAs?: readonly string[]
  logo?: string
}

export type SeoJsonLdObject = Record<string, unknown>

