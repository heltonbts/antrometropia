"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { formatarData, calcularIdade, corRisco, formatarSexo } from "@/lib/utils"
import { CardEvolucao } from "@/components/charts/CardEvolucao"
import { GraficoComposicao } from "@/components/charts/GraficoComposicao"
import { GraficoRadarDobras } from "@/components/charts/GraficoRadarDobras"
import { GraficoAreaEmpilhada } from "@/components/charts/GraficoAreaEmpilhada"
import { GraficoBarrasAgrupadas } from "@/components/charts/GraficoBarrasAgrupadas"
import { Somatocarta } from "@/components/charts/Somatocarta"

const COR_ROSA = "#f472b6"
const COR_CIANO = "#06b6d4"
const COR_AZUL = "#3b82f6"
const COR_VIOLETA = "#8b5cf6"
const COR_AMBER = "#f59e0b"

interface Avaliacao {
  id: string
  dataAvaliacao: string
  peso: number
  altura: number
  dobTricipital?: number | null
  dobSubescapular?: number | null
  dobSupraespinal?: number | null
  dobCristaIliaca?: number | null
  dobAbdominal?: number | null
  dobCoxa?: number | null
  dobPanturrilha?: number | null
  circCintura?: number | null
  circQuadril?: number | null
  circBraco?: number | null
  resultado: {
    imc?: number | null
    classificacaoImc?: string | null
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
      .then((d) => {
        setPaciente(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Carregando...</div>
  }

  if (!paciente) {
    return <div className="text-center py-20 text-slate-400">Paciente não encontrado</div>
  }

  const avals = paciente.avaliacoes
  const ultima = avals[avals.length - 1]
  const penultima = avals[avals.length - 2]
  const idade = calcularIdade(paciente.dataNascimento)

  // Funções auxiliares para série de dados
  const serie = (fn: (a: Avaliacao) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: fn(a) ?? null }))

  const serieRes = (fn: (r: NonNullable<Avaliacao["resultado"]>) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: a.resultado ? (fn(a.resultado) ?? null) : null }))

  // Última avaliação resultado
  const r = ultima?.resultado

  // Dobras da última avaliação para barras
  const dobrasBarra = [
    { nome: "Tricipital", valor: ultima?.dobTricipital ?? 0, cor: COR_CIANO },
    { nome: "Subescap.", valor: ultima?.dobSubescapular ?? 0, cor: COR_AZUL },
    { nome: "Suprailíaca", valor: ultima?.dobSupraespinal ?? 0, cor: COR_VIOLETA },
    { nome: "Abdominal", valor: ultima?.dobAbdominal ?? 0, cor: COR_ROSA },
    { nome: "Coxa", valor: ultima?.dobCoxa ?? 0, cor: COR_AMBER },
    { nome: "Panturrilha", valor: ultima?.dobPanturrilha ?? 0, cor: "#10b981" },
  ]

  // Pontos da somatocarta
  const pontosSomatocarta = avals
    .filter((a) => a.resultado?.somatocartaX != null)
    .map((a) => ({
      data: fmt(a.dataAvaliacao),
      x: a.resultado!.somatocartaX!,
      y: a.resultado!.somatocartaY!,
    }))

  // Dados área empilhada
  const dadosArea = avals.map((a) => ({
    data: fmt(a.dataAvaliacao),
    massaGorda: a.resultado?.massaGorda ?? null,
    massaMagra: a.resultado?.massaMagra ?? null,
  }))

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-cyan-100">
            {paciente.nome[0]}
          </div>
          <div>
            <Link href="/pacientes" className="text-xs text-slate-400 hover:text-slate-600">
              ← Pacientes
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">{paciente.nome}</h1>
            <p className="text-slate-400 text-sm">
              {idade} anos · {formatarSexo(paciente.sexo)} ·{" "}
              {avals.length} {avals.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </div>
        </div>
        <Link
          href={`/avaliacao/nova?pacienteId=${paciente.id}`}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm shadow-cyan-200"
        >
          + Nova Avaliação
        </Link>
      </div>

      {avals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium">Nenhuma avaliação registrada</p>
          <Link
            href={`/avaliacao/nova?pacienteId=${paciente.id}`}
            className="text-cyan-600 text-sm hover:underline mt-1 block"
          >
            Fazer primeira avaliação
          </Link>
        </div>
      ) : (
        <>
          {/* Cards de resumo da última avaliação */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">
              Última avaliação — {formatarData(ultima.dataAvaliacao)}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: "Peso", valor: ultima.peso?.toFixed(1), unidade: "kg", cor: "from-cyan-500 to-blue-600" },
                { label: "IMC", valor: r?.imc?.toFixed(1) ?? "—", unidade: "kg/m²", cor: "from-violet-500 to-purple-600" },
                { label: "% Gordura", valor: r?.percGorduraPetroski?.toFixed(1) ?? r?.percGorduraFaulkner?.toFixed(1) ?? "—", unidade: "%", cor: "from-pink-400 to-rose-500" },
                { label: "Massa Muscular", valor: r?.massaMuscular?.toFixed(1) ?? "—", unidade: "kg", cor: "from-emerald-400 to-teal-500" },
                { label: "Massa Óssea", valor: r?.massaOssea?.toFixed(1) ?? "—", unidade: "kg", cor: "from-slate-500 to-slate-700" },
              ].map((c) => (
                <div key={c.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.cor} flex-shrink-0`} />
                  <div>
                    <p className="text-xs text-slate-400">{c.label}</p>
                    <p className="font-bold text-slate-900">
                      {c.valor}{" "}
                      <span className="text-xs font-normal text-slate-400">{c.unidade}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráficos de evolução */}
          {avals.length >= 2 && (
            <>
              <div>
                <h2 className="text-base font-semibold text-slate-800 mb-4">Evolução</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CardEvolucao
                    titulo="Peso"
                    valorAtual={ultima.peso}
                    valorAnterior={penultima?.peso}
                    unidade="kg"
                    dados={serie((a) => a.peso)}
                    cor={COR_CIANO}
                  />
                  <CardEvolucao
                    titulo="IMC"
                    valorAtual={r?.imc ?? null}
                    valorAnterior={penultima?.resultado?.imc ?? null}
                    unidade="kg/m²"
                    dados={serieRes((r) => r.imc)}
                    cor={COR_VIOLETA}
                    refMin={18.5}
                    refMax={25}
                    classificacao={r?.classificacaoImc}
                    corClass={r?.classificacaoImc ? corRisco(r.classificacaoImc) : undefined}
                  />
                  <CardEvolucao
                    titulo="% Gordura (Petroski)"
                    valorAtual={r?.percGorduraPetroski ?? null}
                    valorAnterior={penultima?.resultado?.percGorduraPetroski ?? null}
                    unidade="%"
                    dados={serieRes((r) => r.percGorduraPetroski)}
                    cor={COR_ROSA}
                  />
                  <CardEvolucao
                    titulo="Massa Muscular (SMM)"
                    valorAtual={r?.massaMuscular ?? null}
                    valorAnterior={penultima?.resultado?.massaMuscular ?? null}
                    unidade="kg"
                    dados={serieRes((r) => r.massaMuscular)}
                    cor="#10b981"
                  />
                  <CardEvolucao
                    titulo="Circunferência da Cintura"
                    valorAtual={ultima.circCintura ?? null}
                    valorAnterior={penultima?.circCintura ?? null}
                    unidade="cm"
                    dados={serie((a) => a.circCintura)}
                    cor={COR_AMBER}
                    classificacao={r?.riscoCintura}
                    corClass={r?.riscoCintura ? corRisco(r.riscoCintura) : undefined}
                  />
                  <CardEvolucao
                    titulo="RCQ"
                    valorAtual={r?.rcq ?? null}
                    valorAnterior={penultima?.resultado?.rcq ?? null}
                    unidade=""
                    dados={serieRes((r) => r.rcq)}
                    cor={COR_AZUL}
                    classificacao={r?.classificacaoRcq}
                    corClass={r?.classificacaoRcq ? corRisco(r.classificacaoRcq) : undefined}
                  />
                </div>
              </div>

              {/* Massa Gorda vs Magra — área empilhada */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-800 mb-4">Massa Gorda vs Massa Magra</h2>
                <GraficoAreaEmpilhada dados={dadosArea} />
              </div>
            </>
          )}

          {/* Composição corporal + Radar dobras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {r?.massaGorda && r?.massaMagra ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-slate-800 mb-1">Composição Corporal</h2>
                <p className="text-xs text-slate-400 mb-4">Última avaliação</p>
                <GraficoComposicao
                  massaGorda={r.massaGorda}
                  massaMagra={r.massaMagra}
                  massaOssea={r.massaOssea}
                  massaMuscular={r.massaMuscular}
                  peso={ultima.peso}
                />
              </div>
            ) : null}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Dobras Cutâneas</h2>
              <p className="text-xs text-slate-400 mb-4">Última avaliação — distribuição</p>
              <GraficoRadarDobras
                tricipital={ultima.dobTricipital}
                subescapular={ultima.dobSubescapular}
                abdominal={ultima.dobAbdominal}
                coxa={ultima.dobCoxa}
                panturrilha={ultima.dobPanturrilha}
              />
            </div>
          </div>

          {/* Barras dobras + Somatocarta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Dobras por Região</h2>
              <p className="text-xs text-slate-400 mb-4">Valores em mm — última avaliação</p>
              <GraficoBarrasAgrupadas dobras={dobrasBarra} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-1">Somatocarta</h2>
              <p className="text-xs text-slate-400 mb-4">
                {r?.biotipo && (
                  <span className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full text-xs font-semibold mr-2">
                    {r.biotipo}
                  </span>
                )}
                Heath-Carter · trajetória entre avaliações
              </p>
              <Somatocarta pontos={pontosSomatocarta} />
            </div>
          </div>

          {/* Somatotipo detalhado */}
          {r?.endomorfia != null && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Somatotipo — Heath-Carter</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Endomorfia", valor: r.endomorfia, cor: "from-pink-400 to-rose-500", bg: "bg-rose-50", text: "text-rose-600", desc: "Adiposidade" },
                  { label: "Mesomorfia", valor: r.mesomorfia, cor: "from-cyan-400 to-teal-500", bg: "bg-cyan-50", text: "text-cyan-600", desc: "Muscularidade" },
                  { label: "Ectomorfia", valor: r.ectomorfia, cor: "from-blue-400 to-indigo-500", bg: "bg-blue-50", text: "text-blue-600", desc: "Linearidade" },
                ].map((c) => (
                  <div key={c.label} className={`${c.bg} rounded-2xl p-5 text-center`}>
                    <p className={`text-xs font-semibold ${c.text} uppercase tracking-wide`}>{c.label}</p>
                    <p className={`text-4xl font-bold ${c.text} mt-2`}>{c.valor?.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de avaliações */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-4">Histórico de Avaliações</h2>
            <div className="space-y-3">
              {[...avals].reverse().map((a, i) => (
                <Link
                  key={a.id}
                  href={`/avaliacao/${a.id}/resultado`}
                  className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-cyan-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-cyan-500" : "bg-slate-200"}`} />
                    <div>
                      <p className="font-medium text-slate-800">{formatarData(a.dataAvaliacao)}</p>
                      <p className="text-slate-400 text-sm">
                        {a.peso} kg · IMC {a.resultado?.imc?.toFixed(1) ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {a.resultado?.percGorduraPetroski && (
                      <span className="text-xs bg-pink-50 text-pink-600 font-semibold px-2 py-1 rounded-lg">
                        {a.resultado.percGorduraPetroski.toFixed(1)}% G
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
