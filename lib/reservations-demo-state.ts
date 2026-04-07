import { randomUUID } from "node:crypto"

import { DEFAULT_BRANCH_ID } from "@/lib/reservations"

export type DemoReservationRecord = {
  id: string
  userId: string
  reservationCode: string
  reservationType: "appointment" | "travel"
  reservationDate: string
  reservationTime: string
  branchId: string
  branchNumber: string | null
  destinationSlug: string | null
  packageId: string | null
  clientName: string
  clientEmail: string | null
  clientCountry: string | null
  peopleCount: number
  message: string | null
  preOrderItems: string | null
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
  updatedAt: string
}

type DemoState = {
  reservations: DemoReservationRecord[]
}

export type DemoUserProfile = {
  id: string
  clientName: string
  clientEmail: string | null
  clientCountry: string | null
}

const demoUsers: DemoUserProfile[] = [
  { id: "demo-client-1", clientName: "Cliente Demo", clientEmail: "cliente@latamviajes.dev", clientCountry: "México" },
  { id: "demo-client-2", clientName: "Valeria Ortega", clientEmail: "valeria@example.com", clientCountry: "México" },
  { id: "demo-client-3", clientName: "Camilo Rivas", clientEmail: "camilo@example.com", clientCountry: "Colombia" },
  { id: "demo-client-4", clientName: "Nadia Salazar", clientEmail: "nadia@example.com", clientCountry: "Chile" },
  { id: "demo-client-5", clientName: "Daniel Price", clientEmail: "daniel@example.ca", clientCountry: "Canadá" },
  { id: "demo-client-6", clientName: "Sofía Torres", clientEmail: "sofia@example.mx", clientCountry: "México" },
]

declare global {
  // eslint-disable-next-line no-var
  var __banffDemoReservations: DemoState | undefined
}

function nowIso(offsetMinutes = 0) {
  const date = new Date()
  date.setMinutes(date.getMinutes() - offsetMinutes)
  return date.toISOString()
}

function randomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  return Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join("")
}

function seedState(): DemoState {
  const userId = "demo-client-1"
  const today = new Date()
  const date = (offset: number) => {
    const copy = new Date(today)
    copy.setUTCDate(copy.getUTCDate() + offset)
    return copy.toISOString().slice(0, 10)
  }

  const findUser = (id: string) => demoUsers.find((user) => user.id === id) ?? demoUsers[0]
  const destinationSeeds = [
    "cancun-riviera-maya",
    "chichen-itza",
    "ciudad-de-mexico",
    "rio-de-janeiro",
    "machu-picchu",
    "cusco",
    "cartagena",
    "medellin",
    "san-andres",
    "tikal-guatemala",
    "monteverde-costa-rica",
    "bocas-del-toro",
    "guna-yala",
    "patagonia-argentina",
    "desierto-atacama",
    "salar-uyuni",
    "buenos-aires",
  ]

  const historicalReservations = Array.from({ length: 16 }, (_, index) => {
    const monthsAgo = 15 - index
    const dateValue = new Date(today)
    dateValue.setUTCMonth(dateValue.getUTCMonth() - monthsAgo)
    dateValue.setUTCDate(8 + (index % 10))
    const reservationType = index % 3 === 0 ? "appointment" : "travel"
    const selectedUser = demoUsers[(index + 1) % demoUsers.length]
    const destinationSlug = reservationType === "travel" ? destinationSeeds[index % destinationSeeds.length] : null
    const packageId = destinationSlug ? `${destinationSlug}-explorer` : null

    return {
      id: `demo-reservation-historical-${index + 1}`,
      userId: selectedUser.id,
      reservationCode: randomCode(),
      reservationType,
      reservationDate: dateValue.toISOString().slice(0, 10),
      reservationTime: `${String(10 + (index % 10)).padStart(2, "0")}:30`,
      branchId: DEFAULT_BRANCH_ID,
      branchNumber: "01",
      destinationSlug,
      packageId,
      clientName: selectedUser.clientName,
      clientEmail: selectedUser.clientEmail,
      clientCountry: selectedUser.clientCountry,
      peopleCount: 2 + (index % 4),
      message: reservationType === "travel" ? "Reserva histórica para análisis" : "Cita histórica para seguimiento",
      preOrderItems: reservationType === "travel" ? "Traslado privado" : null,
      status: index % 4 === 0 ? "confirmed" : index % 5 === 0 ? "completed" : "pending",
      createdAt: nowIso(200 + index * 3),
      updatedAt: nowIso(190 + index * 2),
    } satisfies DemoReservationRecord
  })

  return {
    reservations: [
      {
        id: "demo-reservation-1",
        userId,
        reservationCode: "CIT",
        reservationType: "appointment",
        reservationDate: date(2),
        reservationTime: "10:30",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: null,
        packageId: null,
        clientName: findUser(userId).clientName,
        clientEmail: findUser(userId).clientEmail,
        clientCountry: findUser(userId).clientCountry,
        peopleCount: 2,
        message: "Cita para planear vacaciones a Cancún",
        preOrderItems: null,
        status: "confirmed",
        createdAt: nowIso(90),
        updatedAt: nowIso(5),
      },
      {
        id: "demo-reservation-2",
        userId,
        reservationCode: "TUV",
        reservationType: "travel",
        reservationDate: date(8),
        reservationTime: "15:00",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: "machu-picchu",
        packageId: "machu-picchu-explorer",
        clientName: findUser(userId).clientName,
        clientEmail: findUser(userId).clientEmail,
        clientCountry: findUser(userId).clientCountry,
        peopleCount: 4,
        message: "Viaje familiar",
        preOrderItems: "Asistencia aeropuerto",
        status: "pending",
        createdAt: nowIso(180),
        updatedAt: nowIso(20),
      },
      {
        id: "demo-reservation-3",
        userId: "demo-client-2",
        reservationCode: "CIT",
        reservationType: "appointment",
        reservationDate: date(-1),
        reservationTime: "09:30",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: null,
        packageId: null,
        clientName: demoUsers[1].clientName,
        clientEmail: demoUsers[1].clientEmail,
        clientCountry: demoUsers[1].clientCountry,
        peopleCount: 2,
        message: "Cita para cotizar Riviera Maya",
        preOrderItems: null,
        status: "confirmed",
        createdAt: nowIso(160),
        updatedAt: nowIso(12),
      },
      {
        id: "demo-reservation-4",
        userId: "demo-client-3",
        reservationCode: "TIK",
        reservationType: "travel",
        reservationDate: date(-2),
        reservationTime: "12:00",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: "tikal-guatemala",
        packageId: null,
        clientName: demoUsers[2].clientName,
        clientEmail: demoUsers[2].clientEmail,
        clientCountry: demoUsers[2].clientCountry,
        peopleCount: 4,
        message: "Quieren ajustar el itinerario",
        preOrderItems: "N/A",
        status: "pending",
        createdAt: nowIso(150),
        updatedAt: nowIso(15),
      },
      {
        id: "demo-reservation-5",
        userId: "demo-client-4",
        reservationCode: "MCH",
        reservationType: "travel",
        reservationDate: date(-5),
        reservationTime: "18:30",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: "machu-picchu",
        packageId: "machu-picchu-premium",
        clientName: demoUsers[3].clientName,
        clientEmail: demoUsers[3].clientEmail,
        clientCountry: demoUsers[3].clientCountry,
        peopleCount: 3,
        message: "Travel package confirmation",
        preOrderItems: "Airport transfer",
        status: "completed",
        createdAt: nowIso(140),
        updatedAt: nowIso(8),
      },
      {
        id: "demo-reservation-6",
        userId: "demo-client-5",
        reservationCode: "CDX",
        reservationType: "appointment",
        reservationDate: date(-6),
        reservationTime: "09:30",
        branchId: DEFAULT_BRANCH_ID,
        branchNumber: "01",
        destinationSlug: null,
        packageId: null,
        clientName: demoUsers[4].clientName,
        clientEmail: demoUsers[4].clientEmail,
        clientCountry: demoUsers[4].clientCountry,
        peopleCount: 2,
        message: "Buscan reservar viaje a CDMX",
        preOrderItems: null,
        status: "cancelled",
        createdAt: nowIso(130),
        updatedAt: nowIso(4),
      },
      ...historicalReservations,
    ],
  }
}

