import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

import { HeadingTypewriter } from "@/components/heading-typewriter"
import { BlogArticle } from "@/components/blog-article"
import { Seo } from "@banff/agency-core/components/seo/Seo"
import { ScrollReveal } from "@banff/agency-core/components/shared/ScrollReveal"
import { Button } from "@/components/ui/button"
import { getLocaleFromCookies } from "@/lib/locale.server"
import { getBlogPostBySlug, getAllBlogPosts, renderMdxToHtml } from "@/lib/blog"
import { buildArticleJsonLd, buildBreadcrumbList, buildCanonicalUrl, buildPageMetadata } from "@banff/agency-core/seo"

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const locale = await getLocaleFromCookies()
  const post = getBlogPostBySlug(slug, locale)

  if (!post) return {}

  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    pathname: `/blog/${slug}`,
    locale,
    imageAlt: post.title,
    type: "article",
    keywords: [post.category, ...post.tags],
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const locale = await getLocaleFromCookies()
  const post = getBlogPostBySlug(slug, locale)
  const backLabel = locale === "es" ? "Volver al blog" : locale === "fr" ? "Retour au blog" : "Back to blog"
  const breadcrumbHome = locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home"
  const breadcrumbBlog = locale === "es" ? "Blog" : locale === "fr" ? "Blog" : "Blog"

  if (!post) notFound()

  const html = renderMdxToHtml(post.content)
  const ctaClassName = "rounded-full bg-[color:var(--foreground)] px-5 text-sm font-semibold text-white hover:bg-[color:var(--foreground)]/90 dark:text-black"
  const jsonLd = [
    buildBreadcrumbList([
      { name: breadcrumbHome, pathname: "/" },
      { name: breadcrumbBlog, pathname: "/blog" },
      { name: post.title, pathname: `/blog/${post.slug}` },
    ]),
    buildArticleJsonLd({
      headline: post.title,
      description: post.excerpt,
      url: buildCanonicalUrl(`/blog/${post.slug}`),
      datePublished: post.date,
      dateModified: post.date,
      authorName: "Banff Studio",
      articleType: "BlogPosting",
      inLanguage: locale,
    }),
  ]

  return (
    <main id="blog-post-scope" className="mx-auto w-full max-w-4xl px-4 pb-8 pt-28 sm:px-6 lg:pt-32">
      <Seo jsonLd={jsonLd} />
      <HeadingTypewriter scopeSelector="#blog-post-scope" />

      <section className="space-y-8">
        <ScrollReveal direction="up">
          <BlogArticle title={post.title} excerpt={post.excerpt} html={html} />
        </ScrollReveal>

        <div className="space-y-5 text-center">
          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-[color:var(--accent)]">
            <span>{post.category}</span>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className={ctaClassName}>
              <Link href="/blog">
                {backLabel}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
