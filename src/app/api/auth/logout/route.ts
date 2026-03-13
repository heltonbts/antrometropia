import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", req.url))
  clearAuthCookie(res)
  return res
}
