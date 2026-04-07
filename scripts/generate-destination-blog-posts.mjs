import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const BLOG_ROOT = path.join(ROOT, "content", "blog")

const locales = ["en", "es", "fr"]

const themeCopy = {
  en: {
    title: (name) => `${name}: a premium route with editorial rhythm`,
    excerpt: (name, tone) =>
      `How ${name} turns ${tone} into a clean, premium story that is easy to pitch and even easier to book.`,
    category: "Travel",
    readTime: "5 min read",
    intro: (name, region, season, tone) =>
      `${name} works best when you treat it as a ${region.toLowerCase()} story with ${tone}. The best season usually lands around ${season}, which keeps the visuals strong and the logistics easy to present.`,
    why: "Why it works",
    rhythm: "Suggested rhythm",
    visuals: "Visual notes",
    close: (name) =>
      `That balance of scenery, pacing and comfort is what makes ${name} feel premium instead of generic.`,
    bullets: [
      "Lead with one signature experience.",
      "Keep one slower block for recovery or dining.",
      "Use the final day to close with a polished transfer or farewell moment.",
    ],
    quote: (name) => `The best version of ${name} feels curated, not crowded.`,
    tags: (name, country, region) => [name, country, region, "Premium travel"],
  },
  es: {
    title: (name) => `${name}: una ruta premium con ritmo editorial`,
    excerpt: (name, tone) =>
      `Cómo ${name} convierte ${tone} en una historia limpia y premium, fácil de vender y todavía más fácil de reservar.`,
    category: "Viajes",
    readTime: "5 min de lectura",
    intro: (name, region, season, tone) =>
      `${name} funciona mejor cuando lo piensas como una historia de ${region.toLowerCase()} con ${tone}. La mejor temporada suele estar entre ${season}, lo que mantiene las imágenes fuertes y la logística fácil de explicar.`,
    why: "Por qué funciona",
    rhythm: "Ritmo sugerido",
    visuals: "Notas visuales",
    close: (name) =>
      `Ese balance entre paisaje, ritmo y confort es lo que hace que ${name} se sienta premium y no genérico.`,
    bullets: [
      "Abre con una experiencia firma.",
      "Deja un bloque más lento para descansar o cenar.",
      "Cierra con un traslado pulido o un momento de despedida.",
    ],
    quote: (name) => `La mejor versión de ${name} se siente curada, no saturada.`,
    tags: (name, country, region) => [name, country, region, "Viaje premium"],
  },
  fr: {
    title: (name) => `${name} : une route premium au rythme éditorial`,
    excerpt: (name, tone) =>
      `Comment ${name} transforme ${tone} en une histoire claire et premium, facile à proposer et encore plus simple à réserver.`,
    category: "Voyages",
    readTime: "5 min de lecture",
    intro: (name, region, season, tone) =>
      `${name} fonctionne mieux lorsqu’on le pense comme une histoire de ${region.toLowerCase()} avec ${tone}. La meilleure saison se situe souvent entre ${season}, ce qui garde les visuels forts et la logistique simple à présenter.`,
    why: "Pourquoi ça fonctionne",
    rhythm: "Rythme conseillé",
    visuals: "Repères visuels",
    close: (name) =>
      `Cet équilibre entre paysage, tempo et confort fait de ${name} une expérience premium plutôt que générique.`,
    bullets: [
      "Commencez par une expérience signature.",
      "Gardez un bloc plus lent pour la récupération ou la table.",
      "Terminez par un transfert soigné ou un moment de départ.",
    ],
    quote: (name) => `La meilleure version de ${name} paraît choisie, pas encombrée.`,
    tags: (name, country, region) => [name, country, region, "Voyage premium"],
  },
}

const unsplashIds = [
  "1500375592092-40eb2168fd21",
  "1507525428034-b723cf961d3e",
  "1519046904884-53103b34b206",
  "1506744038136-46273834b3fb",
  "1519608487953-e999c86e7455",
  "1519821172141-b5d8fb9b86b9",
  "1522199710521-72d69614c702",
  "1528127269322-5389ec865e53",
]

