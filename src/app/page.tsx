import type { Metadata } from "next"

import { HeroSection } from "../components/home/HeroSection"
import { FeaturedDestinations } from "../components/home/FeaturedDestinations"
import { PackagesShowcase } from "../components/home/PackagesShowcase"
import { TestimonialsSection } from "../components/home/TestimonialsSection"
import { getLocaleFromCookies } from "@/lib/locale.server"
import { getTravelCopy } from "@/lib/travel-copy"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookies()
  const copy = getTravelCopy(locale)

  return {
    title: "LATAM Viajes | Descubre Latinoamérica",
    description: copy.home.subtitle,
  }
}

export default async function HomePage() {
  const locale = await getLocaleFromCookies()

  return (
    <main id="main-content" className="bg-background">
      <HeroSection locale={locale} />
      <FeaturedDestinations locale={locale} />
      <PackagesShowcase locale={locale} />
      <TestimonialsSection locale={locale} />
    </main>
  )
}
