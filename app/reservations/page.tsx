import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from "lucide-react"

import { ReservationForm } from "@/components/reservations/ReservationForm"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Reservas y citas",
  description: "Agenda una cita o consulta para tu viaje con disponibilidad por horario y confirmación inmediata.",
}

export default function ReservationsPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
      <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/7 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-text-muted backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--secondary)]" />
            Reserva de cita
          </div>
          <h1 className="font-display text-5xl leading-[0.95] text-text sm:text-6xl">
            Agenda una cita y deja listo tu próximo viaje.
          </h1>
          <p className="max-w-xl text-base leading-8 text-text-muted">
            Usa este flujo para reservar una cita con el equipo y definir fechas, personas y notas antes de convertirlo en una reserva confirmada.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[color:var(--secondary)]">
                <CalendarDays className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em] text-text-muted">Horario</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-muted">Elige fecha y hora disponibles para asegurar tu cita sin cruces.</p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-[color:var(--secondary)]">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-xs uppercase tracking-[0.3em] text-text-muted">Confirmación</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-text-muted">Tu código queda registrado y el panel del admin puede verlo de inmediato.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-[color:var(--primary)] px-5 text-white">
              <Link href="#reservation-form" className="inline-flex items-center gap-2">
                Reservar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/12 bg-white/7 px-5 text-white hover:bg-white/12">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>

        <div id="reservation-form" className="scroll-mt-28">
          <ReservationForm
            reservationType="appointment"
            title="Reservar cita"
            description="Agenda una cita con el equipo para planear tu viaje."
            branchLabel="Sucursal matriz"
          />
        </div>
      </section>
    </main>
  )
}
