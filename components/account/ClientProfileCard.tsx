"use client"

import { useMemo, useState } from "react"
import { Edit3, Mail, MapPin, Phone, Sparkles, User } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type ClientProfileData = {
  fullName: string
  email: string
  phone: string
  country: "México" | "Canadá"
  city: string
  travelStyle: string
  notes: string
}

type ClientProfileCardProps = {
  initialProfile?: ClientProfileData
}

const fallbackProfile: ClientProfileData = {
  fullName: "Cliente Demo",
  email: "cliente@latamviajes.dev",
  phone: "+52 55 5555 5555",
  country: "México",
  city: "Ciudad de México",
  travelStyle: "Viajes culturales y escapadas de fin de semana",
  notes: "Prefiere itinerarios ágiles, hoteles céntricos y cambios de última hora sin fricción.",
}

export function ClientProfileCard({ initialProfile }: ClientProfileCardProps) {
  const [profile, setProfile] = useState<ClientProfileData>(initialProfile ?? fallbackProfile)
  const [draft, setDraft] = useState<ClientProfileData>(initialProfile ?? fallbackProfile)
  const [open, setOpen] = useState(false)

  const initials = useMemo(() => {
    return profile.fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [profile.fullName])

  function openEditor() {
    setDraft(profile)
    setOpen(true)
  }

  function saveProfile() {
    setProfile(draft)
    setOpen(false)
    toast.success("Perfil actualizado en modo demo")
  }

  return (
    <>
      <Card className="overflow-hidden border-border/60 bg-background/70 shadow-[0_20px_80px_rgba(0,0,0,0.08)]">
        <CardHeader className="space-y-3 border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Mi perfil
              </div>
              <CardTitle className="text-2xl">Tu información</CardTitle>
              <CardDescription>Datos visibles para reservas, contacto y seguimiento. La edición es un mock para la demo.</CardDescription>
            </div>
            <Button type="button" className="rounded-full" onClick={openEditor}>
              <Edit3 className="mr-2 h-4 w-4" />
              Editar perfil
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 p-5 sm:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border/60 bg-muted/20 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-lg font-semibold text-primary">
                {initials || <User className="h-7 w-7" />}
              </div>
              <div className="min-w-0 space-y-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Nombre</p>
                  <p className="mt-1 text-xl font-semibold">{profile.fullName}</p>
                </div>
                <Badge className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-primary">
                  {profile.country}
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  Correo
                </p>
                <p className="mt-2 font-medium">{profile.email}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  Teléfono
                </p>
                <p className="mt-2 font-medium">{profile.phone}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Ciudad
                </p>
                <p className="mt-2 font-medium">{profile.city}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Estilo de viaje</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{profile.travelStyle}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Notas</p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{profile.notes}</p>
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-primary">Modo demo</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Cambios de perfil se guardan solo en esta sesión de navegador para la demo. No tocan la base de datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar perfil</DialogTitle>
            <DialogDescription>Actualiza tus datos de contacto. En esta demo el guardado es local y temporal.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="profile-full-name">
                Nombre completo
              </label>
              <Input
                id="profile-full-name"
                value={draft.fullName}
                onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-email">
                Correo
              </label>
              <Input
                id="profile-email"
                type="email"
                value={draft.email}
                onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-phone">
                Teléfono
              </label>
              <Input
                id="profile-phone"
                value={draft.phone}
                onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-country">
                País
              </label>
              <Input
                id="profile-country"
                value={draft.country}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    country: event.target.value.includes("Can") ? "Canadá" : "México",
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="profile-city">
                Ciudad
              </label>
              <Input
                id="profile-city"
                value={draft.city}
                onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="profile-travel-style">
                Estilo de viaje
              </label>
              <Input
                id="profile-travel-style"
                value={draft.travelStyle}
                onChange={(event) => setDraft((current) => ({ ...current, travelStyle: event.target.value }))}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="profile-notes">
                Notas
              </label>
              <Textarea
                id="profile-notes"
                value={draft.notes}
                onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))}
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProfile}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
