import { type NextRequest } from "next/server"

import { ADMIN_COOKIE_NAME, verifyAdminToken } from "@/lib/admin-auth"

export async function requireAdminSession(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  return verifyAdminToken(token)
}
