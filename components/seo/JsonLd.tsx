import type { ReactNode } from "react"
import { createElement } from "react"

import { escapeJsonLd } from "@/lib/seo/buildJsonLd"
import type { SeoJsonLdObject } from "@/lib/seo/types"

type JsonLdProps = {
  data: SeoJsonLdObject | readonly SeoJsonLdObject[]
  children?: ReactNode
}

export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data) ? data : [data]

  if (payload.length === 0) {
    return null
  }

  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: escapeJsonLd(payload.length === 1 ? payload[0] : payload) },
  })
}
