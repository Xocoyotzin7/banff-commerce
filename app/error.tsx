"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-24 sm:px-6">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=90"
          alt="Destino tropical"
          fill
          priority
          sizes="100vw"
          className="object-cover blur-[4px] scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(6,13,13,0.48)_0%,rgba(6,13,13,0.9)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl" style={{ perspective: 1400 }}>
        <motion.section
          initial={{ opacity: 0, y: 24, rotateY: -18 }}
          animate={{ opacity: 1, y: 0, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(14,26,26,0.82)] p-6 shadow-[0_30px_120px_-45px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:p-8"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--secondary)]">LATAM VIAJES</p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                ¡Ups! Algo salió mal
              </h1>
              <p className="max-w-lg text-sm leading-7 text-text-muted sm:text-base">
                La ruta no cargó como esperaba. Puedes volver a intentar sin perder el contexto de la sesión.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={reset} className="rounded-full bg-[color:var(--primary)] px-5 text-white hover:bg-[color:var(--primary-dark)]">
                  <span className="inline-flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Intentar de nuevo
                  </span>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-border/70 bg-background/45 px-5 text-text hover:bg-background/70">
                  <Link href="/">
                    <span className="inline-flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Volver al inicio
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative min-h-[240px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-background/30">
              <Image
                src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=90"
                alt="Vista aérea"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,110,110,0.18),rgba(212,160,23,0.06),rgba(6,13,13,0.68))]" />
              <div className="absolute inset-0 flex items-end p-5">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-text-muted backdrop-blur-md">
                  Si esto persiste, vuelve a cargar la página o intenta de nuevo en unos segundos.
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
