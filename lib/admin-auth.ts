import { jwtVerify, SignJWT } from "jose"

export const ADMIN_COOKIE_NAME = "admin_token"

function getAdminSecret() {
  const secret = process.env.ADMIN_JWT_SECRET?.trim() || process.env.JWT_SECRET?.trim() || "admin-dev-secret"
  return new TextEncoder().encode(secret)
}

export type AdminTokenPayload = {
  email: string
  role: "admin"
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.email)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAdminSecret())
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAdminSecret())
    const email = typeof payload.sub === "string" ? payload.sub : null
    const role = payload.role === "admin" ? "admin" : null

    if (!email || !role) {
      return null
    }

    return {
      email,
      role,
    }
  } catch {
    return null
  }
}
