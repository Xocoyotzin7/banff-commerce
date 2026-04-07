import { notFound } from "next/navigation"

import { ServicesPageContent } from "@/components/services-page-content"
import { locales, type Locale, getSiteCopy } from "@/lib/site-content"
import { buildLocaleMetadataPath, buildPageMetadata } from "@banff/agency-core/seo"

type LocalePageProps = {
  params: Promise<{
    locale: string
  }>
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) return {}

  const typedLocale = locale as Locale
  const copy = getSiteCopy(typedLocale)
  const pathname = buildLocaleMetadataPath(typedLocale, "/services")
  const alternates = Object.fromEntries(locales.map((item) => [item, buildLocaleMetadataPath(item, "/services")]))

  return buildPageMetadata({
    title: copy.services.title,
    description: copy.services.description,
    pathname,
    locale: typedLocale,
    alternates,
    keywords: [copy.services.title, "services", "website design", "seo"],
  })
}

export default async function ServicesPage({ params }: LocalePageProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return <ServicesPageContent locale={locale as Locale} />
}
