import Image from "next/image"
import { CheckCircle2 } from "lucide-react"

import { MdxArticle } from "@/components/mdx-article"
import { ScrollReveal } from "@/components/scroll-reveal"
import { renderMdxToHtml, readLocalizedMdx } from "@/lib/mdx"
import type { Locale } from "@/lib/site-content"

import BanffLight from "../BanffClaro.jpeg"
import BanffDark from "../BanffOscuro.jpeg"

const aboutCopy = {
  en: {
    intro: "We create bilingual websites and mobile products shaped by UX/UI, product thinking, AI, and Web3-compatible execution.",
    eyebrow: "What you'll find here",
    description:
      "Banff Studio follows the same logic you see in our portfolio: real product design, clear interfaces, and delivery that can work across Mexico and Canada.",
    points: [
      "UX/UI and product-led decisions.",
      "Trilingual sites in English, French, and Spanish based on your needs.",
      "AI-assisted prototyping and development when it improves speed and quality.",
      "Web3 and crypto implementation when the project needs modern integrations.",
    ],
  },
  fr: {
    intro:
      "Nous créons des sites web et des produits mobiles bilingues pensés à partir de l’UX/UI, du produit, de l’IA et d’une exécution compatible avec Web3.",
    eyebrow: "Ce que vous trouverez ici",
    description:
      "Banff Studio suit la même logique que celle que vous voyez dans notre portfolio: vrai design produit, interfaces claires et une livraison capable de fonctionner entre le Mexique et le Canada.",
    points: [
      "Décisions UX/UI et orientées produit.",
      "Sites trilingues en anglais, français et espagnol selon vos besoins.",
      "Prototypage et développement assistés par IA quand cela améliore la vitesse et la qualité.",
      "Implémentation Web3 et crypto lorsque le projet a besoin d’intégrations modernes.",
    ],
  },
  es: {
    intro:
      "Creamos sitios web y productos móviles bilingües pensados desde UX/UI, producto, AI y una ejecución compatible con Web3.",
    eyebrow: "Qué vas a encontrar aquí",
    description:
      "Banff Studio sigue la misma lógica que ves en nuestro portafolio: diseño de producto real, interfaces claras y una entrega que pueda funcionar entre México y Canadá.",
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
      <ScrollReveal direction="up" once>
        <section className="grid gap-8 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.45)] dark:bg-card/70 lg:grid-cols-[minmax(280px,0.9fr)_1.1fr] lg:p-8">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-3xl dark:bg-black/25" />
            <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/15 bg-white/70 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.20)] backdrop-blur-xl dark:border-white/10 dark:bg-black/40 sm:p-8">
              <Image src={BanffLight} alt="Banff Studio logo" priority className="block h-auto w-full dark:hidden" />
              <Image src={BanffDark} alt="Banff Studio logo" priority className="hidden h-auto w-full dark:block" />
            </div>
          </div>

          <div className="flex flex-col justify-center text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[color:var(--accent)]">
              {copy.eyebrow}
            </p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              {copy.intro}
            </p>
            <h1 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-card-foreground sm:text-4xl md:text-5xl">
              {copy.eyebrow}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              {copy.description}
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-background/75 px-4 py-3 text-sm leading-6 text-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
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
