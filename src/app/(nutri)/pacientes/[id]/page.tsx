"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { formatarData, calcularIdade, corRisco, formatarSexo, corDobras } from "@/lib/utils"
import { CardEvolucao } from "@/components/charts/CardEvolucao"
import { GraficoComposicao } from "@/components/charts/GraficoComposicao"
import { GraficoRadarDobras } from "@/components/charts/GraficoRadarDobras"
import { GraficoAreaEmpilhada } from "@/components/charts/GraficoAreaEmpilhada"
import { GraficoBarrasAgrupadas } from "@/components/charts/GraficoBarrasAgrupadas"
import { GraficoComparacaoDobras } from "@/components/charts/GraficoComparacaoDobras"
import { Somatocarta } from "@/components/charts/Somatocarta"

const ACCENT    = "#06b6d4"
const ACCENT2   = "#ec4899"
const ACCENT3   = "#2563eb"
const COR_ROSA  = "#f472b6"
const COR_AMBER = "#f59e0b"

interface Avaliacao {
  id: string
  dataAvaliacao: string
  peso: number
  altura: number
  circCintura?: number | null
  dobTricipital?: number | null
  dobSubescapular?: number | null
  dobSupraespinal?: number | null
  dobCristaIliaca?: number | null
  dobAbdominal?: number | null
  dobCoxa?: number | null
  dobPanturrilha?: number | null
  resultado: {
    imc?: number | null
    classificacaoImc?: string | null
    formulaReferencia?: string | null
    percGorduraFaulkner?: number | null
    percGorduraPetroski?: number | null
    massaGorda?: number | null
    massaMagra?: number | null
    massaOssea?: number | null
    massaMuscular?: number | null
    rcq?: number | null
    classificacaoRcq?: string | null
    riscoCintura?: string | null
    endomorfia?: number | null
    mesomorfia?: number | null
    ectomorfia?: number | null
    somatocartaX?: number | null
    somatocartaY?: number | null
    biotipo?: string | null
    soma6Dobras?: number | null
    classificacao6Dobras?: string | null
    somaTodasDobras?: number | null
    cmb?: number | null
    cmc?: number | null
  } | null
}

interface Paciente {
  id: string
  nome: string
  email: string
  dataNascimento: string
  sexo: string
  observacoes?: string
  avaliacoes: Avaliacao[]
}

