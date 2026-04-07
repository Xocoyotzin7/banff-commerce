import { PortfolioPageContent } from "@/components/portfolio-page-content"
import { getLocaleFromCookies } from "@/lib/locale.server"

export const dynamic = "force-dynamic"

export default async function PortfolioPage() {
  const locale = await getLocaleFromCookies()
  return <PortfolioPageContent locale={locale} />
}
