import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get("stripe-signature")

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ erro: "Assinatura inválida" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode !== "subscription") return NextResponse.json({ ok: true })

    const nutricionistaId = session.metadata?.nutricionistaId
    if (!nutricionistaId) return NextResponse.json({ ok: true })

    await prisma.nutricionista.update({
      where: { id: nutricionistaId },
      data: {
        plano: "PRO",
        stripeSubscriptionId: session.subscription as string,
        assinaturaStatus: "ACTIVE",
      },
    })
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription
    await prisma.nutricionista.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: { plano: "FREE", assinaturaStatus: "CANCELLED" },
    })
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
    if (!invoice.subscription) return NextResponse.json({ ok: true })
    await prisma.nutricionista.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { assinaturaStatus: "ACTIVE" },
    })
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string }
    if (!invoice.subscription) return NextResponse.json({ ok: true })
    await prisma.nutricionista.updateMany({
      where: { stripeSubscriptionId: invoice.subscription },
      data: { assinaturaStatus: "PAST_DUE" },
    })
  }

  return NextResponse.json({ ok: true })
}
