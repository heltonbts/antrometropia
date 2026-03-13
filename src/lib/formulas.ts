import { normalizarSexo } from "@/lib/utils"

// ============================================================
// TODAS AS FÓRMULAS DE AVALIAÇÃO FÍSICA
// NOTAS DE CAMPO:
//   dobSupraespinal = supraespinal — usada em Faulkner e Heath-Carter
//   dobSupraIliaca / dobCristaIliaca = mesma dobra no fluxo atual
// ============================================================

export interface DadosAvaliacao {
  peso: number
  altura: number      // cm
  idade: number
  sexo: "M" | "F"
  raca?: "branco" | "negro" | "asiatico"
  formulaReferencia?: "petroski" | "faulkner"

  // Dobras cutâneas (mm)
  dobTricipital?: number
  dobSubescapular?: number
  dobBicipital?: number
  dobSupraIliaca?: number
  dobCristaIliaca?: number
  dobSupraespinal?: number  // supraespinal — Faulkner e Heath-Carter
  dobAbdominal?: number
  dobCoxa?: number
  dobPanturrilha?: number

  // Circunferências (cm)
  circCintura?: number
  circQuadril?: number
  circBracoRelaxado?: number
  circBracoContraido?: number
  circPanturrilha?: number
  circCoxaMedia?: number
  circAbdomen?: number

  // Diâmetros ósseos (cm)
  diamUmero?: number
  diamFemur?: number
  diamPunho?: number
  diamFemurDistal?: number

  // Idosos
  alturaJoelho?: number
  pcse?: number
}

export interface ResultadoFormulas {
  imc: number | null
  classificacaoImc: string | null
  percGorduraFaulkner: number | null
  percGorduraPetroski: number | null
  densidadeCorporal: number | null
  massaGorda: number | null
  massaMagra: number | null
  massaOssea: number | null
  massaMuscular: number | null
  endomorfia: number | null
  mesomorfia: number | null
  ectomorfia: number | null
  somatocartaX: number | null
  somatocartaY: number | null
  biotipo: string | null
  rcq: number | null
  classificacaoRcq: string | null
  riscoCintura: string | null
  cmb: number | null
  cmc: number | null
  soma6Dobras: number | null
  classificacao6Dobras: string | null
  cpRisco: string | null
  formulaReferencia: string | null
}

function temNumero(valor: number | null | undefined): valor is number {
  return typeof valor === "number" && !Number.isNaN(valor)
}

// ------------------------------------------------------------
// 1. IMC
// ------------------------------------------------------------
export function calcularIMC(peso: number, alturaCm: number): number {
  const alturaM = alturaCm / 100
  return peso / (alturaM * alturaM)
}

export function classificarIMC(imc: number, idade: number): string {
  if (idade >= 60) {
    if (imc < 22) return "Baixo peso"
    if (imc <= 27) return "Eutrofia"
    return "Sobrepeso"
  }
  if (imc < 18.5) return "Abaixo do peso"
  if (imc < 25) return "Peso normal"
  if (imc < 30) return "Sobrepeso"
  if (imc < 35) return "Obesidade Grau I"
  if (imc < 40) return "Obesidade Grau II"
  return "Obesidade Grau III"
}

// ------------------------------------------------------------
// 2. FAULKNER
//    Tricipital + Subescapular + Suprailíaca + Abdominal
// ------------------------------------------------------------
export function calcularFaulkner(
  tricipital: number,
  subescapular: number,
  suprailíaca: number,
  abdominal: number
): number {
  const soma = tricipital + subescapular + suprailíaca + abdominal
  return soma * 0.153 + 5.783
}

// ------------------------------------------------------------
// 3. PETROSKI (1995) + SIRI (1961)
//    Homens: Subescapular + Tricipital + Supra-ilíaca + Panturrilha
//    Mulheres: Subescapular + Tricipital + Supra-ilíaca + Panturrilha
//    Na equação feminina também entram peso e altura
// ------------------------------------------------------------
export function calcularDensidadePetroskiHomem(s4: number, idade: number): number {
  return (
    1.10726863 -
    0.00081201 * s4 +
    0.00000212 * s4 * s4 -
    0.00041761 * idade
  )
}

