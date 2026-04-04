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
      "Banff Studio follows the same logic you see in our portfolio: real product design, clear interfaces, and delivery that can work across Mexico and Canada.",
  },
  fr: {
    title: "À propos de nous",
    description:
      "Banff Studio suit la même logique que celle que vous voyez dans notre portfolio: vrai design produit, interfaces claires et une livraison capable de fonctionner entre le Mexique et le Canada.",
  },
  es: {
    title: "Sobre nosotros",
    description:
      "Banff Studio sigue la misma lógica que ves en nuestro portafolio: diseño de producto real, interfaces claras y una entrega que pueda funcionar entre Canadá y México.",
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
        <section className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[color:var(--accent)]">{copy.title}</p>
          <p className="mt-5 text-lg leading-8 text-muted-foreground sm:text-xl">{copy.description}</p>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="up" once className="mt-8">
        <section className="relative flex items-center justify-center">
          <Image src={BanffLight} alt="Banff Studio logo" priority className="block h-auto w-full dark:hidden" />
          <Image src={BanffDark} alt="Banff Studio logo" priority className="hidden h-auto w-full dark:block" />
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
