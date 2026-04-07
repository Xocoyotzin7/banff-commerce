/*
 * --------------------------------------------------------------------
 *  Xoco Café — Software Property
 *  Copyright (c) 2025 Xoco Café
 *  Principal Developer: Donovan Riaño
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at:
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  --------------------------------------------------------------------
 *  PROPIEDAD DEL SOFTWARE — XOCO CAFÉ.
 *  Copyright (c) 2025 Xoco Café.
 *  Desarrollador Principal: Donovan Riaño.
 *
 *  Este archivo está licenciado bajo la Apache License 2.0.
 *  Consulta el archivo LICENSE en la raíz del proyecto para más detalles.
 * --------------------------------------------------------------------
 */

import { createHmac, timingSafeEqual } from "node:crypto"

import { eq } from "drizzle-orm"

import { getDb, users } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

type Base64Url = string

export type AuthTokenPayload = {
  userId: string
  email: string
  clientId: string
  exp?: number
  iat?: number
}

export type AuthUser = {
  id: string
  email: string
  clientId: string
  firstName: string | null
  lastName: string | null
}

function encodeBase64Url(input: string) {
  return Buffer.from(input).toString("base64url")
}

function decodeBase64Url(input: Base64Url) {
  return Buffer.from(input, "base64url").toString("utf8")
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

function parseJwtToken(token: string) {
  const parts = token.split(".")

  if (parts.length !== 3) {
    return null
  }

  const [headerPart, payloadPart, signaturePart] = parts

  try {
    const signingInput = `${headerPart}.${payloadPart}`
    const expectedSignature = createHmac("sha256", JWT_SECRET).update(signingInput).digest("base64url")

    if (!safeEqual(signaturePart, expectedSignature)) {
      return null
    }

    const headerJson = decodeBase64Url(headerPart)
    const payloadJson = decodeBase64Url(payloadPart)
    const header = JSON.parse(headerJson) as { alg?: string; typ?: string }
    const payload = JSON.parse(payloadJson) as Partial<AuthTokenPayload> & Record<string, unknown>

    if (header.alg !== "HS256") {
      return null
    }

    if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
      return null
    }

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.clientId !== "string"
    ) {
      return null
    }

    return {
      userId: payload.userId,
      email: payload.email,
      clientId: payload.clientId,
    }
  } catch {
    return null
  }
}

export function generateToken(user: AuthUser): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload = encodeBase64Url(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      clientId: user.clientId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }),
  )
  const signature = createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url")

  return `${header}.${payload}.${signature}`
}

export function verifyToken(token: string): AuthTokenPayload | null {
  return parseJwtToken(token)
}

export async function getUserById(id: string) {
  const database = getDb().db
  const rows = await database
    .select({
      id: users.id,
      email: users.email,
      clientId: users.clientId,
      firstName: users.firstName,
      lastName: users.lastName,
      country: users.country,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return rows[0] ?? null
}
