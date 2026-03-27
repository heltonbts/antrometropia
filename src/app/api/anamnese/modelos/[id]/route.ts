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

async function getModelo(id: string, nutriId: string) {
  const m = await prisma.modeloAnamnese.findUnique({ where: { id } })
  if (!m || m.nutricionistaId !== nutriId) return null
  return m
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const modelo = await getModelo(id, nutriId)
  if (!modelo) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  return NextResponse.json(modelo)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const modelo = await getModelo(id, nutriId)
  if (!modelo) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  const { nome, descricao, perguntas } = await req.json()
  const atualizado = await prisma.modeloAnamnese.update({
    where: { id },
    data: {
      ...(nome      !== undefined ? { nome }      : {}),
      ...(descricao !== undefined ? { descricao } : {}),
      ...(perguntas !== undefined ? { perguntas } : {}),
    },
  })
  return NextResponse.json(atualizado)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  const { id } = await params
  const modelo = await getModelo(id, nutriId)
  if (!modelo) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  await prisma.modeloAnamnese.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
