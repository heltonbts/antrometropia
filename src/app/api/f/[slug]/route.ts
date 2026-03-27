import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/f/[slug] — formulário público
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const anamnese = await prisma.anamnese.findUnique({
    where: { slug },
    select: {
      id:        true,
      titulo:    true,
      status:    true,
      perguntas: true,
      paciente:  { select: { nome: true } },
    },
  })
  if (!anamnese) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  return NextResponse.json(anamnese)
}

// POST /api/f/[slug] — submeter respostas
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const anamnese = await prisma.anamnese.findUnique({ where: { slug } })
  if (!anamnese) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  if (anamnese.status === "PREENCHIDA") {
    return NextResponse.json({ erro: "Esta anamnese já foi preenchida" }, { status: 409 })
  }

  const { respostas } = await req.json()

  await prisma.anamnese.update({
    where: { slug },
    data: { respostas, status: "PREENCHIDA", preenchidaEm: new Date() },
  })
  return NextResponse.json({ ok: true })
}
