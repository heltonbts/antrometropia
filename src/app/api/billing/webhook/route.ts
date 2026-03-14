import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createHmac } from "crypto"

type SubscriptionEvent = {
  event: string
  data: {
    billing?: {
      id: string
      customer?: { id: string }
      products?: Array<{ id?: string; externalId?: string }>
      status?: string
    }
  }
}

function validarAssinatura(rawBody: string, signature: string | null): boolean {
  const secret = process.env.ABACATEPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex")
  return expected === signature
}

export async function POST(req: NextRequest) {
  // Valida secret na query string
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })
  }

  const rawBody = await req.text()

  // Valida assinatura HMAC (opcional mas recomendado)
  const signature = req.headers.get("x-webhook-signature")
  if (signature && !validarAssinatura(rawBody, signature)) {
    return NextResponse.json({ erro: "Assinatura inválida" }, { status: 401 })
  }

  let payload: SubscriptionEvent
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ erro: "Payload inválido" }, { status: 400 })
  }

  const { event, data } = payload

  // Na v1 o webhook de cobrança não devolve externalId de forma confiável.
  // O vínculo é recuperado pelo customerId já salvo no banco.
  const customerId = data.billing?.customer?.id
  const billingId = data.billing?.id
  const nutricionista = customerId
    ? await prisma.nutricionista.findFirst({
        where: { abacateCustomerId: customerId },
        select: { id: true },
      })
    : null
  const nutricionistaId = nutricionista?.id
  if (!nutricionistaId) {
    return NextResponse.json({ ok: true }) // evento sem referência, ignorar
  }

  if (event === "billing.paid") {
    await prisma.nutricionista.update({
      where: { id: nutricionistaId },
      data: {
        plano: "PRO",
        assinaturaId: billingId,
        assinaturaStatus: "PAID",
      },
    })
  }

  return NextResponse.json({ ok: true })
}
