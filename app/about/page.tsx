import { redirect } from "next/navigation"

import { getLocaleFromCookies } from "@/lib/locale.server"

export default async function AboutRedirectPage() {
  const locale = await getLocaleFromCookies()
  redirect(`/${locale}/about`)
}
