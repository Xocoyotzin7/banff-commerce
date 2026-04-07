import { notFound } from "next/navigation"

import { DestinationStory } from "../../../components/destinations/DestinationStory"
import { destinations } from "../../../lib/data/destinations"
import { packages } from "../../../lib/data/packages"
import { JsonLd } from "@banff/agency-core/components/seo/JsonLd"
import { buildPageMetadata } from "@banff/agency-core/seo/buildMetadata"
import { buildCanonicalUrl } from "@banff/agency-core/seo/url"
import type { Testimonial } from "../../../types/travel"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return destinations.map((destination) => ({
    slug: destination.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const destination = destinations.find((item) => item.slug === slug)

  if (!destination) {
    return {}
  }

  return buildPageMetadata({
    title: destination.name,
    description: destination.description,
    pathname: `/destinations/${destination.slug}`,
    imagePath: destination.heroImage,
    imageAlt: destination.name,
    locale: "es",
    keywords: [destination.name, destination.country, destination.region, "destino", "viajes premium"],
  })
}

function buildTestimonials(destinationName: string, country: string): Testimonial[] {
  return [
    {
      id: `${destinationName}-review-1`,
      name: "Camila R.",
      country,
      avatar: "/serene-nature-sharp.jpg",
      rating: 5,
      text: `The ${destinationName} route felt polished from the first message to the final transfer. It made the whole trip feel premium without losing practicality.`,
      destination: destinationName,
      date: "2026-02-18",
    },
    {
      id: `${destinationName}-review-2`,
      name: "Andrés M.",
      country,
      avatar: "/serene-nature-sharp.jpg",
      rating: 5,
      text: `We sold this itinerary faster because the visuals and pacing were so clear. The destination itself does most of the emotional work.`,
      destination: destinationName,
      date: "2026-03-02",
    },
    {
      id: `${destinationName}-review-3`,
      name: "Valeria G.",
      country,
      avatar: "/serene-nature-sharp.jpg",
      rating: 4.9,
      text: `The balance between adventure, comfort and design was exactly what our clients were asking for. It feels curated, not generic.`,
      destination: destinationName,
      date: "2026-03-21",
    },
  ]
}

export default async function DestinationPage({ params }: PageProps) {
  const { slug } = await params
  const destination = destinations.find((item) => item.slug === slug)
  if (!destination) {
    notFound()
  }

  const destinationTours = destination.tours
  const destinationPackages = packages.filter((travelPackage) => travelPackage.destinationId === destination.id)
  const testimonials = buildTestimonials(destination.name, destination.country)
  const touristAttractionJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: destination.name,
    description: destination.description,
    geo: {
      "@type": "GeoCoordinates",
      latitude: destination.coordinates.latitude,
      longitude: destination.coordinates.longitude,
    },
    image: destination.heroImage,
    url: buildCanonicalUrl(`/destinations/${destination.slug}`),
    offers: {
      "@type": "Offer",
      price: destination.startingPriceUsd,
      priceCurrency: "USD",
    },
  } as const

  return (
    <>
      <JsonLd data={touristAttractionJsonLd} />
      <DestinationStory
        destination={destination}
        destinationTours={destinationTours}
        destinationPackages={destinationPackages}
        testimonials={testimonials}
      />
    </>
  )
}
