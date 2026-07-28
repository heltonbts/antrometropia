import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { getJwtSecret } from "@/lib/auth"

export type SessionUsuario =
  | { id: string; tipo: "nutricionista" }
  | { id: string; tipo: "paciente" }

// Extrai o token do header Authorization (Bearer) ou, se ausente, do cookie.
// Web continua usando cookie httpOnly; o app mobile envia Authorization: Bearer <token>.
async function extrairToken(req?: Request): Promise<string | null> {
  const header = req?.headers.get("authorization")
  if (header?.startsWith("Bearer ")) {
    return header.slice(7).trim()
  }
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value ?? null
}

// Valida o token (Bearer ou cookie) e retorna o usuário da sessão.
// Passe `req` nas rotas para habilitar o app mobile; sem `req` funciona só via cookie (web).
export async function getSessionUsuario(req?: Request): Promise<SessionUsuario | null> {
  const token = await extrairToken(req)

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

export async function getSessionByTipo(
  tipo: SessionUsuario["tipo"],
  req?: Request,
): Promise<string | null> {
  const session = await getSessionUsuario(req)
  if (!session || session.tipo !== tipo) return null
  return session.id
}
