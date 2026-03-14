import { Prisma } from "@prisma/client"
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
  detalhes?: Prisma.InputJsonValue
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
