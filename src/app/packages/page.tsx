import type { Metadata } from "next"
import { getLocaleFromCookies } from "@/lib/locale"
import { getTravelCopy } from "@/lib/travel-copy"
import { PackagesPageClient } from "../../components/packages/PackagesPageClient"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies()
  const copy = getTravelCopy(locale)

  return {
    title: copy.packagesPage.title,
    description: copy.packagesPage.description,
  }
}

export default async function PackagesPage() {
  const locale = await getLocaleFromCookies()

  return <PackagesPageClient locale={locale} />
}
