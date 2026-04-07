import type { ReactNode } from "react"
import { Fragment, createElement } from "react"

import { JsonLd } from "@/components/seo/JsonLd"
import type { SeoJsonLdObject } from "@/lib/seo/types"

type SeoProps = {
  jsonLd?: SeoJsonLdObject | readonly SeoJsonLdObject[]
  children?: ReactNode
}

export function Seo({ jsonLd, children }: SeoProps) {
  return createElement(
    Fragment,
    null,
    jsonLd ? createElement(JsonLd, { data: jsonLd }) : null,
    children,
  )
}
