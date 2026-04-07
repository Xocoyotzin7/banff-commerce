import type { Metadata } from "next"

import { DestinationCard } from "../../components/destinations/DestinationCard"
import { destinations } from "../../lib/data/destinations"
import { StaggeredGrid } from "../../components/shared/StaggeredGrid"
import { getLocaleFromCookies } from "@/lib/locale"
import { getTravelCopy } from "@/lib/travel-copy"
import type { Locale } from "@/lib/site-content"

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocaleFromCookies()) as Locale
  const copy = getTravelCopy(locale)

  return {
    title: copy.destinationsPage.title,
    description: copy.destinationsPage.description,
  }
}

export default async function DestinationsPage() {
  const locale = (await getLocaleFromCookies()) as Locale
  const copy = getTravelCopy(locale)

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{copy.destinationsPage.eyebrow}</p>
        <h1 className="mt-3 text-5xl leading-[0.95] tracking-tight text-text">{copy.destinationsPage.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">{copy.destinationsPage.description}</p>
      </div>

      <StaggeredGrid className="mt-10">
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </StaggeredGrid>
    </main>
  )
}
