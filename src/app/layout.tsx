import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"

import { AppProviders } from "@/app/providers"
import { Footer } from "../components/layout/Footer"
import { Navbar } from "../components/layout/Navbar"
import { PageTransition } from "../components/layout/PageTransition"
import { Toaster as AppToaster } from "../../components/ui/toaster"
import { Toaster as SonnerToaster } from "../../components/ui/sonner"
import { ThemeProvider } from "../../components/theme-provider"
import { getLocaleFromCookies } from "@/lib/locale"
import { cn } from "../lib/utils"

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
  title: "LATAM VIAJES",
  description: "Luxury travel e-commerce for Latin America adventure.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocaleFromCookies()

  return (
    <html lang={locale} className={cn(playfair.variable, inter.variable, "dark")} suppressHydrationWarning>
      <body className="relative min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
