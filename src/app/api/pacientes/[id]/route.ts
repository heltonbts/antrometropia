import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"

async function getNutriId(): Promise<string | null> {
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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const paciente = await prisma.paciente.findUnique({
    where: { id, nutricionistaId: nutriId },
    include: {
      avaliacoes: {
        orderBy: { dataAvaliacao: "asc" },
        include: { resultado: true },
      },
    },
  })

  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  return NextResponse.json(paciente)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ erro: "Body inválido" }, { status: 400 })

  const { sexo } = body
  if (sexo !== undefined && sexo !== "M" && sexo !== "F") {
    return NextResponse.json({ erro: "Sexo inválido" }, { status: 400 })
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id, nutricionistaId: nutriId },
    select: { id: true },
  })
  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  const atualizado = await prisma.paciente.update({
    where: { id },
    data: { ...(sexo !== undefined && { sexo }) },
  })

  return NextResponse.json(atualizado)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const paciente = await prisma.paciente.findUnique({
    where: { id, nutricionistaId: nutriId },
    select: { id: true },
  })
  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    await tx.resultado.deleteMany({
      where: { avaliacao: { pacienteId: id } },
    })
    await tx.avaliacao.deleteMany({ where: { pacienteId: id } })
    await tx.anamnese.deleteMany({ where: { pacienteId: id } })
    await tx.lancamento.deleteMany({ where: { pacienteId: id } })
    await tx.consulta.deleteMany({ where: { pacienteId: id } })
    await tx.paciente.delete({ where: { id } })
  })

  return new NextResponse(null, { status: 204 })
}
