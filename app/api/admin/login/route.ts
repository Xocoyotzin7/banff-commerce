import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/admin-auth"

const LoginSchema = z.object({
  email: z.string().catch("demo@latamviajes.local"),
  password: z.string().catch("demo-password"),
})

export async function POST(request: NextRequest) {
  try {
    const body = LoginSchema.parse(await request.json())
    const token = await signAdminToken({
      email: body.email?.trim() || "demo@latamviajes.local",
      role: "admin",
    })
    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed"
    return NextResponse.json({ success: false, message }, { status: 400 })
  }
}
