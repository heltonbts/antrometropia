import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(process.env.APP_SECRET || "secret")

async function getNutriId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    if (payload.tipo !== "nutricionista") return null
    return payload.id as string
  } catch {
    return null
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const paciente = await prisma.paciente.findUnique({
    where: { id, nutricionistaId: nutriId },
    include: {
      avaliacoes: {
        orderBy: { dataAvaliacao: "asc" },
        include: { resultado: true },
      },
    },
  })

  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  return NextResponse.json(paciente)
}
