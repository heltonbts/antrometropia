"use client"

import { useEffect, useState } from "react"
import { formatarData, corRisco } from "@/lib/utils"
import { GraficoLinha } from "@/components/charts/GraficoLinha"
import { GraficoComposicao } from "@/components/charts/GraficoComposicao"
import { GraficoAreaEmpilhada } from "@/components/charts/GraficoAreaEmpilhada"
import { Somatocarta } from "@/components/charts/Somatocarta"
import { cn } from "@/lib/utils"

interface Avaliacao {
  id: string
  dataAvaliacao: string
  peso: number
  resultado: {
    imc?: number | null
    classificacaoImc?: string | null
    percGorduraPetroski?: number | null
    percGorduraFaulkner?: number | null
    massaGorda?: number | null
    massaMagra?: number | null
    massaOssea?: number | null
    massaMuscular?: number | null
    rcq?: number | null
    riscoCintura?: string | null
    somatocartaX?: number | null
    somatocartaY?: number | null
    biotipo?: string | null
    endomorfia?: number | null
    mesomorfia?: number | null
    ectomorfia?: number | null
  } | null
}

interface PacienteData {
  nome: string
  avaliacoes: Avaliacao[]
}

function fmt(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

export default function PainelPaciente() {
  const [data, setData] = useState<PacienteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/paciente/painel")
      .then((r) => r.ok ? r.json().catch(() => null) : null)
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400">Carregando...</p>
      </div>
    )
  }

  if (!data) return null

  const avals = data.avaliacoes ?? []
  const ultima = avals[avals.length - 1]
  const penultima = avals[avals.length - 2]
  const r = ultima?.resultado

  const diff = (fn: (a: Avaliacao) => number | null | undefined) => {
    const v1 = penultima ? fn(penultima) : null
    const v2 = ultima ? fn(ultima) : null
    if (v1 == null || v2 == null) return null
    return v2 - v1
  }

  const serie = (fn: (a: Avaliacao) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: fn(a) ?? null }))

  const serieRes = (fn: (r: NonNullable<Avaliacao["resultado"]>) => number | null | undefined) =>
    avals.map((a) => ({ data: fmt(a.dataAvaliacao), valor: a.resultado ? (fn(a.resultado) ?? null) : null }))

  const dadosArea = avals.map((a) => ({
    data: fmt(a.dataAvaliacao),
    massaGorda: a.resultado?.massaGorda ?? null,
    massaMagra: a.resultado?.massaMagra ?? null,
  }))

  const pontosSomato = avals
    .filter((a) => a.resultado?.somatocartaX != null)
    .map((a) => ({ data: fmt(a.dataAvaliacao), x: a.resultado!.somatocartaX!, y: a.resultado!.somatocartaY! }))

  const percG = r?.percGorduraPetroski ?? r?.percGorduraFaulkner ?? null
  const diffPercG = diff((a) => a.resultado?.percGorduraPetroski ?? a.resultado?.percGorduraFaulkner)
  const diffPeso = diff((a) => a.peso)
  const diffImc = diff((a) => a.resultado?.imc)
  const diffMuscular = diff((a) => a.resultado?.massaMuscular)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-bold text-slate-800">NutriEval</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{data.nome}</span>
          <a href="/api/auth/logout" className="text-xs text-slate-400 hover:text-slate-600">Sair</a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Saudação */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Olá, {data.nome.split(" ")[0]} 👋</h1>
          {ultima && (
            <p className="text-slate-400 text-sm mt-1">
              Última avaliação: {formatarData(ultima.dataAvaliacao)}
            </p>
          )}
        </div>

        {avals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
            <p className="text-3xl mb-3">📊</p>
            <p className="font-medium">Nenhuma avaliação ainda</p>
            <p className="text-sm mt-1">Seu nutricionista realizará a primeira avaliação em breve.</p>
          </div>
        ) : (
          <>
            {/* Cards de destaque */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Peso",
                  valor: ultima.peso?.toFixed(1),
                  unidade: "kg",
                  diff: diffPeso,
                  cor: "from-cyan-500 to-blue-600",
                  sombra: "shadow-cyan-100",
                },
                {
                  label: "IMC",
                  valor: r?.imc?.toFixed(1) ?? "—",
                  unidade: "kg/m²",
                  diff: diffImc,
                  cor: "from-violet-500 to-purple-600",
                  sombra: "shadow-violet-100",
                  sub: r?.classificacaoImc,
                },
                {
                  label: "% Gordura",
                  valor: percG?.toFixed(1) ?? "—",
                  unidade: "%",
                  diff: diffPercG,
                  cor: "from-pink-400 to-rose-500",
                  sombra: "shadow-pink-100",
                },
                {
                  label: "Massa Muscular",
                  valor: r?.massaMuscular?.toFixed(1) ?? "—",
                  unidade: "kg",
                  diff: diffMuscular,
                  cor: "from-emerald-400 to-teal-500",
                  sombra: "shadow-emerald-100",
                },
              ].map((c) => {
                const subiu = c.diff !== null && c.diff > 0
                const desceu = c.diff !== null && c.diff < 0
                return (
                  <div key={c.label} className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${c.sombra} p-5`}>
                    <div className={`w-8 h-1.5 rounded-full bg-gradient-to-r ${c.cor} mb-3`} />
                    <p className="text-xs text-slate-400 font-medium">{c.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">
                      {c.valor}
                      <span className="text-xs font-normal text-slate-400 ml-1">{c.unidade}</span>
                    </p>
                    {c.diff !== null && (
                      <p className={cn("text-xs mt-1 font-semibold", subiu ? "text-rose-400" : desceu ? "text-emerald-500" : "text-slate-400")}>
                        {subiu ? "▲" : desceu ? "▼" : "="} {Math.abs(c.diff).toFixed(1)}
                      </p>
                    )}
                    {c.sub && <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>}
                  </div>
                )
              })}
            </div>

            {/* Gráficos — só mostra se tem 2+ avaliações */}
            {avals.length >= 2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Evolução do Peso</p>
                    <GraficoLinha dados={serie((a) => a.peso)} cor="#06b6d4" unidade="kg" altura={180} />
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">% de Gordura</p>
                    <GraficoLinha dados={serieRes((r) => r.percGorduraPetroski ?? r.percGorduraFaulkner)} cor="#f472b6" unidade="%" altura={180} />
                  </div>
                </div>

                {/* Área empilhada */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">Massa Gorda vs Massa Magra</p>
                  <GraficoAreaEmpilhada dados={dadosArea} />
                </div>
              </>
            )}

            {/* Composição corporal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {r?.massaGorda && r?.massaMagra ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-4">Composição Corporal</p>
                  <GraficoComposicao
                    massaGorda={r.massaGorda}
                    massaMagra={r.massaMagra}
                    massaOssea={r.massaOssea}
                    peso={ultima.peso}
                  />
                </div>
              ) : null}

              {pontosSomato.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Somatotipo</p>
                  {r?.biotipo && (
                    <span className="inline-block bg-cyan-50 text-cyan-700 text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                      {r.biotipo}
                    </span>
                  )}
                  <Somatocarta pontos={pontosSomato} />
                </div>
              )}
            </div>

            {/* Histórico */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Histórico de avaliações</p>
              <div className="space-y-2">
                {[...avals].reverse().map((a, i) => {
                  const pG = a.resultado?.percGorduraPetroski ?? a.resultado?.percGorduraFaulkner
                  return (
                    <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-cyan-500" : "bg-slate-200"}`} />
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{formatarData(a.dataAvaliacao)}</p>
                          <p className="text-slate-400 text-xs">{a.peso} kg</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {a.resultado?.imc && (
                          <span className="text-xs bg-violet-50 text-violet-600 font-medium px-2 py-1 rounded-lg">
                            IMC {a.resultado.imc.toFixed(1)}
                          </span>
                        )}
                        {pG && (
                          <span className="text-xs bg-pink-50 text-pink-600 font-medium px-2 py-1 rounded-lg">
                            {pG.toFixed(1)}% G
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
