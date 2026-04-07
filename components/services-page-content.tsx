import { HeadingTypewriter } from "@/components/heading-typewriter"
import { ScrollReveal } from "@banff/agency-core/components/shared/ScrollReveal"
import { MdxArticle } from "@/components/mdx-article"
import { ServicesPhoneShowcase } from "@/components/services-phone-showcase"
import { readLocalizedMdx, renderMdxToHtml } from "@/lib/mdx"
import { getSiteCopy, type Locale } from "@/lib/site-content"

const serviceContextSurfaces = [
  "from-accent/20 via-background to-primary/10",
  "from-sky-400/20 via-background to-accent/15",
  "from-emerald-400/20 via-background to-accent/15",
] as const

const serviceContextChipSurfaces = [
  "bg-gradient-to-br from-accent/20 via-background to-primary/12 text-[color:var(--accent)] border-accent/20",
  "bg-gradient-to-br from-sky-400/20 via-background to-accent/10 text-sky-700 border-sky-400/20 dark:text-sky-200",
  "bg-gradient-to-br from-emerald-400/20 via-background to-accent/10 text-emerald-700 border-emerald-400/20 dark:text-emerald-200",
  "bg-gradient-to-br from-accent/20 via-background to-primary/12 text-[color:var(--accent)] border-accent/20",
] as const

type ServicesPageContentProps = {
  locale: Locale
}

export function ServicesPageContent({ locale }: ServicesPageContentProps) {
  const copy = getSiteCopy(locale)
  const doc = readLocalizedMdx("services", locale) ?? readLocalizedMdx("services", "en")
  const mobileContextCards = copy.services.cards.slice(0, 4)
  const desktopContextCards = copy.services.cards.slice(0, 4)

  if (!doc) return null

  return (
    <main id="services-scope" className="mx-auto w-full max-w-6xl px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <HeadingTypewriter scopeSelector="#services-scope" />

      <ScrollReveal direction="up">
        <MdxArticle title={doc.title} excerpt={doc.excerpt} html={renderMdxToHtml(doc.content, { centerParagraphs: true })} />
      </ScrollReveal>

      <div className="mt-14 md:mt-16">
        <ServicesPhoneShowcase locale={locale} cards={copy.services.cards} />
      </div>

      <section className="mt-10 grid gap-5 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground dark:bg-card/70 md:grid-cols-[1.05fr_0.95fr] md:p-6">
        <ScrollReveal direction="up" className="space-y-4 md:flex md:h-full md:flex-col md:justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
            {locale === "es" ? "Más contexto" : locale === "fr" ? "Plus de contexte" : "More context"}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
            {locale === "es"
              ? "No son solo cards: son sistemas que modernizan tu producto."
              : locale === "fr"
                ? "Ce ne sont pas seulement des cartes: ce sont des systèmes qui modernisent votre produit."
                : "These are not just cards: they are systems that modernize your product."}
          </h2>
          <p className="text-sm leading-7 text-muted-foreground md:text-base">
            {locale === "es"
              ? "Podemos rediseñar una app existente, rehacer un sitio web viejo, añadir automatización con AI y conectar pagos o experiencias cripto donde realmente aporten valor. El objetivo es que tu presencia digital se vea moderna, funcione mejor y convierta más."
              : locale === "fr"
                ? "Nous pouvons refondre une app existante, moderniser un vieux site web, ajouter de l’automatisation IA et connecter des paiements ou expériences crypto là où cela apporte réellement de la valeur. L’objectif est d’avoir une présence digitale moderne, plus efficace et plus performante."
                : "We can redesign an existing app, rebuild an old website, add AI automation, and connect crypto payments or experiences where they actually make sense. The goal is to make your digital presence feel modern, work better, and convert more."}
          </p>
          <div className="flex flex-wrap gap-2">
            {(locale === "es"
              ? ["Modernización de sitios", "Apps más rápidas", "AI integrada", "Cripto donde aporte"]
              : locale === "fr"
                ? ["Modernisation de sites", "Apps plus rapides", "IA intégrée", "Crypto utile"]
                : ["Website modernization", "Faster apps", "AI integrated", "Crypto where useful"]
            ).map((item, index) => (
              <span
                key={item}
                className={`rounded-full border px-3 py-1 text-xs font-medium shadow-[0_10px_25px_-18px_rgba(2,6,23,0.25)] ${serviceContextChipSurfaces[index % serviceContextChipSurfaces.length]}`}
              >
                {item}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.16} className="space-y-3">
          <div className="grid gap-3 md:hidden">
            {mobileContextCards.map((card, index) => {
              const cardIndex = index + 1
              const isEven = cardIndex % 2 === 0
              const direction = isEven ? "up" : "down"
              const delay = 0.18 + index * 0.14
              return (
                <ScrollReveal key={card.title} direction={direction} delay={delay}>
                  <article
                    className="rounded-[2rem] border border-border/70 bg-card/75 p-3 shadow-[0_10px_35px_-24px_rgba(2,6,23,0.55)] transition"
                  >
                    <div className={`relative h-full overflow-hidden rounded-[1.4rem] border border-border/70 bg-gradient-to-br p-4 text-center ${serviceContextSurfaces[cardIndex % serviceContextSurfaces.length]}`}>
                      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/20 blur-xl" />
                      <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
                      <div className="relative space-y-2">
                        <span className="inline-flex rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {String(cardIndex).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{card.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{card.summary}</p>
                        <ul className="mx-auto max-w-xs space-y-2 pt-1 text-center text-xs leading-relaxed text-foreground">
                          {card.deliverables.map((deliverable) => (
                            <li key={deliverable} className="flex items-center justify-center gap-2 text-center">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              )
            })}
          </div>

          <div className="hidden md:grid gap-3 md:grid-cols-2">
            {desktopContextCards.map((card, index) => {
              const cardIndex = index + 1
              const isEven = cardIndex % 2 === 0
              const direction = isEven ? "up" : "down"
              const delay = 0.18 + index * 0.14
              return (
                <ScrollReveal key={card.title} direction={direction} delay={delay}>
                  <article
                    className={`rounded-[2rem] border border-border/70 bg-card/75 p-3 shadow-[0_10px_35px_-24px_rgba(2,6,23,0.55)] transition ${
                      index % 2 === 1 ? "md:translate-y-2" : ""
                    }`}
                  >
                    <div
                      className={`relative h-full overflow-hidden rounded-[1.4rem] border border-border/70 bg-gradient-to-br p-4 text-center ${serviceContextSurfaces[index % serviceContextSurfaces.length]}`}
                    >
                      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/20 blur-xl" />
                      <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
                      <div className="relative space-y-2">
                        <span className="inline-flex rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{card.title}</h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">{card.summary}</p>
                        <ul className="mx-auto max-w-xs space-y-2 pt-1 text-center text-xs leading-relaxed text-foreground">
                          {card.deliverables.map((deliverable) => (
                            <li key={deliverable} className="flex items-center justify-center gap-2 text-center">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                              <span>{deliverable}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </ScrollReveal>
              )
            })}
          </div>
        </ScrollReveal>
        </section>
    </main>
  )
}
