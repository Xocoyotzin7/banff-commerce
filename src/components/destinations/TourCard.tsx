"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import type { Tour } from "../../types/travel"
import { cn } from "../../lib/utils"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent } from "../../../components/ui/card"

type TourCardProps = {
  tour: Tour
  imageSrc?: string
  href?: string
}

const categoryMap: Record<string, string> = {
  Adventure: "Aventura",
  Naturaleza: "Naturaleza",
  Nature: "Naturaleza",
  Cultura: "Cultural",
  Food: "Gastronómico",
  Mar: "Mar",
  Beach: "Playa",
  Island: "Islas",
  Coffee: "Café",
  Trek: "Trekking",
  Rail: "Tren",
  Premium: "Premium",
  Tradition: "Tradición",
  Landscape: "Paisaje",
  Photo: "Fotografía",
  Sailing: "Navegación",
  Expedition: "Expedición",
  River: "Río",
  Snow: "Nieve",
  Aerial: "Aéreo",
}

export function TourCard({ tour, imageSrc, href }: TourCardProps) {
  return (
    <Card className="overflow-hidden border border-white/10 bg-white/7 backdrop-blur-xl">
      <div className="grid gap-0 lg:grid-cols-[200px_1fr]">
        <div className="relative min-h-[220px] lg:min-h-full">
          <Image src={imageSrc ?? "/serene-nature-sharp.jpg"} alt={tour.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 200px" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.8),rgba(6,13,13,0.12))]" />
          <Badge className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white backdrop-blur-xl">
            {categoryMap[tour.category] ?? tour.category}
          </Badge>
        </div>

        <CardContent className="flex flex-col justify-between gap-4 p-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-text">{tour.title}</h3>
                <p className="mt-2 text-sm uppercase tracking-[0.28em] text-text-muted">
                  {tour.duration} · hasta {tour.maxGroupSize} personas
                </p>
              </div>
              <Badge className="rounded-full bg-[color:var(--secondary)] text-black">
                ${tour.price.toLocaleString()} USD
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {tour.highlights.map((highlight) => (
                <span key={highlight} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/18 px-3 py-1 text-xs text-white/76">
                  <Check className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-text-muted">{tour.included.slice(0, 3).join(" · ")}</p>
            <Button asChild className={cn("rounded-full bg-[color:var(--primary)] text-white", href ? "inline-flex" : "opacity-80")}>
              <Link href={href ?? "#"}>
                Reservar tour
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
