import { DotBackground } from "@banff/agency-core/components/shared/DotBackground"

type BlogArticleProps = {
  title: string
  excerpt: string
  html: string
}

export function BlogArticle({ title, excerpt, html }: BlogArticleProps) {
  return (
    <article className="relative isolate overflow-hidden px-2 py-10 text-card-foreground sm:px-4 md:px-6 md:py-14">
      <DotBackground
        className="opacity-100 mix-blend-soft-light"
        quantity={140}
        accentRatio={0.28}
        baseColor="125, 112, 100"
        accentColor="10, 110, 110"
        opacity={0.95}
      />
      <div className="relative space-y-5">
        <h1 className="text-center font-serif text-4xl leading-[0.96] tracking-tight text-card-foreground sm:text-5xl md:text-6xl">{title}</h1>
        <p className="mx-auto max-w-3xl text-justify text-base leading-8 text-muted-foreground md:text-lg">{excerpt}</p>

        <div className="blog-content mt-8 space-y-6 text-justify text-base leading-8 text-card-foreground" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </article>
  )
}
