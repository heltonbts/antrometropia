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

// GET /api/financeiro?mes=2025-01
export async function GET(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const mes = req.nextUrl.searchParams.get("mes") // formato: "2025-01"

  let inicio: Date | undefined
  let fim: Date | undefined
  if (mes) {
    const [ano, m] = mes.split("-").map(Number)
    inicio = new Date(ano, m - 1, 1)
    fim = new Date(ano, m, 1)
  }

  const lancamentos = await prisma.lancamento.findMany({
    where: {
      nutricionistaId: nutriId,
      ...(inicio && fim ? { dataVencimento: { gte: inicio, lt: fim } } : {}),
    },
    include: { paciente: { select: { id: true, nome: true } } },
    orderBy: { dataVencimento: "desc" },
  })

  return NextResponse.json(lancamentos)
}

// POST /api/financeiro
export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { descricao, valor, dataVencimento, pacienteId, formaPagamento, status } = body

  if (!descricao || valor == null || !dataVencimento) {
    return NextResponse.json({ erro: "Campos obrigatórios ausentes" }, { status: 400 })
  }

  const lancamento = await prisma.lancamento.create({
    data: {
      nutricionistaId: nutriId,
      descricao,
      valor: Number(valor),
      dataVencimento: new Date(dataVencimento),
      pacienteId: pacienteId || null,
      formaPagamento: formaPagamento || null,
      status: status || "PENDENTE",
      dataPagamento: status === "PAGO" ? new Date() : null,
    },
    include: { paciente: { select: { id: true, nome: true } } },
  })

  return NextResponse.json(lancamento, { status: 201 })
}
