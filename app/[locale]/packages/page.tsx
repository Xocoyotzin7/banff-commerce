import { notFound } from "next/navigation"

import { PackagesPageContent } from "@/components/packages-page-content"
import { getSiteCopy, locales, type Locale } from "@/lib/site-content"
import { buildLocaleMetadataPath, buildPageMetadata } from "@/lib/seo"

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
  const pathname = buildLocaleMetadataPath(typedLocale, "/packages")
  const alternates = Object.fromEntries(locales.map((item) => [item, buildLocaleMetadataPath(item, "/packages")]))

  return buildPageMetadata({
    title: copy.packages.title,
    description: copy.packages.description,
    pathname,
    locale: typedLocale,
    alternates,
    keywords: [copy.packages.title, "packages", "pricing", "seo"],
  })
}

export default async function PackagesPage({ params }: LocalePageProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return <PackagesPageContent locale={locale as Locale} />
}
