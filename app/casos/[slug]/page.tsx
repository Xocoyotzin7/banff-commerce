import Link from "next/link"
import { notFound } from "next/navigation"

import { Seo } from "@/components/seo/Seo"
import { Button } from "@/components/ui/button"
import { buildArticleJsonLd, buildBreadcrumbList, buildCanonicalUrl, buildPageMetadata, seoConfig } from "@/lib/seo"
import { casePageExamples, getCasePageExample } from "@/lib/seo/example-pages"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return Object.keys(casePageExamples).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const page = getCasePageExample(slug)

  if (!page) return {}

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    pathname: `/casos/${slug}`,
    locale: "es",
    type: "article",
    keywords: [page.title, "casos", "seo", "website"],
  })
}

export default async function CaseExamplePage({ params }: PageProps) {
  const { slug } = await params
  const page = getCasePageExample(slug)

  if (!page) notFound()

  const canonicalUrl = buildCanonicalUrl(`/casos/${slug}`, seoConfig.siteUrl)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <Seo
        jsonLd={[
          buildBreadcrumbList(
            [
              { name: "Inicio", pathname: "/" },
              { name: "Casos", pathname: "/casos" },
              { name: page.title, pathname: `/casos/${slug}` },
            ],
            seoConfig.siteUrl,
          ),
          buildArticleJsonLd({
            headline: page.title,
            description: page.description,
            url: canonicalUrl,
            datePublished: page.datePublished,
            dateModified: page.datePublished,
            authorName: seoConfig.brand.brandName,
            articleType: "Article",
            inLanguage: "es",
          }),
        ]}
      />

      <section className="space-y-6 rounded-[2rem] border border-border/70 bg-card/80 p-6 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">Case study</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{page.description}</p>
        <p className="text-sm leading-7 text-foreground/90">{page.body}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {page.highlights.map((item) => (
            <div key={item} className="rounded-2xl border border-border/60 bg-background/75 p-4 text-sm leading-6">
              {item}
            </div>
          ))}
        </div>
        <div>
          <Button asChild className="rounded-full">
            <Link href="/portfolio">Portfolio</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}