export function calcularDensidadePetroskiMulher(
  s4: number,
  idade: number,
  peso: number,
  alturaCm: number
): number {
  return (
    1.02902361 -
    0.00067159 * s4 +
    0.00000242 * s4 * s4 -
    0.00026073 * idade -
    0.00056009 * peso +
    0.00054649 * alturaCm
  )
}

export function calcularPercGorduraSiri(dc: number): number {
  return (4.95 / dc - 4.5) * 100
}

// ------------------------------------------------------------
// 4. SOMATOTIPO — Heath-Carter
// ------------------------------------------------------------
export function calcularEndomorfia(
  tricipital: number,
  subescapular: number,
  supraespinalOuSuprailíaca: number,
  alturaCm: number
): number {
  const X = (tricipital + subescapular + supraespinalOuSuprailíaca) * (170.18 / alturaCm)
  return -0.7182 + 0.1451 * X - 0.00068 * X * X + 0.0000014 * X * X * X
}

export function calcularMesomorfia(
  diamUmero: number,
  diamFemur: number,
  cbCorrigida: number,  // circBracoRelaxado - (dobTricipital / 10)
  cpCorrigida: number,  // circPanturrilha - (dobPanturrilha / 10)
  alturaCm: number
): number {
  return (
    0.858 * diamUmero +
    0.601 * diamFemur +
    0.188 * cbCorrigida +
    0.161 * cpCorrigida -
    0.131 * alturaCm +
    4.5
  )
}

export function calcularEctomorfia(peso: number, alturaCm: number): number {
  const IP = alturaCm / Math.cbrt(peso)
  if (IP >= 40.75) return 0.732 * IP - 28.58
  if (IP >= 38.28) return 0.463 * IP - 17.63
  return 0.1
}

export function calcularCoordenadasSomatocarta(
  endo: number,
  meso: number,
  ecto: number
): { x: number; y: number } {
  return { x: ecto - endo, y: 2 * meso - (endo + ecto) }
}

export function classificarBiotipo(
  endo: number,
  meso: number,
  ecto: number
): string {
  const dif = 1.5
  if (meso >= endo + dif && meso >= ecto + dif) return "Mesomorfo"
  if (endo >= meso + dif && endo >= ecto + dif) return "Endomorfo"
  if (ecto >= meso + dif && ecto >= endo + dif) return "Ectomorfo"
  if (endo >= meso && endo >= ecto) return "Endo-Mesomorfo"
  if (meso >= endo && meso >= ecto) return "Meso-Endomorfo"
  return "Ecto-Mesomorfo"
}

// ------------------------------------------------------------
// 5. RCQ
// ------------------------------------------------------------
export function calcularRCQ(cintura: number, quadril: number): number {
  return cintura / quadril
}

export function classificarRCQ(rcq: number, sexo: "M" | "F"): string {
  if (sexo === "F") {
    if (rcq < 0.75) return "Risco baixo"
    if (rcq <= 0.85) return "Risco moderado"
    return "Risco alto"
  }
  if (rcq < 0.85) return "Risco baixo"
  if (rcq <= 0.9) return "Risco moderado"
  return "Risco alto"
}

// ------------------------------------------------------------
// 6. RISCO CINTURA (OMS)
// ------------------------------------------------------------
export function classificarRiscoCintura(cintura: number, sexo: "M" | "F"): string {
  if (sexo === "F") {
    if (cintura < 80) return "Sem risco"
    if (cintura <= 88) return "Risco elevado"
    return "Risco muito elevado"
  }
  if (cintura < 94) return "Sem risco"
  if (cintura <= 102) return "Risco elevado"
  return "Risco muito elevado"
}

