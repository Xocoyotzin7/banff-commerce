import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { FlightMockBadge } from "../../../components/packages/FlightMockBadge"
import { PackageCard } from "../../../components/packages/PackageCard"
import { destinations } from "../../../lib/data/destinations"
import { flights } from "../../../lib/data/flights"
import { packages } from "../../../lib/data/packages"

type PageProps = {
  params: Promise<{
    id: string
  }>
}

export function generateStaticParams() {
  return packages.map((travelPackage) => ({
    id: travelPackage.id,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const travelPackage = packages.find((item) => item.id === id)

  if (!travelPackage) {
    return {}
  }

  const destination = destinations.find((entry) => entry.id === travelPackage.destinationId)

  return {
    title: travelPackage.title,
    description: `Paquete ${travelPackage.title} para ${destination?.name ?? "Latinoamérica"}.`,
  }
}

export default async function PackagePage({ params }: PageProps) {
  const { id } = await params
  const travelPackage = packages.find((item) => item.id === id)
  if (!travelPackage) {
    notFound()
  }

  const destination = destinations.find((entry) => entry.id === travelPackage.destinationId)
  const relatedFlight = flights.find((flight) => flight.destination === destination?.name) ?? flights[0]

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <PackageCard travelPackage={travelPackage} layout="horizontal" highlighted layoutId={`package-card-${travelPackage.id}`} />

        <div className="space-y-5 rounded-[1.9rem] border border-white/10 bg-white/7 p-6 text-text backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Flight mock</p>
              <h1 className="mt-3 text-4xl leading-[0.98] tracking-tight text-text">{travelPackage.title}</h1>
            </div>
            <FlightMockBadge classType={relatedFlight.class} stops={relatedFlight.stops} />
          </div>

          <div className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/18 p-4 text-sm text-text-muted">
            <div className="flex items-center justify-between">
              <span>Route</span>
              <span className="text-text">
                {relatedFlight.origin} → {relatedFlight.destination}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Airline</span>
              <span className="text-text">{relatedFlight.airline}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Duration</span>
              <span className="text-text">{relatedFlight.duration}</span>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-text-muted">Itinerary</p>
            <ul className="mt-4 space-y-2">
              {travelPackage.itinerary.map((step) => (
                <li key={step} className="rounded-2xl border border-white/10 bg-black/18 px-4 py-3 text-sm text-text-muted">
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/checkout?packageId=${travelPackage.id}`} className="rounded-full bg-[color:var(--primary)] px-5 py-3 text-sm font-semibold text-white">
              Reserve now
            </Link>
            <Link href="/packages" className="rounded-full border border-white/10 bg-white/7 px-5 py-3 text-sm font-semibold text-text">
              Back to catalog
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
