import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUsuario } from "@/lib/session"
import { registrarAuditoria } from "@/lib/audit"

export async function GET() {
  const session = await getSessionUsuario()

  if (!session) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  if (session.tipo === "nutricionista") {
    const nutricionista = await prisma.nutricionista.findUnique({
      where: { id: session.id },
      include: {
        pacientes: {
          include: {
            avaliacoes: {
              include: { resultado: true },
              orderBy: { dataAvaliacao: "asc" },
            },
          },
          orderBy: { criadoEm: "asc" },
        },
      },
    })

    if (!nutricionista) {
      return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 })
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { actorId: session.id, actorTipo: session.tipo },
      orderBy: { criadoEm: "asc" },
    })

    await registrarAuditoria({
      actorId: session.id,
      actorTipo: session.tipo,
      acao: "lgpd_exportacao",
      detalhes: { escopo: "conta_nutricionista" },
    })

    const payload = {
      exportadoEm: new Date().toISOString(),
      tipo: "nutricionista",
      conta: nutricionista,
      auditoria: auditLogs,
    }

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="nutrieval-export-nutricionista-${session.id}.json"`,
      },
    })
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id: session.id },
    include: {
      nutricionista: {
        select: { id: true, nome: true, email: true },
      },
      avaliacoes: {
        include: { resultado: true },
        orderBy: { dataAvaliacao: "asc" },
      },
    },
  })

  if (!paciente) {
    return NextResponse.json({ erro: "Conta não encontrada" }, { status: 404 })
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { actorId: session.id, actorTipo: session.tipo },
    orderBy: { criadoEm: "asc" },
  })

  await registrarAuditoria({
    actorId: session.id,
    actorTipo: session.tipo,
    acao: "lgpd_exportacao",
    detalhes: { escopo: "conta_paciente" },
  })

  const payload = {
    exportadoEm: new Date().toISOString(),
    tipo: "paciente",
    conta: paciente,
    auditoria: auditLogs,
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="nutrieval-export-paciente-${session.id}.json"`,
    },
  })
}
