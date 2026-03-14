import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { clearAuthCookie, getJwtSecret } from "@/lib/auth"

const rotasNutri = ["/dashboard", "/pacientes", "/avaliacao"]
const rotasPaciente = ["/painel"]
const rotasPublicas = ["/login", "/cadastro", "/convite", "/termos", "/privacidade", "/api"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname === "/" ||
    rotasPublicas.some((r) => pathname.startsWith(r)) ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())

    // Paciente tentando acessar área do nutricionista
    if (payload.tipo === "paciente" && rotasNutri.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/painel", req.url))
    }

    // Nutricionista tentando acessar painel do paciente
    if (payload.tipo === "nutricionista" && rotasPaciente.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
  } catch {
    // Token inválido — remove cookie e redireciona
    const res = NextResponse.redirect(new URL("/login", req.url))
    clearAuthCookie(res)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
