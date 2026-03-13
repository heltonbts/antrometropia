import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "secret")

// Rotas que exigem autenticação de nutricionista
const rotasNutri = ["/dashboard", "/pacientes", "/avaliacao"]

// Rotas que exigem autenticação de paciente
const rotasPaciente = ["/painel"]

// Rotas públicas (não redireciona)
const rotasPublicas = ["/", "/login", "/cadastro", "/convite", "/api"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Não intercepta rotas públicas nem assets
  if (
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
    const { payload } = await jwtVerify(token, SECRET)

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
    res.cookies.delete("token")
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
