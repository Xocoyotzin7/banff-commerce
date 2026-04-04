import { ArrowUpRight, CheckCircle2, Mail, XCircle } from "lucide-react"

import { HeadingTypewriter } from "@/components/heading-typewriter"
import { MinimalWhatsappIcon } from "@/components/icons/minimal-whatsapp-icon"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { getSiteCopy, type Locale } from "@/lib/site-content"

const packageSurfaces = [
  "from-accent/20 via-background to-primary/10",
  "from-sky-400/20 via-background to-accent/15",
  "from-emerald-400/20 via-background to-accent/15",
] as const

const packageChipSurfaces = [
  "bg-gradient-to-br from-accent/20 via-background to-primary/12 text-[color:var(--accent)] border-accent/20",
  "bg-gradient-to-br from-sky-400/20 via-background to-accent/10 text-sky-700 border-sky-400/20 dark:text-sky-200",
  "bg-gradient-to-br from-emerald-400/20 via-background to-accent/10 text-emerald-700 border-emerald-400/20 dark:text-emerald-200",
] as const

type PackagesPageContentProps = {
  locale: Locale
}

export function PackagesPageContent({ locale }: PackagesPageContentProps) {
  const copy = getSiteCopy(locale)
  const mainEmail = copy.contact.emails[0]
  const whatsappHref = `https://wa.me/${copy.contact.whatsapp.replace(/[^+\d]/g, "").replace(/^\+/, "")}`
  const visiblePackages = copy.packages.cards.slice(0, 2)

  const contactActions = (
    <div className="flex flex-wrap gap-2 pt-1">
      <Button asChild size="sm" variant="outline" className="rounded-full">
        <a href={`mailto:${mainEmail}`}>
          <Mail className="h-4 w-4" />
          Email
        </a>
      </Button>
      <Button asChild size="sm" className="rounded-full">
        <a href={whatsappHref} target="_blank" rel="noreferrer">
          <MinimalWhatsappIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </Button>
    </div>
  )

  return (
    <main id="packages-scope" className="mx-auto w-full max-w-6xl px-4 pb-12 pt-32 sm:px-6 lg:pt-36">
      <HeadingTypewriter scopeSelector="#packages-scope" />

      <ScrollReveal direction="up" className="mt-2">
        <section className="grid gap-4 rounded-[2rem] border border-border/60 bg-card/80 p-5 text-card-foreground dark:bg-card/70 md:grid-cols-[1.05fr_0.95fr] md:p-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
              {copy.packages.eyebrow}
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-card-foreground md:text-3xl">
              {copy.packages.title}
            </h2>
            <p className="text-sm leading-7 text-muted-foreground md:text-base">{copy.packages.description}</p>
            <div className="flex flex-wrap gap-2">
              {(locale === "es"
                ? ["Inicio", "Crecimiento", "Cotización"]
                : locale === "fr"
                  ? ["Démarrage", "Croissance", "Devis"]
                  : ["Starter", "Growth", "Quote"]
              ).map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${packageChipSurfaces[index % packageChipSurfaces.length]}`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            {(locale === "es"
              ? ["Definimos el alcance", "Ordenamos los entregables", "Cotizamos lo que quede fuera"]
              : locale === "fr"
                ? ["Nous définissons le périmètre", "Nous ordonnons les livrables", "Nous chiffrons le reste"]
                : ["We define the scope", "We organize the deliverables", "We quote what falls outside"]
            ).map((item, index) => (
              <div key={item} className="rounded-2xl border border-border/60 bg-background/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">0{index + 1}</p>
                <p className="mt-1 text-sm font-semibold text-card-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {visiblePackages.map((card, index) => (
            <ScrollReveal key={card.title} direction={index % 2 === 0 ? "up" : "down"} delay={0.02 + index * 0.04}>
            <article
              className={`rounded-[2rem] border border-border/70 bg-card/75 p-3 shadow-[0_10px_35px_-24px_rgba(2,6,23,0.55)] transition ${
                index === 1 ? "md:translate-y-4" : ""
              }`}
            >
              <div
                className={`relative h-full overflow-hidden rounded-[1.4rem] border border-border/70 bg-gradient-to-br p-5 ${
                  packageSurfaces[index % packageSurfaces.length]
                }`}
              >
                  <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/20 blur-xl" />
                  <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
                  <div className="relative space-y-4">
                    <span className="inline-flex rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {card.badge}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{card.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{card.summary}</p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {card.facts.map((fact) => (
                        <div key={`${card.title}-${fact.label}`} className="rounded-2xl border border-border/60 bg-background/70 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground underline decoration-[color:var(--accent)] decoration-2 underline-offset-4">
                            {fact.label}
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-foreground">{fact.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 pt-1">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground underline decoration-[color:var(--accent)] decoration-2 underline-offset-4">
                          {locale === "fr" ? "Inclus" : locale === "es" ? "Incluye" : "Includes"}
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-foreground">
                          {card.includes.map((item) => (
                            <li key={item} className="flex gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="underline decoration-white/30 decoration-2 underline-offset-4">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground underline decoration-[color:var(--accent)] decoration-2 underline-offset-4">
                          {locale === "fr" ? "Non inclus" : locale === "es" ? "No incluye" : "Excludes"}
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-foreground">
                          {card.excludes.map((item) => (
                            <li key={item} className="flex gap-2">
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                              <span className="line-through decoration-white/30 decoration-2">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{card.note}</p>
                    {contactActions}
                  </div>
                </div>
              </article>
            </ScrollReveal>
        ))}
      </section>

      <ScrollReveal direction="up" className="mt-8">
        <section className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-[0_10px_35px_-24px_rgba(2,6,23,0.55)] dark:bg-card/70 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
                {locale === "es" ? "Cotización" : locale === "fr" ? "Devis" : "Quote"}
              </p>
              <h3 className="text-2xl font-semibold tracking-tight text-card-foreground">
                {locale === "es"
                  ? "¿Buscas otro tipo de sitio web?"
                  : locale === "fr"
                    ? "Vous cherchez un autre type de site web?"
                    : "Need another type of website?"}
              </h3>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                {locale === "es"
                  ? "Podemos modernizar tu sitio web a una nueva tecnología o volverlo más intuitivo. Escríbenos por email o WhatsApp y te pasamos más información con el scope adecuado."
                  : locale === "fr"
                    ? "Écrivez-nous par email ou WhatsApp et nous vous enverrons plus d’informations avec le bon scope."
                    : "Write to us by email or WhatsApp and we will send more details with the right scope."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" className="rounded-full">
                <a href={`mailto:${mainEmail}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button asChild className="rounded-full">
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <MinimalWhatsappIcon className="h-4 w-4" />
                  WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </main>
  )
}
