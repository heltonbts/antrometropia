import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { getSessionUsuario } from "@/lib/session"

export async function POST() {
  const session = await getSessionUsuario()
  if (!session || session.tipo !== "nutricionista") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  const nutri = await prisma.nutricionista.findUnique({
    where: { id: session.id },
    select: { id: true, nome: true, email: true, plano: true, stripeCustomerId: true },
  })

  if (!nutri) return NextResponse.json({ erro: "Usuário não encontrado" }, { status: 404 })
  if (nutri.plano === "PRO") {
    return NextResponse.json({ erro: "Você já tem o plano Pro" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  // Cria ou reutiliza o cliente no Stripe
  let customerId = nutri.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: nutri.email,
      name: nutri.nome,
      metadata: { nutricionistaId: nutri.id },
    })
    customerId = customer.id
    await prisma.nutricionista.update({
      where: { id: nutri.id },
      data: { stripeCustomerId: customerId },
    })
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${appUrl}/conta?upgraded=true`,
    cancel_url: `${appUrl}/conta`,
    metadata: { nutricionistaId: nutri.id },
  })

  return NextResponse.json({ checkoutUrl: checkoutSession.url })
}
