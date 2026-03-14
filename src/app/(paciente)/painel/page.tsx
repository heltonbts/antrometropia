"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatarData, corDobras } from "@/lib/utils"
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
    formulaReferencia?: string | null
    percGorduraPetroski?: number | null
    percGorduraFaulkner?: number | null
    soma6Dobras?: number | null
    somaTodasDobras?: number | null
    classificacao6Dobras?: string | null
    massaGorda?: number | null
    massaMagra?: number | null
    massaOssea?: number | null
    massaMuscular?: number | null
    rcq?: number | null
    classificacaoRcq?: string | null
    riscoCintura?: string | null
    cmb?: number | null
    cmc?: number | null
    cpRisco?: string | null
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

function n(v: number | null | undefined, casas = 1) {
  if (v == null) return null
  return v.toFixed(casas)
}

// ─── Drawer de detalhe de uma avaliação ──────────────────────────────────────
function DetalheAvaliacao({ aval, onClose }: { aval: Avaliacao; onClose: () => void }) {
  const r = aval.resultado
  const percG = r?.formulaReferencia === "faulkner" ? r?.percGorduraFaulkner : r?.percGorduraPetroski
  const labelPercG = r?.formulaReferencia === "faulkner" ? "% Gordura (Faulkner)" : "% Gordura (Petroski)"

  const metricas = [
    { label: "Peso",          valor: n(aval.peso),        unidade: "kg" },
    { label: "IMC",           valor: n(r?.imc),           unidade: "kg/m²", sub: r?.classificacaoImc },
    { label: labelPercG,      valor: n(percG),             unidade: "%" },
    { label: "Massa Gorda",   valor: n(r?.massaGorda),    unidade: "kg" },
    { label: "Massa Magra",   valor: n(r?.massaMagra),    unidade: "kg" },
    { label: "Massa Muscular",valor: n(r?.massaMuscular), unidade: "kg" },
    { label: "Massa Óssea",   valor: n(r?.massaOssea),    unidade: "kg" },
    { label: "RCQ",           valor: n(r?.rcq, 2),        unidade: "",   sub: r?.classificacaoRcq },
    { label: "Risco Cintura", valor: null,                 unidade: "",   sub: r?.riscoCintura },
    { label: "CMB",           valor: n(r?.cmb),           unidade: "cm" },
    { label: "CMC",           valor: n(r?.cmc),           unidade: "cm" },
    { label: "Soma 6 Dobras", valor: n(r?.soma6Dobras),   unidade: "mm", badge: r?.classificacao6Dobras },
    { label: "Soma Todas as Dobras", valor: n(r?.somaTodasDobras), unidade: "mm" },
  ].filter((m) => m.valor != null || m.sub != null || m.badge != null)

  const temSomato = r?.endomorfia != null && r?.mesomorfia != null && r?.ectomorfia != null

  // Fechar com ESC
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [onClose])

  // Bloquear scroll do body
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Painel — bottom sheet no mobile, modal centralizado no desktop */}
      <div className="relative w-full md:max-w-lg md:mx-auto md:mb-0 bg-white md:rounded-[28px] rounded-t-[28px] shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh]">

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header do drawer */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400">Avaliação</p>
            <h2 className="text-lg font-semibold text-slate-900 mt-0.5">
              {new Date(aval.dataAvaliacao).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center text-slate-500 text-sm font-bold mt-0.5"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo rolável */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* Grid de métricas */}
          <div className="grid grid-cols-2 gap-2.5">
            {metricas.map((m) => (
              <div key={m.label} className="glass-panel rounded-[18px] p-3.5">
                <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-slate-400">{m.label}</p>
                {m.valor != null && (
                  <p className="text-lg font-bold text-slate-800 mt-1.5">
                    {m.valor}
                    {m.unidade && <span className="text-xs font-normal text-slate-400 ml-1">{m.unidade}</span>}
                  </p>
                )}
                {m.badge && (
                  <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-lg text-xs font-bold font-mono-ui uppercase tracking-[0.12em] ${corDobras(m.badge)}`}>
                    {m.badge}
                  </span>
                )}
                {m.sub && !m.badge && (
                  <p className="text-xs text-slate-500 mt-1 leading-tight">{m.sub}</p>
                )}
              </div>
            ))}
          </div>

          {/* Somatotipo */}
          {temSomato && (
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-2.5">Somatotipo — Heath-Carter</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="metric-card rounded-[18px] bg-gradient-to-br from-[#c96d42] to-[#d88c5b] p-4 text-white text-center">
                  <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/70">Endomorfia</p>
                  <p className="text-2xl font-bold mt-2">{n(r?.endomorfia, 2)}</p>
                </div>
                <div className="metric-card rounded-[18px] bg-gradient-to-br from-[#1f8a70] to-[#2a9d8f] p-4 text-white text-center">
                  <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/70">Mesomorfia</p>
                  <p className="text-2xl font-bold mt-2">{n(r?.mesomorfia, 2)}</p>
                </div>
                <div className="metric-card rounded-[18px] bg-gradient-to-br from-[#264653] to-[#4d6a77] p-4 text-white text-center">
                  <p className="font-mono-ui text-[9px] uppercase tracking-[0.18em] text-white/70">Ectomorfia</p>
                  <p className="text-2xl font-bold mt-2">{n(r?.ectomorfia, 2)}</p>
                </div>
              </div>
              {r?.biotipo && (
                <p className="text-center mt-3 text-sm font-semibold text-[color:var(--accent)]">
                  Biotipo: {r.biotipo}
                </p>
              )}
            </div>
          )}

          {/* Composição corporal */}
          {r?.massaGorda && r?.massaMagra && (
            <div>
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-2.5">Composição Corporal</p>
              <GraficoComposicao
                massaGorda={r.massaGorda}
                massaMagra={r.massaMagra}
                massaOssea={r.massaOssea}
                massaMuscular={r.massaMuscular}
                peso={aval.peso}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PainelPaciente() {
  const [data, setData] = useState<PacienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [avalSelecionada, setAvalSelecionada] = useState<Avaliacao | null>(null)

  useEffect(() => {
    fetch("/api/paciente/painel")
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) { window.location.href = "/login"; return null }
        return r.ok ? r.json().catch(() => null) : null
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen hero-grid flex items-center justify-center">
        <p className="text-slate-400 font-mono-ui text-sm uppercase tracking-[0.2em]">Carregando...</p>
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

  const percG = (r?.formulaReferencia === "faulkner" ? r?.percGorduraFaulkner : r?.percGorduraPetroski) ?? null
  const diffPeso     = diff((a) => a.peso)
  const diffImc      = diff((a) => a.resultado?.imc)
  const diffPercG    = diff((a) => a.resultado?.formulaReferencia === "faulkner" ? a.resultado?.percGorduraFaulkner : a.resultado?.percGorduraPetroski)
  const diffMuscular = diff((a) => a.resultado?.massaMuscular)

  return (
    <>
      {avalSelecionada && (
        <DetalheAvaliacao aval={avalSelecionada} onClose={() => setAvalSelecionada(null)} />
      )}

      <div className="hero-grid min-h-screen md:px-6 md:py-6">
        <div className="glass-panel-strong flex flex-col min-h-screen md:min-h-[calc(100vh-3rem)] md:rounded-[36px]">

          {/* Header */}
          <header className="px-4 py-4 md:px-8 md:py-6 flex items-center justify-between border-b border-[rgba(23,32,51,0.08)] sticky top-0 bg-[rgba(255,255,255,0.72)] backdrop-blur-xl z-10 md:rounded-t-[36px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center shadow-[0_12px_28px_rgba(31,138,112,0.22)]">
                <span className="text-white text-xs md:text-sm font-bold">N</span>
              </div>
              <div>
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</p>
                <p className="text-sm font-semibold text-slate-900 leading-none mt-0.5">Painel do Paciente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:block">{data.nome}</span>
              <Link
                href="/conta"
                className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-700 transition"
              >
                Conta
              </Link>
              <button
              onClick={async () => { await fetch("/api/auth/logout"); window.location.href = "/login" }}
              className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-700 transition"
            >Sair</button>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 md:px-8 md:py-8 space-y-6 md:space-y-8">

            {/* Saudação */}
            <div>
              <div className="eyebrow">Sua evolução</div>
              <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-slate-900">
                Olá, {data.nome.split(" ")[0]}
              </h1>
              {ultima && (
                <p className="text-slate-400 text-sm mt-1.5">
                  Última avaliação: {formatarData(ultima.dataAvaliacao)}
                </p>
              )}
            </div>

            {avals.length === 0 ? (
              <div className="glass-panel rounded-[24px] p-10 text-center text-slate-400">
                <p className="font-mono-ui text-sm mb-3 text-[color:var(--accent)]">EMPTY</p>
                <p className="font-medium">Nenhuma avaliação ainda</p>
                <p className="text-sm mt-1">Seu nutricionista realizará a primeira avaliação em breve.</p>
              </div>
            ) : (
              <>
                {/* Cards principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Peso",           valor: n(ultima.peso),             unidade: "kg",    diff: diffPeso,     tone: "from-[#1f8a70] to-[#2a9d8f]",  sub: null },
                    { label: "IMC",            valor: n(r?.imc) ?? "—",           unidade: "kg/m²", diff: diffImc,      tone: "from-[#264653] to-[#4d6a77]",  sub: r?.classificacaoImc },
                    { label: "% Gordura",      valor: n(percG) ?? "—",            unidade: "%",     diff: diffPercG,    tone: "from-[#c96d42] to-[#d88c5b]",  sub: null },
                    { label: "Massa Muscular", valor: n(r?.massaMuscular) ?? "—", unidade: "kg",    diff: diffMuscular, tone: "from-[#1f8a70] to-[#264653]",  sub: null },
                  ].map((c) => {
                    const subiu  = c.diff !== null && c.diff > 0
                    const desceu = c.diff !== null && c.diff < 0
                    return (
                      <div key={c.label} className={`metric-card rounded-[20px] bg-gradient-to-br ${c.tone} p-4 md:p-5 text-white`}>
                        <p className="font-mono-ui text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/70">{c.label}</p>
                        <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3">
                          {c.valor}
                          <span className="text-xs font-normal text-white/60 ml-1">{c.unidade}</span>
                        </p>
                        {c.diff !== null && (
                          <p className={cn("text-xs mt-1.5 font-semibold", subiu || desceu ? "text-white/80" : "text-white/60")}>
                            {subiu ? "▲" : desceu ? "▼" : "="} {Math.abs(c.diff).toFixed(1)}
                          </p>
                        )}
                        {c.sub && <p className="text-xs text-white/70 mt-1 leading-tight">{c.sub}</p>}
                      </div>
                    )
                  })}
                </div>

                {/* Cards de dobras */}
                {(r?.soma6Dobras != null || r?.somaTodasDobras != null) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="metric-card rounded-[20px] bg-gradient-to-br from-[#c96d42] to-[#264653] p-4 md:p-5 text-white">
                      <p className="font-mono-ui text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/70">Soma 6 Dobras</p>
                      <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3">
                        {r?.soma6Dobras?.toFixed(1) ?? "—"}
                        <span className="text-xs font-normal text-white/60 ml-1">mm</span>
                      </p>
                      {penultima?.resultado?.soma6Dobras != null && r?.soma6Dobras != null && (
                        <p className="text-xs mt-1 font-semibold text-white/80">
                          {r.soma6Dobras > penultima.resultado.soma6Dobras ? "▲" : "▼"}{" "}
                          {Math.abs(r.soma6Dobras - penultima.resultado.soma6Dobras).toFixed(1)}
                        </p>
                      )}
                      {r?.classificacao6Dobras && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-xs font-bold font-mono-ui uppercase tracking-[0.12em] ${corDobras(r.classificacao6Dobras)}`}>
                          {r.classificacao6Dobras}
                        </span>
                      )}
                    </div>
                    <div className="metric-card rounded-[20px] bg-gradient-to-br from-[#264653] to-[#c96d42] p-4 md:p-5 text-white">
                      <p className="font-mono-ui text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-white/70">Soma Todas as Dobras</p>
                      <p className="text-xl md:text-2xl font-bold mt-2 md:mt-3">
                        {r?.somaTodasDobras?.toFixed(1) ?? "—"}
                        <span className="text-xs font-normal text-white/60 ml-1">mm</span>
                      </p>
                      {penultima?.resultado?.somaTodasDobras != null && r?.somaTodasDobras != null && (
                        <p className="text-xs mt-1 font-semibold text-white/80">
                          {r.somaTodasDobras > penultima.resultado.somaTodasDobras ? "▲" : "▼"}{" "}
                          {Math.abs(r.somaTodasDobras - penultima.resultado.somaTodasDobras).toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Gráficos */}
                {avals.length >= 2 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-panel rounded-[24px] p-4 md:p-5">
                        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Evolução do Peso</p>
                        <GraficoLinha dados={serie((a) => a.peso)} cor="#1f8a70" unidade="kg" altura={160} />
                      </div>
                      <div className="glass-panel rounded-[24px] p-4 md:p-5">
                        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">% de Gordura</p>
                        <GraficoLinha dados={serieRes((r) => r.formulaReferencia === "faulkner" ? r.percGorduraFaulkner : r.percGorduraPetroski)} cor="#c96d42" unidade="%" altura={160} />
                      </div>
                    </div>

                    <div className="glass-panel rounded-[24px] p-4 md:p-6">
                      <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Massa Gorda vs Massa Magra</p>
                      <GraficoAreaEmpilhada dados={dadosArea} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-panel rounded-[24px] p-4 md:p-5">
                        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Soma 6 Dobras</p>
                        <GraficoLinha dados={serieRes((r) => r.soma6Dobras)} cor="#c96d42" unidade="mm" altura={150} />
                      </div>
                      <div className="glass-panel rounded-[24px] p-4 md:p-5">
                        <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Soma Todas as Dobras</p>
                        <GraficoLinha dados={serieRes((r) => r.somaTodasDobras)} cor="#264653" unidade="mm" altura={150} />
                      </div>
                    </div>
                  </>
                )}

                {/* Composição + Somatocarta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {r?.massaGorda && r?.massaMagra ? (
                    <div className="glass-panel rounded-[24px] p-4 md:p-6">
                      <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">Composição Corporal</p>
                      <GraficoComposicao
                        massaGorda={r.massaGorda}
                        massaMagra={r.massaMagra}
                        massaOssea={r.massaOssea}
                        massaMuscular={r.massaMuscular}
                        peso={ultima.peso}
                      />
                    </div>
                  ) : null}

                  {pontosSomato.length > 0 && (
                    <div className="glass-panel rounded-[24px] p-4 md:p-6">
                      <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-1">Somatotipo</p>
                      {r?.biotipo && (
                        <span className="inline-block bg-[rgba(31,138,112,0.1)] text-[color:var(--accent)] text-xs font-semibold px-2 py-0.5 rounded-full mb-3">
                          {r.biotipo}
                        </span>
                      )}
                      <div className="mb-3 overflow-hidden rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white/70">
                        <Image
                          src="/avateres.png"
                          alt="Referência visual dos biotipos da somatocarta"
                          width={1200}
                          height={675}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                      <Somatocarta pontos={pontosSomato} />
                    </div>
                  )}
                </div>

                {/* Histórico — clicável */}
                <div className="pb-6">
                  <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 mb-3">
                    Histórico de avaliações
                    <span className="ml-2 normal-case tracking-normal text-[10px] text-slate-300">— toque para ver detalhes</span>
                  </p>
                  <div className="space-y-2">
                    {[...avals].reverse().map((a, i) => {
                      const pG = a.resultado?.formulaReferencia === "faulkner" ? a.resultado?.percGorduraFaulkner : a.resultado?.percGorduraPetroski
                      return (
                        <button
                          key={a.id}
                          onClick={() => setAvalSelecionada(a)}
                          className="w-full text-left glass-panel flex items-center justify-between rounded-[20px] p-3.5 md:p-4 hover:border-[rgba(31,138,112,0.25)] hover:shadow-sm active:scale-[0.99] transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${i === 0 ? "bg-[color:var(--accent)]" : "bg-slate-200"}`} />
                            <div>
                              <p className="font-medium text-slate-800 text-sm">{formatarData(a.dataAvaliacao)}</p>
                              <p className="text-slate-400 text-xs">{a.peso} kg</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-1.5 flex-wrap justify-end">
                              {a.resultado?.imc && (
                                <span className="font-mono-ui text-[10px] bg-[rgba(38,70,83,0.08)] text-[color:var(--accent-3)] font-semibold px-2 py-1 rounded-lg">
                                  IMC {a.resultado.imc.toFixed(1)}
                                </span>
                              )}
                              {pG && (
                                <span className="font-mono-ui text-[10px] bg-[rgba(201,109,66,0.1)] text-[color:var(--accent-2)] font-semibold px-2 py-1 rounded-lg">
                                  {pG.toFixed(1)}% G
                                </span>
                              )}
                            </div>
                            <span className="text-slate-300 text-sm ml-1">›</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
