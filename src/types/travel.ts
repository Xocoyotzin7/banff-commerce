export interface Destination {
  id: string
  slug: string
  name: string
  country: string
  region: string
  startingPriceUsd: number
  heroImage: string
  images: string[]
  description: string
  highlights: string[]
  rating: number
  reviewCount: number
  bestSeason: string
  coordinates: {
    latitude: number
    longitude: number
  }
  tours: Tour[]
}

export interface TravelPackage {
  id: string
  destinationId: string
  title: string
  days: number
  nights: number
  price: number
  currency: string
  pricing?: {
    usd: number
    mxn: number
    cad: number
  }
  includes: {
    flights: boolean
    hotel: boolean
    tours: string[]
    breakfast?: boolean
    allInclusive?: boolean
  }
  itinerary: string[]
  availability: "available" | "limited" | "sold-out"
  badge?: string
}

export interface Flight {
  id: string
  origin: string
  destination: string
  airline: string
  departure: string
  arrival: string
  duration: string
  price: number
  class: "economy" | "premium economy" | "business"
  stops: number
}

export interface Tour {
  id: string
  destinationId: string
  title: string
  duration: string
  price: number
  category: string
  maxGroupSize: number
  highlights: string[]
  included: string[]
}

export interface Testimonial {
  id: string
  name: string
  country: string
  avatar: string
  rating: number
  text: string
  destination: string
  date: string
}