function getState(): DemoState {
  if (!globalThis.__banffDemoReservations) {
    globalThis.__banffDemoReservations = seedState()
  }
  return globalThis.__banffDemoReservations
}

export function listDemoReservationsByUser(userId: string) {
  return getState().reservations.filter((reservation) => reservation.userId === userId)
}

export function listAllDemoReservations() {
  return [...getState().reservations]
}

export function listDemoReservationsByBranchAndDate(branchId: string, reservationDate: string) {
  return getState().reservations.filter((reservation) => reservation.branchId === branchId && reservation.reservationDate === reservationDate)
}

export function getDemoReservationById(reservationId: string) {
  return getState().reservations.find((reservation) => reservation.id === reservationId) ?? null
}

export function getDemoUserProfile(userId: string): DemoUserProfile {
  return demoUsers.find((user) => user.id === userId) ?? demoUsers[0]
}

export function createDemoReservation(input: {
  userId: string
  reservationType: "appointment" | "travel"
  reservationDate: string
  reservationTime: string
  branchId: string
  branchNumber: string | null
  destinationSlug: string | null
  packageId: string | null
  peopleCount: number
  message: string | null
  preOrderItems: string | null
}) {
  const profile = getDemoUserProfile(input.userId)
  const reservation: DemoReservationRecord = {
    id: `demo-${randomUUID()}`,
    userId: input.userId,
    reservationCode: randomCode(),
    reservationType: input.reservationType,
    reservationDate: input.reservationDate,
    reservationTime: input.reservationTime,
    branchId: input.branchId,
    branchNumber: input.branchNumber,
    destinationSlug: input.destinationSlug,
    packageId: input.packageId,
    clientName: profile.clientName,
    clientEmail: profile.clientEmail,
    clientCountry: profile.clientCountry,
    peopleCount: input.peopleCount,
    message: input.message,
    preOrderItems: input.preOrderItems,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }

  getState().reservations = [reservation, ...getState().reservations]
  return reservation
}

export function cancelDemoReservation(reservationId: string, userId: string) {
  const state = getState()
  const index = state.reservations.findIndex((reservation) => reservation.id === reservationId && reservation.userId === userId)
  if (index < 0) return null

  const updated = {
    ...state.reservations[index],
    status: "cancelled" as const,
    updatedAt: nowIso(),
  }
  state.reservations[index] = updated
  return updated
}

export function updateDemoReservationStatus(reservationId: string, userId: string, status: DemoReservationRecord["status"]) {
  const state = getState()
  const index = state.reservations.findIndex((reservation) => reservation.id === reservationId && reservation.userId === userId)
  if (index < 0) return null

  const updated = {
    ...state.reservations[index],
    status,
    updatedAt: nowIso(),
  }
  state.reservations[index] = updated
  return updated
}
