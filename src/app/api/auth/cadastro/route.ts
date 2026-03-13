import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { SignJWT } from "jose"

const SECRET = new TextEncoder().encode(process.env.APP_SECRET || "secret")

export async function POST(req: NextRequest) {
  const { nome, email, senha } = await req.json()

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 })
  }

  const existe = await prisma.nutricionista.findUnique({ where: { email } })
  if (existe) {
    return NextResponse.json({ erro: "E-mail já cadastrado" }, { status: 409 })
  }

  const senhaHash = await bcrypt.hash(senha, 10)
  const nutri = await prisma.nutricionista.create({
    data: { nome, email, senhaHash },
  })

  const token = await new SignJWT({ id: nutri.id, tipo: "nutricionista" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return NextResponse.json({ ok: true, tipo: "nutricionista" })
}
