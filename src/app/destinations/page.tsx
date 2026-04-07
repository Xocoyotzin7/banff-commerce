import type { Metadata } from "next"

import { DestinationCard } from "../../components/destinations/DestinationCard"
import { destinations } from "../../lib/data/destinations"
import { StaggeredGrid } from "../../components/shared/StaggeredGrid"

export const metadata: Metadata = {
  title: "Destinos",
  description: "Explora 20 destinos premium de Latinoamérica con historias, tours y paquetes listos para reservar.",
}

export default function DestinationsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Destinations</p>
        <h1 className="mt-3 text-5xl leading-[0.95] tracking-tight text-text">Every place has a tempo.</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-text-muted">
          Choose coastal rhythm, altitude calm, or night-forward city energy. Each route is represented as a destination story first and a product second.
        </p>
      </div>

      <StaggeredGrid className="mt-10">
        {destinations.map((destination) => (
          <DestinationCard key={destination.id} destination={destination} />
        ))}
      </StaggeredGrid>
    </main>
  )
}
