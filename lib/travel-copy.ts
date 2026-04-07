import type { Locale } from "@/lib/site-content"

export type TravelCopy = {
  nav: {
    destinations: string
    packages: string
    tours: string
    about: string
    login: string
    reserve: string
    viewAll: string
    close: string
    highlightedDestinations: string
    exploreByRegion: string
  }
  home: {
    eyebrow: string
    titleLineOne: string
    titleLineTwo: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    appointmentCta: string
    scrollHint: string
    featuredEyebrow: string
    featuredTitle: string
    featuredDescription: string
    packagesEyebrow: string
    packagesTitle: string
    packagesDescription: string
    packagesCta: string
    testimonialsEyebrow: string
    testimonialsTitle: string
    testimonialsDescription: string
    loopVisual: string
    counters: {
      destinations: string
      packages: string
      travelers: string
    }
    packageTabs: {
      starter: string
      explorer: string
      premium: string
    }
    featurePanel: {
      metrics: {
        label: string
        value: string
      }[]
      cards: {
        title: string
        body: string
      }[]
      curatedLabel: string
    }
  }
  packageCard: {
    from: string
    days: string
    nights: string
    flights: string
    hotel: string
    tours: string
    breakfast: string
    included: string
    optional: string
    notIncluded: string
    hotelByTier: string
    curatedExperiences: string
    details: string
    reserve: string
    badges: {
      starter: string
      explorer: string
      premium: string
    }
    itinerary: {
      arrival: string
      privateArrival: string
      departureAssist: string
      departure: string
      day: string
      leisure: string
      curatedDowntime: string
    }
  }
  destinationsPage: {
    eyebrow: string
    title: string
    description: string
  }
  packagesPage: {
    eyebrow: string
    title: string
    description: string
    foundSuffix: string
    checkoutLink: string
  }
  footer: {
    description: string
    aboutTitle: string
    infoTitle: string
    contactTitle: string
    newsletterTitle: string
    newsletterDescription: string
    newsletterPlaceholder: string
    subscribe: string
    invalidEmail: string
    success: string
    popularDestinationsTitle: string
    socialText: string
  }
}

const basePackageCard = {
  from: "From",
  days: "days",
  nights: "nights",
  flights: "Flights",
  hotel: "Hotel",
  tours: "Tours",
  breakfast: "Breakfast",
  included: "Included",
  optional: "Optional",
  notIncluded: "Not included",
  hotelByTier: "3★ / 4★ / 5★ by tier",
  curatedExperiences: "curated experiences",
  details: "View details",
  reserve: "Reserve",
  badges: {
    starter: "Best value",
    explorer: "Best seller",
    premium: "Exclusive",
  },
  itinerary: {
    arrival: "Arrival in",
    privateArrival: "Private arrival at",
    departureAssist: "Departure with airport assistance",
    departure: "Departure",
    day: "Day",
    leisure: "leisure and transfer buffer",
    curatedDowntime: "curated downtime",
  },
} satisfies TravelCopy["packageCard"]

