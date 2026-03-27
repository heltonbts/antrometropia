import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"
import { randomBytes } from "crypto"

async function getNutriId() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.tipo !== "nutricionista") return null
    return payload.id as string
  } catch { return null }
}

// GET /api/anamnese — lista anamneses enviadas
export async function GET() {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const anamneses = await prisma.anamnese.findMany({
    where: { nutricionistaId: nutriId },
    include: {
      paciente: { select: { id: true, nome: true } },
      modelo:   { select: { id: true, nome: true } },
    },
    orderBy: { criadoEm: "desc" },
  })
  return NextResponse.json(anamneses)
}

// POST /api/anamnese — enviar anamnese (gera link)
export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { modeloId, pacienteId, titulo } = await req.json()
  if (!modeloId) return NextResponse.json({ erro: "Modelo obrigatório" }, { status: 400 })

  const modelo = await prisma.modeloAnamnese.findUnique({ where: { id: modeloId } })
  if (!modelo || modelo.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Modelo não encontrado" }, { status: 404 })
  }

  const slug = randomBytes(8).toString("hex")

  const anamnese = await prisma.anamnese.create({
    data: {
      nutricionistaId: nutriId,
      pacienteId:      pacienteId || null,
      modeloId,
      slug,
      titulo:    titulo || modelo.nome,
      perguntas: modelo.perguntas as any,
      status:    "PENDENTE",
    },
    include: {
      paciente: { select: { id: true, nome: true } },
      modelo:   { select: { id: true, nome: true } },
    },
  })
  return NextResponse.json(anamnese, { status: 201 })
}
