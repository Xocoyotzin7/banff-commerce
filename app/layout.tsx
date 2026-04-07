import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { AppProviders } from "@/app/providers"
import { Footer } from "../src/components/layout/Footer"
import { Navbar } from "../src/components/layout/Navbar"
import { PageTransition } from "@banff/agency-core/components/layout/PageTransition"
import { ThemeProvider } from "@banff/agency-core/components/theme-provider"
import { PassiveAnalyticsTracker } from "@banff/agency-core/components/analytics/PassiveAnalyticsTracker"
import { getLocaleFromCookies } from "@/lib/locale.server"
import { Toaster as AppToaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://latam-travel.vercel.app"),
  title: {
    default: "LATAM Viajes | Descubre Latinoamérica",
    template: "%s | LATAM Viajes",
  },
  description:
    "Paquetes de viaje premium a 20 destinos de Latinoamérica. Machu Picchu, Salar de Uyuni, Cancún, Patagonia y más. Vuelos incluidos desde $599 USD.",
  keywords: ["viajes latinoamerica", "paquetes turisticos", "machu picchu", "salar de uyuni", "cancun"],
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: ["en_CA", "pt_BR"],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocaleFromCookies()

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable} dark`} suppressHydrationWarning>
      <body className="relative min-h-screen bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white outline-none transition focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Saltar al contenido principal
        </a>
        <AppProviders>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <PassiveAnalyticsTracker />
            <Navbar locale={locale} />
            <PageTransition>{children}</PageTransition>
            <Footer locale={locale} />
            <AppToaster />
            <SonnerToaster richColors closeButton />
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  )
}
