export type Locale = "en" | "fr" | "es"

export const locales: readonly Locale[] = ["en", "fr", "es"] as const

export type NavLink = {
  label: string
  href: string
}

export type PackageCard = {
  badge: string
  title: string
  summary: string
  facts: {
    label: string
    value: string
  }[]
  includes: string[]
  excludes: string[]
  note: string
}

export type ServiceCard = {
  title: string
  summary: string
  deliverables: string[]
}

export type PortfolioCard = {
  title: string
  category: string
  summary: string
  stack: string[]
  outcome: string
}

export type BlogTeaser = {
  slug: string
  title: string
  excerpt: string
  tag: string
}

export type SiteCopy = {
  brand: {
    name: string
    tagline: string
  }
  nav: {
    home: string
    about: string
    packages: string
    portfolio: string
    blog: string
    services: string
    contact: string
    projectCta: string
  }
  hero: {
    eyebrow: string
    title: string
    slogan: string
    description: string
    primaryCta: string
    secondaryCta: string
    highlightOne: string
    highlightTwo: string
  }
  about: {
    eyebrow: string
    title: string
    description: string
    points: string[]
  }
  packages: {
    eyebrow: string
    title: string
    description: string
    cards: PackageCard[]
  }
  services: {
    eyebrow: string
    title: string
    description: string
    cards: ServiceCard[]
  }
  portfolio: {
    eyebrow: string
    title: string
    description: string
    cards: PortfolioCard[]
  }
  blog: {
    eyebrow: string
    title: string
    description: string
    cards: BlogTeaser[]
    cta: string
  }
  contact: {
    eyebrow: string
    title: string
    description: string
    telegrams: string[]
    whatsapp: string
    phone: string
    emails: string[]
    github: string
  }
  footer: {
    note: string
    credit: string
    rights: string
  }
}

const portfolioCardsByLocale: Record<Locale, PortfolioCard[]> = {
  en: [
    {
      title: "Bilingual service website",
      category: "Website",
      summary:
        "A launch-ready website concept for a service business that needs clear positioning across English, French, and Spanish.",
      stack: ["Next.js", "SEO", "Content"],
      outcome: "Best for a site that needs to stay simple, multilingual, and easy to expand.",
    },
    {
      title: "Content-driven service hub",
      category: "Website",
      summary:
        "A modular structure for pages, blog posts, and updates without rebuilding the whole site.",
      stack: ["MDX", "CMS", "SEO"],
      outcome: "Useful when the team needs to publish regularly in more than one language.",
    },
    {
      title: "Selective mobile flow",
      category: "App",
      summary:
        "A mobile concept reserved for projects that truly need app behavior, not the default offer.",
      stack: ["React Native", "UI", "Integrations"],
      outcome: "Kept as a secondary capability when the project scope calls for it.",
    },
  ],
  fr: [
    {
      title: "Site de services bilingue",
      category: "Site web",
      summary:
        "Un concept de site prêt à lancer pour une entreprise de services qui doit être clair en anglais, en français et en espagnol.",
      stack: ["Next.js", "SEO", "Contenu"],
      outcome: "Idéal pour un site simple, multilingue et facile à faire évoluer.",
    },
    {
      title: "Pôle de contenu",
      category: "Site web",
      summary:
        "Une structure modulaire pour les pages, les articles et les mises à jour sans reconstruire tout le site.",
      stack: ["MDX", "CMS", "SEO"],
      outcome: "Utile quand l’équipe doit publier régulièrement dans plusieurs langues.",
    },
    {
      title: "Parcours mobile sélectif",
      category: "App",
      summary:
        "Un concept mobile réservé aux projets qui ont réellement besoin d’un comportement d’application.",
      stack: ["React Native", "UI", "Intégrations"],
      outcome: "Conservé comme capacité secondaire lorsque le projet l’exige.",
    },
  ],
  es: [
    {
      title: "Sitio de servicios bilingüe",
      category: "Sitio web",
      summary:
        "Un concepto de sitio listo para lanzar para un negocio de servicios que necesita posicionarse con claridad en inglés, francés y español.",
      stack: ["Next.js", "SEO", "Contenido"],
      outcome: "Ideal para un sitio simple, multilingüe y fácil de ampliar.",
    },
    {
      title: "Hub de contenido",
      category: "Sitio web",
      summary:
        "Una estructura modular para páginas, artículos y actualizaciones sin reconstruir todo el sitio.",
      stack: ["MDX", "CMS", "SEO"],
      outcome: "Útil cuando el equipo necesita publicar con frecuencia en más de un idioma.",
    },
    {
      title: "Flujo móvil selectivo",
      category: "App",
      summary:
        "Un concepto móvil reservado para proyectos que realmente necesitan comportamiento de app.",
      stack: ["React Native", "UI", "Integraciones"],
      outcome: "Se mantiene como capacidad secundaria cuando el proyecto lo pide.",
    },
  ],
}

