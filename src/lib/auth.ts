import { NextResponse } from "next/server"

function getSecretValue(): string {
  const secret = process.env.APP_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("APP_SECRET or NEXTAUTH_SECRET must be configured")
  }
  return secret
}

export function getJwtSecret(): Uint8Array {
  return new TextEncoder().encode(getSecretValue())
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
