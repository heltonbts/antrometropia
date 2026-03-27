import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"
import { MODELOS_PADRAO } from "@/lib/modelos-padrao"

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

// GET /api/anamnese/modelos — lista modelos do nutri + padrão
export async function GET() {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  try {
    const existentes = await prisma.modeloAnamnese.findMany({
      where: { nutricionistaId: nutriId },
      orderBy: { criadoEm: "asc" },
    })

    if (!existentes.some((m) => m.padrao)) {
      for (const m of MODELOS_PADRAO) {
        await prisma.modeloAnamnese.create({
          data: {
            nutricionistaId: nutriId,
            nome:       m.nome,
            descricao:  m.descricao,
            perguntas:  m.perguntas as any,
            padrao:     true,
          },
        })
      }
      const todos = await prisma.modeloAnamnese.findMany({
        where: { nutricionistaId: nutriId },
        orderBy: { criadoEm: "asc" },
      })
      return NextResponse.json(todos)
    }

    return NextResponse.json(existentes)
  } catch (e: any) {
    console.error("[GET /api/anamnese/modelos]", e?.message)
    return NextResponse.json({ erro: e?.message ?? "Erro interno" }, { status: 500 })
  }
}

// POST /api/anamnese/modelos — criar novo modelo
export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  try {
    const { nome, descricao, perguntas } = await req.json()
    if (!nome) return NextResponse.json({ erro: "Nome obrigatório" }, { status: 400 })

    const modelo = await prisma.modeloAnamnese.create({
      data: { nutricionistaId: nutriId, nome, descricao: descricao || null, perguntas: perguntas ?? [] },
    })
    return NextResponse.json(modelo, { status: 201 })
  } catch (e: any) {
    console.error("[POST /api/anamnese/modelos]", e?.message)
    return NextResponse.json({ erro: e?.message ?? "Erro interno" }, { status: 500 })
  }
}
