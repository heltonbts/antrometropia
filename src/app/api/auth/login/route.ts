import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "secret")

export async function POST(req: NextRequest) {
  const { email, senha } = await req.json()

  // Tenta nutricionista
  const nutri = await prisma.nutricionista.findUnique({ where: { email } })
  if (nutri) {
    const ok = await bcrypt.compare(senha, nutri.senhaHash)
    if (!ok) return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 })

    const token = await new SignJWT({ id: nutri.id, tipo: "nutricionista" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET)

    const cookieStore = await cookies()
    cookieStore.set("token", token, { httpOnly: true, maxAge: 604800, path: "/" })
    return NextResponse.json({ ok: true, tipo: "nutricionista" })
  }

  // Tenta paciente
  const paciente = await prisma.paciente.findFirst({ where: { email } })
  if (paciente && paciente.senhaHash) {
    const ok = await bcrypt.compare(senha, paciente.senhaHash)
    if (!ok) return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 })

    const token = await new SignJWT({ id: paciente.id, tipo: "paciente" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET)

    const cookieStore = await cookies()
    cookieStore.set("token", token, { httpOnly: true, maxAge: 604800, path: "/" })
    return NextResponse.json({ ok: true, tipo: "paciente" })
  }

  return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 })
}
