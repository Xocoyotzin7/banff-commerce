import bcrypt from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/admin-auth"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = LoginSchema.parse(await request.json())
    const expectedEmail = process.env.ADMIN_EMAIL?.trim() || ""
    const expectedPasswordHash = process.env.ADMIN_PASSWORD?.trim() || ""

    if (!expectedEmail || !expectedPasswordHash) {
      return NextResponse.json({ success: false, message: "Admin credentials are not configured" }, { status: 500 })
    }

    const emailMatches = body.email.toLowerCase() === expectedEmail.toLowerCase()
    const passwordMatches = await bcrypt.compare(body.password, expectedPasswordHash)

    if (!emailMatches || !passwordMatches) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const token = await signAdminToken({ email: expectedEmail, role: "admin" })
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
