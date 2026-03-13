import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { normalizarSexo } from "@/lib/utils"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { randomBytes } from "crypto"

const SECRET = new TextEncoder().encode(process.env.APP_SECRET || "secret")

async function getNutriId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (payload.tipo !== "nutricionista") return null
    return payload.id as string
  } catch {
    return null
  }
}

export async function GET() {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  try {
    const pacientes = await prisma.paciente.findMany({
      where: { nutricionistaId: nutriId },
      include: {
        avaliacoes: {
          orderBy: { dataAvaliacao: "desc" },
          take: 1,
          include: { resultado: true },
        },
      },
      orderBy: { criadoEm: "desc" },
    })
    return NextResponse.json(pacientes)
  } catch (e) {
    console.error("Erro ao buscar pacientes:", e)
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { nome, email, dataNascimento, sexo, raca, observacoes } = body
  const sexoNormalizado = normalizarSexo(sexo)

  if (!nome || !email || !dataNascimento || !sexoNormalizado || !raca) {
    return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 })
  }

  const tokenConvite = randomBytes(32).toString("hex")

  const paciente = await prisma.paciente.create({
    data: {
      nutricionistaId: nutriId,
      nome,
      email,
      dataNascimento: new Date(dataNascimento),
      sexo: sexoNormalizado,
      raca,
      observacoes,
      tokenConvite,
    },
  })

  return NextResponse.json({ ok: true, paciente, tokenConvite })
}
