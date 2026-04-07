import type { ReactNode } from "react"
import { createElement } from "react"

import { escapeJsonLd } from "@banff/agency-core/seo/buildJsonLd"
import type { SeoJsonLdObject } from "@banff/agency-core/seo/types"

type JsonLdProps = {
  data: SeoJsonLdObject | readonly SeoJsonLdObject[]
  children?: ReactNode
}

export function JsonLd({ data }: JsonLdProps) {
  // Server-safe JSON-LD renderer: supports one or many schema blocks per page.
  const payload = Array.isArray(data) ? data : [data]

  if (payload.length === 0) {
    return null
  }

  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: escapeJsonLd(payload.length === 1 ? payload[0] : payload) },
  })
}

