import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

import { HeadingTypewriter } from "@/components/heading-typewriter"
import { BlogArticle } from "@/components/blog-article"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { getLocaleFromCookies } from "@/lib/locale"
import { getAllBlogPosts, getBlogPostBySlug, renderMdxToHtml } from "@/lib/blog"
import { readLocalizedMdx } from "@/lib/mdx"
import { buildPageMetadata } from "@/lib/seo"
import { getSiteCopy } from "@/lib/site-content"
import { destinations } from "../../src/lib/data/destinations"

const blogSurfaces = [
  "from-accent/20 via-background to-primary/10",
  "from-sky-400/20 via-background to-accent/15",
  "from-emerald-400/20 via-background to-accent/15",
] as const

export async function generateMetadata() {
  const locale = await getLocaleFromCookies()
  const copy = getSiteCopy(locale)
  const doc = readLocalizedMdx("blog", locale) ?? readLocalizedMdx("blog", "en")

  return buildPageMetadata({
    title: doc?.title ?? copy.blog.title,
    description: doc?.excerpt ?? copy.blog.description,
    pathname: "/blog",
    locale,
    keywords: [copy.blog.title, "blog", "seo", "web design"],
  })
}

export default async function BlogPage() {
  const locale = await getLocaleFromCookies()
  const copy = getSiteCopy(locale)
  const doc = readLocalizedMdx("blog", locale) ?? readLocalizedMdx("blog", "en")
  const posts = copy.blog.cards
  const destinationPosts = getAllBlogPosts()

  if (!doc) return null

  return (
    <main id="blog-scope" className="mx-auto w-full max-w-6xl px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <HeadingTypewriter scopeSelector="#blog-scope" />

      <ScrollReveal direction="up">
        <BlogArticle title={doc.title} excerpt={doc.excerpt} html={renderMdxToHtml(doc.content)} />
      </ScrollReveal>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {posts.map((post, index) => (
          <ScrollReveal key={post.slug} direction={index % 2 === 0 ? "up" : "down"} delay={0.08 + index * 0.08}>
            <article className="rounded-[2rem] border border-border/70 bg-card/75 p-3 shadow-[0_10px_35px_-24px_rgba(2,6,23,0.55)] transition">
              <div className={`relative h-full overflow-hidden rounded-[1.4rem] border border-border/70 bg-gradient-to-br p-5 ${blogSurfaces[index % blogSurfaces.length]}`}>
                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-accent/20 blur-xl" />
                <div className="absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
                <div className="relative space-y-3">
                  <span className="inline-flex rounded-full border border-border/70 bg-background/75 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                    {post.tag}
                  </span>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{post.title}</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 pt-2 text-sm font-semibold text-[color:var(--accent)] hover:underline"
                  >
                    {locale === "es" ? "Leer artículo" : locale === "fr" ? "Lire l’article" : "Read article"}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </section>

      <div className="mt-6 flex justify-start">
        <Button asChild variant="outline" className="rounded-full border-border/60 bg-card/80 px-5 text-sm font-semibold text-card-foreground hover:bg-card dark:bg-card/70">
          <Link href="/#contact">Contact</Link>
        </Button>
      </div>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-muted-foreground">
              {locale === "es" ? "Historias de destinos" : locale === "fr" ? "Histoires de destinations" : "Destination stories"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {locale === "es" ? "Un blog por cada destino destacado" : locale === "fr" ? "Un article pour chaque destination phare" : "One article for every featured destination"}
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {destinationPosts.map((post, index) => {
            const localized = getBlogPostBySlug(post.slug, locale) ?? post
            const destination = destinations.find((item) => item.slug === post.slug)
            if (!destination) return null

            return (
              <ScrollReveal key={post.slug} direction={index % 2 === 0 ? "up" : "down"} delay={0.04 + index * 0.03}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group relative block overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="relative min-h-[22rem]">
                    <Image
                      src={destination.heroImage}
                      alt={localized.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(6,13,13,0.92)_0%,rgba(6,13,13,0.2)_55%,rgba(6,13,13,0.02)_100%)]" />
                    <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/80 backdrop-blur">
                      {destination.country}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                      <p className="text-[10px] uppercase tracking-[0.34em] text-white/60">{destination.region}</p>
                      <h3 className="mt-2 font-display text-2xl leading-[0.96]">{localized.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-white/76">{localized.excerpt}</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--secondary)]">
                        {locale === "es" ? "Leer historia" : locale === "fr" ? "Lire l’histoire" : "Read story"}
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            )
          })}
        </div>
      </section>
    </main>
  )
}
