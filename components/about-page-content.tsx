import Image from "next/image"

import { ScrollReveal } from "@/components/scroll-reveal"
import type { Locale } from "@/lib/site-content"

import BanffLight from "../BanffClaro.jpeg"
import BanffDark from "../BanffOscuro.jpeg"

const aboutCopy = {
  en: {
    title: "About Us",
    description:
      "We create bilingual websites with clear UX/UI, multilingual structure, and practical support for SEO, content, and light marketing.",
    panelDescription:
      "We create bilingual websites and mobile products shaped by UX/UI, product thinking, AI, and execution that is compatible with Web3.",
    points: [
      "Websites designed for Mexico and Canada.",
      "English, French, and Spanish when the project calls for it.",
      "SEO, content, and practical marketing support.",
      "AI, automation, and Web3 as optional integrations.",
    ],
  },
  fr: {
    title: "À propos de nous",
    description:
      "Nous créons des sites web bilingues avec une UX/UI claire, une structure multilingue et un soutien concret en SEO, contenu et marketing léger.",
    panelDescription:
      "Nous créons des sites web et des produits mobiles bilingues pensés autour de l’UX/UI, du produit, de l’IA et d’une exécution compatible avec Web3.",
    points: [
      "Des sites pensés pour le Mexique et le Canada.",
      "Anglais, français et espagnol lorsque le projet le demande.",
      "SEO, contenu et soutien marketing concret.",
      "IA, automatisation et Web3 comme intégrations optionnelles.",
    ],
  },
  es: {
    title: "Sobre nosotros",
    description:
      "Creamos sitios web bilingües con UX/UI clara, estructura multilingüe y apoyo práctico en SEO, contenido y marketing ligero.",
    panelDescription:
      "Creamos sitios web y productos móviles bilingües pensados desde UX/UI, producto, AI y una ejecución compatible con Web3.",
    points: [
      "Sitios pensados para México y Canadá.",
      "Inglés, francés y español cuando el proyecto lo pide.",
      "SEO, contenido y apoyo de marketing práctico.",
      "AI, automatización y Web3 como integraciones opcionales.",
    ],
  },
} as const

const whyMattersCopy = {
  en: {
    title: "Why it matters",
    items: ["Clear message.", "Useful interfaces.", "Fast execution with room to grow."],
    quote:
      "The goal is not to launch something just to look good. The goal is to launch a product that is easy to understand, easy to use, and useful for the business.",
  },
  fr: {
    title: "Pourquoi c’est important",
    items: ["Un message clair.", "Des interfaces utiles.", "Une exécution rapide avec de la place pour évoluer."],
    quote:
      "L’objectif n’est pas de lancer quelque chose juste pour que ce soit joli. L’objectif est de lancer un produit facile à comprendre, facile à utiliser et utile pour l’entreprise.",
  },
  es: {
    title: "Por qué importa",
    items: ["Un mensaje claro.", "Interfaces útiles.", "Ejecución rápida con espacio para crecer."],
    quote:
      "El objetivo no es lanzar algo solo para verse bien. El objetivo es lanzar un producto fácil de entender, fácil de usar y útil para el negocio.",
  },
} as const

type AboutPageContentProps = {
  locale: Locale
}

function AboutIntroSection({ title, description }: Pick<(typeof aboutCopy)["en"], "title" | "description">) {
  return (
    <ScrollReveal direction="up" once>
      <div className="mx-auto max-w-3xl text-center text-black dark:text-white">
        <p className="text-balance font-serif text-3xl leading-[1.02] tracking-tight text-black sm:text-4xl md:text-5xl dark:text-white">
          {title}
        </p>
        <p className="mt-4 text-sm leading-7 text-black/80 md:text-base dark:text-white/80">{description}</p>
      </div>
    </ScrollReveal>
  )
}

function AboutFeaturePanel({
  description,
  points,
}: Pick<(typeof aboutCopy)["en"], "description" | "points">) {
  return (
    <ScrollReveal direction="up" once className="mt-8">
      <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.45)] dark:bg-card/70 lg:grid-cols-[1.1fr_minmax(280px,0.9fr)] lg:p-8">
        <ScrollReveal direction="down" once delay={0.24} className="flex flex-col justify-center text-left">
          <p className="text-sm leading-7 text-card-foreground/90 md:text-base dark:text-card-foreground/85">{description}</p>
          <div className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-background/75 px-4 py-3 text-sm leading-6 text-foreground"
                >
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-[color:var(--accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" once delay={0.36} className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-3xl dark:bg-black/25" />
          <div className="relative w-full p-2 sm:p-4">
            <Image src={BanffLight} alt="Banff Studio logo" priority className="block h-auto w-full dark:hidden" />
            <Image src={BanffDark} alt="Banff Studio logo" priority className="hidden h-auto w-full dark:block" />
          </div>
        </ScrollReveal>
      </section>
    </ScrollReveal>
  )
}

export function AboutPageContent({ locale }: AboutPageContentProps) {
  const copy = aboutCopy[locale]

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <AboutIntroSection title={copy.title} description={copy.description} />
      <AboutFeaturePanel description={copy.panelDescription} points={copy.points} />

      <ScrollReveal direction="up" once className="mt-8">
        <section className="relative isolate overflow-hidden px-2 py-10 text-card-foreground sm:px-4 md:px-6 md:py-14">
          <div className="relative space-y-6">
            <ScrollReveal direction="up" once>
              <h2 className="text-center font-serif text-4xl leading-[0.96] tracking-tight text-card-foreground sm:text-5xl md:text-6xl">
                {whyMattersCopy[locale].title}
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" once delay={0.12}>
              <ol className="mx-auto max-w-3xl space-y-4 text-base text-card-foreground">
                {whyMattersCopy[locale].items.map((item, index) => (
                  <li key={item} className="text-lg text-muted-foreground">
                    {index + 1}. {item}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal direction="up" once delay={0.24}>
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-card/80 p-5 text-sm leading-8 text-muted-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70 md:p-6 md:text-base">
                {whyMattersCopy[locale].quote}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>
    </main>
  )
}
