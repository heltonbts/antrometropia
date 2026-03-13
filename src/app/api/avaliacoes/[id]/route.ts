import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { calcularTudo } from "@/lib/formulas"
import { calcularIdade, normalizarSexo } from "@/lib/utils"
import { getJwtSecret } from "@/lib/auth"

async function getNutriId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
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

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: { resultado: true, paciente: true },
  })

  if (!avaliacao || avaliacao.paciente.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  return NextResponse.json(avaliacao)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { dataAvaliacao, peso, altura, formulaReferencia: formulaEscolha, ...resto } = body

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: { paciente: true },
  })

  if (!avaliacao || avaliacao.paciente.nutricionistaId !== nutriId) {
    return NextResponse.json({ erro: "Não encontrado" }, { status: 404 })
  }

  const paciente = avaliacao.paciente
  const idade = calcularIdade(paciente.dataNascimento)
  const sexo = normalizarSexo(typeof resto.sexoConfirmado === "string" ? resto.sexoConfirmado : paciente.sexo)

  if (!sexo) {
    return NextResponse.json({ erro: "Sexo inválido para os cálculos" }, { status: 400 })
  }

  const n = (v: unknown) => (v !== undefined && v !== null && v !== "" ? Number(v) : null)
  const dobraSupraIliaca = n(resto.dobCristaIliaca) ?? n(resto.dobSupraIliaca)

  if (formulaEscolha === "petroski") {
    const obrigatorios = [
      n(resto.dobTricipital),
      n(resto.dobSubescapular),
      dobraSupraIliaca,
      n(resto.dobPanturrilha),
    ]
    if (obrigatorios.some((v) => v === null)) {
      return NextResponse.json(
        { erro: "Petroski exige: Tricipital, Subescapular, Crista Ilíaca e Panturrilha" },
        { status: 400 }
      )
    }
  }

  // Atualiza a avaliação
  await prisma.avaliacao.update({
    where: { id },
    data: {
      dataAvaliacao: new Date(dataAvaliacao),
      peso: Number(peso),
      altura: Number(altura),
      dobTricipital:   n(resto.dobTricipital),
      dobSubescapular: n(resto.dobSubescapular),
      dobBicipital:    n(resto.dobBicipital),
      dobAxilarMedia:  null,
      dobSupraIliaca:  dobraSupraIliaca,
      dobCristaIliaca: dobraSupraIliaca,
      dobSupraespinal: n(resto.dobSupraespinal),
      dobAbdominal:    n(resto.dobAbdominal),
      dobCoxa:         n(resto.dobCoxa),
      dobPanturrilha:  n(resto.dobPanturrilha),
      circCintura:        n(resto.circCintura),
      circQuadril:        n(resto.circQuadril),
      circBracoRelaxado:  n(resto.circBracoRelaxado),
      circBracoContraido: n(resto.circBracoContraido),
      circPanturrilha:    n(resto.circPanturrilha),
      circCoxaMedia:      n(resto.circCoxaMedia),
      circAbdomen:        n(resto.circAbdomen),
      diamUmero:       n(resto.diamUmero),
      diamFemur:       n(resto.diamFemur),
      diamPunho:       n(resto.diamPunho),
      diamFemurDistal: n(resto.diamFemurDistal),
      alturaJoelho: n(resto.alturaJoelho),
      pcse:         n(resto.pcse),
    },
  })

  // Recalcula resultados
  const resultado = calcularTudo({
    peso: Number(peso),
    altura: Number(altura),
    idade,
    sexo,
    raca: paciente.raca as "branco" | "negro" | "asiatico",
    formulaReferencia: formulaEscolha,
    dobTricipital:   n(resto.dobTricipital) ?? undefined,
    dobSubescapular: n(resto.dobSubescapular) ?? undefined,
    dobBicipital:    n(resto.dobBicipital) ?? undefined,
    dobSupraIliaca:  dobraSupraIliaca ?? undefined,
    dobCristaIliaca: dobraSupraIliaca ?? undefined,
    dobSupraespinal: n(resto.dobSupraespinal) ?? undefined,
    dobAbdominal:    n(resto.dobAbdominal) ?? undefined,
    dobCoxa:         n(resto.dobCoxa) ?? undefined,
    dobPanturrilha:  n(resto.dobPanturrilha) ?? undefined,
    circCintura:        n(resto.circCintura) ?? undefined,
    circQuadril:        n(resto.circQuadril) ?? undefined,
    circBracoRelaxado:  n(resto.circBracoRelaxado) ?? undefined,
    circBracoContraido: n(resto.circBracoContraido) ?? undefined,
    circPanturrilha:    n(resto.circPanturrilha) ?? undefined,
    circCoxaMedia:      n(resto.circCoxaMedia) ?? undefined,
    circAbdomen:        n(resto.circAbdomen) ?? undefined,
    diamUmero:       n(resto.diamUmero) ?? undefined,
    diamFemur:       n(resto.diamFemur) ?? undefined,
    diamPunho:       n(resto.diamPunho) ?? undefined,
    diamFemurDistal: n(resto.diamFemurDistal) ?? undefined,
    alturaJoelho: n(resto.alturaJoelho) ?? undefined,
    pcse:         n(resto.pcse) ?? undefined,
  })

  await prisma.resultado.upsert({
    where: { avaliacaoId: id },
    update: {
      imc: resultado.imc,
      classificacaoImc: resultado.classificacaoImc,
      percGorduraFaulkner: resultado.percGorduraFaulkner,
      percGorduraPetroski: resultado.percGorduraPetroski,
      densidadeCorporal: resultado.densidadeCorporal,
      massaGorda: resultado.massaGorda,
      massaMagra: resultado.massaMagra,
      massaOssea: resultado.massaOssea,
      massaMuscular: resultado.massaMuscular,
      endomorfia: resultado.endomorfia,
      mesomorfia: resultado.mesomorfia,
      ectomorfia: resultado.ectomorfia,
      somatocartaX: resultado.somatocartaX,
      somatocartaY: resultado.somatocartaY,
      biotipo: resultado.biotipo,
      rcq: resultado.rcq,
      classificacaoRcq: resultado.classificacaoRcq,
      riscoCintura: resultado.riscoCintura,
      cmb: resultado.cmb,
      cmc: resultado.cmc,
      soma6Dobras: resultado.soma6Dobras,
      classificacao6Dobras: resultado.classificacao6Dobras,
      cpRisco: resultado.cpRisco,
      somaTodasDobras: resultado.somaTodasDobras,
      formulaReferencia: formulaEscolha ?? "petroski",
    },
    create: {
      avaliacaoId: id,
      imc: resultado.imc,
      classificacaoImc: resultado.classificacaoImc,
      percGorduraFaulkner: resultado.percGorduraFaulkner,
      percGorduraPetroski: resultado.percGorduraPetroski,
      densidadeCorporal: resultado.densidadeCorporal,
      massaGorda: resultado.massaGorda,
      massaMagra: resultado.massaMagra,
      massaOssea: resultado.massaOssea,
      massaMuscular: resultado.massaMuscular,
      endomorfia: resultado.endomorfia,
      mesomorfia: resultado.mesomorfia,
      ectomorfia: resultado.ectomorfia,
      somatocartaX: resultado.somatocartaX,
      somatocartaY: resultado.somatocartaY,
      biotipo: resultado.biotipo,
      rcq: resultado.rcq,
      classificacaoRcq: resultado.classificacaoRcq,
      riscoCintura: resultado.riscoCintura,
      cmb: resultado.cmb,
      cmc: resultado.cmc,
      soma6Dobras: resultado.soma6Dobras,
      classificacao6Dobras: resultado.classificacao6Dobras,
      cpRisco: resultado.cpRisco,
      somaTodasDobras: resultado.somaTodasDobras,
      formulaReferencia: formulaEscolha ?? "petroski",
    },
  })

  return NextResponse.json({ ok: true, avaliacaoId: id })
}
