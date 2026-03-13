import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { randomBytes } from "crypto"
import { getJwtSecret } from "@/lib/auth"

const SECRET = getJwtSecret()

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

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params

  const paciente = await prisma.paciente.findUnique({
    where: { id, nutricionistaId: nutriId },
  })

  if (!paciente) return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })

  const novoToken = randomBytes(32).toString("hex")

  await prisma.paciente.update({
    where: { id },
    data: { tokenConvite: novoToken, conviteAceito: false },
  })

  return NextResponse.json({ tokenConvite: novoToken })
}