const blogCardsByLocale: Record<Locale, BlogTeaser[]> = {
  en: [
    {
      slug: "seo-for-bilingual-websites",
      title: "SEO basics for bilingual websites",
      excerpt: "A short guide to structure, locale pages, and internal links for sites that need to rank in more than one language.",
      tag: "SEO",
    },
    {
      slug: "what-to-publish-on-a-new-service-website",
      title: "What to publish on a new service website",
      excerpt: "A practical checklist for homepage copy, service pages, and contact CTAs when the site is still being built.",
      tag: "Content",
    },
    {
      slug: "using-ai-without-losing-brand-voice",
      title: "Using AI without losing your brand voice",
      excerpt: "AI can help draft and organize content, but clear editing rules keep the tone consistent.",
      tag: "AI",
    },
    {
      slug: "local-visibility-in-mexico-and-canada",
      title: "Local visibility in Mexico and Canada",
      excerpt: "Maps, service pages, and bilingual content can work together when the site is built with local intent.",
      tag: "Local",
    },
  ],
  fr: [
    {
      slug: "seo-de-base-pour-les-sites-bilingues",
      title: "SEO de base pour les sites bilingues",
      excerpt: "Un guide court sur la structure, les pages par langue et les liens internes pour mieux se positionner dans plusieurs langues.",
      tag: "SEO",
    },
    {
      slug: "que-publier-sur-un-nouveau-site-de-services",
      title: "Que publier sur un nouveau site de services",
      excerpt: "Une checklist pratique pour la page d’accueil, les pages services et les CTA de contact pendant la construction du site.",
      tag: "Contenu",
    },
    {
      slug: "utiliser-lia-sans-perdre-la-voix-de-marque",
      title: "Utiliser l’IA sans perdre la voix de marque",
      excerpt: "L’IA peut aider à rédiger et organiser le contenu, mais des règles d’édition claires gardent un ton constant.",
      tag: "IA",
    },
    {
      slug: "visibilite-locale-au-mexique-et-au-canada",
      title: "Visibilité locale au Mexique et au Canada",
      excerpt: "Cartes, pages services et contenu bilingue peuvent fonctionner ensemble quand le site est pensé pour le local.",
      tag: "Local",
    },
  ],
  es: [
    {
      slug: "seo-basico-para-sitios-bilingues",
      title: "SEO básico para sitios bilingües",
      excerpt: "Una guía breve sobre estructura, páginas por idioma y enlaces internos para posicionar en más de un idioma.",
      tag: "SEO",
    },
    {
      slug: "que-publicar-en-un-nuevo-sitio-de-servicios",
      title: "Qué publicar en un nuevo sitio de servicios",
      excerpt: "Una lista práctica para el home, las páginas de servicio y los CTAs de contacto mientras el sitio todavía se construye.",
      tag: "Contenido",
    },
    {
      slug: "usar-ai-sin-perder-la-voz-de-marca",
      title: "Usar AI sin perder la voz de marca",
      excerpt: "AI puede ayudar a redactar y ordenar contenido, pero unas reglas claras de edición mantienen el tono consistente.",
      tag: "AI",
    },
    {
      slug: "visibilidad-local-en-mexico-y-canada",
      title: "Visibilidad local en México y Canadá",
      excerpt: "Mapas, páginas de servicio y contenido bilingüe pueden funcionar juntos cuando el sitio se piensa para lo local.",
      tag: "Local",
    },
  ],
}

