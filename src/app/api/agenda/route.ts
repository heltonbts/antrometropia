import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"

async function getNutriId() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.tipo !== "nutricionista") return null
    return payload.id as string
  } catch {
    return null
  }
}

// GET /api/agenda?inicio=2025-01-01&fim=2025-01-31
export async function GET(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const inicio = req.nextUrl.searchParams.get("inicio")
  const fim    = req.nextUrl.searchParams.get("fim")

  const consultas = await prisma.consulta.findMany({
    where: {
      nutricionistaId: nutriId,
      ...(inicio && fim ? {
        inicio: { gte: new Date(inicio) },
        fim:    { lte: new Date(fim) },
      } : {}),
    },
    include: {
      paciente:   { select: { id: true, nome: true } },
      lancamento: { select: { id: true, status: true, valor: true } },
    },
    orderBy: { inicio: "asc" },
  })

  return NextResponse.json(consultas)
}

// POST /api/agenda
export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { titulo, inicio, fim, pacienteId, observacoes, gerarLancamento, valorLancamento, formaPagamento } = body

  if (!titulo || !inicio || !fim) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 })
  }

  const consulta = await prisma.consulta.create({
    data: {
      nutricionistaId: nutriId,
      titulo,
      inicio: new Date(inicio),
      fim:    new Date(fim),
      pacienteId: pacienteId || null,
      observacoes: observacoes || null,
      status: "AGENDADA",
    },
    include: {
      paciente:   { select: { id: true, nome: true } },
      lancamento: { select: { id: true, status: true, valor: true } },
    },
  })

  // Gerar lançamento vinculado se solicitado
  if (gerarLancamento && valorLancamento) {
    const lancamento = await prisma.lancamento.create({
      data: {
        nutricionistaId: nutriId,
        pacienteId: pacienteId || null,
        descricao: titulo,
        valor: Number(valorLancamento),
        dataVencimento: new Date(inicio),
        formaPagamento: formaPagamento || null,
        status: "PENDENTE",
        consultaId: consulta.id,
      },
    })
    const consultaAtualizada = await prisma.consulta.findUnique({
      where: { id: consulta.id },
      include: {
        paciente:   { select: { id: true, nome: true } },
        lancamento: { select: { id: true, status: true, valor: true } },
      },
    })
    return NextResponse.json(consultaAtualizada, { status: 201 })
  }

  return NextResponse.json(consulta, { status: 201 })
}
