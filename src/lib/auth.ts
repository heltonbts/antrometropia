import { NextResponse } from "next/server"

export function getJwtSecret(): Uint8Array {
  const secret = process.env.APP_SECRET?.trim()

  if (!secret) {
    throw new Error("APP_SECRET não configurado")
  }

  return new TextEncoder().encode(secret)
}

export function getAuthCookieOptions() {
  // Em alguns ambientes de produção (como Vercel/Railway), o Secure=true pode falhar 
  // se o proxy não repassar o protocolo corretamente. 
  // Vou garantir que o cookie seja persistente.
  return {
    httpOnly: true,
    secure: true, // Forçamos secure true pois produção deve ser HTTPS
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, getAuthCookieOptions())
}

export function clearAuthCookie(response: NextResponse) {
  // Nota: Usamos as mesmas opções para garantir que o navegador localize o cookie para apagar
  const options = getAuthCookieOptions()
  response.cookies.set("token", "", { ...options, maxAge: 0 })
}
