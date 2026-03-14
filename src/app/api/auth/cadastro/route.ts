import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import { getJwtSecret, setAuthCookie } from "@/lib/auth"
import { POLITICA_PRIVACIDADE_VERSAO_ATUAL, TERMOS_VERSAO_ATUAL } from "@/lib/legal"



export async function POST(req: NextRequest) {
  const { nome, email, senha, aceitouTermos, aceitouPoliticaPrivacidade } = await req.json()

  if (!nome || !email || !senha) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 })
  }

  if (!aceitouTermos || !aceitouPoliticaPrivacidade) {
    return NextResponse.json(
      { erro: "Você precisa aceitar os Termos de Uso e a Política de Privacidade" },
      { status: 400 }
    )
  }

  const existe = await prisma.nutricionista.findUnique({ where: { email } })
  if (existe) {
    return NextResponse.json({ erro: "E-mail já cadastrado" }, { status: 409 })
  }

  const senhaHash = await bcrypt.hash(senha, 10)
  const agora = new Date()
  const nutri = await prisma.nutricionista.create({
    data: {
      nome,
      email,
      senhaHash,
      termosAceitosEm: agora,
      politicaPrivacidadeAceitaEm: agora,
      termosVersao: TERMOS_VERSAO_ATUAL,
      politicaPrivacidadeVersao: POLITICA_PRIVACIDADE_VERSAO_ATUAL,
    },
  })

  const token = await new SignJWT({ id: nutri.id, tipo: "nutricionista" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecret())

  const res = NextResponse.json({ ok: true, tipo: "nutricionista" })
  setAuthCookie(res, token)
  return res
}
