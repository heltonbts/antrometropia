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

// PATCH /api/agenda/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.consulta.findUnique({ where: { id } })
  if (!existing || existing.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  const body = await req.json()
  const { status, titulo, inicio, fim, pacienteId, observacoes } = body

  const consulta = await prisma.consulta.update({
    where: { id },
    data: {
      ...(status      !== undefined ? { status }      : {}),
      ...(titulo      !== undefined ? { titulo }      : {}),
      ...(inicio      !== undefined ? { inicio: new Date(inicio) } : {}),
      ...(fim         !== undefined ? { fim:    new Date(fim) }    : {}),
      ...(pacienteId  !== undefined ? { pacienteId: pacienteId || null } : {}),
      ...(observacoes !== undefined ? { observacoes: observacoes || null } : {}),
    },
    include: {
      paciente:   { select: { id: true, nome: true } },
      lancamento: { select: { id: true, status: true, valor: true } },
    },
  })

  return NextResponse.json(consulta)
}

// DELETE /api/agenda/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const existing = await prisma.consulta.findUnique({ where: { id } })
  if (!existing || existing.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  // Remove lançamento vinculado primeiro (FK)
  await prisma.lancamento.deleteMany({ where: { consultaId: id } })
  await prisma.consulta.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