const travelCopyEn: TravelCopy = {
  nav: {
    destinations: "Destinations",
    packages: "Packages",
    tours: "Tours",
    about: "About us",
    login: "Login",
    reserve: "Reserve",
    viewAll: "View all",
    close: "Close",
    highlightedDestinations: "Highlighted destinations",
    exploreByRegion: "Explore by region",
  },
  home: {
    eyebrow: "Luxury travel e-commerce",
    titleLineOne: "DISCOVER",
    titleLineTwo: "LATIN AMERICA",
    subtitle: "20 destinations · Packages from $599 USD · Flights included",
    primaryCta: "Explore destinations",
    secondaryCta: "View packages",
    appointmentCta: "Book appointment",
    scrollHint: "Scroll to explore",
    featuredEyebrow: "Featured destinations",
    featuredTitle: "Destinations that will take your breath away",
    featuredDescription:
      "An editorial layout that inspires first and converts second. On desktop the grid feels like a magazine cover.",
    packagesEyebrow: "Packages",
    packagesTitle: "Ready-to-sell trips with a clear logic.",
    packagesDescription:
      "Change the package tier and the selection reorganizes with shared transitions to keep visual context.",
    packagesCta: "View all packages",
    testimonialsEyebrow: "Testimonials",
    testimonialsTitle: "People who already booked the feeling",
    testimonialsDescription:
      "Short notes from travelers who cared about ease, clarity and a premium finish.",
    loopVisual: "Visual loop",
    counters: {
      destinations: "Destinations",
      packages: "Packages",
      travelers: "Travelers",
    },
    packageTabs: {
      starter: "Starter",
      explorer: "Growth",
      premium: "Premium",
    },
    featurePanel: {
      metrics: [
        { label: "Stay", value: "5-star sanctuaries" },
        { label: "Transfer", value: "Private aircraft" },
        { label: "Support", value: "24/7 concierge" },
        { label: "Mood", value: "Slow luxury" },
      ],
      cards: [
        { title: "Private routes", body: "Mexico to the Caribbean" },
        { title: "Altitude breaks", body: "Cusco and the Andes" },
        { title: "Night programs", body: "Cartagena and beyond" },
      ],
      curatedLabel: "Curated",
    },
  },
  packageCard: basePackageCard,
  destinationsPage: {
    eyebrow: "Destinations",
    title: "Every place has a tempo.",
    description:
      "Choose coastal rhythm, altitude calm, or night-forward city energy. Each route is represented as a destination story first and a product second.",
  },
  packagesPage: {
    eyebrow: "Packages",
    title: "Packages built to sell from the first glance.",
    description:
      "Filter by country, budget, duration and tier. The grid uses shared layout transitions so the detail page feels connected.",
    foundSuffix: "packages found",
    checkoutLink: "Go to checkout",
  },
  footer: {
    description:
      "Luxury travel for Latin America, with a practical commerce layer that keeps discovery, booking and conversion in the same flow.",
    aboutTitle: "About",
    infoTitle: "Information",
    contactTitle: "Contact",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Receive route drops and private offers without the noise.",
    newsletterPlaceholder: "your@email.com",
    subscribe: "Subscribe",
    invalidEmail: "Enter a valid email.",
    success: "Thanks. We will let you know first.",
    popularDestinationsTitle: "Popular destinations",
    socialText: "Follow us",
  },
}

