import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionByTipo } from "@/lib/session"

export async function GET(req: NextRequest) {
  const pacienteId = await getSessionByTipo("paciente", req)
  if (!pacienteId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    include: {
      avaliacoes: {
        orderBy: { dataAvaliacao: "asc" },
        include: { resultado: true },
      },
    },
  })

  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  return NextResponse.json({
    nome: paciente.nome,
    email: paciente.email,
    criadoEm: paciente.criadoEm,
    avaliacoes: paciente.avaliacoes,
  })
}
