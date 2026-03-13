import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function GET() {
  const res = NextResponse.json({ ok: true })
  clearAuthCookie(res)
  return res
}
