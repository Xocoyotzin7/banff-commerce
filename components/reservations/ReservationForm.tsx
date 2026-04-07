"use client"

import * as React from "react"

import { ReservationReceiptDialog } from "@/components/reservations/ReservationReceiptDialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"
import { DEFAULT_BRANCH_ID, MAX_MONTHS_IN_ADVANCE } from "@/lib/reservations"
import {
  getAvailableTimeSlots,
  reservationFormSchema,
  useAvailability,
  useCreateReservation,
} from "@/hooks/use-reservations"

type ReservationFormProps = {
  branchId?: string
  branchLabel?: string
  reservationType?: "appointment" | "travel"
  title?: string
  description?: string
}

type FieldErrors = Partial<Record<"reservationDate" | "reservationTime" | "numPeople" | "message" | "preOrderItems" | "root", string>>

function addMonthsToDate(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

export function ReservationForm({
  branchId = DEFAULT_BRANCH_ID,
  branchLabel,
  reservationType = "appointment",
  title = "Reservar cita",
  description = "Agenda una fecha y horario para tu cita o consulta.",
}: ReservationFormProps) {
  const [reservationDate, setReservationDate] = React.useState("")
  const [reservationTime, setReservationTime] = React.useState("")
  const [numPeople, setNumPeople] = React.useState("2")
  const [message, setMessage] = React.useState("")
  const [preOrderItems, setPreOrderItems] = React.useState("")
  const [errors, setErrors] = React.useState<FieldErrors>({})
  const [receipt, setReceipt] = React.useState<{
    reservationId: string
    reservationCode: string
    reservationType: "appointment" | "travel"
    reservationDate: string
    reservationTime: string
    branchId: string
    branchNumber: string | null
    branchLabel: string
    destinationSlug: string | null
    destinationName: string
    packageId: string | null
    packageName: string | null
    peopleCount: number
    status: string
    createdAt: string | null
    updatedAt: string | null
    clientName: string | null
    clientEmail: string | null
    clientCountry: string | null
    message: string | null
    preOrderItems: string | null
    qrPayload: string | null
  } | null>(null)
  const [receiptOpen, setReceiptOpen] = React.useState(false)

  const { availableSlots, isLoading: isAvailabilityLoading } = useAvailability(branchId, reservationDate)
  const { createReservation, isPending } = useCreateReservation()

  React.useEffect(() => {
    if (reservationTime && !availableSlots.includes(reservationTime)) {
      setReservationTime("")
    }
  }, [availableSlots, reservationTime])

  const minDate = new Date().toISOString().slice(0, 10)
  const maxDate = addMonthsToDate(new Date(), MAX_MONTHS_IN_ADVANCE).toISOString().slice(0, 10)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsed = reservationFormSchema.safeParse({
      numPeople,
      reservationDate,
      reservationTime,
      branchId,
      message: message.trim() || null,
      preOrderItems: preOrderItems.trim() || null,
    })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]
        if (key === "numPeople" || key === "reservationDate" || key === "reservationTime" || key === "message" || key === "preOrderItems") {
          nextErrors[key] = issue.message
        } else {
          nextErrors.root = issue.message
        }
      }
      if (!reservationTime && availableSlots.length > 0) {
        nextErrors.reservationTime = "Selecciona un horario disponible"
      }
      setErrors(nextErrors)
      return
    }

    if (!reservationTime) {
      setErrors({ reservationTime: "Selecciona un horario disponible" })
      return
    }

    try {
      setErrors({})
      const result = await createReservation({
        numPeople: Number(numPeople),
        reservationType,
        reservationDate,
        reservationTime,
        branchId,
        message: message.trim() || null,
        preOrderItems: preOrderItems.trim() || null,
      })

      toast({
        title: "Reservación creada",
        description: `Código: ${result.reservationCode}`,
      })
      if (result.receipt) {
        setReceipt(result.receipt)
        setReceiptOpen(true)
      }

      setReservationDate("")
      setReservationTime("")
      setNumPeople("2")
      setMessage("")
      setPreOrderItems("")
    } catch (submitError) {
      setErrors({
        root: submitError instanceof Error ? submitError.message : "No pudimos crear tu reservación.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-border/70 bg-card/80 p-6 text-card-foreground shadow-[0_18px_55px_-28px_rgba(2,6,23,0.35)] dark:bg-card/70">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {description}{" "}
          {branchLabel ? `Sucursal: ${branchLabel}` : `Sucursal: ${branchId}`}
        </p>
      </div>

      {errors.root ? <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errors.root}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Fecha</span>
          <input
            type="date"
            min={minDate}
            max={maxDate}
            value={reservationDate}
            onChange={(event) => setReservationDate(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          />
          {errors.reservationDate ? <p className="text-sm text-rose-600">{errors.reservationDate}</p> : null}
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Horario</span>
          <select
            value={reservationTime}
            onChange={(event) => setReservationTime(event.target.value)}
            disabled={!reservationDate || isAvailabilityLoading}
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{reservationDate ? "Selecciona un horario" : "Primero selecciona fecha"}</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.reservationTime ? <p className="text-sm text-rose-600">{errors.reservationTime}</p> : null}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_140px]">
        <label className="space-y-2">
          <span className="text-sm font-medium">Personas</span>
          <select
            value={numPeople}
            onChange={(event) => setNumPeople(event.target.value)}
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          >
            {Array.from({ length: 15 }, (_, index) => index + 1).map((count) => (
              <option key={count} value={String(count)}>
                {count}
              </option>
            ))}
          </select>
          {errors.numPeople ? <p className="text-sm text-rose-600">{errors.numPeople}</p> : null}
        </label>

        <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
          {availableSlots.length > 0 ? `${availableSlots.length} horarios disponibles` : "Sin horarios cargados"}
        </div>
      </div>

      <label className="space-y-2 block">
        <span className="text-sm font-medium">Mensaje opcional</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          placeholder="Instrucciones, alergias o contexto adicional"
        />
        {errors.message ? <p className="text-sm text-rose-600">{errors.message}</p> : null}
      </label>

      <label className="space-y-2 block">
        <span className="text-sm font-medium">Pre-orden opcional</span>
        <textarea
          value={preOrderItems}
          onChange={(event) => setPreOrderItems(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition focus:border-[color:var(--accent)]"
          placeholder="Bebidas, alimentos o notas de pre-orden"
        />
        {errors.preOrderItems ? <p className="text-sm text-rose-600">{errors.preOrderItems}</p> : null}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending || isAvailabilityLoading} className="rounded-full">
          {isPending ? "Creando..." : "Crear reservación"}
        </Button>
        <p className="text-sm text-muted-foreground">
          Los horarios van de {getAvailableTimeSlots()[0]} a {getAvailableTimeSlots()[getAvailableTimeSlots().length - 1]}
        </p>
      </div>

      <ReservationReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        receipt={receipt}
        title={reservationType === "travel" ? "Tu viaje quedó confirmado" : "Tu cita quedó confirmada"}
        description={
          reservationType === "travel"
            ? "Guarda este comprobante para consultar tu itinerario y mostrarlo en el momento del embarque o atención."
            : "Guarda este comprobante para tu cita. El panel del admin también puede localizarla con el mismo QR."
        }
        actionLabel="Copiar"
      />
    </form>
  )
}