const travelCopyFr: TravelCopy = {
  nav: {
    destinations: "Destinations",
    packages: "Forfaits",
    tours: "Circuits",
    about: "À propos",
    login: "Connexion",
    reserve: "Réserver",
    viewAll: "Tout voir",
    close: "Fermer",
    highlightedDestinations: "Destinations à la une",
    exploreByRegion: "Explorer par région",
  },
  home: {
    eyebrow: "E-commerce de voyages premium",
    titleLineOne: "DÉCOUVREZ",
    titleLineTwo: "L’AMÉRIQUE LATINE",
    subtitle: "20 destinations · Forfaits à partir de 599 USD · Vols inclus",
    primaryCta: "Explorer les destinations",
    secondaryCta: "Voir les forfaits",
    appointmentCta: "Réserver un rendez-vous",
    scrollHint: "Faites défiler pour explorer",
    featuredEyebrow: "Destinations phares",
    featuredTitle: "Des destinations qui coupent le souffle",
    featuredDescription:
      "Une mise en page éditoriale qui inspire d’abord et convertit ensuite. Sur desktop, la grille ressemble à une couverture de magazine.",
    packagesEyebrow: "Forfaits",
    packagesTitle: "Des voyages prêts à vendre avec une logique claire.",
    packagesDescription:
      "Changez de niveau de forfait et la sélection se réorganise avec des transitions partagées pour garder le contexte visuel.",
    packagesCta: "Voir tous les forfaits",
    testimonialsEyebrow: "Témoignages",
    testimonialsTitle: "Des voyageurs déjà convaincus",
    testimonialsDescription:
      "De courts retours de voyageurs qui ont apprécié la simplicité, la clarté et la finition premium.",
    loopVisual: "Boucle visuelle",
    counters: {
      destinations: "Destinations",
      packages: "Forfaits",
      travelers: "Voyageurs",
    },
    packageTabs: {
      starter: "Starter",
      explorer: "Explorer",
      premium: "Premium",
    },
    featurePanel: {
      metrics: [
        { label: "Séjour", value: "Sanctuaires 5 étoiles" },
        { label: "Transfert", value: "Avion privé" },
        { label: "Support", value: "Conciergerie 24/7" },
        { label: "Ambiance", value: "Luxe lent" },
      ],
      cards: [
        { title: "Routes privées", body: "Du Mexique aux Caraïbes" },
        { title: "Pauses altitude", body: "Cusco et les Andes" },
        { title: "Programmes nocturnes", body: "Cartagena et plus loin" },
      ],
      curatedLabel: "Sélectionné",
    },
  },
  packageCard: {
    from: "À partir de",
    days: "jours",
    nights: "nuits",
    flights: "Vols",
    hotel: "Hôtel",
    tours: "Circuits",
    breakfast: "Petit-déjeuner",
    included: "Inclus",
    optional: "Optionnel",
    notIncluded: "Non inclus",
    hotelByTier: "3★ / 4★ / 5★ selon le niveau",
    curatedExperiences: "expériences sélectionnées",
    details: "Voir les détails",
    reserve: "Réserver",
    badges: {
      starter: "Meilleur rapport qualité-prix",
      explorer: "Meilleure vente",
      premium: "Exclusif",
    },
    itinerary: {
      arrival: "Arrivée à",
      privateArrival: "Arrivée privée à",
      departureAssist: "Départ avec assistance aéroport",
      departure: "Départ",
      day: "Jour",
      leisure: "temps libre et marge de transfert",
      curatedDowntime: "temps libre sélectionné",
    },
  },
  destinationsPage: {
    eyebrow: "Destinations",
    title: "Chaque lieu a son rythme.",
    description:
      "Choisissez le rythme côtier, le calme des hauteurs ou l’énergie des villes nocturnes. Chaque route est pensée comme une histoire de destination avant d’être un produit.",
  },
  packagesPage: {
    eyebrow: "Forfaits",
    title: "Des forfaits pensés pour vendre dès le premier regard.",
    description:
      "Filtrez par pays, budget, durée et niveau. La grille utilise des transitions partagées pour que la page détail reste connectée.",
    foundSuffix: "forfaits trouvés",
    checkoutLink: "Aller au paiement",
  },
  footer: {
    description:
      "Voyages premium en Amérique latine, avec une couche e-commerce pratique qui garde la découverte, la réservation et la conversion dans un même flux.",
    aboutTitle: "À propos",
    infoTitle: "Informations",
    contactTitle: "Contact",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Recevez les nouvelles routes et les offres privées, sans bruit.",
    newsletterPlaceholder: "votre@email.com",
    subscribe: "S'abonner",
    invalidEmail: "Entrez un e-mail valide.",
    success: "Merci. Nous vous préviendrons en premier.",
    popularDestinationsTitle: "Destinations populaires",
    socialText: "Suivez-nous",
  },
}

