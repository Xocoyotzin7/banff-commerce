import fs from "node:fs"
import path from "node:path"

export type MdxDocument = {
  title: string
  excerpt: string
  content: string
}

export type MdxFrontmatter = {
  title?: string
  excerpt?: string
  slug?: string
  date?: string
  readTime?: string
  category?: string
  tags?: string[]
}

export function parseFrontmatter(raw: string): { meta: MdxFrontmatter; body: string } {
  const trimmed = raw.trim()
  if (!trimmed.startsWith("---")) {
    return { meta: {}, body: trimmed }
  }

  const end = trimmed.indexOf("\n---", 3)
  if (end === -1) {
    return { meta: {}, body: trimmed }
  }

  const frontmatter = trimmed.slice(3, end).trim()
  const body = trimmed.slice(end + 4).trim()
  const meta: MdxFrontmatter = { tags: [] }

  for (const line of frontmatter.split("\n")) {
    const colonIndex = line.indexOf(":")
    if (colonIndex === -1) continue
    const key = line.slice(0, colonIndex).trim()
    const value = line.slice(colonIndex + 1).trim()

    if (key === "tags") {
      meta.tags = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
      continue
    }

    if (key in meta || ["title", "excerpt", "slug", "date", "readTime", "category"].includes(key)) {
      ;(meta as Record<string, string | string[]>)[key] = value
    }
  }

  return { meta, body }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function renderInline(source: string) {
  const escaped = escapeHtml(source)
  return escaped
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="underline decoration-[color:var(--accent)]/60 underline-offset-4 hover:text-[color:var(--accent)]" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, '<code class="rounded bg-black/5 px-1.5 py-0.5 text-[0.92em] font-medium text-foreground">$1</code>')
}

function renderImageBlock(alt: string, src: string) {
  return `
    <figure class="my-10 overflow-hidden rounded-[2rem] border border-border/70 bg-card/70 shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <img src="${src}" alt="${escapeHtml(alt)}" class="h-auto w-full object-cover" loading="lazy" />
      <figcaption class="px-5 py-4 text-sm leading-6 text-muted-foreground">${escapeHtml(alt)}</figcaption>
    </figure>
  `.trim()
}

export function renderMdxToHtml(
  source: string,
  options?: {
    centerParagraphs?: boolean
  },
) {
  const lines = source.replace(/\r\n/g, "\n").split("\n")
  const html: string[] = []
  let index = 0
  const paragraphClass = options?.centerParagraphs
    ? "mx-auto max-w-3xl text-center leading-7 text-muted-foreground"
    : "leading-7 text-muted-foreground"

  const flushParagraph = (buffer: string[]) => {
    if (buffer.length === 0) return
    html.push(`<p class="${paragraphClass}">${renderInline(buffer.join(" ").trim())}</p>`)
    buffer.length = 0
  }

  while (index < lines.length) {
    const line = lines[index].trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith("### ")) {
      html.push(`<h3 class="mt-8 text-2xl font-semibold tracking-tight text-foreground">${renderInline(trimmed.slice(4))}</h3>`)
      index += 1
      continue
    }

    if (trimmed.startsWith("## ")) {
      html.push(`<h2 class="mt-10 text-center text-3xl font-semibold tracking-tight text-foreground">${renderInline(trimmed.slice(3))}</h2>`)
      index += 1
      continue
    }

    if (trimmed.startsWith("# ")) {
      html.push(`<h1 class="mt-10 text-4xl font-semibold tracking-tight text-foreground">${renderInline(trimmed.slice(2))}</h1>`)
      index += 1
      continue
    }

    if (trimmed.startsWith("> ")) {
      const quote: string[] = []
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quote.push(lines[index].trim().replace(/^>\s?/, ""))
        index += 1
      }
      html.push(
        `<blockquote class="rounded-3xl border border-black/10 bg-white/70 px-5 py-4 text-sm leading-7 text-foreground shadow-sm dark:border-white/10 dark:bg-black/55 dark:text-white/78"><p>${renderInline(
          quote.join(" "),
        )}</p></blockquote>`,
      )
      continue
    }

    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.+?)\)$/)
    if (imageMatch) {
      html.push(renderImageBlock(imageMatch[1] || "Travel image", imageMatch[2]))
      index += 1
      continue
    }

    if (/^(\- |\* )/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^(\- |\* )/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^(\- |\* )/, ""))
        index += 1
      }
      html.push(
        `<ul class="my-6 space-y-3 pl-5 text-muted-foreground">${items
          .map((item) => `<li class="list-disc leading-7">${renderInline(item)}</li>`)
          .join("")}</ul>`,
      )
      continue
    }

    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""))
        index += 1
      }
      html.push(
        `<ol class="my-6 space-y-3 pl-5 text-muted-foreground">${items
          .map((item) => `<li class="list-decimal leading-7">${renderInline(item)}</li>`)
          .join("")}</ol>`,
      )
      continue
    }

    const paragraph: string[] = [trimmed]
    index += 1
    while (index < lines.length && lines[index].trim() && !/^(#|##|###|> |\- |\* |\d+\. )/.test(lines[index].trim())) {
      paragraph.push(lines[index].trim())
      index += 1
    }
    flushParagraph(paragraph)
  }

  return html.join("\n")
}

const CONTENT_ROOT = path.join(process.cwd(), "content")

export function readMdxFile(filePath: string): MdxDocument | null {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, "utf8")
  const { meta, body } = parseFrontmatter(raw)
  if (!meta.title || !meta.excerpt) return null
  return { title: meta.title, excerpt: meta.excerpt, content: body }
}

export function readLocalizedMdx(route: string, locale: "en" | "fr" | "es"): MdxDocument | null {
  const filePath = path.join(CONTENT_ROOT, "pages", route, `${locale}.mdx`)
  return readMdxFile(filePath)
}