// ------------------------------------------------------------
// 7. MASSA ÓSSEA — Von Dobeln (1964)
//    MO = 3,02 × [H(m)² × Diam.Punho(m) × Diam.Fêmur(m) × 400] ^ 0,712
//    Os diâmetros são recebidos em cm e convertidos para metros internamente
// ------------------------------------------------------------
export function calcularMassaOssea(
  alturaM: number,
  diamPunhoCm: number,
  diamFemurCm: number
): number {
  const diamPunhoM = diamPunhoCm / 100
  const diamFemurM = diamFemurCm / 100
  return 3.02 * Math.pow(alturaM * alturaM * diamPunhoM * diamFemurM * 400, 0.712)
}

// ------------------------------------------------------------
// 8. MASSA MUSCULAR ESQUELÉTICA — Lee et al. (2000), modelo antropométrico
//    SMM = Ht x (0.00744 x CAG² + 0.00088 x CTG² + 0.00441 x CCG²)
//          + 2.4 x sexo - 0.048 x idade + raca + 7.8
//    sexo: 1 masculino, 0 feminino
//    raca: 0 branco/hispânico, 1.1 afrodescendente, -2 asiático
// ------------------------------------------------------------
export function calcularMassaMuscularLee(
  alturaCm: number,
  circBracoCm: number,
  dobTricipitalMm: number,
  circCoxaCm: number,
  dobCoxaMm: number,
  circPanturrilhaCm: number,
  dobPanturrilhaMm: number,
  sexo: "M" | "F",
  idade: number,
  raca: "branco" | "negro" | "asiatico" = "branco"
): number {
  const alturaM = alturaCm / 100
  const sexoVal = sexo === "M" ? 1 : 0
  const racaVal = raca === "negro" ? 1.1 : raca === "asiatico" ? -2 : 0

  const bracoCorrigido = circBracoCm - Math.PI * (dobTricipitalMm / 10)
  const coxaCorrigida = circCoxaCm - Math.PI * (dobCoxaMm / 10)
  const panturrilhaCorrigida = circPanturrilhaCm - Math.PI * (dobPanturrilhaMm / 10)

  return (
    alturaM *
      (
        0.00744 * bracoCorrigido * bracoCorrigido +
        0.00088 * coxaCorrigida * coxaCorrigida +
        0.00441 * panturrilhaCorrigida * panturrilhaCorrigida
      ) +
    2.4 * sexoVal -
    0.048 * idade +
    racaVal +
    7.8
  )
}

// ------------------------------------------------------------
// 9. CMB — Circunferência Muscular do Braço
// ------------------------------------------------------------
export function calcularCMB(circBracoRelaxado: number, dobTricipital: number): number {
  return circBracoRelaxado - (Math.PI * dobTricipital) / 10
}

// ------------------------------------------------------------
// 10. CMC — Circunferência Muscular da Coxa
// ------------------------------------------------------------
export function calcularCMC(circCoxaMedia: number, dobCoxa: number): number {
  return circCoxaMedia - (Math.PI * dobCoxa) / 10
}

// ------------------------------------------------------------
// 11. SOMA 6 DOBRAS
// ------------------------------------------------------------
export function calcularSoma6Dobras(
  tricipital: number,
  subescapular: number,
  suprailíaca: number,
  abdominal: number,
  coxa: number,
  panturrilha: number
): number {
  return tricipital + subescapular + suprailíaca + abdominal + coxa + panturrilha
}

export function classificar6Dobras(soma: number, sexo: "M" | "F"): string {
  if (sexo === "M") {
    if (soma < 47.1) return "Baixo"
    if (soma <= 84.2) return "Normal"
    return "Alto"
  }
  if (soma < 69.5) return "Baixo"
  if (soma <= 112.4) return "Normal"
  return "Alto"
}

// ------------------------------------------------------------
// 12. CP — risco idosos
// ------------------------------------------------------------
export function classificarCP(cp: number): string {
  return cp < 31 ? "Risco nutricional" : "Normal"
}

