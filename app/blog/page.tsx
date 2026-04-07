import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

import { HeadingTypewriter } from "@/components/heading-typewriter"
import { BlogArticle } from "@/components/blog-article"
import { ScrollReveal } from "@/components/scroll-reveal"
import { Button } from "@/components/ui/button"
import { getLocaleFromCookies } from "@/lib/locale"
import { renderMdxToHtml } from "@/lib/blog"
import { readLocalizedMdx } from "@/lib/mdx"
import { buildPageMetadata } from "@/lib/seo"
import { getSiteCopy } from "@/lib/site-content"

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
    </main>
  )
}
