import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"

export type SessionUsuario =
  | { id: string; tipo: "nutricionista" }
  | { id: string; tipo: "paciente" }

export async function getSessionUsuario(): Promise<SessionUsuario | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())

    if (payload.tipo !== "nutricionista" && payload.tipo !== "paciente") {
      return null
    }

    if (typeof payload.id !== "string") {
      return null
    }

    return { id: payload.id, tipo: payload.tipo }
  } catch {
    return null
  }
}

export async function getSessionByTipo(tipo: SessionUsuario["tipo"]): Promise<string | null> {
  const session = await getSessionUsuario()
  if (!session || session.tipo !== tipo) return null
  return session.id
}