// ============================================================
// CALCULADOR GERAL
// ============================================================
export function calcularTudo(dados: DadosAvaliacao): ResultadoFormulas {
  const alturaM = dados.altura / 100
  const sexo = normalizarSexo(dados.sexo)
  const dobraSupraIliaca = temNumero(dados.dobCristaIliaca) ? dados.dobCristaIliaca : dados.dobSupraIliaca

  // IMC
  const imc = calcularIMC(dados.peso, dados.altura)
  const classificacaoImc = classificarIMC(imc, dados.idade)

  // Faulkner — usa dobSupraespinal
  let percGorduraFaulkner: number | null = null
  if (
    temNumero(dados.dobTricipital) &&
    temNumero(dados.dobSubescapular) &&
    temNumero(dados.dobSupraespinal) &&
    temNumero(dados.dobAbdominal)
  ) {
    percGorduraFaulkner = calcularFaulkner(
      dados.dobTricipital,
      dados.dobSubescapular,
      dados.dobSupraespinal,
      dados.dobAbdominal
    )
  }

  let percGorduraPetroski: number | null = null
  let densidadeCorporal: number | null = null
  if (sexo === "M") {
    if (
      temNumero(dados.dobTricipital) &&
      temNumero(dados.dobSubescapular) &&
      temNumero(dobraSupraIliaca) &&
      temNumero(dados.dobPanturrilha)
    ) {
      const s4 = dados.dobSubescapular + dados.dobTricipital + dobraSupraIliaca + dados.dobPanturrilha
      densidadeCorporal = calcularDensidadePetroskiHomem(s4, dados.idade)
      percGorduraPetroski = calcularPercGorduraSiri(densidadeCorporal)
    }
  } else if (sexo === "F") {
    if (
      temNumero(dados.dobTricipital) &&
      temNumero(dados.dobSubescapular) &&
      temNumero(dobraSupraIliaca) &&
      temNumero(dados.dobPanturrilha)
    ) {
      const s4 = dados.dobSubescapular + dados.dobTricipital + dobraSupraIliaca + dados.dobPanturrilha
      densidadeCorporal = calcularDensidadePetroskiMulher(s4, dados.idade, dados.peso, dados.altura)
      percGorduraPetroski = calcularPercGorduraSiri(densidadeCorporal)
    }
  }

  // Composição corporal — Escolha da fórmula de referência
  const formulaReferencia = dados.formulaReferencia ?? (percGorduraPetroski !== null ? "petroski" : "faulkner")
  const percRef = formulaReferencia === "petroski" ? (percGorduraPetroski ?? percGorduraFaulkner) : (percGorduraFaulkner ?? percGorduraPetroski)

  const massaGorda = percRef !== null ? dados.peso * (percRef / 100) : null
  const massaMagra = massaGorda !== null ? dados.peso - massaGorda : null

  // Massa óssea — Von Dobeln
  // Usa diamFemur (biepicondiliano do joelho); aceita diamFemurDistal como alias
  let massaOssea: number | null = null
  const femurDiam = temNumero(dados.diamFemur) ? dados.diamFemur : dados.diamFemurDistal
  if (temNumero(dados.diamPunho) && temNumero(femurDiam)) {
    massaOssea = calcularMassaOssea(alturaM, dados.diamPunho, femurDiam)
  }

  // Massa muscular esquelética — Lee et al. (2000)
  let massaMuscular: number | null = null
  if (
    sexo &&
    temNumero(dados.circBracoRelaxado) &&
    temNumero(dados.dobTricipital) &&
    temNumero(dados.circCoxaMedia) &&
    temNumero(dados.dobCoxa) &&
    temNumero(dados.circPanturrilha) &&
    temNumero(dados.dobPanturrilha)
  ) {
    massaMuscular = calcularMassaMuscularLee(
      dados.altura,
      dados.circBracoRelaxado,
      dados.dobTricipital,
      dados.circCoxaMedia,
      dados.dobCoxa,
      dados.circPanturrilha,
      dados.dobPanturrilha,
      sexo,
      dados.idade,
      dados.raca
    )
  }

  // Somatotipo Heath-Carter
  let endomorfia: number | null = null
  let mesomorfia: number | null = null
  let ectomorfia: number | null = null
  let somatocartaX: number | null = null
  let somatocartaY: number | null = null
  let biotipo: string | null = null

  // Endomorfia: Tricipital + Subescapular + Supraespinal
  const dobEndo = dados.dobSupraespinal
  if (temNumero(dados.dobTricipital) && temNumero(dados.dobSubescapular) && temNumero(dobEndo)) {
    endomorfia = calcularEndomorfia(dados.dobTricipital, dados.dobSubescapular, dobEndo, dados.altura)
  }

  // Mesomorfia: usa circBracoRelaxado corrigida por dobTricipital
  if (
    temNumero(dados.diamUmero) &&
    temNumero(dados.diamFemur) &&
    temNumero(dados.circBracoRelaxado) &&
    temNumero(dados.circPanturrilha) &&
    temNumero(dados.dobTricipital) &&
    temNumero(dados.dobPanturrilha)
  ) {
    const cbCorrigida = dados.circBracoRelaxado - dados.dobTricipital / 10
    const cpCorrigida = dados.circPanturrilha - dados.dobPanturrilha / 10
    mesomorfia = calcularMesomorfia(
      dados.diamUmero,
      dados.diamFemur,
      cbCorrigida,
      cpCorrigida,
      dados.altura
    )
  }

  ectomorfia = calcularEctomorfia(dados.peso, dados.altura)

  if (endomorfia !== null && mesomorfia !== null) {
    const coords = calcularCoordenadasSomatocarta(endomorfia, mesomorfia, ectomorfia)
    somatocartaX = coords.x
    somatocartaY = coords.y
    biotipo = classificarBiotipo(endomorfia, mesomorfia, ectomorfia)
  }

  // RCQ
  let rcq: number | null = null
  let classificacaoRcq: string | null = null
  if (sexo && temNumero(dados.circCintura) && temNumero(dados.circQuadril)) {
    rcq = calcularRCQ(dados.circCintura, dados.circQuadril)
    classificacaoRcq = classificarRCQ(rcq, sexo)
  }

  // Risco cintura
  let riscoCintura: string | null = null
  if (sexo && temNumero(dados.circCintura)) {
    riscoCintura = classificarRiscoCintura(dados.circCintura, sexo)
  }

  // CMB
  let cmb: number | null = null
  if (temNumero(dados.circBracoRelaxado) && temNumero(dados.dobTricipital)) {
    cmb = calcularCMB(dados.circBracoRelaxado, dados.dobTricipital)
  }

  // CMC
  let cmc: number | null = null
  if (temNumero(dados.circCoxaMedia) && temNumero(dados.dobCoxa)) {
    cmc = calcularCMC(dados.circCoxaMedia, dados.dobCoxa)
  }

  // Soma 6 dobras
  let soma6Dobras: number | null = null
  let classificacao6Dobras: string | null = null
  if (
    sexo &&
    temNumero(dados.dobTricipital) &&
    temNumero(dados.dobSubescapular) &&
    temNumero(dados.dobSupraespinal) &&
    temNumero(dados.dobAbdominal) &&
    temNumero(dados.dobCoxa) &&
    temNumero(dados.dobPanturrilha)
  ) {
    soma6Dobras = calcularSoma6Dobras(
      dados.dobTricipital,
      dados.dobSubescapular,
      dados.dobSupraespinal,
      dados.dobAbdominal,
      dados.dobCoxa,
      dados.dobPanturrilha
    )
    classificacao6Dobras = classificar6Dobras(soma6Dobras, sexo)
  }

  // CP risco idosos
  let cpRisco: string | null = null
  if (temNumero(dados.circPanturrilha) && dados.idade >= 60) {
    cpRisco = classificarCP(dados.circPanturrilha)
  }

  return {
    imc,
    classificacaoImc,
    percGorduraFaulkner,
    percGorduraPetroski,
    densidadeCorporal,
    massaGorda,
    massaMagra,
    massaOssea,
    massaMuscular,
    endomorfia,
    mesomorfia,
    ectomorfia,
    somatocartaX,
    somatocartaY,
    biotipo,
    rcq,
    classificacaoRcq,
    riscoCintura,
    cmb,
    cmc,
    soma6Dobras,
    classificacao6Dobras,
    cpRisco,
    formulaReferencia,
  }
}
