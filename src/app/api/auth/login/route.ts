import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { getJwtSecret, setAuthCookie } from "@/lib/auth"

const SECRET = getJwtSecret()

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

    const res = NextResponse.json({ ok: true, tipo: "nutricionista" })
    setAuthCookie(res, token)
    return res
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

    const res = NextResponse.json({ ok: true, tipo: "paciente" })
    setAuthCookie(res, token)
    return res
  }

  return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 })
}