export const siteCopy: Record<Locale, SiteCopy> = {
  en: {
    brand: {
      name: "Banff Studio",
      tagline: "Websites first for Mexico and Canada.",
    },
    nav: {
      home: "Home",
      about: "About Us",
      packages: "Packages",
      portfolio: "Portfolio",
      blog: "Blog",
      services: "Services",
      contact: "Contact",
      projectCta: "See services",
    },
    hero: {
      eyebrow: "English · French · Spanish",
      title: "Websites that work in Mexico and Canada.",
      slogan: "We're technology and professional development",
      description:
        "We build bilingual websites with clear UX/UI, multilingual structure, and practical support for SEO, content, and light marketing.",
      primaryCta: "Book a call",
      secondaryCta: "See the work",
      highlightOne: "Bilingual by default",
      highlightTwo: "Built to convert",
    },
    about: {
      eyebrow: "About us",
      title: "A website studio for multilingual teams.",
      description:
        "Banff Studio focuses on websites first: clear UX/UI, bilingual delivery, and support for SEO, content, and light marketing. AI, automation, and Web3 stay available when they add real value.",
      points: [
        "Websites designed for Mexico and Canada.",
        "English, French, and Spanish when the project calls for it.",
        "SEO, content, and practical marketing support.",
        "AI, automation, and Web3 as optional integrations.",
      ],
    },
    packages: {
      eyebrow: "Website packages",
      title: "Website packages, without prices for now.",
      description:
        "Starter and Growth cover the most common website scopes. If your project needs something different, we can quote it separately.",
      cards: [
        {
          badge: "Starter",
          title: "Launch site",
          summary: "A lean website for validating a new idea or creating a simple online presence.",
          facts: [
            { label: "Best for", value: "Validating a website idea." },
            { label: "Pages", value: "1 landing page." },
            { label: "Revisions", value: "2 rounds." },
            { label: "SEO", value: "Not included." },
          ],
          includes: ["Up to 5 images", "2 POCs/CTAs"],
          excludes: ["E-commerce"],
          note: "Best when the goal is to move fast without overbuilding.",
        },
        {
          badge: "Growth",
          title: "Growth site",
          summary: "A fuller website for a real business that needs more pages, stronger structure, and room to scale.",
          facts: [
            { label: "Best for", value: "Growing a real business." },
            { label: "Pages", value: "5 to 10 subpages." },
            { label: "Revisions", value: "3 rounds." },
            { label: "SEO", value: "Basic indexing." },
          ],
          includes: ["Up to 15 images", "2 languages (English, French, or Spanish)", "5 POCs/CTAs", "Professional animations", "Google or Apple Maps"],
          excludes: ["E-commerce"],
          note: "Best when the site needs to support ongoing marketing.",
        },
        {
          badge: "Quote",
          title: "Custom quote",
          summary: "Need another type of website? We can scope it and price it separately.",
          facts: [
            { label: "Best for", value: "Other website types." },
            { label: "Pages", value: "Custom." },
            { label: "Revisions", value: "By request." },
            { label: "SEO", value: "Custom." },
          ],
          includes: ["Discovery call", "Defined scope", "Quote by email or WhatsApp"],
          excludes: ["Fixed pricing", "One-size-fits-all scope"],
          note: "If the project does not fit Starter or Growth, contact us for more info.",
        },
      ],
    },
    services: {
      eyebrow: "Services",
      title: "Website-first services for launch and growth.",
      description:
        "Banff Studio helps teams build websites first, then layer in SEO, content, light marketing, and the occasional app or integration when it genuinely helps the project. If a mobile app is required, it can be quoted separately.",
      cards: [
        {
          title: "Website design",
          summary: "Clear, bilingual websites with a strong information hierarchy and a simple path from idea to launch.",
          deliverables: ["Landing pages", "Business websites", "Campaign pages"],
        },
        {
          title: "SEO and content",
          summary: "On-page SEO, content structure, and bilingual messaging for sites that need to be found and understood.",
          deliverables: ["Keyword mapping", "Metadata", "Content outlines"],
        },
        {
          title: "Site modernization",
          summary: "Refresh older websites with cleaner UX, stronger structure, and better multilingual organization.",
          deliverables: ["UX audit", "Information architecture review", "Visual updates"],
        },
        {
          title: "Mobile apps on request",
          summary: "App concepts and builds only when the scope truly calls for mobile. If needed, they are quoted separately.",
          deliverables: ["UI systems", "Prototypes", "React Native"],
        },
        {
          title: "Advanced integrations",
          summary: "AI, automation, and Web3 integrations when the project benefits from them.",
          deliverables: ["Automation flows", "AI assistants", "Web3 integrations"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Representative project directions, not client case studies.",
      description:
        "A preview of the kinds of websites and digital products Banff Studio can scope, including bilingual sites and selective mobile work when needed.",
      cards: portfolioCardsByLocale.en,
    },
    blog: {
      eyebrow: "Blog",
      title: "Short notes on websites, SEO, and practical marketing.",
      description:
        "A small starter library of articles about bilingual websites, content, AI-assisted workflows, and local visibility.",
      cards: blogCardsByLocale.en,
      cta: "Read the blog",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let us know what you want to build.",
      description:
        "If you need a website, SEO support, content help, or a selective mobile or integration project, these are the fastest ways to reach us.",
      telegrams: ["https://t.me/riaygarcia4", "https://t.me/driano7"],
      whatsapp: "+1 647 223 0271",
      phone: "+1 647 223 0271",
      emails: ["y@criptec.io", "donovan@criptec.io"],
      github: "github.com/driano7",
    },
    footer: {
      note: "Websites first for Mexico and Canada.",
      credit: "Made with 🧡 by Donovan Riaño.",
      rights: "All rights reserved.",
    },
  },
  fr: {
    brand: {
      name: "Banff Studio",
      tagline: "Le web d’abord pour le Mexique et le Canada.",
    },
    nav: {
      home: "Accueil",
      about: "À propos",
      packages: "Forfaits",
      portfolio: "Réalisations",
      blog: "Blog",
      services: "Prestations",
      contact: "Contact",
      projectCta: "Voir les services",
    },
    hero: {
      eyebrow: "Anglais · Français · Espagnol",
      title: "Des sites web qui fonctionnent au Mexique et au Canada.",
      slogan: "Nous sommes technologie et développement professionnel",
      description:
        "Nous créons des sites web bilingues avec une UX/UI claire, une structure multilingue et un soutien concret en SEO, contenu et marketing léger.",
      primaryCta: "Planifier un appel",
      secondaryCta: "Voir les projets",
      highlightOne: "Bilingue dès le départ",
      highlightTwo: "Pensé pour convertir",
    },
    about: {
      eyebrow: "À propos",
      title: "Un studio web pour les équipes multilingues.",
      description:
        "Banff Studio se concentre d’abord sur les sites web: UX/UI claire, livraison bilingue, et appui en SEO, contenu et marketing léger. L’IA, l’automatisation et Web3 restent disponibles quand ils apportent une vraie valeur.",
      points: [
        "Des sites pensés pour le Mexique et le Canada.",
        "Anglais, français et espagnol lorsque le projet le demande.",
        "SEO, contenu et soutien marketing concret.",
        "IA, automatisation et Web3 comme intégrations optionnelles.",
      ],
    },
    packages: {
      eyebrow: "Forfaits web",
      title: "Des forfaits web, sans prix pour le moment.",
      description:
        "Démarrage et Croissance couvrent les besoins web les plus courants. Si votre projet demande autre chose, nous le chiffrons à part.",
      cards: [
        {
          badge: "Démarrage",
          title: "Site de lancement",
          summary: "Un site léger pour tester une idée ou poser une présence en ligne simple.",
          facts: [
            { label: "Idéal pour", value: "Valider une idée de site web." },
            { label: "Pages", value: "1 page d’atterrissage." },
            { label: "Révisions", value: "2 rondes." },
            { label: "SEO", value: "Non inclus." },
          ],
          includes: ["Jusqu’à 5 images", "2 POCs/CTAs"],
          excludes: ["E-commerce"],
          note: "Idéal pour aller vite sans alourdir le projet.",
        },
        {
          badge: "Croissance",
          title: "Site de croissance",
          summary: "Un site plus complet pour accompagner une entreprise qui veut grandir.",
          facts: [
            { label: "Idéal pour", value: "Développer une vraie entreprise." },
            { label: "Pages", value: "5 à 10 sous-pages." },
            { label: "Révisions", value: "3 rondes." },
            { label: "SEO", value: "Indexation de base." },
          ],
          includes: ["Jusqu’à 15 images", "2 langues (anglais, français ou espagnol)", "5 POCs/CTAs", "Animations professionnelles", "Google ou Apple Maps"],
          excludes: ["E-commerce"],
          note: "Idéal pour soutenir un marketing continu.",
        },
        {
          badge: "Devis",
          title: "Devis sur mesure",
          summary: "Vous cherchez un autre type de site web? Nous pouvons le définir et le chiffrer à part.",
          facts: [
            { label: "Idéal pour", value: "Un autre type de site." },
            { label: "Pages", value: "Sur mesure." },
            { label: "Révisions", value: "Sur demande." },
            { label: "SEO", value: "Sur mesure." },
          ],
          includes: ["Appel de découverte", "Périmètre défini", "Devis par email ou WhatsApp"],
          excludes: ["Tarif forfaitaire", "Périmètre identique pour tous"],
          note: "Si le projet sort de Starter ou Growth, contactez-nous pour plus d’infos.",
        },
      ],
    },
    services: {
      eyebrow: "Prestations",
      title: "Des prestations pensées d’abord pour le web.",
      description:
        "Banff Studio aide les équipes à construire des sites web, puis à ajouter du SEO, du contenu, un peu de marketing et, si nécessaire, des apps ou des intégrations. Si une application mobile est nécessaire, elle peut être chiffrée à part.",
      cards: [
        {
          title: "Conception web",
          summary: "Des sites bilingues avec une hiérarchie claire et une trajectoire simple de l’idée au lancement.",
          deliverables: ["Pages d’atterrissage", "Sites d’entreprise", "Pages de campagne"],
        },
        {
          title: "SEO et contenu",
          summary: "SEO on-page, structure de contenu et messages bilingues pour des sites faciles à trouver et à comprendre.",
          deliverables: ["Cartographie de mots-clés", "Métadonnées", "Plans de contenu"],
        },
        {
          title: "Modernisation de site",
          summary: "Refaire d’anciens sites avec une UX plus claire, une structure plus solide et une meilleure organisation multilingue.",
          deliverables: ["Audit UX", "Revue de l’architecture de l’information", "Mises à jour visuelles"],
        },
        {
          title: "Apps mobiles sur demande",
          summary: "Des concepts et des builds d’apps uniquement quand le projet en a vraiment besoin. Si nécessaire, ils sont chiffrés à part.",
          deliverables: ["Systèmes UI", "Prototypes", "React Native"],
        },
        {
          title: "Intégrations avancées",
          summary: "IA, automatisation et Web3 quand le projet en tire une vraie valeur.",
          deliverables: ["Flux d’automatisation", "Assistants IA", "Intégrations Web3"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Des directions de projet représentatives, pas des cas clients.",
      description:
        "Un aperçu des sites web et produits numériques que Banff Studio peut cadrer, y compris des sites bilingues et des apps sélectives quand il le faut.",
      cards: portfolioCardsByLocale.fr,
    },
    blog: {
      eyebrow: "Blog",
      title: "Des notes courtes sur les sites web, le SEO et le marketing utile.",
      description:
        "Une petite base d’articles sur les sites bilingues, le contenu, les workflows assistés par IA et la visibilité locale.",
      cards: blogCardsByLocale.fr,
      cta: "Lire le blog",
    },
    contact: {
      eyebrow: "Contact",
      title: "Dites-nous ce que vous voulez construire.",
      description:
        "Si vous avez un site, une app ou un projet de croissance en tête, voici les moyens les plus rapides pour nous joindre.",
      telegrams: ["https://t.me/riaygarcia4", "https://t.me/driano7"],
      whatsapp: "+1 647 223 0271",
      phone: "+1 647 223 0271",
      emails: ["y@criptec.io", "donovan@criptec.io"],
      github: "github.com/driano7",
    },
    footer: {
      note: "Le web d’abord pour le Mexique et le Canada.",
      credit: "Fait avec 🧡 par Donovan Riaño.",
      rights: "Tous droits réservés.",
    },
  },
  es: {
    brand: {
      name: "Banff Studio",
      tagline: "Sitios web primero para México y Canadá.",
    },
    nav: {
      home: "Inicio",
      about: "Quiénes somos",
      packages: "Paquetes",
      portfolio: "Portafolio",
      blog: "Blog",
      services: "Servicios",
      contact: "Contacto",
      projectCta: "Ver servicios",
    },
    hero: {
      eyebrow: "Inglés · Francés · Español",
      title: "Sitios web que funcionan en México y Canadá.",
      slogan: "Somos tecnología y desarrollo profesional",
      description:
        "Creamos sitios web bilingües con UX/UI clara, estructura multilingüe y apoyo práctico en SEO, contenido y marketing ligero.",
      primaryCta: "Agendar llamada",
      secondaryCta: "Ver proyectos",
      highlightOne: "Bilingüe desde el inicio",
      highlightTwo: "Pensado para convertir",
    },
    about: {
      eyebrow: "Sobre nosotros",
      title: "Un estudio web para equipos multilingües.",
      description:
        "Banff Studio se enfoca primero en sitios web: UX/UI clara, entrega bilingüe y apoyo en SEO, contenido y marketing ligero. AI, automatización y Web3 siguen disponibles cuando aportan valor real.",
      points: [
        "Sitios pensados para México y Canadá.",
        "Inglés, francés y español cuando el proyecto lo pide.",
        "SEO, contenido y apoyo de marketing práctico.",
        "AI, automatización y Web3 como integraciones opcionales.",
      ],
    },
    packages: {
      eyebrow: "Paquetes web",
      title: "Paquetes web sin precios por ahora.",
      description:
        "Inicio y Crecimiento cubren los alcances web más comunes. Si tu proyecto necesita algo distinto, lo cotizamos aparte.",
      cards: [
        {
          badge: "Inicio",
          title: "Sitio de lanzamiento",
          summary: "Un sitio ligero para probar una idea o establecer una presencia en línea simple.",
          facts: [
            { label: "Ideal para", value: "Validar una idea de sitio web." },
            { label: "Páginas", value: "1 landing page." },
            { label: "Revisiones", value: "2 rondas." },
            { label: "SEO", value: "No incluido." },
          ],
          includes: ["Hasta 5 imágenes", "2 POCs/CTAs"],
          excludes: ["E-commerce"],
          note: "Ideal para salir rápido sin complicar el alcance.",
        },
        {
          badge: "Crecimiento",
          title: "Sitio de crecimiento",
          summary: "Un sitio más completo para acompañar a un negocio real que necesita más recorrido.",
          facts: [
            { label: "Ideal para", value: "Hacer crecer un negocio real." },
            { label: "Páginas", value: "5 a 10 subpáginas." },
            { label: "Revisiones", value: "3 rondas." },
            { label: "SEO", value: "Indexación básica." },
          ],
          includes: ["Hasta 15 imágenes", "2 idiomas (inglés, francés o español)", "5 POCs/CTAs", "Animaciones profesionales", "Google o Apple Maps"],
          excludes: ["E-commerce"],
          note: "Ideal cuando el sitio debe apoyar marketing continuo.",
        },
        {
          badge: "Cotización",
          title: "Cotización personalizada",
          summary: "Si buscas otro tipo de sitio web, lo definimos y cotizamos aparte.",
          facts: [
            { label: "Ideal para", value: "Otro tipo de sitio web." },
            { label: "Páginas", value: "Personalizado." },
            { label: "Revisiones", value: "Bajo solicitud." },
            { label: "SEO", value: "Personalizado." },
          ],
          includes: ["Llamada inicial", "Alcance definido", "Cotización por email o WhatsApp"],
          excludes: ["Precio fijo por paquete", "Alcance genérico"],
          note: "Si el proyecto no entra en Inicio o Crecimiento, escríbenos para más info.",
        },
      ],
    },
    services: {
      eyebrow: "Servicios",
      title: "Servicios pensados primero para web.",
      description:
        "Banff Studio ayuda a los equipos a construir sitios web y luego a sumar SEO, contenido, algo de marketing y, cuando hace falta, apps o integraciones. Si se requiere una app móvil, se puede cotizar por separado.",
      cards: [
        {
          title: "Diseño web",
          summary: "Sitios bilingües con jerarquía clara y una ruta simple desde la idea hasta el lanzamiento.",
          deliverables: ["Landing pages", "Sitios corporativos", "Páginas de campaña"],
        },
        {
          title: "SEO y contenido",
          summary: "SEO on-page, estructura de contenido y mensajes bilingües para sitios fáciles de encontrar y de entender.",
          deliverables: ["Mapa de keywords", "Metadatos", "Esquemas de contenido"],
        },
        {
          title: "Modernización de sitios",
          summary: "Renovamos sitios antiguos con mejor UX, estructura más sólida y una organización multilingüe más clara.",
          deliverables: ["Auditoría UX", "Revisión de arquitectura de la información", "Actualizaciones visuales"],
        },
        {
          title: "Apps móviles bajo solicitud",
          summary: "Conceptos y builds de app solo cuando el proyecto realmente lo necesita. Si se requiere, se cotiza por separado.",
          deliverables: ["Sistemas UI", "Prototipos", "React Native"],
        },
        {
          title: "Integraciones avanzadas",
          summary: "AI, automatización y Web3 cuando el proyecto sí se beneficia de ellas.",
          deliverables: ["Flujos de automatización", "Asistentes AI", "Integraciones Web3"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portafolio",
      title: "Direcciones de proyecto representativas, no casos de clientes.",
      description:
        "Una vista previa de los sitios web y productos digitales que Banff Studio puede plantear, incluidos sitios bilingües y apps selectivas cuando hagan falta.",
      cards: portfolioCardsByLocale.es,
    },
    blog: {
      eyebrow: "Blog",
      title: "Notas cortas sobre sitios web, SEO y marketing útil.",
      description:
        "Una base pequeña de artículos sobre sitios bilingües, contenido, flujos asistidos por AI y visibilidad local.",
      cards: blogCardsByLocale.es,
      cta: "Leer blog",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Cuéntanos qué quieres construir.",
      description:
        "Si necesitas un sitio web, apoyo en SEO, ayuda con contenido o un proyecto móvil o de integración más selectivo, estas son las formas más rápidas de contactarnos.",
      telegrams: ["https://t.me/riaygarcia4", "https://t.me/driano7"],
      whatsapp: "+1 647 223 0271",
      phone: "+1 647 223 0271",
      emails: ["y@criptec.io", "donovan@criptec.io"],
      github: "github.com/driano7",
    },
    footer: {
      note: "Sitios web primero para México y Canadá.",
      credit: "Hecho con 🧡 por Donovan Riaño.",
      rights: "Todos los derechos reservados.",
    },
  },
}

export function getSiteCopy(locale: Locale): SiteCopy {
  return siteCopy[locale] ?? siteCopy.en
}
