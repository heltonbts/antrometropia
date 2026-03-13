import { NextResponse } from "next/server"

export function getJwtSecret(): Uint8Array {
  const secret = process.env.APP_SECRET ?? process.env.NEXTAUTH_SECRET ?? "secret-dev-fallback"
  return new TextEncoder().encode(secret)
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, getAuthCookieOptions())
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set("token", "", {
    ...getAuthCookieOptions(),
    maxAge: 0,
  })
}
