import { verifyToken } from "@/lib/auth"
import { isAdminDemoMode } from "@/lib/admin/demo-data"

export type AccountSession = {
  userId: string
  isDemo: boolean
}

export function authenticateAccountRequest(request: Request): AccountSession | null {
  const authHeader = request.headers.get("authorization")
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      return { userId: decoded.userId, isDemo: false }
    }
  }

  if (isAdminDemoMode()) {
    return { userId: "demo-client-1", isDemo: true }
  }

  return null
}
