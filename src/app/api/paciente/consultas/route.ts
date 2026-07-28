import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionByTipo } from "@/lib/session"

// GET /api/paciente/consultas
// Agendamentos do próprio paciente autenticado (Bearer ou cookie).
export async function GET(req: NextRequest) {
  const pacienteId = await getSessionByTipo("paciente", req)
  if (!pacienteId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const consultas = await prisma.consulta.findMany({
    where: { pacienteId },
    select: {
      id:          true,
      titulo:      true,
      inicio:      true,
      fim:         true,
      status:      true,
      observacoes: true,
      nutricionista: { select: { nome: true } },
    },
    orderBy: { inicio: "desc" },
  })

  return NextResponse.json(consultas)
}
