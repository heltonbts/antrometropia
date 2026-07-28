import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionByTipo } from "@/lib/session"

export async function GET(req: NextRequest) {
  const pacienteId = await getSessionByTipo("paciente", req)
  if (!pacienteId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const anamneses = await prisma.anamnese.findMany({
    where: { pacienteId },
    select: {
      id:           true,
      titulo:       true,
      status:       true,
      slug:         true,
      criadoEm:     true,
      preenchidaEm: true,
      perguntas:    true,
      respostas:    true,
    },
    orderBy: { criadoEm: "desc" },
  })
  return NextResponse.json(anamneses)
}
