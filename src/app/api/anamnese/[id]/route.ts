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
  } catch { return null }
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const anamnese = await prisma.anamnese.findUnique({
    where: { id },
    include: { paciente: { select: { id: true, nome: true } }, modelo: { select: { id: true, nome: true } } },
  })
  if (!anamnese || anamnese.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }
  return NextResponse.json(anamnese)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const anamnese = await prisma.anamnese.findUnique({ where: { id } })
  if (!anamnese || anamnese.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }
  await prisma.anamnese.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
