import Link from "next/link"
import { notFound } from "next/navigation"

import { Seo } from "@banff/agency-core/components/seo/Seo"
import { Button } from "@/components/ui/button"
import { buildBreadcrumbList, buildCanonicalUrl, buildPageMetadata, buildServiceJsonLd, seoConfig } from "@banff/agency-core/seo"
import { getServicePageExample, servicePageExamples } from "@banff/agency-core/seo/example-pages"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return Object.keys(servicePageExamples).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const page = getServicePageExample(slug)

  if (!page) return {}

  return buildPageMetadata({
    title: page.title,
    description: page.description,
    pathname: `/servicios/${slug}`,
    locale: "es",
    keywords: [page.serviceType, "servicios", "seo", "website"],
  })
}

export default async function ServiceExamplePage({ params }: PageProps) {
  const { slug } = await params
  const page = getServicePageExample(slug)

  if (!page) notFound()

  const canonicalUrl = buildCanonicalUrl(`/servicios/${slug}`, seoConfig.siteUrl)

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-28 sm:px-6 lg:pt-32">
      <Seo
        jsonLd={[
          buildBreadcrumbList(
            [
              { name: "Inicio", pathname: "/" },
              { name: "Servicios", pathname: "/servicios" },
              { name: page.title, pathname: `/servicios/${slug}` },
            ],
            seoConfig.siteUrl,
          ),
          buildServiceJsonLd({
            siteUrl: seoConfig.siteUrl,
            name: page.title,
            description: page.description,
            url: canonicalUrl,
            serviceType: page.serviceType,
            areaServed: page.areaServed,
            organizationId: `${seoConfig.brand.brandUrl}#organization`,
          }),
        ]}
      />

      <section className="space-y-6 rounded-[2rem] border border-border/70 bg-card/80 p-6 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">Service</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{page.title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">{page.description}</p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium">{page.serviceType}</span>
          <span className="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium">{page.areaServed}</span>
        </div>
        <p className="text-sm leading-7 text-foreground/90">{page.body}</p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {page.summaryPoints.map((point) => (
            <li key={point} className="rounded-2xl border border-border/60 bg-background/75 p-4 text-sm leading-6">
              {point}
            </li>
          ))}
        </ul>
        <div>
          <Button asChild className="rounded-full">
            <Link href="/#contact">Contact</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