function fmt(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export default function PerfilPacientePage() {
  const { id } = useParams<{ id: string }>()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/pacientes/${id}`)
      .then((r) => r.ok ? r.json().catch(() => null) : null)
      .then((d) => { setPaciente(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-20 text-slate-400">Carregando...</div>
  if (!paciente) return <div className="text-center py-20 text-slate-400">Paciente não encontrado</div>

  const avals = paciente.avaliacoes
  const ultima = avals[avals.length - 1]
  const penultima = avals[avals.length - 2]
  const idade = calcularIdade(paciente.dataNascimento)

  const serie = (fn: (a: Avaliacao) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: fn(a) ?? null }))

  const serieRes = (fn: (r: NonNullable<Avaliacao["resultado"]>) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: a.resultado ? (fn(a.resultado) ?? null) : null }))

  const r = ultima?.resultado

  const dobrasBarra = [
    { nome: "Tricipital",   valor: ultima?.dobTricipital ?? 0,   cor: ACCENT },
    { nome: "Subescap.",    valor: ultima?.dobSubescapular ?? 0,  cor: ACCENT3 },
    { nome: "Supraespinal", valor: ultima?.dobSupraespinal ?? 0,  cor: ACCENT2 },
    { nome: "Abdominal",    valor: ultima?.dobAbdominal ?? 0,     cor: COR_ROSA },
    { nome: "Coxa",         valor: ultima?.dobCoxa ?? 0,          cor: COR_AMBER },
    { nome: "Panturrilha",  valor: ultima?.dobPanturrilha ?? 0,   cor: "#10b981" },
  ]

  const dobrasPorAvaliacao = avals.map((a) => ({
    data: fmt(a.dataAvaliacao),
    tricipital:   a.dobTricipital,
    subescapular: a.dobSubescapular,
    supraespinal: a.dobSupraespinal,
    abdominal:    a.dobAbdominal,
    coxa:         a.dobCoxa,
    panturrilha:  a.dobPanturrilha,
  }))

  const pontosSomatocarta = avals
    .filter((a) => a.resultado?.somatocartaX != null)
    .map((a) => ({ data: fmt(a.dataAvaliacao), x: a.resultado!.somatocartaX!, y: a.resultado!.somatocartaY! }))

  const dadosArea = avals.map((a) => ({
    data: fmt(a.dataAvaliacao),
    massaGorda: a.resultado?.massaGorda ?? null,
    massaMagra: a.resultado?.massaMagra ?? null,
  }))

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[22px] bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center text-white text-2xl font-bold shadow-[0_16px_36px_rgba(6,182,212,0.28)]">
            {paciente.nome[0]}
          </div>
          <div>
            <Link href="/pacientes" className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 hover:text-slate-600">
              ← Pacientes
            </Link>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900 mt-1">{paciente.nome}</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {idade} anos · {formatarSexo(paciente.sexo)} · {avals.length} {avals.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        </div>
        <Link
          href={`/avaliacao/nova?pacienteId=${paciente.id}`}
          className="self-start md:self-auto px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition shadow-[0_14px_34px_rgba(6,182,212,0.28)]"
        >
          + Nova Avaliação
        </Link>
      </div>

      {avals.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-12 text-center text-slate-400">
          <p className="font-mono-ui text-sm mb-3 text-[color:var(--accent)]">EMPTY</p>
          <p className="font-medium">Nenhuma avaliação registrada</p>
          <Link href={`/avaliacao/nova?pacienteId=${paciente.id}`} className="text-[color:var(--accent)] text-sm hover:underline mt-1 block">
            Fazer primeira avaliação
          </Link>
        </div>
      ) : (
        <>
          {/* Cards resumo */}
          <div>
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-3">
              Última avaliação — {formatarData(ultima.dataAvaliacao)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Peso",           valor: ultima.peso?.toFixed(1),                                                           unidade: "kg",    tone: "from-[#06b6d4] to-[#22d3ee]" },
                { label: "IMC",            valor: r?.imc?.toFixed(1) ?? "—",                                                         unidade: "kg/m²", tone: "from-[#2563eb] to-[#60a5fa]" },
                { label: "% Gordura",      valor: (r?.formulaReferencia === "faulkner" ? r?.percGorduraFaulkner : r?.percGorduraPetroski)?.toFixed(1) ?? "—", unidade: "%", tone: "from-[#ec4899] to-[#f472b6]" },
                { label: "Massa Muscular", valor: r?.massaMuscular?.toFixed(1) ?? "—",                                               unidade: "kg",    tone: "from-[#06b6d4] to-[#2563eb]" },
                { label: "Massa Óssea",    valor: r?.massaOssea?.toFixed(1) ?? "—",                                                  unidade: "kg",    tone: "from-[#2563eb] to-[#1e3a8a]" },
              ].map((c) => (
                <div key={c.label} className={`metric-card rounded-[22px] bg-gradient-to-br ${c.tone} p-4 text-white`}>
                  <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">{c.label}</p>
                  <p className="mt-3 text-xl font-semibold">{c.valor}</p>
                  <p className="mt-1 text-xs text-white/60">{c.unidade}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Evolução */}
          {avals.length >= 2 && (
            <>
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Evolução</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CardEvolucao titulo="Peso" valorAtual={ultima.peso} valorAnterior={penultima?.peso} unidade="kg" dados={serie((a) => a.peso)} cor={ACCENT} />
                  <CardEvolucao titulo="IMC" valorAtual={r?.imc ?? null} valorAnterior={penultima?.resultado?.imc ?? null} unidade="kg/m²" dados={serieRes((r) => r.imc)} cor={ACCENT3} refMin={18.5} refMax={25} classificacao={r?.classificacaoImc} corClass={r?.classificacaoImc ? corRisco(r.classificacaoImc) : undefined} />
                  <CardEvolucao titulo={`% Gordura (${r?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"})`} valorAtual={(r?.formulaReferencia === "faulkner" ? r?.percGorduraFaulkner : r?.percGorduraPetroski) ?? null} valorAnterior={(penultima?.resultado?.formulaReferencia === "faulkner" ? penultima?.resultado?.percGorduraFaulkner : penultima?.resultado?.percGorduraPetroski) ?? null} unidade="%" dados={serieRes((res) => res.formulaReferencia === "faulkner" ? res.percGorduraFaulkner : res.percGorduraPetroski)} cor={ACCENT2} />
                  <CardEvolucao titulo="Massa Muscular (SMM)" valorAtual={r?.massaMuscular ?? null} valorAnterior={penultima?.resultado?.massaMuscular ?? null} unidade="kg" dados={serieRes((r) => r.massaMuscular)} cor="#10b981" />
                  <CardEvolucao titulo="Circunferência da Cintura" valorAtual={ultima.circCintura ?? null} valorAnterior={penultima?.circCintura ?? null} unidade="cm" dados={serie((a) => a.circCintura)} cor={COR_AMBER} classificacao={r?.riscoCintura} corClass={r?.riscoCintura ? corRisco(r.riscoCintura) : undefined} />
                  <CardEvolucao titulo="RCQ" valorAtual={r?.rcq ?? null} valorAnterior={penultima?.resultado?.rcq ?? null} unidade="" dados={serieRes((r) => r.rcq)} cor={COR_ROSA} classificacao={r?.classificacaoRcq} corClass={r?.classificacaoRcq ? corRisco(r.classificacaoRcq) : undefined} />
                  <CardEvolucao titulo="Soma 6 Dobras" valorAtual={r?.soma6Dobras ?? null} valorAnterior={penultima?.resultado?.soma6Dobras ?? null} unidade="mm" dados={serieRes((r) => r.soma6Dobras)} cor={ACCENT2} />
                  <CardEvolucao titulo="Soma Todas as Dobras" valorAtual={r?.somaTodasDobras ?? null} valorAnterior={penultima?.resultado?.somaTodasDobras ?? null} unidade="mm" dados={serieRes((r) => r.somaTodasDobras)} cor={ACCENT3} />
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Massa Gorda vs Massa Magra</p>
                <GraficoAreaEmpilhada dados={dadosArea} />
              </div>
            </>
          )}

          {/* Composição + Radar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {r?.massaGorda && r?.massaMagra ? (
              <div className="glass-panel rounded-[28px] p-6">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">Composição Corporal</p>
                <p className="text-xs text-slate-400 mb-4">Última avaliação</p>
                <GraficoComposicao massaGorda={r.massaGorda} massaMagra={r.massaMagra} massaOssea={r.massaOssea} massaMuscular={r.massaMuscular} peso={ultima.peso} />
              </div>
            ) : null}

            <div className="glass-panel rounded-[28px] p-6">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">Dobras Cutâneas</p>
              <p className="text-xs text-slate-400 mb-4">Distribuição — última avaliação</p>
              <GraficoRadarDobras tricipital={ultima.dobTricipital} subescapular={ultima.dobSubescapular} supraespinal={ultima.dobSupraespinal} abdominal={ultima.dobAbdominal} coxa={ultima.dobCoxa} panturrilha={ultima.dobPanturrilha} />
            </div>
          </div>

          {/* Totais de dobras */}
          {(r?.soma6Dobras != null || r?.somaTodasDobras != null) && (
            <div className="glass-panel rounded-[28px] p-6">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-5">Somatório de Dobras — última avaliação</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="metric-card rounded-[22px] bg-gradient-to-br from-[#ec4899] to-[#2563eb] p-5 text-white">
                  <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">Soma 6 Dobras</p>
                  <p className="text-4xl font-bold mt-3">{r?.soma6Dobras?.toFixed(1) ?? "—"}</p>
                  <p className="text-xs text-white/60 mt-1">mm</p>
                  {r?.classificacao6Dobras && (
                    <span className={`inline-block mt-2 px-2.5 py-1 rounded-lg text-xs font-bold font-mono-ui uppercase tracking-[0.14em] ${corDobras(r.classificacao6Dobras)}`}>
                      {r.classificacao6Dobras}
                    </span>
                  )}
                </div>
                <div className="metric-card rounded-[22px] bg-gradient-to-br from-[#2563eb] to-[#ec4899] p-5 text-white">
                  <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">Soma Todas as Dobras</p>
                  <p className="text-4xl font-bold mt-3">{r?.somaTodasDobras?.toFixed(1) ?? "—"}</p>
                  <p className="text-xs text-white/60 mt-1">mm · {r?.somaTodasDobras != null && r?.soma6Dobras != null ? `${(r.somaTodasDobras - r.soma6Dobras).toFixed(1)} mm fora do S6` : ""}</p>
                </div>
              </div>
            </div>
          )}

          {/* Barras + Somatocarta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel rounded-[28px] p-6">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">Dobras por Região</p>
              <p className="text-xs text-slate-400 mb-4">Valores em mm — última avaliação</p>
              <GraficoBarrasAgrupadas dobras={dobrasBarra} />
              {avals.length >= 2 && (
                <div className="border-t border-slate-100 mt-5 pt-5">
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-3">Comparação entre avaliações</p>
                  <GraficoComparacaoDobras avaliacoes={dobrasPorAvaliacao} />
                </div>
              )}
            </div>

            <div className="glass-panel rounded-[28px] p-6">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">Somatocarta</p>
              <p className="text-xs text-slate-400 mb-4">
                {r?.biotipo && (
                  <span className="inline-flex items-center gap-1 bg-[rgba(6,182,212,0.10)] text-[color:var(--accent)] px-2 py-0.5 rounded-full text-xs font-semibold mr-2">
                    {r.biotipo}
                  </span>
                )}
                Heath-Carter · trajetória entre avaliações
              </p>
              <Somatocarta pontos={pontosSomatocarta} />
            </div>
          </div>

          {/* Somatotipo */}
          {r?.endomorfia != null && (
            <div className="glass-panel rounded-[28px] p-6">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-5">Somatotipo — Heath-Carter</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Endomorfia", valor: r.endomorfia, tone: "from-[#ec4899] to-[#f472b6]", desc: "Adiposidade" },
                  { label: "Mesomorfia", valor: r.mesomorfia, tone: "from-[#06b6d4] to-[#22d3ee]", desc: "Muscularidade" },
                  { label: "Ectomorfia", valor: r.ectomorfia, tone: "from-[#2563eb] to-[#60a5fa]", desc: "Linearidade" },
                ].map((c) => (
                  <div key={c.label} className={`metric-card rounded-[22px] bg-gradient-to-br ${c.tone} p-5 text-center text-white`}>
                    <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">{c.label}</p>
                    <p className="text-4xl font-bold mt-2">{c.valor?.toFixed(1)}</p>
                    <p className="text-xs text-white/60 mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico */}
          <div>
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Histórico de Avaliações</p>
            <div className="space-y-2">
              {[...avals].reverse().map((a, i) => (
                <Link
                  key={a.id}
                  href={`/avaliacao/${a.id}/resultado`}
                  className="glass-panel flex items-center justify-between rounded-[22px] p-4 hover:border-[rgba(6,182,212,0.22)] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[color:var(--accent)]" : "bg-slate-200"}`} />
                    <div>
                      <p className="font-medium text-slate-800">{formatarData(a.dataAvaliacao)}</p>
                      <p className="text-slate-400 text-sm">{a.peso} kg · IMC {a.resultado?.imc?.toFixed(1) ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(a.resultado?.formulaReferencia === "faulkner" ? a.resultado?.percGorduraFaulkner : a.resultado?.percGorduraPetroski) && (
                      <span className="font-mono-ui text-[11px] bg-[rgba(236,72,153,0.10)] text-[color:var(--accent-2)] font-semibold px-2 py-1 rounded-lg">
                        {(a.resultado?.formulaReferencia === "faulkner" ? a.resultado?.percGorduraFaulkner : a.resultado?.percGorduraPetroski)?.toFixed(1)}% G
                      </span>
                    )}
                    <span className="text-slate-300 text-sm">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
