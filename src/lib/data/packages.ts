import { destinations } from "./destinations"
import type { TravelPackage } from "../../types/travel"

function money(value: number) {
  return {
    usd: value,
    mxn: Math.round(value * 20),
    cad: Math.round(value * 1.35),
  }
}

function formatPackageId(destinationId: string, tier: "starter" | "explorer" | "premium") {
  return `${destinationId}-${tier}`
}

function buildItinerary(destinationName: string, tourTitles: string[], days: number, premium = false) {
  const itinerary: string[] = [premium ? `Private arrival at ${destinationName}` : `Arrival in ${destinationName}`]

  for (let day = 2; day <= days; day += 1) {
    if (day === days) {
      itinerary.push(premium ? "Departure with airport assistance" : "Departure")
      continue
    }

    const tourTitle = tourTitles[day - 2]
    if (tourTitle) {
      itinerary.push(`Day ${day}: ${tourTitle}`)
      continue
    }

    if (premium && day === days - 1) {
      itinerary.push(`Day ${day}: curated downtime`)
      continue
    }

    itinerary.push(`Day ${day}: leisure and transfer buffer`)
  }

  return itinerary
}

function buildPackage(destinationId: string, tier: "starter" | "explorer" | "premium"): TravelPackage {
  const destination = destinations.find((entry) => entry.id === destinationId)
  if (!destination) {
    throw new Error(`Missing destination ${destinationId}`)
  }

  const price =
    tier === "starter"
      ? destination.startingPriceUsd
      : tier === "explorer"
        ? Math.round(destination.startingPriceUsd * 1.55)
        : Math.round(destination.startingPriceUsd * 2.55)

  const tierConfig = {
    starter: {
      days: 5,
      nights: 4,
      badge: "Mejor valor",
      availability: "available" as const,
      tours: [destination.tours[0].id],
      breakfast: false,
      allInclusive: false,
    },
    explorer: {
      days: 8,
      nights: 7,
      badge: "Más vendido",
      availability: "limited" as const,
      tours: [destination.tours[0].id, destination.tours[1].id],
      breakfast: true,
      allInclusive: false,
    },
    premium: {
      days: 12,
      nights: 11,
      badge: "Exclusivo",
      availability: "limited" as const,
      tours: [destination.tours[0].id, destination.tours[1].id, destination.tours[2].id],
      breakfast: true,
      allInclusive: true,
    },
  }[tier]

  return {
    id: formatPackageId(destinationId, tier),
    destinationId,
    title: `${destination.name} ${tier[0].toUpperCase()}${tier.slice(1)}`,
    days: tierConfig.days,
    nights: tierConfig.nights,
    price,
    currency: "USD",
    pricing: money(price),
    includes: {
      flights: tier !== "starter",
      hotel: true,
      tours: tierConfig.tours,
      breakfast: tierConfig.breakfast,
      allInclusive: tierConfig.allInclusive,
    },
    itinerary: buildItinerary(
      destination.name,
      destination.tours.slice(0, tierConfig.tours.length).map((tourItem) => tourItem.title),
      tierConfig.days,
      tier === "premium",
    ),
    availability: tierConfig.availability,
    badge: tierConfig.badge,
  }
}

export const packages: TravelPackage[] = destinations.flatMap((destination) => [
  buildPackage(destination.id, "starter"),
  buildPackage(destination.id, "explorer"),
  buildPackage(destination.id, "premium"),
])
