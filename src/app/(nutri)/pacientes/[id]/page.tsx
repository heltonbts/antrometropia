"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
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
  circQuadril?: number | null
  circBracoRelaxado?: number | null
  circBracoContraido?: number | null
  circPanturrilha?: number | null
  circCoxaMedia?: number | null
  circAbdomen?: number | null
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
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit", timeZone: "UTC" })
}

function fmtLong(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
}

function delta(atual: number | null | undefined, anterior: number | null | undefined) {
  if (atual == null || anterior == null) return null
  const diff = atual - anterior
  return { diff: Math.abs(diff).toFixed(2), positivo: diff >= 0 }
}

export default function PerfilPacientePage() {
  const { id } = useParams<{ id: string }>()
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [loading, setLoading] = useState(true)
  const [showComparar, setShowComparar] = useState(false)
  const [a1Selected, setA1Selected] = useState("")
  const [a2Selected, setA2Selected] = useState("")
  const [comparacaoAtiva, setComparacaoAtiva] = useState<{ av1: Avaliacao; av2: Avaliacao } | null>(null)
  const [avalsVisiveis, setAvalsVisiveis] = useState<string[] | null>(null)
  const [editandoSexo, setEditandoSexo] = useState(false)
  const [sexoTemp, setSexoTemp] = useState("")
  const [salvandoSexo, setSalvandoSexo] = useState(false)

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

  const avalsFiltradas = avalsVisiveis === null ? avals : avals.filter((a) => avalsVisiveis.includes(a.id))

  const ultimaFiltrada   = avalsFiltradas[avalsFiltradas.length - 1]
  const penultimaFiltrada = avalsFiltradas[avalsFiltradas.length - 2]
  const rFiltrado        = ultimaFiltrada?.resultado

  const serie = (fn: (a: Avaliacao) => number | null | undefined) =>
    avalsFiltradas.map((a) => ({ data: fmt(a.dataAvaliacao), valor: fn(a) ?? null }))

  const serieRes = (fn: (r: NonNullable<Avaliacao["resultado"]>) => number | null | undefined) =>
    avalsFiltradas.map((a) => ({ data: fmt(a.dataAvaliacao), valor: a.resultado ? (fn(a.resultado) ?? null) : null }))

  const r = ultima?.resultado

  const dobrasBarra = [
    { nome: "Tricipital",   valor: ultima?.dobTricipital ?? 0,   cor: ACCENT },
    { nome: "Subescap.",    valor: ultima?.dobSubescapular ?? 0,  cor: ACCENT3 },
    { nome: "Supraespinal", valor: ultima?.dobSupraespinal ?? 0,  cor: ACCENT2 },
    { nome: "Abdominal",    valor: ultima?.dobAbdominal ?? 0,     cor: COR_ROSA },
    { nome: "Coxa",         valor: ultima?.dobCoxa ?? 0,          cor: COR_AMBER },
    { nome: "Panturrilha",  valor: ultima?.dobPanturrilha ?? 0,   cor: "#10b981" },
  ]

  const dobrasPorAvaliacao = avalsFiltradas.map((a) => ({
    data: fmt(a.dataAvaliacao),
    tricipital:   a.dobTricipital,
    subescapular: a.dobSubescapular,
    supraespinal: a.dobSupraespinal,
    abdominal:    a.dobAbdominal,
    coxa:         a.dobCoxa,
    panturrilha:  a.dobPanturrilha,
  }))

  const pontosSomatocarta = avalsFiltradas
    .filter((a) => a.resultado?.somatocartaX != null)
    .map((a) => ({ data: fmt(a.dataAvaliacao), x: a.resultado!.somatocartaX!, y: a.resultado!.somatocartaY! }))

  const dadosArea = avalsFiltradas.map((a) => ({
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
            <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5 flex-wrap">
              {idade} anos ·{" "}
              {editandoSexo ? (
                <>
                  <select
                    value={sexoTemp}
                    onChange={(e) => setSexoTemp(e.target.value)}
                    className="text-xs px-2 py-0.5 rounded-lg border border-[rgba(6,182,212,0.40)] bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[rgba(6,182,212,0.50)]"
                    autoFocus
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                  <button
                    disabled={salvandoSexo}
                    onClick={async () => {
                      setSalvandoSexo(true)
                      const r = await fetch(`/api/pacientes/${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ sexo: sexoTemp }),
                      })
                      if (r.ok) setPaciente((p) => p ? { ...p, sexo: sexoTemp } : p)
                      setSalvandoSexo(false)
                      setEditandoSexo(false)
                    }}
                    className="text-xs font-medium text-[color:var(--accent)] hover:underline disabled:opacity-50"
                  >
                    {salvandoSexo ? "..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => setEditandoSexo(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  {formatarSexo(paciente.sexo)}
                  <button
                    onClick={() => { setSexoTemp(paciente.sexo); setEditandoSexo(true) }}
                    className="text-[10px] font-mono-ui uppercase tracking-[0.15em] text-slate-300 hover:text-[color:var(--accent)] transition"
                    title="Editar sexo"
                  >
                    editar
                  </button>
                </>
              )}{" "}
              · {avals.length} {avals.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          {avals.length >= 2 && (
            <button
              onClick={() => {
                setA1Selected(avals[avals.length - 2]?.id ?? "")
                setA2Selected(avals[avals.length - 1]?.id ?? "")
                setShowComparar(true)
              }}
              className="px-5 py-2.5 glass-panel text-slate-700 text-sm font-semibold rounded-2xl hover:bg-white transition flex items-center gap-2"
            >
              🖨 Comparar PDF
            </button>
          )}
          <Link
            href={`/avaliacao/nova?pacienteId=${paciente.id}`}
            className="px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition shadow-[0_14px_34px_rgba(6,182,212,0.28)]"
          >
            + Nova Avaliação
          </Link>
        </div>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400">Evolução</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {avals.map((a) => {
                      const ativa = avalsVisiveis === null || avalsVisiveis.includes(a.id)
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            const novaSelecao = ativa
                              ? (avalsVisiveis ?? avals.map(x => x.id)).filter(id => id !== a.id)
                              : [...(avalsVisiveis ?? avals.map(x => x.id)), a.id]
                            const ordenada = avals.map(x => x.id).filter(id => novaSelecao.includes(id))
                            setAvalsVisiveis(ordenada.length === avals.length ? null : ordenada)
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono-ui transition border ${
                            ativa
                              ? "bg-[rgba(6,182,212,0.1)] text-[color:var(--accent)] border-[rgba(6,182,212,0.25)]"
                              : "bg-slate-100 text-slate-400 border-slate-200"
                          }`}
                        >
                          {fmt(a.dataAvaliacao)}
                        </button>
                      )
                    })}
                    {avalsVisiveis !== null && (
                      <button
                        onClick={() => setAvalsVisiveis(null)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
                      >
                        Todas
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CardEvolucao titulo="Peso" valorAtual={ultimaFiltrada?.peso ?? null} valorAnterior={penultimaFiltrada?.peso ?? null} unidade="kg" dados={serie((a) => a.peso)} cor={ACCENT} />
                  <CardEvolucao titulo="IMC" valorAtual={rFiltrado?.imc ?? null} valorAnterior={penultimaFiltrada?.resultado?.imc ?? null} unidade="kg/m²" dados={serieRes((r) => r.imc)} cor={ACCENT3} refMin={18.5} refMax={25} classificacao={rFiltrado?.classificacaoImc} corClass={rFiltrado?.classificacaoImc ? corRisco(rFiltrado.classificacaoImc) : undefined} />
                  <CardEvolucao titulo={`% Gordura (${rFiltrado?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"})`} valorAtual={(rFiltrado?.formulaReferencia === "faulkner" ? rFiltrado?.percGorduraFaulkner : rFiltrado?.percGorduraPetroski) ?? null} valorAnterior={(penultimaFiltrada?.resultado?.formulaReferencia === "faulkner" ? penultimaFiltrada?.resultado?.percGorduraFaulkner : penultimaFiltrada?.resultado?.percGorduraPetroski) ?? null} unidade="%" dados={serieRes((res) => res.formulaReferencia === "faulkner" ? res.percGorduraFaulkner : res.percGorduraPetroski)} cor={ACCENT2} />
                  <CardEvolucao titulo="Massa Magra" valorAtual={rFiltrado?.massaMagra ?? null} valorAnterior={penultimaFiltrada?.resultado?.massaMagra ?? null} unidade="kg" dados={serieRes((r) => r.massaMagra)} cor={ACCENT} maiorMelhor />
                  <CardEvolucao titulo="Massa Muscular (SMM)" valorAtual={rFiltrado?.massaMuscular ?? null} valorAnterior={penultimaFiltrada?.resultado?.massaMuscular ?? null} unidade="kg" dados={serieRes((r) => r.massaMuscular)} cor="#10b981" maiorMelhor />
                  <CardEvolucao titulo="RCQ" valorAtual={rFiltrado?.rcq ?? null} valorAnterior={penultimaFiltrada?.resultado?.rcq ?? null} unidade="" dados={serieRes((r) => r.rcq)} cor={COR_ROSA} classificacao={rFiltrado?.classificacaoRcq} corClass={rFiltrado?.classificacaoRcq ? corRisco(rFiltrado.classificacaoRcq) : undefined} />
                  <CardEvolucao titulo="Soma 6 Dobras" valorAtual={rFiltrado?.soma6Dobras ?? null} valorAnterior={penultimaFiltrada?.resultado?.soma6Dobras ?? null} unidade="mm" dados={serieRes((r) => r.soma6Dobras)} cor={ACCENT2} />
                  <CardEvolucao titulo="Soma Todas as Dobras" valorAtual={rFiltrado?.somaTodasDobras ?? null} valorAnterior={penultimaFiltrada?.resultado?.somaTodasDobras ?? null} unidade="mm" dados={serieRes((r) => r.somaTodasDobras)} cor={ACCENT3} />
                  {rFiltrado?.cmb != null && <CardEvolucao titulo="Circunferência Muscular do Braço" valorAtual={rFiltrado.cmb} valorAnterior={penultimaFiltrada?.resultado?.cmb ?? null} unidade="cm" dados={serieRes((r) => r.cmb)} cor={ACCENT} maiorMelhor />}
                  {rFiltrado?.cmc != null && <CardEvolucao titulo="Circunferência Muscular da Coxa" valorAtual={rFiltrado.cmc} valorAnterior={penultimaFiltrada?.resultado?.cmc ?? null} unidade="cm" dados={serieRes((r) => r.cmc)} cor="#10b981" maiorMelhor />}
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-6">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Massa Gorda vs Massa Magra</p>
                <GraficoAreaEmpilhada dados={dadosArea} />
              </div>
            </>
          )}

          {/* Circunferências */}
          {(ultima.circCintura != null || ultima.circQuadril != null || ultima.circBracoRelaxado != null || ultima.circPanturrilha != null) && (
            <div>
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Circunferências</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {ultima.circCintura != null && (
                  <CardEvolucao titulo="Cintura" valorAtual={ultimaFiltrada?.circCintura ?? null} valorAnterior={penultimaFiltrada?.circCintura ?? null} unidade="cm" dados={serie((a) => a.circCintura)} cor={COR_AMBER} classificacao={rFiltrado?.riscoCintura} corClass={rFiltrado?.riscoCintura ? corRisco(rFiltrado.riscoCintura) : undefined} />
                )}
                {ultima.circQuadril != null && (
                  <CardEvolucao titulo="Quadril" valorAtual={ultimaFiltrada?.circQuadril ?? null} valorAnterior={penultimaFiltrada?.circQuadril ?? null} unidade="cm" dados={serie((a) => a.circQuadril)} cor={ACCENT2} />
                )}
                {ultima.circBracoRelaxado != null && (
                  <CardEvolucao titulo="Braço Relaxado" valorAtual={ultimaFiltrada?.circBracoRelaxado ?? null} valorAnterior={penultimaFiltrada?.circBracoRelaxado ?? null} unidade="cm" dados={serie((a) => a.circBracoRelaxado)} cor={ACCENT} maiorMelhor />
                )}
                {ultima.circBracoContraido != null && (
                  <CardEvolucao titulo="Braço Contraído" valorAtual={ultimaFiltrada?.circBracoContraido ?? null} valorAnterior={penultimaFiltrada?.circBracoContraido ?? null} unidade="cm" dados={serie((a) => a.circBracoContraido)} cor={ACCENT3} maiorMelhor />
                )}
                {ultima.circPanturrilha != null && (
                  <CardEvolucao titulo="Panturrilha" valorAtual={ultimaFiltrada?.circPanturrilha ?? null} valorAnterior={penultimaFiltrada?.circPanturrilha ?? null} unidade="cm" dados={serie((a) => a.circPanturrilha)} cor="#10b981" maiorMelhor />
                )}
                {ultima.circCoxaMedia != null && (
                  <CardEvolucao titulo="Coxa Média" valorAtual={ultimaFiltrada?.circCoxaMedia ?? null} valorAnterior={penultimaFiltrada?.circCoxaMedia ?? null} unidade="cm" dados={serie((a) => a.circCoxaMedia)} cor={COR_ROSA} maiorMelhor />
                )}
                {ultima.circAbdomen != null && (
                  <CardEvolucao titulo="Abdômen" valorAtual={ultimaFiltrada?.circAbdomen ?? null} valorAnterior={penultimaFiltrada?.circAbdomen ?? null} unidade="cm" dados={serie((a) => a.circAbdomen)} cor={COR_AMBER} />
                )}
              </div>
            </div>
          )}

          {/* Composição + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="glass-panel rounded-[28px] p-4 md:p-6">
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
              <div className="mb-4 overflow-hidden rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white/70">
                <img
                  src="/avateres.png"
                  alt="Referência visual dos biotipos da somatocarta"
                  className="block h-auto w-full object-contain"
                />
              </div>
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
      {/* Comparativo inline */}
      {comparacaoAtiva && (() => {
        const { av1, av2 } = comparacaoAtiva
        const r1 = av1.resultado
        const r2 = av2.resultado
        const formula1 = r1?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"
        const formula2 = r2?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"

        const linhas: { label: string; v1?: number | null; v2?: number | null; badge1?: string | null; badge2?: string | null; inv: boolean }[] = [
          { label: "Peso (kg)", v1: av1.peso, v2: av2.peso, inv: false },
          { label: "IMC (kg/m²)", v1: r1?.imc, v2: r2?.imc, badge1: r1?.classificacaoImc, badge2: r2?.classificacaoImc, inv: false },
          { label: `% Gordura (${formula2})`, v1: formula1 === "Faulkner" ? r1?.percGorduraFaulkner : r1?.percGorduraPetroski, v2: formula2 === "Faulkner" ? r2?.percGorduraFaulkner : r2?.percGorduraPetroski, inv: true },
          { label: "Massa Gorda (kg)", v1: r1?.massaGorda, v2: r2?.massaGorda, inv: true },
          { label: "Massa Magra (kg)", v1: r1?.massaMagra, v2: r2?.massaMagra, inv: false },
          { label: "Massa Muscular SMM (kg)", v1: r1?.massaMuscular, v2: r2?.massaMuscular, inv: false },
          { label: "Massa Óssea (kg)", v1: r1?.massaOssea, v2: r2?.massaOssea, inv: false },
          { label: "RCQ", v1: r1?.rcq, v2: r2?.rcq, badge1: r1?.classificacaoRcq, badge2: r2?.classificacaoRcq, inv: true },
          { label: "Circunferência Muscular do Braço (cm)", v1: r1?.cmb, v2: r2?.cmb, inv: false },
          { label: "Circunferência Muscular da Coxa (cm)", v1: r1?.cmc, v2: r2?.cmc, inv: false },
          { label: "Soma 6 Dobras (mm)", v1: r1?.soma6Dobras, v2: r2?.soma6Dobras, badge1: r1?.classificacao6Dobras, badge2: r2?.classificacao6Dobras, inv: true },
          { label: "Soma Todas as Dobras (mm)", v1: r1?.somaTodasDobras, v2: r2?.somaTodasDobras, inv: true },
        ]

        const circ: { label: string; v1?: number | null; v2?: number | null; inv: boolean }[] = [
          { label: "Cintura (cm)", v1: av1.circCintura, v2: av2.circCintura, inv: true },
          { label: "Quadril (cm)", v1: av1.circQuadril, v2: av2.circQuadril, inv: false },
          { label: "Braço Relaxado (cm)", v1: av1.circBracoRelaxado, v2: av2.circBracoRelaxado, inv: false },
          { label: "Braço Contraído (cm)", v1: av1.circBracoContraido, v2: av2.circBracoContraido, inv: false },
          { label: "Panturrilha (cm)", v1: av1.circPanturrilha, v2: av2.circPanturrilha, inv: false },
          { label: "Coxa Média (cm)", v1: av1.circCoxaMedia, v2: av2.circCoxaMedia, inv: false },
          { label: "Abdômen (cm)", v1: av1.circAbdomen, v2: av2.circAbdomen, inv: true },
        ].filter(({ v1, v2 }) => v1 != null || v2 != null)

        const renderTabela = (rows: typeof linhas) => (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 w-[45%]">Indicador</th>
                <th className="text-center py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 w-[20%]">{fmtLong(av1.dataAvaliacao)}</th>
                <th className="text-center py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 w-[20%]">{fmtLong(av2.dataAvaliacao)}</th>
                <th className="text-center py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 w-[15%]">Δ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, v1, v2, badge1, badge2, inv }) => {
                if (v1 == null && v2 == null) return null
                const d = delta(v2, v1)
                const melhora = d ? (inv ? !d.positivo : d.positivo) : null
                return (
                  <tr key={label} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-600 text-sm">{label}</td>
                    <td className="py-2.5 text-center text-slate-500 font-medium">
                      {v1 != null ? Number(v1).toFixed(2) : "—"}
                      {badge1 && <span className="block text-[10px] text-slate-400">{badge1}</span>}
                    </td>
                    <td className="py-2.5 text-center text-slate-900 font-bold">
                      {v2 != null ? Number(v2).toFixed(2) : "—"}
                      {badge2 && <span className="block text-[10px] text-slate-400">{badge2}</span>}
                    </td>
                    <td className="py-2.5 text-center text-xs font-semibold">
                      {d && (
                        <span className={melhora ? "text-emerald-500" : "text-rose-400"}>
                          {d.positivo ? "+" : "−"}{d.diff}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )

        return (
          <div className="glass-panel rounded-[28px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400">Comparativo</p>
                <p className="text-slate-700 font-semibold mt-0.5">
                  {fmtLong(av1.dataAvaliacao)} <span className="text-slate-300 font-normal">→</span> {fmtLong(av2.dataAvaliacao)}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/pacientes/${paciente.id}/comparar?a1=${av1.id}&a2=${av2.id}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                  PDF
                </a>
                <button
                  onClick={() => {
                    setA1Selected(av1.id)
                    setA2Selected(av2.id)
                    setShowComparar(true)
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition"
                >
                  Alterar
                </button>
                <button
                  onClick={() => setComparacaoAtiva(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 border border-slate-100 rounded-xl hover:bg-slate-50 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {renderTabela(linhas)}

            {circ.length > 0 && (
              <div className="mt-6">
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Circunferências</p>
                {renderTabela(circ)}
              </div>
            )}

            {r1?.endomorfia != null && r2?.endomorfia != null && (
              <div className="mt-6">
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Somatotipo — Heath-Carter</p>
                {renderTabela([
                  { label: "Endomorfia (Adiposidade)", v1: r1.endomorfia, v2: r2.endomorfia, inv: true },
                  { label: "Mesomorfia (Muscularidade)", v1: r1.mesomorfia, v2: r2.mesomorfia, inv: false },
                  { label: "Ectomorfia (Linearidade)", v1: r1.ectomorfia, v2: r2.ectomorfia, inv: false },
                ])}
              </div>
            )}

            <p className="text-[10px] text-slate-400 mt-3">Δ verde = melhora · Δ vermelho = piora (considerando redução de gordura)</p>
          </div>
        )
      })()}

      {/* Modal seleção de avaliações para comparar */}
      {showComparar && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowComparar(false)}
        >
          <div
            className="bg-white rounded-[28px] p-8 max-w-sm w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Comparar Avaliações</h2>
            <p className="text-sm text-slate-400 mb-6">Selecione as duas avaliações para comparar</p>

            <div className="space-y-4">
              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-1.5 block">Avaliação 1</label>
                <select
                  value={a1Selected}
                  onChange={(e) => setA1Selected(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40"
                >
                  {avals.map((a) => (
                    <option key={a.id} value={a.id}>{formatarData(a.dataAvaliacao)} — {a.peso} kg</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-1.5 block">Avaliação 2</label>
                <select
                  value={a2Selected}
                  onChange={(e) => setA2Selected(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]/40"
                >
                  {avals.map((a) => (
                    <option key={a.id} value={a.id}>{formatarData(a.dataAvaliacao)} — {a.peso} kg</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowComparar(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-2xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                disabled={a1Selected === a2Selected}
                onClick={() => {
                  const av1 = avals.find((a) => a.id === a1Selected)
                  const av2 = avals.find((a) => a.id === a2Selected)
                  if (av1 && av2) { setComparacaoAtiva({ av1, av2 }); setShowComparar(false) }
                }}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-2xl transition ${
                  a1Selected === a2Selected
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Ver na Página
              </button>
              <a
                href={`/pacientes/${paciente.id}/comparar?a1=${a1Selected}&a2=${a2Selected}`}
                target="_blank"
                onClick={() => setShowComparar(false)}
                className={`flex-1 px-4 py-2.5 text-center text-white text-sm font-semibold rounded-2xl transition ${
                  a1Selected === a2Selected
                    ? "bg-slate-300 cursor-not-allowed pointer-events-none"
                    : "bg-[linear-gradient(135deg,#06b6d4,#2563eb)] hover:opacity-90 shadow-[0_8px_24px_rgba(6,182,212,0.28)]"
                }`}
              >
                PDF
              </a>
            </div>
            {a1Selected === a2Selected && (
              <p className="text-xs text-rose-400 text-center mt-2">Selecione avaliações diferentes</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
