"use client"

import { useMemo } from "react"
import { CalendarDays, Copy, MapPin, PhoneCall, QrCode, Sparkles, Ticket } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { buildReservationQrPayload, type ReservationReceiptPayload } from "@/lib/reservations-receipt"

type ReservationReceiptDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  receipt: ReservationReceiptPayload | null
  title?: string
  description?: string
  actionLabel?: string
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function ReservationReceiptDialog({
  open,
  onOpenChange,
  receipt,
  title = "Tu comprobante de reserva",
  description = "Guarda este comprobante. El código QR resume los datos clave de tu reserva y el admin puede verlo también.",
  actionLabel = "Copiar código",
}: ReservationReceiptDialogProps) {
  const qrPayload = receipt
    ? receipt.qrPayload ?? buildReservationQrPayload(receipt as unknown as Parameters<typeof buildReservationQrPayload>[0])
    : null

  const formattedDate = useMemo(() => {
    if (!receipt) return ""
    return formatDate(receipt.reservationDate)
  }, [receipt])

  const copyCode = async () => {
    if (!receipt) return
    try {
      await navigator.clipboard.writeText(receipt.reservationCode)
      toast({
        title: "Código copiado",
        description: `Se copió ${receipt.reservationCode} al portapapeles.`,
      })
    } catch {
      toast({
        title: "No pudimos copiar",
        description: "Tu navegador bloqueó el portapapeles.",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/90 bg-[#040707] p-0 shadow-[0_40px_140px_-55px_rgba(0,0,0,0.92)] sm:max-w-4xl">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden border-b border-white/8 bg-[#050b0b] p-6 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(10,110,110,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(212,160,23,0.18),transparent_26%),linear-gradient(180deg,rgba(2,6,23,0.82),rgba(2,6,23,0.96))]" />
            <div className="relative space-y-5">
              <DialogHeader className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Reserva confirmada
                </div>
                <DialogTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</DialogTitle>
                <DialogDescription className="max-w-xl text-sm leading-6 text-muted-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>

              {receipt ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#071111]/95 p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        <Ticket className="h-4 w-4 text-primary" />
                        Código
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-3xl font-semibold tracking-[0.3em] text-foreground">{receipt.reservationCode}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 rounded-full"
                          onClick={copyCode}
                          aria-label={actionLabel}
                          title={actionLabel}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">{actionLabel}</span>
                        </Button>
                      </div>
                    </div>

                    {qrPayload ? (
                      <div className="rounded-3xl border border-white/10 bg-[#071111]/95 p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                          <QrCode className="h-4 w-4 text-secondary" />
                          QR
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Escanea el código o compártelo desde este comprobante.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-[#071111]/95 p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Fecha y hora
                      </div>
                      <p className="mt-2 text-lg font-medium">{formattedDate}</p>
                      <p className="text-sm text-muted-foreground">{receipt.reservationTime}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-[#071111]/95 p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]">
                      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        <MapPin className="h-4 w-4 text-secondary" />
                        Referencia
                      </div>
                      <p className="mt-2 text-lg font-medium">{receipt.destinationName}</p>
                      <p className="text-sm text-muted-foreground">
                        {receipt.branchLabel} · {receipt.peopleCount} personas
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#071111]/95 p-4 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                      <PhoneCall className="h-4 w-4 text-primary" />
                      Datos del cliente
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Nombre</p>
                        <p className="font-medium">{receipt.clientName ?? "Sin nombre"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Correo</p>
                        <p className="font-medium">{receipt.clientEmail ?? "Sin correo"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">País</p>
                        <p className="font-medium">{receipt.clientCountry ?? "Sin dato"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Tipo</p>
                        <Badge variant="outline" className="mt-1 rounded-full capitalize">
                          {receipt.reservationType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="relative flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(10,110,110,0.12),transparent_38%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(6,13,13,0.96))] p-6">
            {receipt && qrPayload ? (
              <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#071111]/98 p-6 text-center shadow-[0_30px_100px_-50px_rgba(0,0,0,0.95)] backdrop-blur-xl">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                  <QrCode className="h-8 w-8" />
                </div>
                <p className="mt-4 text-xs uppercase tracking-[0.34em] text-muted-foreground">
                  Comprobante digital
                </p>
                <div className="mt-6 flex justify-center rounded-[1.5rem] border border-white/10 bg-[#f7f7f4] p-4 shadow-[0_20px_80px_-30px_rgba(10,110,110,0.25)]">
                  <QRCodeSVG
                    value={qrPayload}
                    size={240}
                    bgColor="#ffffff"
                    fgColor="#0a6e6e"
                    includeMargin={false}
                    level="M"
                  />
                </div>
                <div className="mt-5 space-y-2 text-left">
                  <p className="text-sm font-medium text-text">Reserva #{receipt.reservationCode}</p>
                  <p className="text-sm text-text-muted">
                    {receipt.destinationName} · {formattedDate}
                  </p>
                  <p className="text-sm text-text-muted">
                    {receipt.reservationTime} · {receipt.peopleCount} personas
                  </p>
                </div>
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-left text-xs leading-6 text-text-muted">
                  Presenta este comprobante al llegar. El código QR permite consultar tu reserva y el admin puede identificarla desde el panel.
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-text-muted">
                {receipt ? "No pudimos generar el QR del comprobante." : "No hay comprobante disponible."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
