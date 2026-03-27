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

// PATCH /api/financeiro/[id] — atualizar status ou dados
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.lancamento.findUnique({ where: { id } })
  if (!existing || existing.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  const { status, formaPagamento } = body

  const lancamento = await prisma.lancamento.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(formaPagamento !== undefined ? { formaPagamento } : {}),
      ...(status === "PAGO" ? { dataPagamento: new Date() } : {}),
      ...(status === "PENDENTE" ? { dataPagamento: null } : {}),
    },
    include: { paciente: { select: { id: true, nome: true } } },
  })

  return NextResponse.json(lancamento)
}

// DELETE /api/financeiro/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const existing = await prisma.lancamento.findUnique({ where: { id } })
  if (!existing || existing.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  await prisma.lancamento.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
