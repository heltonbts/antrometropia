import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { calcularTudo } from "@/lib/formulas"
import { calcularIdade, normalizarSexo } from "@/lib/utils"
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

export async function POST(req: NextRequest) {
  const nutriId = await getNutriId()
  if (!nutriId) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 })

  const body = await req.json()
  const { pacienteId, dataAvaliacao, peso, altura, formulaReferencia: formulaEscolha, ...resto } = body

  if (!pacienteId || !peso || !altura) {
    return NextResponse.json({ erro: "Dados obrigatórios ausentes" }, { status: 400 })
  }

  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId, nutricionistaId: nutriId },
  })
  if (!paciente) return NextResponse.json({ erro: "Paciente não encontrado" }, { status: 404 })

  const idade = calcularIdade(paciente.dataNascimento)
  const sexo = normalizarSexo(typeof resto.sexoConfirmado === "string" ? resto.sexoConfirmado : paciente.sexo)

  if (!sexo) {
    return NextResponse.json({ erro: "Sexo do paciente inválido para os cálculos" }, { status: 400 })
  }

  const n = (v: unknown) => (v !== undefined && v !== null && v !== "" ? Number(v) : null)
  const dobraSupraIliaca = n(resto.dobCristaIliaca) ?? n(resto.dobSupraIliaca)
  const obrigatoriosPetroski =
    sexo === "M"
      ? [
          ["dobTricipital", n(resto.dobTricipital)],
          ["dobSubescapular", n(resto.dobSubescapular)],
          ["dobCristaIliaca", dobraSupraIliaca],
          ["dobPanturrilha", n(resto.dobPanturrilha)],
        ]
      : [
          ["dobTricipital", n(resto.dobTricipital)],
          ["dobSubescapular", n(resto.dobSubescapular)],
          ["dobCristaIliaca", dobraSupraIliaca],
          ["dobPanturrilha", n(resto.dobPanturrilha)],
        ]

  if (formulaEscolha === "petroski") {
    const faltantes = obrigatoriosPetroski
      .filter(([, valor]) => valor === null)
      .map(([campo]) => campo)

    if (faltantes.length > 0) {
      return NextResponse.json(
        { erro: `Dados obrigatórios ausentes para Petroski (${sexo === "M" ? "masculino" : "feminino"}): ${faltantes.join(", ")}` },
        { status: 400 }
      )
    }
  }

  const avaliacao = await prisma.avaliacao.create({
    data: {
      pacienteId,
      dataAvaliacao: new Date(dataAvaliacao),
      peso: Number(peso),
      altura: Number(altura),
      // Dobras cutâneas
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
      // Circunferências
      circCintura:        n(resto.circCintura),
      circQuadril:        n(resto.circQuadril),
      circBracoRelaxado:  n(resto.circBracoRelaxado),
      circBracoContraido: n(resto.circBracoContraido),
      circPanturrilha:    n(resto.circPanturrilha),
      circCoxaMedia:      n(resto.circCoxaMedia),
      circAbdomen:        n(resto.circAbdomen),
      // Diâmetros
      diamUmero:       n(resto.diamUmero),
      diamFemur:       n(resto.diamFemur),
      diamPunho:       n(resto.diamPunho),
      diamFemurDistal: n(resto.diamFemurDistal),
      // Idosos
      alturaJoelho: n(resto.alturaJoelho),
      pcse:         n(resto.pcse),
    },
  })

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

  await prisma.resultado.create({
    data: {
      avaliacaoId: avaliacao.id,
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

  return NextResponse.json({ ok: true, avaliacaoId: avaliacao.id })
}
