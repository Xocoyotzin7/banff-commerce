import { MdxArticle } from "@/components/mdx-article"
import { HeadingTypewriter } from "@/components/heading-typewriter"
import { ScrollReveal } from "@banff/agency-core/components/shared/ScrollReveal"
import { readLocalizedMdx, renderMdxToHtml } from "@/lib/mdx"
import type { Locale } from "@/lib/site-content"

type LocalizedMdxPageProps = {
  route: "about" | "packages" | "services"
  locale: Locale
}

export function LocalizedMdxPage({ route, locale }: LocalizedMdxPageProps) {
  const doc = readLocalizedMdx(route, locale) ?? readLocalizedMdx(route, "en")

  if (!doc) return null

  const scopeId = `${route}-scope`

  return (
    <main id={scopeId} className="mx-auto w-full max-w-6xl px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <HeadingTypewriter scopeSelector={`#${scopeId}`} />
      <ScrollReveal direction="up">
        <MdxArticle title={doc.title} excerpt={doc.excerpt} html={renderMdxToHtml(doc.content)} />
      </ScrollReveal>
    </main>
  )
}
