import Image from "next/image"

import { MdxArticle } from "@/components/mdx-article"
import { ScrollReveal } from "@/components/scroll-reveal"
import { renderMdxToHtml, readLocalizedMdx } from "@/lib/mdx"
import type { Locale } from "@/lib/site-content"

import BanffLight from "../BanffClaro.jpeg"
import BanffDark from "../BanffOscuro.jpeg"

const aboutCopy = {
  en: {
    title: "About Us",
    description:
      "We create bilingual websites and mobile products shaped by UX/UI, product thinking, AI, and execution that is compatible with Web3.",
    points: [
      "UX/UI and product-led decisions.",
      "Trilingual sites in English, French, and Spanish based on your needs.",
      "AI-assisted prototyping and development when it improves speed and quality.",
      "Web3 and crypto implementation when the project needs modern integrations.",
    ],
  },
  fr: {
    title: "À propos de nous",
    description:
      "Nous créons des sites web et des produits mobiles bilingues pensés autour de l’UX/UI, du produit, de l’IA et d’une exécution compatible avec Web3.",
    points: [
      "Décisions UX/UI et orientées produit.",
      "Sites trilingues en anglais, français et espagnol selon vos besoins.",
      "Prototypage et développement assistés par IA quand cela améliore la vitesse et la qualité.",
      "Implémentation Web3 et crypto lorsque le projet a besoin d’intégrations modernes.",
    ],
  },
  es: {
    title: "Sobre nosotros",
    description:
      "Creamos sitios web y productos móviles bilingües pensados desde UX/UI, producto, AI y una ejecución compatible con Web3.",
    points: [
      "Decisiones UX/UI y orientadas a producto.",
      "Sitios trilingües en Inglés, Francés y Español de acuerdo a tus necesidades.",
      "Prototipado y desarrollo asistidos por AI cuando mejora la velocidad y la calidad.",
      "Implementación Web3 y cripto cuando el proyecto necesita integraciones modernas.",
    ],
  },
} as const

type AboutPageContentProps = {
  locale: Locale
}

export function AboutPageContent({ locale }: AboutPageContentProps) {
  const copy = aboutCopy[locale]
  const doc = readLocalizedMdx("about", locale) ?? readLocalizedMdx("about", "en")

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <ScrollReveal direction="up" once className="mt-8">
        <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.45)] dark:bg-card/70 lg:grid-cols-[1.1fr_minmax(280px,0.9fr)] lg:p-8">
          <ScrollReveal direction="down" once delay={0.24} className="flex flex-col justify-center text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[color:var(--accent)]">{copy.title}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              {copy.description}
            </p>

            <div className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {copy.points.map((point) => (
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

      {doc ? (
        <ScrollReveal direction="up" once className="mt-8">
          <MdxArticle title={doc.title} excerpt={doc.excerpt} html={renderMdxToHtml(doc.content)} />
        </ScrollReveal>
      ) : null}
    </main>
  )
}