function unsplashImage(seed) {
  const id = unsplashIds[seed % unsplashIds.length]
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1920&q=90`
}

function imageSet(seed) {
  return [unsplashImage(seed), unsplashImage(seed + 1), unsplashImage(seed + 2), unsplashImage(seed + 3)]
}

const toneCopy = {
  en: {
    "coastal energy": "coastal energy",
    "ancient heritage": "ancient heritage",
    "urban culture": "urban culture",
    "beach city rhythm": "beach city rhythm",
    "iconic skyline": "an iconic skyline",
    "island calm": "island calm",
    "remote wilderness": "remote wilderness",
    "mountain heritage": "mountain heritage",
    "highland city": "highland city energy",
    "historic coastline": "historic coastline",
    "creative urban energy": "creative urban energy",
    "island clarity": "island clarity",
    "jungle archaeology": "jungle archaeology",
    "cloud forest quiet": "cloud forest quiet",
    "caribbean island hopping": "caribbean island hopping",
    "sailing archipelago": "sailing archipelago",
    "glacial wilderness": "glacial wilderness",
    "desert scale": "desert scale",
    "mirror desert": "mirror desert",
    "city culture": "city culture",
  },
  es: {
    "coastal energy": "energía costera",
    "ancient heritage": "patrimonio antiguo",
    "urban culture": "cultura urbana",
    "beach city rhythm": "ritmo de ciudad de playa",
    "iconic skyline": "un skyline icónico",
    "island calm": "calma isleña",
    "remote wilderness": "naturaleza remota",
    "mountain heritage": "patrimonio de montaña",
    "highland city": "energía de ciudad de altura",
    "historic coastline": "costa histórica",
    "creative urban energy": "energía urbana creativa",
    "island clarity": "claridad isleña",
    "jungle archaeology": "arqueología en la selva",
    "cloud forest quiet": "calma del bosque nuboso",
    "caribbean island hopping": "salto caribeño entre islas",
    "sailing archipelago": "archipiélago de navegación",
    "glacial wilderness": "naturaleza glacial",
    "desert scale": "escala desértica",
    "mirror desert": "desierto espejo",
    "city culture": "cultura urbana",
  },
  fr: {
    "coastal energy": "énergie côtière",
    "ancient heritage": "patrimoine ancien",
    "urban culture": "culture urbaine",
    "beach city rhythm": "rythme ville-plage",
    "iconic skyline": "un skyline iconique",
    "island calm": "calme insulaire",
    "remote wilderness": "nature isolée",
    "mountain heritage": "patrimoine de montagne",
    "highland city": "énergie d’une ville d’altitude",
    "historic coastline": "côte historique",
    "creative urban energy": "énergie urbaine créative",
    "island clarity": "clarté insulaire",
    "jungle archaeology": "archéologie de jungle",
    "cloud forest quiet": "calme de forêt nuageuse",
    "caribbean island hopping": "voyage caribéen d’île en île",
    "sailing archipelago": "archipel à la voile",
    "glacial wilderness": "nature glaciaire",
    "desert scale": "échelle désertique",
    "mirror desert": "désert miroir",
    "city culture": "culture urbaine",
  },
}

const seasonCopy = {
  en: {
    "todo el año": "year-round",
    "noviembre y abril": "November and April",
    "noviembre y febrero": "November and February",
    "marzo y mayo": "March and May",
    "diciembre y marzo": "December and March",
    "mayo y octubre": "May and October",
    "junio y noviembre": "June and November",
    "mayo y septiembre": "May and September",
    "diciembre y abril": "December and April",
    "diciembre y mayo": "December and May",
    "abril y octubre": "April and October",
    "enero y abril": "January and April",
    "marzo y noviembre": "March and November",
  },
  es: {
    "todo el año": "todo el año",
  },
  fr: {
    "todo el año": "toute l’année",
    "noviembre y abril": "novembre et avril",
    "noviembre y febrero": "novembre et février",
    "marzo y mayo": "mars et mai",
    "diciembre y marzo": "décembre et mars",
    "mayo y octubre": "mai et octobre",
    "junio y noviembre": "juin et novembre",
    "mayo y septiembre": "mai et septembre",
    "diciembre y abril": "décembre et avril",
    "diciembre y mayo": "décembre et mai",
    "abril y octubre": "avril et octobre",
    "enero y abril": "janvier et avril",
    "marzo y noviembre": "mars et novembre",
  },
}

const destinations = [
  { slug: "cancun-riviera-maya", name: "Playas de Cancún y Riviera Maya", country: "México", region: "Caribe Mexicano", tone: "coastal energy", season: "noviembre y abril", seed: 0 },
  { slug: "chichen-itza", name: "Chichén Itzá", country: "México", region: "Yucatán", tone: "ancient heritage", season: "noviembre y febrero", seed: 1 },
  { slug: "ciudad-de-mexico", name: "Ciudad de México", country: "México", region: "Centro", tone: "urban culture", season: "marzo y mayo", seed: 2 },
  { slug: "rio-de-janeiro", name: "Playas de Río de Janeiro (Copacabana, Ipanema)", country: "Brasil", region: "Sudeste", tone: "beach city rhythm", season: "diciembre y marzo", seed: 3 },
  { slug: "cristo-redentor", name: "Cristo Redentor", country: "Brasil", region: "Río de Janeiro", tone: "iconic skyline", season: "mayo y octubre", seed: 4 },
  { slug: "florianopolis", name: "Florianópolis, la isla de la magia", country: "Brasil", region: "Santa Catarina", tone: "island calm", season: "diciembre y marzo", seed: 5 },
  { slug: "salto-angel", name: "Salto Ángel (Kerepakupai Merú)", country: "Venezuela", region: "Canaima", tone: "remote wilderness", season: "junio y noviembre", seed: 6 },
  { slug: "machu-picchu", name: "Machu Picchu", country: "Perú", region: "Cusco", tone: "mountain heritage", season: "mayo y septiembre", seed: 7 },
  { slug: "cusco", name: "Cusco, Ciudad Imperial", country: "Perú", region: "Andes peruanos", tone: "highland city", season: "mayo y octubre", seed: 8 },
  { slug: "cartagena", name: "Cartagena de Indias", country: "Colombia", region: "Caribe", tone: "historic coastline", season: "diciembre y abril", seed: 9 },
  { slug: "medellin", name: "Medellín, ciudad de la eterna primavera", country: "Colombia", region: "Antioquia", tone: "creative urban energy", season: "todo el año", seed: 10 },
  { slug: "san-andres", name: "San Andrés y Providencia", country: "Colombia", region: "Caribe insular", tone: "island clarity", season: "diciembre y mayo", seed: 11 },
  { slug: "tikal-guatemala", name: "Tikal, Guatemala", country: "Guatemala", region: "Petén", tone: "jungle archaeology", season: "noviembre y abril", seed: 12 },
  { slug: "monteverde-costa-rica", name: "Monteverde, Costa Rica", country: "Costa Rica", region: "Puntarenas", tone: "cloud forest quiet", season: "diciembre y abril", seed: 13 },
  { slug: "bocas-del-toro", name: "Bocas del Toro, Panamá", country: "Panamá", region: "Bocas del Toro", tone: "caribbean island hopping", season: "diciembre y abril", seed: 14 },
  { slug: "guna-yala", name: "Guna Yala (San Blas)", country: "Panamá", region: "Comarca Guna Yala", tone: "sailing archipelago", season: "diciembre y abril", seed: 15 },
  { slug: "patagonia-argentina", name: "Patagonia Argentina (Bariloche + El Chaltén)", country: "Argentina", region: "Patagonia", tone: "glacial wilderness", season: "octubre y abril", seed: 16 },
  { slug: "desierto-atacama", name: "Desierto de Atacama", country: "Chile", region: "Antofagasta", tone: "desert scale", season: "abril y octubre", seed: 17 },
  { slug: "salar-uyuni", name: "Salar de Uyuni", country: "Bolivia", region: "Potosí", tone: "mirror desert", season: "enero y abril", seed: 18 },
  { slug: "buenos-aires", name: "Buenos Aires, la París del sur", country: "Argentina", region: "Buenos Aires", tone: "city culture", season: "marzo y noviembre", seed: 19 },
]

function buildBody(locale, entry) {
  const copy = themeCopy[locale]
  const images = imageSet(entry.seed)
  const heroAlt = `${entry.name} hero image`
  const galleryAlt = `${entry.name} gallery image`
  const tone = toneCopy[locale][entry.tone] ?? entry.tone
  const season = seasonCopy[locale][entry.season] ?? entry.season

  return `![${heroAlt}](${images[0]})

${copy.intro(entry.name, entry.region, season, tone)}

## ${copy.why}

${locale === "es"
    ? `${entry.name} funciona mejor como una ruta de ${tone}. La región le da identidad suficiente para sentirse específica, mientras el ritmo sigue siendo lo bastante simple como para presentarla como un producto premium.`
    : locale === "fr"
      ? `${entry.name} fonctionne mieux comme une route ${tone}. La région lui donne assez d’identité pour rester spécifique, tandis que le rythme reste assez simple pour se présenter comme un produit premium.`
      : `${entry.name} works best as a ${tone} route. The region gives it enough identity to feel specific, while the pacing stays simple enough to present as a premium product.`}

## ${copy.rhythm}

- ${copy.bullets[0]}
- ${copy.bullets[1]}
- ${copy.bullets[2]}

![${galleryAlt}](${images[1]})

## ${copy.visuals}

${copy.quote(entry.name)}

![${galleryAlt}](${images[2]})

${locale === "es"
    ? "La mejor forma de vender esta ruta es conectar paisaje, confort y una ventana estacional clara. Así la propuesta se mantiene elevada sin sentirse cargada."
    : locale === "fr"
      ? "La meilleure façon de vendre cette route est de relier le paysage, le confort et une fenêtre saisonnière claire. Cela garde la proposition haut de gamme sans alourdir l’itinéraire."
      : "The strongest way to sell this route is to connect scenery, comfort and a clear seasonal window. That keeps the proposal elevated without making the itinerary feel busy."}

![${galleryAlt}](${images[3]})

${copy.close(entry.name)}
`
}

function buildPost(locale, entry, index) {
  const copy = themeCopy[locale]
  const tone = toneCopy[locale][entry.tone] ?? entry.tone
  const title = copy.title(entry.name)
  const excerpt = copy.excerpt(entry.name, tone)
  const date = new Date(Date.UTC(2026, 3, 20 - index)).toISOString().slice(0, 10)
  const tags = copy.tags(entry.name, entry.country, entry.region).map((tag) => tag.replaceAll(",", ""))

  return `---
title: ${title}
excerpt: ${excerpt}
slug: ${entry.slug}
date: ${date}
readTime: ${copy.readTime}
category: ${copy.category}
tags: ${tags.join(", ")}
---

${buildBody(locale, entry)}
`
}

for (const locale of locales) {
  const localeDir = locale === "en" ? BLOG_ROOT : path.join(BLOG_ROOT, locale)
  fs.mkdirSync(localeDir, { recursive: true })

  for (const [index, entry] of destinations.entries()) {
    const post = buildPost(locale, entry, index)
    const filePath = path.join(localeDir, `${entry.slug}.mdx`)
    fs.writeFileSync(filePath, post, "utf8")
  }
}

console.log(`Generated ${destinations.length * locales.length} destination blog posts.`)
