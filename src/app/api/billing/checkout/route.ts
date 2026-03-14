import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUsuario } from "@/lib/session"
import { criarCheckoutAssinatura, criarOuBuscarCliente } from "@/lib/abacatepay"

export async function POST() {
  const session = await getSessionUsuario()
  if (!session || session.tipo !== "nutricionista") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  const nutri = await prisma.nutricionista.findUnique({
    where: { id: session.id },
    select: { id: true, nome: true, email: true, plano: true, abacateCustomerId: true },
  })

  if (!nutri) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 })
  if (nutri.plano === "PRO") {
    return NextResponse.json({ erro: "Você já tem o plano Pro" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  // Cria ou reutiliza o cliente no AbacatePay
  let customerId = nutri.abacateCustomerId
  if (!customerId) {
    const resp = await criarOuBuscarCliente({ email: nutri.email, name: nutri.nome })
    customerId = resp.data.id
    await prisma.nutricionista.update({
      where: { id: nutri.id },
      data: { abacateCustomerId: customerId },
    })
  }

  if (!customerId) {
    return NextResponse.json({ erro: "Não foi possível criar o cliente no AbacatePay" }, { status: 500 })
  }

  // Cria o checkout de assinatura
  const checkout = await criarCheckoutAssinatura({
    customerId,
    externalId: nutri.id,
    returnUrl: `${appUrl}/conta`,
    completionUrl: `${appUrl}/conta?upgraded=true`,
  })

  return NextResponse.json({ checkoutUrl: checkout.data.url })
}
