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
    <ScrollReveal direction="up">
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
    <ScrollReveal direction="up" className="mt-8">
      <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.45)] dark:bg-card/70 lg:grid-cols-[1.1fr_minmax(280px,0.9fr)] lg:p-8">
        <ScrollReveal direction="down" delay={0.24} className="flex flex-col justify-center text-left">
          <p className="text-sm leading-7 text-card-foreground/90 md:text-base dark:text-card-foreground/85">{description}</p>
          <div className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {points.map((point, index) => (
                <ScrollReveal key={point} direction={index % 2 === 0 ? "up" : "down"} delay={0.12 + index * 0.1}>
                  <li
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/75 px-4 py-3 text-sm leading-6 text-foreground"
                  >
                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-[color:var(--accent)]" />
                    <span>{point}</span>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.36} className="relative flex items-center justify-center">
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

function AboutMapsSection({ locale }: { locale: Locale }) {
  return (
    <ScrollReveal direction="up" className="mt-8">
      <section className="space-y-5">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
            {locale === "es" ? "Ubicación" : locale === "fr" ? "Localisation" : "Location"}
          </p>
          <h3 className="mt-3 font-serif text-3xl leading-none tracking-tight text-card-foreground sm:text-4xl">
            {locale === "es" ? "Dónde estamos" : locale === "fr" ? "Où nous trouver" : "Where to find us"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">
            {locale === "es"
              ? "Abrimos Google Maps para que puedas ver la ubicación desde cualquier dispositivo."
              : locale === "fr"
                ? "Nous ouvrons Google Maps pour que vous puissiez voir l’emplacement depuis n’importe quel appareil."
                : "We open Google Maps so you can view the location from any device."}
          </p>
        </div>

        <div className="grid gap-4">
          <details
            open
            className="group rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70 md:p-6"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">G maps</p>
                <h3 className="font-serif text-2xl leading-none tracking-tight text-card-foreground">Torre CN</h3>
              </div>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/40 bg-background/90 text-lg text-muted-foreground shadow-sm transition-transform duration-300 dark:border-white/50 dark:bg-black/40">
                ▾
              </span>
            </summary>
            <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-border/70 bg-background">
              <div className="aspect-[4/3] w-full md:aspect-[16/9]">
                <iframe
                  title="Google Maps - Torre CN"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2887.2690643595633!2d-79.38963172384474!3d43.64257005311824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34d68bf33a9b%3A0x15edd8c4de1c7581!2sTorre%20CN!5e0!3m2!1ses-419!2smx!4v1775340491513!5m2!1ses-419!2smx"
                  className="h-full w-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </details>

        </div>
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

      <ScrollReveal direction="up" className="mt-8">
        <section className="relative isolate overflow-hidden px-2 py-10 text-card-foreground sm:px-4 md:px-6 md:py-14">
          <div className="relative space-y-6">
            <ScrollReveal direction="up">
              <h2 className="text-center font-serif text-4xl leading-[0.96] tracking-tight text-card-foreground sm:text-5xl md:text-6xl">
                {whyMattersCopy[locale].title}
              </h2>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.12}>
              <ol className="mx-auto max-w-3xl space-y-4 text-base text-card-foreground">
                {whyMattersCopy[locale].items.map((item, index) => (
                  <li key={item} className="text-lg text-muted-foreground">
                    {index + 1}. {item}
                  </li>
                ))}
              </ol>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.24}>
              <div className="mx-auto max-w-3xl rounded-[2rem] border border-border/60 bg-card/80 p-5 text-sm leading-8 text-muted-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70 md:p-6 md:text-base">
                {whyMattersCopy[locale].quote}
              </div>
            </ScrollReveal>
          </div>
        </section>
      </ScrollReveal>

      <AboutMapsSection locale={locale} />
    </main>
  )
}
