import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getSessionUsuario } from "@/lib/session"
import { registrarAuditoria } from "@/lib/audit"

export async function DELETE() {
  const session = await getSessionUsuario()

  if (!session) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  await registrarAuditoria({
    actorId: session.id,
    actorTipo: session.tipo,
    acao: "lgpd_exclusao_solicitada",
    detalhes: { escopo: session.tipo === "nutricionista" ? "conta_nutricionista" : "conta_paciente" },
  })

  if (session.tipo === "nutricionista") {
    await prisma.$transaction(async (tx) => {
      await tx.resultado.deleteMany({
        where: {
          avaliacao: {
            paciente: {
              nutricionistaId: session.id,
            },
          },
        },
      })

      await tx.avaliacao.deleteMany({
        where: {
          paciente: {
            nutricionistaId: session.id,
          },
        },
      })

      await tx.paciente.deleteMany({
        where: { nutricionistaId: session.id },
      })

      await tx.nutricionista.delete({
        where: { id: session.id },
      })
    })
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.resultado.deleteMany({
        where: {
          avaliacao: {
            pacienteId: session.id,
          },
        },
      })

      await tx.avaliacao.deleteMany({
        where: { pacienteId: session.id },
      })

      await tx.paciente.delete({
        where: { id: session.id },
      })
    })
  }

  const res = NextResponse.json({ ok: true })
  clearAuthCookie(res)
  return res
}
