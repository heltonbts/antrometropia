import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.APP_SECRET || "secret")

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  let pacienteId: string
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (payload.tipo !== "paciente") return NextResponse.json({ erro: "Acesso negado" }, { status: 403 })
    pacienteId = payload.id as string
  } catch {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 })
  }

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

  return NextResponse.json({ nome: paciente.nome, avaliacoes: paciente.avaliacoes })
}
