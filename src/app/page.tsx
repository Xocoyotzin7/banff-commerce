import type { Metadata } from "next"

import { HeroSection } from "../components/home/HeroSection"
import { FeaturedDestinations } from "../components/home/FeaturedDestinations"
import { PackagesShowcase } from "../components/home/PackagesShowcase"
import { TestimonialsSection } from "../components/home/TestimonialsSection"

export const metadata: Metadata = {
  title: "Descubre Latinoamérica",
  description:
    "Paquetes de viaje premium a 20 destinos de Latinoamérica. Cancún, Cartagena, Machu Picchu, Salar de Uyuni y más.",
}

export default function HomePage() {
  return (
    <main id="main-content" className="bg-background">
      <HeroSection />
      <FeaturedDestinations />
      <PackagesShowcase />
      <TestimonialsSection />
    </main>
  )
}
