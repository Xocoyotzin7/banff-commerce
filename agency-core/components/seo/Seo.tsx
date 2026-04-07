import type { ReactNode } from "react"
import { Fragment, createElement } from "react"

import { JsonLd } from "@banff/agency-core/components/seo/JsonLd"
import type { SeoJsonLdObject } from "@banff/agency-core/seo/types"

type SeoProps = {
  jsonLd?: SeoJsonLdObject | readonly SeoJsonLdObject[]
  children?: ReactNode
}

export function Seo({ jsonLd, children }: SeoProps) {
  // Small composition wrapper for pages/layouts that want metadata helpers plus structured data.
  return createElement(
    Fragment,
    null,
    jsonLd ? createElement(JsonLd, { data: jsonLd }) : null,
    children,
  )
}

