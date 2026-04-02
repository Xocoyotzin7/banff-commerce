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
  bullets: string[]
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

const sharedPortfolioCards: PortfolioCard[] = [
  {
    title: "Bilingual lead-gen landing",
    category: "Website",
    summary:
      "A conversion-focused landing page for a service business targeting English, French, and Spanish speaking clients.",
    stack: ["Next.js", "SEO", "Analytics"],
    outcome: "Built for fast launches, clear positioning, and measurable lead capture.",
  },
  {
    title: "Mobile booking flow",
    category: "App",
    summary:
      "A mobile app concept for booking, reminders, and customer self-service across Mexico and Canada.",
    stack: ["React Native", "Push", "Payments"],
    outcome: "Designed to reduce friction between discovery, booking, and repeat engagement.",
  },
  {
    title: "Service business CMS",
    category: "Platform",
    summary:
      "A flexible content system for teams that need multilingual pages, blogs, and campaign updates without rebuilding the site.",
    stack: ["Content", "MDX", "CMS"],
    outcome: "Structured for internal teams that want speed without losing consistency.",
  },
]

const sharedBlogCards: BlogTeaser[] = [
  {
    slug: "seo-for-bilingual-websites",
    title: "SEO for bilingual websites: structure that search engines understand",
    excerpt: "Use locale-aware pages, internal links, and intent-driven content to rank across markets without duplicating effort.",
    tag: "SEO",
  },
  {
    slug: "social-content-that-converts",
    title: "Social media content that converts without looking forced",
    excerpt: "Build a repeatable content system with hooks, proof, and offers that match each stage of the customer journey.",
    tag: "Social",
  },
  {
    slug: "marketing-with-ai-without-losing-brand-voice",
    title: "Marketing with AI without losing your brand voice",
    excerpt: "AI can accelerate drafting, but the real value comes from editing, QA, and clear brand rules.",
    tag: "AI",
  },
  {
    slug: "local-seo-for-mexico-and-canada",
    title: "Local SEO for Mexico and Canada: win the nearby search",
    excerpt: "The strongest local campaigns combine maps, reviews, service pages, and fast mobile experiences.",
    tag: "Local SEO",
  },
]

