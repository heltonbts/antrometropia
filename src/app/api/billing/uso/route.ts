import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUsuario } from "@/lib/session"

export const LIMITE_FREE = 5

export async function GET() {
  const session = await getSessionUsuario()
  if (!session || session.tipo !== "nutricionista") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  const [nutri, totalPacientes] = await Promise.all([
    prisma.nutricionista.findUnique({
      where: { id: session.id },
      select: { plano: true, assinaturaStatus: true },
    }),
    prisma.paciente.count({ where: { nutricionistaId: session.id } }),
  ])

  if (!nutri) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  return NextResponse.json({
    plano: nutri.plano,
    assinaturaStatus: nutri.assinaturaStatus,
    totalPacientes,
    limite: nutri.plano === "PRO" ? null : LIMITE_FREE,
  })
}
