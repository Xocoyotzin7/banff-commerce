import { seoConfig } from "@/lib/seo/config"

export type SeoServicePageRecord = {
  slug: string
  title: string
  description: string
  body: string
  serviceType: string
  areaServed: string
  summaryPoints: readonly string[]
}

export type SeoCasePageRecord = {
  slug: string
  title: string
  description: string
  body: string
  datePublished: string
  highlights: readonly string[]
}

export const servicePageExamples: Record<string, SeoServicePageRecord> = {
  "diseno-sitios-web": {
    slug: "diseno-sitios-web",
    title: "Website design for service businesses",
    description:
      "A structured service page example for agencies, consultants, and local businesses that need a clearer website presence.",
    body:
      "This page is designed to show how a service route can publish metadata, structured data, and a readable content hierarchy without mixing SEO logic into the view layer.",
    serviceType: "Website design",
    areaServed: "Canada and Mexico",
    summaryPoints: [
      "Strategy-led website structure",
      "Technical SEO foundations",
      "Responsive design for launch",
    ],
  },
  "seo-empresas": {
    slug: "seo-empresas",
    title: "SEO system for businesses",
    description:
      "A template service page for companies that need organic visibility, better internal linking, and cleaner search intent alignment.",
    body:
      "Use this route to feed service metadata from CMS content, then attach Organization, Service, and BreadcrumbList JSON-LD blocks from the server component.",
    serviceType: "SEO consulting",
    areaServed: "Canada and Mexico",
    summaryPoints: [
      "Entity-first copy structure",
      "Internal linking support",
      "Schema-ready service pages",
    ],
  },
}

export const casePageExamples: Record<string, SeoCasePageRecord> = {
  "sitio-bilingue": {
    slug: "sitio-bilingue",
    title: "Bilingual website rebuild",
    description:
      "A case-study example for a business that needed a cleaner bilingual structure and better search visibility.",
    body:
      "This template shows how to treat a case study as an Article in JSON-LD, while keeping the business narrative and metrics in the page content.",
    datePublished: "2025-01-15",
    highlights: [
      "Clear bilingual navigation",
      "Improved crawlable structure",
      "Conversion-focused layout",
    ],
  },
  "seo-local": {
    slug: "seo-local",
    title: "Local SEO structure for a service business",
    description:
      "A case-study template for local visibility, service-area signals, and stronger search intent alignment.",
    body:
      "This example is intentionally small: the SEO module should receive structured data from config or props, not from hardcoded assumptions inside helpers.",
    datePublished: "2025-02-10",
    highlights: [
      "Location-aware content",
      "Service pages by intent",
      "Breadcrumb and article markup",
    ],
  },
}

export function getServicePageExample(slug: string) {
  return servicePageExamples[slug] ?? null
}

export function getCasePageExample(slug: string) {
  return casePageExamples[slug] ?? null
}

export function getSeoBrandName() {
  return seoConfig.brand.brandName
}

