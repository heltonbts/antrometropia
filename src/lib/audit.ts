import { prisma } from "@/lib/prisma"

export async function registrarAuditoria({
  actorId,
  actorTipo,
  acao,
  detalhes,
}: {
  actorId: string
  actorTipo: "nutricionista" | "paciente"
  acao: string
  detalhes?: Record<string, unknown>
}) {
  await prisma.auditLog.create({
    data: {
      actorId,
      actorTipo,
      acao,
      detalhes,
    },
  })
}