const travelCopyEs: TravelCopy = {
  nav: {
    destinations: "Destinos",
    packages: "Paquetes",
    tours: "Tours",
    about: "Sobre nosotros",
    login: "Entrar",
    reserve: "Reservar",
    viewAll: "Ver todos",
    close: "Cerrar",
    highlightedDestinations: "Destinos destacados",
    exploreByRegion: "Explora por región",
  },
  home: {
    eyebrow: "E-commerce de viajes premium",
    titleLineOne: "DESCUBRE",
    titleLineTwo: "LATINOAMÉRICA",
    subtitle: "20 destinos · Paquetes desde $599 USD · Vuelos incluidos",
    primaryCta: "Explorar destinos",
    secondaryCta: "Ver paquetes",
    appointmentCta: "Reservar cita",
    scrollHint: "Desliza para explorar",
    featuredEyebrow: "Destinos destacados",
    featuredTitle: "Destinos que te quitarán el aliento",
    featuredDescription:
      "Un diseño editorial para inspirar primero y convertir después. En desktop la grilla se siente como una portada de revista.",
    packagesEyebrow: "Paquetes",
    packagesTitle: "Viajes listos para vender con una lógica clara.",
    packagesDescription:
      "Cambia el nivel del paquete y la selección se reorganiza con transiciones compartidas para conservar contexto visual.",
    packagesCta: "Ver todos los paquetes",
    testimonialsEyebrow: "Testimonios",
    testimonialsTitle: "Viajeros que ya reservaron la experiencia",
    testimonialsDescription:
      "Notas breves de viajeros que valoraron la facilidad, la claridad y el acabado premium.",
    loopVisual: "Loop visual",
    counters: {
      destinations: "Destinos",
      packages: "Paquetes",
      travelers: "Viajeros",
    },
    packageTabs: {
      starter: "Starter",
      explorer: "Growth",
      premium: "Premium",
    },
    featurePanel: {
      metrics: [
        { label: "Estadía", value: "Santuarios 5 estrellas" },
        { label: "Traslado", value: "Aviones privados" },
        { label: "Soporte", value: "Concierge 24/7" },
        { label: "Mood", value: "Lujo lento" },
      ],
      cards: [
        { title: "Rutas privadas", body: "México y el Caribe" },
        { title: "Pausas de altura", body: "Cusco y los Andes" },
        { title: "Programas nocturnos", body: "Cartagena y más allá" },
      ],
      curatedLabel: "Curado",
    },
  },
  packageCard: {
    from: "Desde",
    days: "días",
    nights: "noches",
    flights: "Vuelos",
    hotel: "Hotel",
    tours: "Tours",
    breakfast: "Desayuno",
    included: "Incluido",
    optional: "Opcional",
    notIncluded: "No incluido",
    hotelByTier: "3★ / 4★ / 5★ por nivel",
    curatedExperiences: "experiencias curadas",
    details: "Ver detalles",
    reserve: "Reservar",
    badges: {
      starter: "Mejor valor",
      explorer: "Más vendido",
      premium: "Exclusivo",
    },
    itinerary: {
      arrival: "Llegada a",
      privateArrival: "Llegada privada a",
      departureAssist: "Salida con asistencia en aeropuerto",
      departure: "Salida",
      day: "Día",
      leisure: "tiempo libre y margen de traslado",
      curatedDowntime: "descanso curado",
    },
  },
  destinationsPage: {
    eyebrow: "Destinos",
    title: "Cada lugar tiene su propio ritmo.",
    description:
      "Elige el pulso costero, la calma de altura o la energía nocturna de las ciudades. Cada ruta se cuenta como historia primero y producto después.",
  },
  packagesPage: {
    eyebrow: "Paquetes",
    title: "Paquetes construidos para vender desde la primera vista.",
    description:
      "Filtra por país, presupuesto, duración y tipo. La grilla usa transiciones compartidas para que la página detalle se sienta conectada.",
    foundSuffix: "paquetes encontrados",
    checkoutLink: "Ir al checkout",
  },
  footer: {
    description:
      "Viajes premium por Latinoamérica, con una capa de comercio práctica que mantiene descubrimiento, reserva y conversión en un mismo flujo.",
    aboutTitle: "Acerca de",
    infoTitle: "Información",
    contactTitle: "Contacto",
    newsletterTitle: "Newsletter",
    newsletterDescription: "Recibe rutas nuevas y ofertas privadas sin ruido.",
    newsletterPlaceholder: "tu@email.com",
    subscribe: "Suscribirme",
    invalidEmail: "Ingresa un correo válido.",
    success: "Gracias. Te avisaremos primero.",
    popularDestinationsTitle: "Destinos populares",
    socialText: "Síguenos",
  },
}

export const travelCopy: Record<Locale, TravelCopy> = {
  en: travelCopyEn,
  fr: travelCopyFr,
  es: travelCopyEs,
}

export function getTravelCopy(locale: Locale) {
  return travelCopy[locale] ?? travelCopy.en
}