export const siteCopy: Record<Locale, SiteCopy> = {
  en: {
    brand: {
      name: "Banff Studio",
      tagline: "Bilingual web and mobile builds for Mexico and Canada.",
    },
    nav: {
      home: "Home",
      about: "About Us",
      packages: "Packages",
      portfolio: "Portfolio",
      blog: "Blog",
      services: "Services",
      contact: "Contact",
      projectCta: "Our services",
    },
    hero: {
      eyebrow: "English · French · Spanish",
      title: "Websites and mobile apps that can sell in two markets at once.",
      slogan: "We're technology and professional development",
      description:
        "We design, build, and launch bilingual digital products for founders who want product-minded execution, strong UX/UI, AI-assisted delivery, and practical growth across Canada and Mexico.",
      primaryCta: "Book a call",
      secondaryCta: "See the work",
      highlightOne: "Bilingual by default",
      highlightTwo: "Built for conversion",
    },
    about: {
      eyebrow: "About Us",
      title: "A studio shaped by product, design, and technical execution.",
      description:
        "Banff Studio is built from the same mindset behind our portfolio: UX/UI, product strategy, AI-assisted prototyping, Web3, and bilingual delivery for teams that work across Mexico and Canada.",
      points: [
        "English-first structure, with French and Spanish ready for launch.",
        "UX/UI and product decisions that keep the experience clear, fast, and conversion-focused.",
        "AI, Web3, and crypto-aware execution when the project needs modern integrations.",
        "Practical delivery: clean scope, clear timelines, and assets your team can actually maintain.",
      ],
    },
    packages: {
      eyebrow: "Packages",
      title: "Website packages that can be shaped to the project.",
      description:
        "The scope is intentionally flexible for now. These cards establish the level of service and the kind of result each package should aim for.",
      cards: [
        {
          badge: "Starter",
          title: "Launch Site",
          summary: "A focused website for a new business or product that needs a credible presence fast.",
          bullets: [
            "One clear message and one conversion path.",
            "Responsive design with bilingual navigation.",
            "Contact form, WhatsApp or Telegram CTA, and basic analytics.",
          ],
          note: "Best when the goal is to go live quickly and validate demand.",
        },
        {
          badge: "Growth",
          title: "Conversion Site",
          summary: "A broader website for brands that want SEO, content, and stronger lead generation.",
          bullets: [
            "Multi-page structure with service and trust sections.",
            "SEO foundations, blog-ready architecture, and performance work.",
            "Better tracking for leads, events, and campaign attribution.",
          ],
          note: "Best when the site needs to support ongoing marketing.",
        },
        {
          badge: "Scale",
          title: "Web + Mobile Platform",
          summary: "A custom build for companies that need a website plus a mobile experience or internal workflow.",
          bullets: [
            "Custom product logic and integrations.",
            "Mobile-ready flows for clients, staff, or operations.",
            "Roadmap-friendly architecture that can grow over time.",
          ],
          note: "Best when the business needs more than a brochure site.",
        },
      ],
    },
    services: {
      eyebrow: "Services",
      title: "What we do beyond the landing page.",
      description:
        "The studio is built to support full digital execution, from the first mockup to the growth layer that keeps traffic and leads coming in. We can also modernize your app or website and integrate AI or crypto services directly into your site.",
      cards: [
        {
          title: "Web design",
          summary: "Bilingual websites with strong information hierarchy and a polished visual system that can modernize your app or site.",
          deliverables: ["Landing pages", "Corporate sites", "Campaign pages"],
        },
        {
          title: "Mobile app",
          summary: "Product-first app concepts that can handle onboarding, booking, payments, or account flows and modernize older experiences.",
          deliverables: ["UI systems", "Prototypes", "React Native builds"],
        },
        {
          title: "SEO",
          summary: "Technical and content-driven SEO for service businesses, local markets, and bilingual pages.",
          deliverables: ["Keyword structure", "Metadata", "Local SEO"],
        },
        {
          title: "Social media marketing",
          summary: "Repeatable content systems for reels, posts, and campaign hooks that support sales.",
          deliverables: ["Content pillars", "Short-form scripts", "Campaign planning"],
        },
        {
          title: "AI + Crypto integrations",
          summary: "Modernize your app or website with AI workflows, crypto payments, and smart automation where it makes sense.",
          deliverables: ["AI assistants", "Crypto checkout", "Automation"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "A preview of the kinds of projects we can ship.",
      description:
        "This page borrows the project-style layout you asked for and frames it around bilingual web and app work.",
      cards: sharedPortfolioCards,
    },
    blog: {
      eyebrow: "Blog",
      title: "Short articles for marketing teams that want useful answers.",
      description:
        "Four starter posts cover SEO, social, AI marketing, and local visibility. They can be expanded later into a fuller content engine.",
      cards: sharedBlogCards,
      cta: "Read the blog",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let us know what you want to build.",
      description:
        "If you have a website, app, or growth project in mind, these are the fastest ways to reach us.",
      telegrams: ["https://t.me/riaygarcia4", "https://t.me/driano7"],
      whatsapp: "+1 647 223 0271",
      phone: "+1 647 223 0271",
      emails: ["y@criptec.io", "donovan@criptec.io"],
      github: "github.com/driano7",
    },
    footer: {
      note: "Bilingual web and mobile studio for Mexico and Canada.",
      credit: "Made with 🧡 by Donovan Riaño.",
      rights: "All rights reserved.",
    },
  },
  fr: {
    brand: {
      name: "Banff Studio",
      tagline: "Sites web et applications mobiles bilingues pour le Mexique et le Canada.",
    },
    nav: {
      home: "Accueil",
      about: "À propos",
      packages: "Forfaits",
      portfolio: "Portfolio",
      blog: "Blog",
      services: "Services",
      contact: "Contact",
      projectCta: "Nos services",
    },
    hero: {
      eyebrow: "Anglais · Français · Espagnol",
      title: "Des sites et des apps qui peuvent vendre sur deux marchés à la fois.",
      slogan: "Nous sommes technologie et développement professionnel",
      description:
        "Nous concevons, développons et lançons des produits numériques bilingues pour les fondateurs qui recherchent une exécution orientée produit, un UX/UI solide, un développement assisté par IA et une croissance pratique entre le Mexique et le Canada.",
      primaryCta: "Planifier un appel",
      secondaryCta: "Voir les projets",
      highlightOne: "Bilingue dès le départ",
      highlightTwo: "Pensé pour la conversion",
    },
    about: {
      eyebrow: "À propos",
      title: "Un studio façonné par le produit, le design et l’exécution technique.",
      description:
        "Banff Studio est construit à partir de la même logique que notre portfolio: UX/UI, stratégie produit, prototypage assisté par IA, Web3 et livraison bilingue pour les équipes qui travaillent entre le Canada et le Mexique.",
      points: [
        "Structure en anglais d’abord, avec le français et l’espagnol prêts pour le lancement entre le Canada et le Mexique.",
        "Décisions UX/UI et produit pour garder l’expérience claire, rapide et orientée conversion.",
        "Exécution IA, Web3 et crypto quand le projet a besoin d’intégrations modernes.",
        "Livraison pragmatique: périmètre clair, délais clairs, et livrables faciles à maintenir.",
      ],
    },
    packages: {
      eyebrow: "Forfaits",
      title: "Des forfaits web flexibles, encore ajustables.",
      description:
        "Le périmètre reste volontairement ouvert. Ces cartes définissent le niveau de service et le type de résultat attendu.",
      cards: [
        {
          badge: "Démarrage",
          title: "Site de lancement",
          summary: "Un site ciblé pour une marque ou un produit qui doit être lancé rapidement.",
          bullets: [
            "Message unique et parcours de conversion simple.",
            "Design responsive avec navigation bilingue.",
            "Formulaire, CTA WhatsApp ou Telegram, et analytics de base.",
          ],
          note: "Idéal pour sortir en ligne rapidement et tester le marché.",
        },
        {
          badge: "Croissance",
          title: "Site de conversion",
          summary: "Un site plus complet pour les marques qui veulent SEO, contenu et génération de leads.",
          bullets: [
            "Structure multi-pages avec sections services et confiance.",
            "Fondations SEO, architecture compatible blog et performance.",
            "Suivi plus précis des leads et des campagnes.",
          ],
          note: "Idéal pour soutenir un marketing continu.",
        },
        {
          badge: "Échelle",
          title: "Plateforme web + mobile",
          summary: "Une solution sur mesure pour les entreprises qui ont besoin d’un site et d’une expérience mobile.",
          bullets: [
            "Logique produit et intégrations sur mesure.",
            "Flux mobiles pour clients, équipes ou opérations.",
            "Architecture prête à évoluer avec l’entreprise.",
          ],
          note: "Idéal quand le besoin dépasse le simple site vitrine.",
        },
      ],
    },
    services: {
      eyebrow: "Services",
      title: "Ce que nous faisons au-delà de la landing page.",
      description:
        "Le studio accompagne l’exécution complète, du premier mockup à la couche croissance qui alimente le trafic et les leads. Nous pouvons aussi moderniser votre app ou votre site et intégrer des services d’IA ou de crypto directement dans votre site.",
      cards: [
        {
          title: "Web design",
          summary: "Des sites bilingues avec hiérarchie claire et identité visuelle soignée, capables de moderniser votre app ou votre site.",
          deliverables: ["Landing pages", "Sites corporate", "Pages de campagne"],
        },
        {
          title: "Mobile app",
          summary: "Des concepts orientés produit pour onboarding, réservation, paiement ou compte utilisateur, avec une modernisation des parcours anciens.",
          deliverables: ["Systèmes UI", "Prototypes", "Builds React Native"],
        },
        {
          title: "SEO",
          summary: "SEO technique et éditorial pour services, marchés locaux et pages bilingues.",
          deliverables: ["Structure de mots-clés", "Métadonnées", "SEO local"],
        },
        {
          title: "Social media marketing",
          summary: "Des systèmes de contenu répétables pour reels, posts et campagnes qui soutiennent les ventes.",
          deliverables: ["Piliers de contenu", "Scripts courts", "Planification"],
        },
        {
          title: "Intégrations IA + crypto",
          summary: "Moderniser votre app ou votre site avec des workflows IA, des paiements crypto et de l’automatisation utile.",
          deliverables: ["Assistants IA", "Checkout crypto", "Automatisation"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Un aperçu des projets que nous pouvons livrer.",
      description:
        "Cette page reprend la logique des pages projets que vous avez partagées et l’adapte à notre studio bilingue.",
      cards: sharedPortfolioCards,
    },
    blog: {
      eyebrow: "Blog",
      title: "Des articles courts, utiles et actionnables.",
      description:
        "Quatre articles de départ couvrent le SEO, les réseaux sociaux, l’IA en marketing et la visibilité locale.",
      cards: sharedBlogCards,
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
      note: "Studio bilingue web et mobile pour le Canada et le Mexique.",
      credit: "Fait avec 🧡 par Donovan Riaño.",
      rights: "Tous droits réservés.",
    },
  },
  es: {
    brand: {
      name: "Banff Studio",
      tagline: "Sitios web y apps móviles bilingües para Canadá y México.",
    },
    nav: {
      home: "Inicio",
      about: "Quiénes somos",
      packages: "Paquetes",
      portfolio: "Portafolio",
      blog: "Blog",
      services: "Servicios",
      contact: "Contacto",
      projectCta: "Nuestros servicios",
    },
    hero: {
      eyebrow: "Inglés · Francés · Español",
      title: "Sitios y apps que puedan vender en dos mercados al mismo tiempo.",
      slogan: "Somos tecnología y desarrollo profesional",
      description:
        "Diseñamos, desarrollamos y lanzamos productos digitales bilingües para fundadores que buscan ejecución orientada a producto, UX/UI sólida, delivery asistido por AI y crecimiento práctico entre México y Canadá.",
      primaryCta: "Agendar llamada",
      secondaryCta: "Ver proyectos",
      highlightOne: "Bilingüe desde el inicio",
      highlightTwo: "Pensado para convertir",
    },
    about: {
      eyebrow: "About Us",
      title: "Un estudio moldeado por producto, diseño y ejecución técnica.",
      description:
        "Banff Studio nace de la misma lógica que ves en mi portafolio: UX/UI, estrategia de producto, prototipado con AI, Web3 y entrega bilingüe para equipos que operan entre Canadá y México.",
      points: [
        "Estructura en inglés primero, con francés y español listos para salir entre Canadá y México.",
        "Decisiones de UX/UI y producto para mantener la experiencia clara, rápida y enfocada en conversión.",
        "Ejecución con AI, Web3 y cripto cuando el proyecto necesita integraciones modernas.",
        "Entrega práctica: scope claro, tiempos claros y archivos que tu equipo sí pueda mantener.",
      ],
    },
    packages: {
      eyebrow: "Packages",
      title: "Paquetes web que todavía podemos ajustar al proyecto.",
      description:
        "El alcance todavía es flexible. Estas cards marcan el nivel de servicio y el tipo de resultado que debe buscar cada paquete.",
      cards: [
        {
          badge: "Starter",
          title: "Launch Site",
          summary: "Un sitio puntual para una marca o producto que necesita presencia rápida y sólida.",
          bullets: [
            "Un mensaje principal y una ruta clara de conversión.",
            "Diseño responsive con navegación bilingüe.",
            "Formulario, CTA a WhatsApp o Telegram y analytics básicos.",
          ],
          note: "Ideal para salir rápido y validar demanda.",
        },
        {
          badge: "Growth",
          title: "Conversion Site",
          summary: "Un sitio más amplio para marcas que quieren SEO, contenido y generación de leads.",
          bullets: [
            "Estructura multi-página con secciones de servicio y confianza.",
            "Bases SEO, arquitectura lista para blog y optimización de performance.",
            "Mejor tracking de leads, eventos y campañas.",
          ],
          note: "Ideal cuando el sitio debe apoyar marketing continuo.",
        },
        {
          badge: "Scale",
          title: "Web + Mobile Platform",
          summary: "Un build a la medida para negocios que necesitan sitio, app móvil o flujo interno.",
          bullets: [
            "Lógica de producto e integraciones personalizadas.",
            "Flujos mobile para clientes, staff u operación.",
            "Arquitectura lista para crecer con el negocio.",
          ],
          note: "Ideal cuando el proyecto es más que una landing.",
        },
      ],
    },
    services: {
      eyebrow: "Services",
      title: "Lo que hacemos más allá de la landing page.",
      description:
        "El estudio está pensado para cubrir toda la ejecución digital: desde el primer mockup hasta la capa de crecimiento que mantiene tráfico y leads entrando. También podemos modernizar tu app o sitio e integrar servicios de AI o cripto directamente en tu sitio.",
      cards: [
        {
          title: "Web design",
          summary: "Sitios bilingües con jerarquía clara de información y una identidad visual pulida para modernizar tu app o sitio.",
          deliverables: ["Landing pages", "Sitios corporativos", "Páginas de campaña"],
        },
        {
          title: "Mobile app",
          summary: "Conceptos de producto para onboarding, booking, pagos o flujo de cuenta, con modernización de experiencias antiguas.",
          deliverables: ["Sistemas UI", "Prototipos", "Builds en React Native"],
        },
        {
          title: "SEO",
          summary: "SEO técnico y de contenido para servicios, mercados locales y páginas bilingües.",
          deliverables: ["Estructura de keywords", "Metadata", "SEO local"],
        },
        {
          title: "Social media marketing",
          summary: "Sistemas de contenido repetibles para reels, posts y campañas que apoyen ventas.",
          deliverables: ["Pilares de contenido", "Guiones cortos", "Planeación de campañas"],
        },
        {
          title: "Integraciones AI + cripto",
          summary: "Moderniza tu app o sitio con workflows de AI, pagos cripto y automatización útil.",
          deliverables: ["Asistentes AI", "Checkout cripto", "Automatización"],
        },
      ],
    },
    portfolio: {
      eyebrow: "Portfolio",
      title: "Una vista previa del tipo de proyectos que podemos lanzar.",
      description:
        "Esta página toma la lógica visual de una página de proyectos y la adapta a trabajo web y mobile bilingüe.",
      cards: sharedPortfolioCards,
    },
    blog: {
      eyebrow: "Blog",
      title: "Cuatro artículos iniciales para marketing que sí ayuda.",
      description:
        "SEO, redes, IA y visibilidad local: una base corta para después convertirla en un motor de contenido más grande.",
      cards: sharedBlogCards,
      cta: "Leer blog",
    },
    contact: {
      eyebrow: "Contacto",
      title: "Cuéntanos qué quieres construir.",
      description:
        "Si tienes en mente un sitio, una app o un proyecto de crecimiento, estas son las formas más rápidas de contactarnos.",
      telegrams: ["https://t.me/riaygarcia4", "https://t.me/driano7"],
      whatsapp: "+1 647 223 0271",
      phone: "+1 647 223 0271",
      emails: ["y@criptec.io", "donovan@criptec.io"],
      github: "github.com/driano7",
    },
    footer: {
      note: "Estudio bilingüe de web y mobile para Canadá y México.",
      credit: "Hecho con 🧡 por Donovan Riaño.",
      rights: "Todos los derechos reservados.",
    },
  },
}

export function getSiteCopy(locale: Locale): SiteCopy {
  return siteCopy[locale] ?? siteCopy.en
}
