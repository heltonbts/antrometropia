import { NextResponse } from "next/server"

export function getJwtSecret(): Uint8Array {
  const secret = process.env.APP_SECRET
  
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL: APP_SECRET environment variable is not set in production.")
  }
  
  return new TextEncoder().encode(secret || "dev-only-secret")
}

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production"
  
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
