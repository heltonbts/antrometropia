import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"
import bcrypt from "bcryptjs"
import { getJwtSecret, setAuthCookie } from "@/lib/auth"
import {
  CONSENTIMENTO_DADOS_SAUDE_VERSAO_ATUAL,
  POLITICA_PRIVACIDADE_VERSAO_ATUAL,
  TERMOS_VERSAO_ATUAL,
} from "@/lib/legal"



export async function POST(req: NextRequest) {
  const {
    token,
    senha,
    aceitouTermos,
    aceitouPoliticaPrivacidade,
    consentiuDadosSaude,
  } = await req.json()

  if (!token || !senha || senha.length < 6) {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 })
  }

  if (!aceitouTermos || !aceitouPoliticaPrivacidade || !consentiuDadosSaude) {
    return NextResponse.json(
      { erro: "Você precisa aceitar os termos, a política e o consentimento de dados de saúde" },
      { status: 400 }
    )
  }

  const paciente = await prisma.paciente.findUnique({
    where: { tokenConvite: token },
  })

  if (!paciente) {
    return NextResponse.json({ erro: "Convite inválido ou expirado" }, { status: 404 })
  }

  const senhaHash = await bcrypt.hash(senha, 10)
  const agora = new Date()

  await prisma.paciente.update({
    where: { id: paciente.id },
    data: {
      senhaHash,
      conviteAceito: true,
      tokenConvite: null,
      termosAceitosEm: agora,
      politicaPrivacidadeAceitaEm: agora,
      consentiuDadosSaudeEm: agora,
      termosVersao: TERMOS_VERSAO_ATUAL,
      politicaPrivacidadeVersao: POLITICA_PRIVACIDADE_VERSAO_ATUAL,
      consentimentoVersao: CONSENTIMENTO_DADOS_SAUDE_VERSAO_ATUAL,
    },
  })

  const jwt = await new SignJWT({ id: paciente.id, tipo: "paciente" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(getJwtSecret())

  const res = NextResponse.json({ ok: true })
  setAuthCookie(res, jwt)
  return res
}

// Valida o token sem aceitar — usado para mostrar o nome na tela de convite
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 })

  const paciente = await prisma.paciente.findUnique({
    where: { tokenConvite: token },
    select: { nome: true, email: true },
  })

  if (!paciente) {
    return NextResponse.json({ erro: "Convite inválido ou expirado" }, { status: 404 })
  }

  return NextResponse.json(paciente)
}
