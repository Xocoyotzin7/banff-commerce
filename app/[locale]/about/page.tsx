import { notFound } from "next/navigation"

import { AboutPageContent } from "@/components/about-page-content"
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
  const pathname = buildLocaleMetadataPath(typedLocale, "/about")
  const alternates = Object.fromEntries(locales.map((item) => [item, buildLocaleMetadataPath(item, "/about")]))

  return buildPageMetadata({
    title: copy.about.title,
    description: copy.about.description,
    pathname,
    locale: typedLocale,
    alternates,
    keywords: [copy.about.title, "about", "web design", "seo"],
  })
}

export default async function AboutPage({ params }: LocalePageProps) {
  const { locale } = await params

  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  return <AboutPageContent locale={locale as Locale} />
}
