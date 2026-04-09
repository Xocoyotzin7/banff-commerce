import { destinations } from "@/src/lib/data/destinations"
import { packages } from "@/src/lib/data/packages"

type ReservationReceiptSource = {
  id: string
  reservationCode: string
  reservationType: "appointment" | "travel"
  reservationDate: string
  reservationTime: string
  branchId: string
  branchNumber: string | null
  destinationSlug: string | null
  packageId: string | null
  peopleCount: number
  status: string
  createdAt?: string | null
  updatedAt?: string | null
  clientName?: string | null
  clientEmail?: string | null
  clientCountry?: string | null
  message?: string | null
  preOrderItems?: string | null
}

export type ReservationReceiptPayload = {
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
}

function getDestinationName(destinationSlug: string | null, packageId: string | null): string {
  if (destinationSlug) {
    const destination = destinations.find((entry) => entry.slug === destinationSlug)
    if (destination) {
      return destination.name
    }
  }

  if (packageId) {
    const travelPackage = packages.find((entry) => entry.id === packageId)
    if (travelPackage) {
      const destination = destinations.find((entry) => entry.slug === travelPackage.destinationId)
      return destination?.name ?? travelPackage.title
    }
  }

  return "Cita"
}

function getPackageName(packageId: string | null): string | null {
  if (!packageId) {
    return null
  }
  const travelPackage = packages.find((entry) => entry.id === packageId)
  return travelPackage?.title ?? null
}

function getBranchLabel(branchId: string, branchNumber: string | null, reservationType: string) {
  if (branchNumber) {
    return `Sucursal ${branchNumber}`
  }
  if (branchId) {
    return reservationType === "travel" ? "Atención de viaje" : "Sucursal principal"
  }
  return "Sucursal principal"
}

export function buildReservationQrPayload(source: ReservationReceiptSource) {
  return JSON.stringify({
    kind: "reservation-receipt",
    reservationId: source.id,
    reservationCode: source.reservationCode,
    reservationType: source.reservationType,
    reservationDate: source.reservationDate,
    reservationTime: source.reservationTime,
    branchId: source.branchId,
    branchNumber: source.branchNumber,
    destinationSlug: source.destinationSlug,
    packageId: source.packageId,
    peopleCount: source.peopleCount,
  })
}

export function buildReservationReceipt(source: ReservationReceiptSource): ReservationReceiptPayload {
  const destinationName = getDestinationName(source.destinationSlug, source.packageId)
  const packageName = getPackageName(source.packageId)
  const qrPayload = buildReservationQrPayload(source)

  return {
    reservationId: source.id,
    reservationCode: source.reservationCode,
    reservationType: source.reservationType,
    reservationDate: source.reservationDate,
    reservationTime: source.reservationTime,
    branchId: source.branchId,
    branchNumber: source.branchNumber,
    branchLabel: getBranchLabel(source.branchId, source.branchNumber, source.reservationType),
    destinationSlug: source.destinationSlug,
    destinationName,
    packageId: source.packageId,
    packageName,
    peopleCount: source.peopleCount,
    status: source.status,
    createdAt: source.createdAt ?? null,
    updatedAt: source.updatedAt ?? null,
    clientName: source.clientName ?? null,
    clientEmail: source.clientEmail ?? null,
    clientCountry: source.clientCountry ?? null,
    message: source.message ?? null,
    preOrderItems: source.preOrderItems ?? null,
    qrPayload,
  }
}
