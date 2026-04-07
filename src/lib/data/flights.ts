import { destinations } from "./destinations"
import type { Flight } from "../../types/travel"

const origins = [
  { city: "Ciudad de México", code: "MEX", country: "MX" },
  { city: "Toronto", code: "YYZ", country: "CA" },
  { city: "Bogotá", code: "BOG", country: "CO" },
  { city: "Lima", code: "LIM", country: "PE" },
]

const airlines = ["Aeroméxico", "Air Canada", "LATAM Airlines"] as const
const classes: Flight["class"][] = ["economy", "premium economy", "business"]

function formatHours(totalHours: number) {
  const hours = Math.floor(totalHours)
  const minutes = Math.round((totalHours - hours) * 60)
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`
}

function buildFlightDuration(originIndex: number, destinationIndex: number, variant: number) {
  const baseHours = 1.8 + originIndex * 1.35 + destinationIndex * 0.28 + variant * 0.35
  return Math.max(2.1, baseHours)
}

function buildFlightPrice(hours: number, originIndex: number, destinationIndex: number, variant: number) {
  return Math.round(145 + hours * 92 + originIndex * 38 + destinationIndex * 11 + variant * 24)
}

function buildDepartureDate(originIndex: number, destinationIndex: number, variant: number) {
  const day = 1 + originIndex * 7 + destinationIndex * 2 + variant
  const month = 4 + Math.floor((destinationIndex + originIndex) / 6)
  const hour = 7 + ((originIndex + variant) % 4) * 3
  const date = new Date(Date.UTC(2026, month, day, hour, 0, 0))
  return date.toISOString()
}

function addHours(dateIso: string, hours: number) {
  const date = new Date(dateIso)
  date.setUTCHours(date.getUTCHours() + hours)
  return date.toISOString()
}

function makeFlight(originIndex: number, destinationIndex: number, variant: number): Flight {
  const origin = origins[originIndex]
  const destination = destinations[destinationIndex]
  const hours = buildFlightDuration(originIndex, destinationIndex, variant)
  const departure = buildDepartureDate(originIndex, destinationIndex, variant)
  const arrival = addHours(departure, hours)
  const airline = airlines[(originIndex + destinationIndex + variant) % airlines.length]
  const stopPattern = [0, 1, 0, 1, 2]
  const stops = stopPattern[variant]

  return {
    id: `flt-${origin.code.toLowerCase()}-${destination.slug}-${variant + 1}`,
    origin: `${origin.city} (${origin.code})`,
    destination: `${destination.name}`,
    airline,
    departure,
    arrival,
    duration: formatHours(hours),
    price: buildFlightPrice(hours, originIndex, destinationIndex, variant),
    class: classes[(originIndex + variant) % classes.length],
    stops,
  }
}

export const flights: Flight[] = origins.flatMap((_, originIndex) =>
  destinations.flatMap((_, destinationIndex) =>
    Array.from({ length: 5 }, (_, variant) => makeFlight(originIndex, destinationIndex, variant)),
  ),
)
