"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { toPng } from "html-to-image"

export interface AvaliacaoStory {
  dataAvaliacao: string
  peso: number
  resultado: {
    formulaReferencia?: string | null
    percGorduraPetroski?: number | null
    percGorduraFaulkner?: number | null
    massaGorda?: number | null
    massaMagra?: number | null
    massaMuscular?: number | null
    soma6Dobras?: number | null
    somaTodasDobras?: number | null
    classificacao6Dobras?: string | null
    imc?: number | null
    classificacaoImc?: string | null
    rcq?: number | null
    classificacaoRcq?: string | null
    riscoCintura?: string | null
  } | null
}

// ─── Tipos de slide ───────────────────────────────────────────────────────────

type SlideTexto  = { kind: "texto";   texto: string; tamanho: "xs" | "md" | "lg" | "xl"; cor?: string }
type SlidePeso   = { kind: "peso";    anterior: number; atual: number }
type SlideGord   = { kind: "gordura"; anteriorPct: number; atualPct: number; deltaPct: number }
type SlideMusc   = { kind: "musculo"; anterior: number; atual: number; delta: number }
type SlideDobras = { kind: "dobras";  anterior: number; atual: number; delta: number; classAtual: string | null }
type SlideResumo = { kind: "resumo";  items: ResumoItem[] }
type SlideShare  = {
  kind: "share"
  nome: string; mes: string
  peso: number; dPeso: number
  gordura: number | null; dGordura: number | null
  musculo: number | null; dMusculo: number | null
  soma6: number | null; dSoma6: number | null
  imc: number | null; classImc: string | null
  frase: string
}

type Slide = SlideTexto | SlidePeso | SlideGord | SlideMusc | SlideDobras | SlideResumo | SlideShare

interface ResumoItem {
  label: string; valor: string; delta: string | null; bom: boolean | null; badge?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function percG(a: AvaliacaoStory): number | null {
  const r = a.resultado
  if (!r) return null
  return r.formulaReferencia === "faulkner" ? (r.percGorduraFaulkner ?? null) : (r.percGorduraPetroski ?? null)
}

function mesNome(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
}

function dif(a: number | null, b: number | null, dec = 1): number | null {
  if (a == null || b == null) return null
  return +((a - b).toFixed(dec))
}

function duracaoSlide(s: Slide): number {
  if (s.kind === "texto")  return 4000
  if (s.kind === "resumo") return 6000
  if (s.kind === "share")  return 999999
  return 5500
}

// ─── Gerador de slides ────────────────────────────────────────────────────────

function gerarSlides(nome: string, avaliacoes: AvaliacaoStory[]): Slide[] {
  const primeiro = nome.split(" ")[0]
  if (!avaliacoes.length) return [{ kind: "texto", texto: "Nenhuma avaliação.", tamanho: "md" }]

  const ult = avaliacoes[avaliacoes.length - 1]
  const pen = avaliacoes.length >= 2 ? avaliacoes[avaliacoes.length - 2] : null
  const mes = mesNome(ult.dataAvaliacao)

  // ── 1 avaliação ──
  if (!pen) {
    return [
      { kind: "texto", texto: mes.toUpperCase(), tamanho: "xs", cor: "rgba(255,255,255,0.32)" },
      { kind: "texto", texto: primeiro + ".", tamanho: "xl" },
      { kind: "texto", texto: "Este é o seu ponto de partida.", tamanho: "lg" },
      { kind: "peso",  anterior: ult.peso, atual: ult.peso },
      { kind: "texto", texto: "Cada número aqui é uma linha de largada.", tamanho: "md" },
      { kind: "texto", texto: "A história está só começando.", tamanho: "md" },
      { kind: "texto", texto: "Continue.", tamanho: "xl", cor: "#06b6d4" },
      {
        kind: "share", nome: primeiro, mes, peso: ult.peso, dPeso: 0,
        gordura: percG(ult), dGordura: null, musculo: ult.resultado?.massaMuscular ?? null, dMusculo: null,
        soma6: ult.resultado?.soma6Dobras ?? null, dSoma6: null,
        imc: ult.resultado?.imc ?? null, classImc: ult.resultado?.classificacaoImc ?? null,
        frase: "A história está só começando.",
      },
    ]
  }

  // ── 2+ avaliações ──
  const dPeso   = +(ult.peso - pen.peso).toFixed(1)
  const gAtu    = percG(ult);         const gAnt    = percG(pen)
  const dGord   = dif(gAtu, gAnt)
  const dGordKg = dif(ult.resultado?.massaGorda ?? null, pen.resultado?.massaGorda ?? null)
  const mAtu    = ult.resultado?.massaMuscular ?? null; const mAnt = pen.resultado?.massaMuscular ?? null
  const dMusc   = dif(mAtu, mAnt)
  const s6Atu   = ult.resultado?.soma6Dobras ?? null;   const s6Ant = pen.resultado?.soma6Dobras ?? null
  const dS6     = dif(s6Atu, s6Ant)
  const imcAtu  = ult.resultado?.imc ?? null
  const classImcAtu = ult.resultado?.classificacaoImc ?? null
  const rcqAtu  = ult.resultado?.rcq ?? null
  const classRcqAtu = ult.resultado?.classificacaoRcq ?? null
  const riscoCint = ult.resultado?.riscoCintura ?? null
  const class6Atu = ult.resultado?.classificacao6Dobras ?? null

  const positivo = +dPeso < -0.05 || (dGord !== null && dGord < 0) || (dMusc !== null && dMusc > 0) || (dS6 !== null && dS6 < 0)
  const ss: Slide[] = []

  // Intro
  ss.push({ kind: "texto", texto: mes.toUpperCase(), tamanho: "xs", cor: "rgba(255,255,255,0.32)" })
  ss.push({ kind: "texto", texto: primeiro + ".", tamanho: "xl" })

  // Peso
  ss.push({ kind: "texto", texto: `Você veio de ${pen.peso.toFixed(1)} kg.`, tamanho: "md", cor: "rgba(255,255,255,0.38)" })
  ss.push({ kind: "peso", anterior: pen.peso, atual: ult.peso })
  if (Math.abs(dPeso) >= 0.1) {
    if (dPeso < 0) {
      ss.push({ kind: "texto", texto: `${Math.abs(dPeso).toFixed(1)} kg a menos.`, tamanho: "xl", cor: "#10b981" })
      ss.push({ kind: "texto", texto: Math.abs(dPeso) >= 3 ? "Resultado de escolha, dia após dia." : "Cada grama conta.", tamanho: "md" })
    } else {
      ss.push({ kind: "texto", texto: `${dPeso.toFixed(1)} kg a mais.`, tamanho: "xl" })
      ss.push({
        kind: "texto",
        texto: dMusc !== null && dMusc > 0 && dMusc >= dPeso * 0.5 ? "Em grande parte, é músculo." : "O caminho é longo. E você está nele.",
        tamanho: "md",
        cor: dMusc !== null && dMusc > 0 && dMusc >= dPeso * 0.5 ? "#06b6d4" : undefined,
      })
    }
  } else {
    ss.push({ kind: "texto", texto: "O peso se manteve.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Estabilidade também é conquista.", tamanho: "md" })
  }

  // IMC — mostrar se disponível
  if (imcAtu !== null && classImcAtu) {
    ss.push({ kind: "texto", texto: `IMC: ${imcAtu.toFixed(1)} kg/m²`, tamanho: "lg" })
    ss.push({ kind: "texto", texto: classImcAtu + ".", tamanho: "md", cor: "rgba(255,255,255,0.55)" })
  }

  // Gordura
  if (gAtu !== null && gAnt !== null) {
    ss.push({ kind: "gordura", anteriorPct: gAnt, atualPct: gAtu, deltaPct: dGord ?? 0 })
    if (dGord !== null && Math.abs(dGord) >= 0.3) {
      if (dGord < 0) {
        ss.push({ kind: "texto", texto: `Gordura corporal: −${Math.abs(dGord).toFixed(1)}%.`, tamanho: "lg", cor: "#10b981" })
        if (dGordKg !== null && dGordKg < 0)
          ss.push({ kind: "texto", texto: `${Math.abs(dGordKg).toFixed(1)} kg de gordura eliminados.`, tamanho: "xl", cor: "#10b981" })
        ss.push({ kind: "texto", texto: "Isso muda o corpo por dentro.", tamanho: "md" })
      } else {
        ss.push({ kind: "texto", texto: `A gordura subiu ${dGord.toFixed(1)}%.`, tamanho: "lg" })
        ss.push({ kind: "texto", texto: "O corpo está pedindo atenção.", tamanho: "md" })
      }
    }
  }

  // Dobras cutâneas
  if (s6Atu !== null && s6Ant !== null) {
    ss.push({ kind: "dobras", anterior: s6Ant, atual: s6Atu, delta: dS6 ?? 0, classAtual: class6Atu })
    if (dS6 !== null && Math.abs(dS6) >= 1) {
      if (dS6 < 0) {
        ss.push({ kind: "texto", texto: `−${Math.abs(dS6).toFixed(1)} mm nas dobras.`, tamanho: "xl", cor: "#8b5cf6" })
        ss.push({ kind: "texto", texto: "Gordura subcutânea em queda.", tamanho: "md" })
      } else {
        ss.push({ kind: "texto", texto: `As dobras subiram ${dS6.toFixed(1)} mm.`, tamanho: "lg" })
        ss.push({ kind: "texto", texto: "O protocolo pede atenção.", tamanho: "md" })
      }
    }
    if (class6Atu) {
      ss.push({ kind: "texto", texto: `Classificação: ${class6Atu}.`, tamanho: "md", cor: "rgba(255,255,255,0.55)" })
    }
  }

  // Músculo
  if (mAtu !== null && mAnt !== null) {
    ss.push({ kind: "musculo", anterior: mAnt, atual: mAtu, delta: dMusc ?? 0 })
    if (dMusc !== null && dMusc >= 0.2) {
      ss.push({ kind: "texto", texto: `+${dMusc.toFixed(1)} kg de massa muscular.`, tamanho: "xl", cor: "#06b6d4" })
      ss.push({ kind: "texto", texto: "Músculo não aparece do nada.", tamanho: "md" })
      ss.push({ kind: "texto", texto: "Você construiu isso.", tamanho: "lg", cor: "#06b6d4" })
    } else if (dMusc !== null && dMusc < -0.2) {
      ss.push({ kind: "texto", texto: "A massa muscular pediu atenção.", tamanho: "lg" })
      ss.push({ kind: "texto", texto: "Nutrição e treino andam juntos.", tamanho: "md" })
    }
  }

  // Resumo com índices e classificações
  const resumo: ResumoItem[] = [
    { label: "Peso",  valor: `${ult.peso.toFixed(1)} kg`, delta: Math.abs(dPeso) >= 0.1 ? `${dPeso > 0 ? "+" : ""}${dPeso.toFixed(1)} kg` : null, bom: dPeso < -0.05 ? true : dPeso > 0.05 ? false : null },
  ]
  if (imcAtu !== null)
    resumo.push({ label: "IMC", valor: `${imcAtu.toFixed(1)} kg/m²`, delta: null, bom: null, badge: classImcAtu ?? undefined })
  if (gAtu !== null && dGord !== null)
    resumo.push({ label: "% Gordura", valor: `${gAtu.toFixed(1)}%`, delta: Math.abs(dGord) >= 0.3 ? `${dGord > 0 ? "+" : ""}${dGord.toFixed(1)}%` : null, bom: dGord < 0 ? true : dGord > 0 ? false : null })
  if (s6Atu !== null && dS6 !== null)
    resumo.push({ label: "Σ 6 Dobras", valor: `${s6Atu.toFixed(1)} mm`, delta: Math.abs(dS6) >= 1 ? `${dS6 > 0 ? "+" : ""}${dS6.toFixed(1)} mm` : null, bom: dS6 < 0 ? true : dS6 > 0 ? false : null, badge: class6Atu ?? undefined })
  if (mAtu !== null && dMusc !== null)
    resumo.push({ label: "Massa Muscular", valor: `${mAtu.toFixed(1)} kg`, delta: Math.abs(dMusc) >= 0.2 ? `${dMusc > 0 ? "+" : ""}${dMusc.toFixed(1)} kg` : null, bom: dMusc > 0 ? true : dMusc < 0 ? false : null })
  if (rcqAtu !== null && classRcqAtu)
    resumo.push({ label: "RCQ", valor: rcqAtu.toFixed(2), delta: null, bom: null, badge: classRcqAtu })
  if (riscoCint)
    resumo.push({ label: "Risco Cintura", valor: "", delta: null, bom: null, badge: riscoCint })
  ss.push({ kind: "resumo", items: resumo })

  // Fechamento
  const frase = positivo ? "Você compareceu. Mediu. Evoluiu." : "Todo mês é uma nova chance. Continue."
  if (positivo) {
    ss.push({ kind: "texto", texto: "Você compareceu.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Mediu.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Evoluiu.", tamanho: "xl", cor: "#06b6d4" })
  } else {
    ss.push({ kind: "texto", texto: "Todo mês é uma nova chance.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Continue.", tamanho: "xl", cor: "#06b6d4" })
  }

  // Cartão de compartilhamento
  ss.push({
    kind: "share", nome: primeiro, mes, peso: ult.peso, dPeso,
    gordura: gAtu, dGordura: dGord, musculo: mAtu, dMusculo: dMusc,
    soma6: s6Atu, dSoma6: dS6,
    imc: imcAtu, classImc: classImcAtu,
    frase,
  })

  return ss
}

// ─── Cartão de compartilhamento (1080×1080 via pixelRatio 4) ─────────────────

interface MetricaCard { label: string; valor: string; delta: string | null; bom: boolean | null }

function CartaoCompartilhamento({ slide, cardRef }: { slide: SlideShare; cardRef: React.RefObject<HTMLDivElement | null> }) {
  const metricas: MetricaCard[] = [
    { label: "PESO", valor: `${slide.peso.toFixed(1)} kg`, delta: Math.abs(slide.dPeso) >= 0.1 ? `${slide.dPeso > 0 ? "+" : ""}${slide.dPeso.toFixed(1)} kg` : null, bom: slide.dPeso < -0.05 ? true : slide.dPeso > 0.05 ? false : null },
  ]
  if (slide.gordura !== null)
    metricas.push({ label: "GORDURA", valor: `${slide.gordura.toFixed(1)}%`, delta: slide.dGordura !== null && Math.abs(slide.dGordura) >= 0.3 ? `${slide.dGordura > 0 ? "+" : ""}${slide.dGordura.toFixed(1)}%` : null, bom: slide.dGordura !== null ? slide.dGordura < 0 : null })
  if (slide.musculo !== null)
    metricas.push({ label: "MÚSCULO", valor: `${slide.musculo.toFixed(1)} kg`, delta: slide.dMusculo !== null && Math.abs(slide.dMusculo) >= 0.2 ? `${slide.dMusculo > 0 ? "+" : ""}${slide.dMusculo.toFixed(1)} kg` : null, bom: slide.dMusculo !== null ? slide.dMusculo > 0 : null })
  if (slide.soma6 !== null)
    metricas.push({ label: "Σ6 DOBRAS", valor: `${slide.soma6.toFixed(0)} mm`, delta: slide.dSoma6 !== null && Math.abs(slide.dSoma6) >= 1 ? `${slide.dSoma6 > 0 ? "+" : ""}${slide.dSoma6.toFixed(1)} mm` : null, bom: slide.dSoma6 !== null ? slide.dSoma6 < 0 : null })

  const isGrid = metricas.length >= 4

  const MetricBox = ({ m, small }: { m: MetricaCard; small?: boolean }) => (
    <div style={{
      flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: small ? 9 : 11,
      padding: small ? "7px 6px" : "9px 8px", display: "flex", flexDirection: "column", gap: 2,
    }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: small ? 5.5 : 6.5, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>{m.label}</p>
      <p style={{ color: "white", fontSize: small ? 12 : 14, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{m.valor}</p>
      {m.delta && (
        <p style={{ fontSize: small ? 8 : 9.5, fontWeight: 700, margin: 0, color: m.bom === true ? "#10b981" : m.bom === false ? "#f59e0b" : "rgba(255,255,255,0.4)" }}>
          {m.delta}
        </p>
      )}
    </div>
  )

  return (
    <div ref={cardRef} style={{
      width: 270, height: 270,
      background: "linear-gradient(135deg, #0f0c29 0%, #1b1640 45%, #0d1a2e 100%)",
      borderRadius: 20, padding: 22,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden", boxSizing: "border-box",
    }}>
      {/* Glows */}
      <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, background: "radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Topo */}
      <div>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>antrometropia</p>
        <p style={{ color: "white", fontSize: 30, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.025em", margin: 0 }}>{slide.nome}.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
          <p style={{ color: "rgba(255,255,255,0.32)", fontSize: 9, letterSpacing: "0.06em", textTransform: "capitalize", margin: 0 }}>{slide.mes}</p>
          {slide.imc !== null && slide.classImc && (
            <span style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 7, padding: "2px 6px", borderRadius: 4, letterSpacing: "0.08em" }}>
              IMC {slide.imc.toFixed(1)} · {slide.classImc}
            </span>
          )}
        </div>
      </div>

      {/* Métricas */}
      {isGrid ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
          {metricas.map((m) => <MetricBox key={m.label} m={m} small />)}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 5 }}>
          {metricas.map((m) => <MetricBox key={m.label} m={m} />)}
        </div>
      )}

      {/* Frase */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.09)", paddingTop: 10 }}>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 10, fontStyle: "italic", lineHeight: 1.55, margin: "0 0 6px 0" }}>"{slide.frase}"</p>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>antrometropia.com.br</p>
      </div>
    </div>
  )
}

// ─── Sub-componentes visuais ──────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

function ColunaBarra({ label, valor, pct, cor, delay, unidade = "kg" }: {
  label: string; valor: number; pct: number; cor: string; delay: number; unidade?: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.span className="text-2xl font-bold text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.7 }}>
        {valor.toFixed(unidade === "mm" ? 0 : 1)}
      </motion.span>
      <span className="text-white/40 text-xs -mt-2">{unidade}</span>
      <div className="w-[72px] rounded-[16px] relative overflow-hidden" style={{ height: 140, background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="absolute bottom-0 left-0 right-0 rounded-[16px]" style={{ background: cor }} initial={{ height: 0 }} animate={{ height: `${pct}%` }} transition={{ duration: 1.3, delay, ease: EASE }} />
      </div>
      <span className="text-white/40 text-[11px] tracking-widest uppercase font-mono-ui">{label}</span>
    </div>
  )
}

function SlidePesoRender({ slide }: { slide: SlidePeso }) {
  const { anterior, atual } = slide
  const unico  = anterior === atual
  const max    = Math.max(anterior, atual) * 1.1
  const corAtu = atual < anterior ? "#10b981" : atual > anterior ? "#f59e0b" : "#06b6d4"
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">{unico ? "Peso atual" : "Evolução do peso"}</p>
      <div className="flex items-end gap-8 justify-center">
        {unico ? (
          <ColunaBarra label="Atual"  valor={atual}    pct={(atual / max) * 100}    cor="#06b6d4"                 delay={0.2} />
        ) : (
          <>
            <ColunaBarra label="Antes" valor={anterior} pct={(anterior / max) * 100} cor="rgba(255,255,255,0.22)" delay={0.2} />
            <ColunaBarra label="Agora" valor={atual}    pct={(atual / max) * 100}    cor={corAtu}                 delay={0.5} />
          </>
        )}
      </div>
    </div>
  )
}

function AnelGordura({ pct, cor, delay, label }: { pct: number; cor: string; delay: number; label: string }) {
  const R = 60; const SIZE = 152; const cx = SIZE / 2; const cy = SIZE / 2
  const circum = 2 * Math.PI * R
  const dash   = circum * (1 - Math.min(pct, 60) / 60)
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
          <g transform={`rotate(-90, ${cx}, ${cy})`}>
            <motion.circle cx={cx} cy={cy} r={R} fill="none" stroke={cor} strokeWidth="11" strokeLinecap="round"
              strokeDasharray={circum} initial={{ strokeDashoffset: circum }} animate={{ strokeDashoffset: dash }}
              transition={{ duration: 1.6, delay, ease: EASE }} />
          </g>
        </svg>
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.9 }}>
          <span className="text-xl font-bold" style={{ color: cor }}>{pct.toFixed(1)}%</span>
          <span className="text-white/30 text-[9px] tracking-widest font-mono-ui uppercase mt-0.5">{label}</span>
        </motion.div>
      </div>
    </div>
  )
}

function SlideGordRender({ slide }: { slide: SlideGord }) {
  const { anteriorPct, atualPct, deltaPct } = slide
  const melhorou = deltaPct < 0
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">Gordura corporal</p>
      <div className="flex gap-8 items-end">
        <AnelGordura pct={anteriorPct} cor="rgba(244,114,182,0.45)" delay={0.2} label="antes" />
        <AnelGordura pct={atualPct}   cor={melhorou ? "#10b981" : "#ec4899"}  delay={0.5} label="agora" />
      </div>
      {Math.abs(deltaPct) >= 0.3 && (
        <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{ background: melhorou ? "rgba(16,185,129,0.12)" : "rgba(236,72,153,0.12)", color: melhorou ? "#10b981" : "#ec4899", border: `1px solid ${melhorou ? "rgba(16,185,129,0.25)" : "rgba(236,72,153,0.25)"}` }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
        >
          {deltaPct > 0 ? "+" : ""}{deltaPct.toFixed(1)}%
        </motion.div>
      )}
    </div>
  )
}

function BarrasHorizontais({ items, titulo }: {
  titulo: string
  items: { label: string; valor: number; pct: number; cor: string; delay: number; valorCor: string; unidade?: string }[]
}) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[300px]">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">{titulo}</p>
      <div className="w-full space-y-4">
        {items.map((b) => (
          <div key={b.label} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-white/40 text-[11px] tracking-widest uppercase font-mono-ui">{b.label}</span>
              <motion.span className="text-lg font-bold" style={{ color: b.valorCor }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: b.delay + 0.8 }}>
                {b.valor.toFixed(b.unidade === "mm" ? 0 : 1)} {b.unidade ?? "kg"}
              </motion.span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div className="h-full rounded-full" style={{ background: b.cor }} initial={{ width: 0 }} animate={{ width: `${b.pct}%` }} transition={{ duration: 1.3, delay: b.delay, ease: EASE }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideMuscRender({ slide }: { slide: SlideMusc }) {
  const { anterior, atual, delta } = slide
  const max = Math.max(anterior, atual) * 1.1 || 1
  const cresceu = delta > 0
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[300px]">
      <BarrasHorizontais titulo="Massa muscular" items={[
        { label: "Antes", valor: anterior, pct: (anterior / max) * 100, cor: "rgba(255,255,255,0.22)", delay: 0.2,  valorCor: "rgba(255,255,255,0.6)" },
        { label: "Agora", valor: atual,    pct: (atual / max) * 100,    cor: cresceu ? "#06b6d4" : "#f59e0b", delay: 0.55, valorCor: cresceu ? "#06b6d4" : "#f59e0b" },
      ]} />
      {Math.abs(delta) >= 0.2 && (
        <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{ background: cresceu ? "rgba(6,182,212,0.12)" : "rgba(245,158,11,0.12)", color: cresceu ? "#06b6d4" : "#f59e0b", border: `1px solid ${cresceu ? "rgba(6,182,212,0.25)" : "rgba(245,158,11,0.25)"}` }}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
        >
          {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg {delta > 0 ? "↑" : "↓"}
        </motion.div>
      )}
    </div>
  )
}

function SlideDobrasRender({ slide }: { slide: SlideDobras }) {
  const { anterior, atual, delta, classAtual } = slide
  const max = Math.max(anterior, atual) * 1.1 || 1
  const melhorou = delta < 0
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[300px]">
      <BarrasHorizontais titulo="Somatório 6 Dobras" items={[
        { label: "Antes", valor: anterior, pct: (anterior / max) * 100, cor: "rgba(255,255,255,0.22)", delay: 0.2,  valorCor: "rgba(255,255,255,0.6)", unidade: "mm" },
        { label: "Agora", valor: atual,    pct: (atual / max) * 100,    cor: melhorou ? "#8b5cf6" : "#f59e0b", delay: 0.55, valorCor: melhorou ? "#8b5cf6" : "#f59e0b", unidade: "mm" },
      ]} />
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {Math.abs(delta) >= 1 && (
          <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
            style={{ background: melhorou ? "rgba(139,92,246,0.12)" : "rgba(245,158,11,0.12)", color: melhorou ? "#8b5cf6" : "#f59e0b", border: `1px solid ${melhorou ? "rgba(139,92,246,0.25)" : "rgba(245,158,11,0.25)"}` }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }}
          >
            {delta > 0 ? "+" : ""}{delta.toFixed(1)} mm {delta < 0 ? "↓" : "↑"}
          </motion.div>
        )}
        {classAtual && (
          <motion.div className="px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}
          >
            {classAtual}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function SlideResumoRender({ slide }: { slide: SlideResumo }) {
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[320px]">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">Resumo e índices</p>
      <div className="w-full space-y-2">
        {slide.items.map((item, i) => (
          <motion.div key={item.label} className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.055)" }}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.2, ease: EASE }}
          >
            <span className="text-white/50 text-sm">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.valor && <span className="text-white font-semibold text-sm">{item.valor}</span>}
              {item.badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                  {item.badge}
                </span>
              )}
              {item.delta && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ color: item.bom === true ? "#10b981" : item.bom === false ? "#f59e0b" : "rgba(255,255,255,0.4)", background: item.bom === true ? "rgba(16,185,129,0.12)" : item.bom === false ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.07)" }}>
                  {item.delta}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Fundo por tipo de slide ──────────────────────────────────────────────────

function bgOrb(slide: Slide): string {
  if (slide.kind === "gordura") return "rgba(236,72,153,0.18)"
  if (slide.kind === "musculo") return "rgba(6,182,212,0.18)"
  if (slide.kind === "dobras")  return "rgba(139,92,246,0.18)"
  if (slide.kind === "resumo")  return "rgba(124,58,237,0.18)"
  if (slide.kind === "peso")    return "rgba(245,158,11,0.11)"
  if (slide.kind === "share")   return "rgba(6,182,212,0.12)"
  return "rgba(124,58,237,0.15)"
}

const TAMANHO: Record<"xs" | "md" | "lg" | "xl", string> = {
  xs: "text-sm tracking-[0.28em] uppercase font-mono-ui",
  md: "text-2xl font-medium leading-snug",
  lg: "text-[2.5rem] font-semibold leading-tight tracking-tight",
  xl: "text-[3.75rem] md:text-[5rem] font-bold leading-none tracking-tighter",
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function EvolucaoStorytelling({
  nome,
  avaliacoes,
  onClose,
}: {
  nome: string
  avaliacoes: AvaliacaoStory[]
  onClose: () => void
}) {
  const slides  = useMemo(() => gerarSlides(nome, avaliacoes), [nome, avaliacoes])
  const [idx, setIdx]           = useState(0)
  const [mounted, setMounted]   = useState(false)
  const [baixando, setBaixando] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const avancar = useCallback(() => setIdx((i) => Math.min(i + 1, slides.length - 1)), [slides.length])
  const voltar  = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), [])

  const slide   = slides[idx]
  const duracao = duracaoSlide(slide)
  const isLast  = idx === slides.length - 1

  useEffect(() => {
    if (isLast) return
    const t = setTimeout(avancar, duracao)
    return () => clearTimeout(t)
  }, [idx, isLast, duracao, avancar])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")                       { onClose(); return }
      if (e.key === "ArrowRight" || e.key === " ")  { e.preventDefault(); avancar() }
      if (e.key === "ArrowLeft")                      voltar()
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onClose, avancar, voltar])

  const baixarPng = async () => {
    if (!cardRef.current || baixando) return
    setBaixando(true)
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 4, cacheBust: true })
      const a = document.createElement("a")
      a.download = `evolucao-${slide.kind === "share" ? slide.nome.toLowerCase() : "paciente"}.png`
      a.href = dataUrl
      a.click()
    } catch (e) {
      console.error("Erro ao gerar PNG:", e)
    } finally {
      setBaixando(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col select-none"
      style={{ background: "#020617" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div className="absolute inset-0 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse at 50% 42%, ${bgOrb(slide)} 0%, transparent 65%)` }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />

      {/* Progress bars */}
      <div className="relative z-10 flex gap-[3px] px-5 pt-10 md:pt-8">
        {slides.map((s, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
            {i < idx && <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />}
            {i === idx && slide.kind !== "share" && (
              <motion.div key={`bar-${idx}`} className="h-full rounded-full origin-left" style={{ background: "white" }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: duracaoSlide(s) / 1000, ease: "linear" }} />
            )}
            {i === idx && slide.kind === "share" && <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />}
          </div>
        ))}
      </div>

      {/* Fechar */}
      <button onClick={onClose} className="absolute top-8 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white text-xs transition-colors" style={{ background: "rgba(255,255,255,0.10)" }}>
        ✕
      </button>

      {/* Conteúdo */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={idx} className="flex flex-col items-center py-4"
            initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            {slide.kind === "texto"   && <p className={`text-center max-w-xs md:max-w-sm ${TAMANHO[slide.tamanho]}`} style={{ color: slide.cor ?? "white" }}>{slide.texto}</p>}
            {slide.kind === "peso"    && <SlidePesoRender   slide={slide} />}
            {slide.kind === "gordura" && <SlideGordRender    slide={slide} />}
            {slide.kind === "musculo" && <SlideMuscRender    slide={slide} />}
            {slide.kind === "dobras"  && <SlideDobrasRender  slide={slide} />}
            {slide.kind === "resumo"  && <SlideResumoRender  slide={slide} />}

            {slide.kind === "share" && (
              <div className="flex flex-col items-center gap-4">
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30 mb-1">Compartilhar evolução</p>
                <div className="rounded-[20px] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
                  <CartaoCompartilhamento slide={slide} cardRef={cardRef} />
                </div>
                <button
                  onClick={baixarPng} disabled={baixando}
                  className="mt-1 px-8 py-3 rounded-2xl text-white font-semibold text-sm transition-all active:scale-95 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #2563eb)", boxShadow: "0 12px 32px rgba(6,182,212,0.30)" }}
                >
                  {baixando ? "Gerando..." : "↓ Baixar PNG"}
                </button>
                <p className="text-[10px] tracking-[0.2em] uppercase font-mono-ui" style={{ color: "rgba(255,255,255,0.18)" }}>
                  1080 × 1080 px · Instagram ready
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zonas de toque */}
      {slide.kind !== "share" && (
        <div className="absolute z-[5] flex" style={{ inset: 0, top: 72, bottom: 64 }}>
          <div className="flex-[2] cursor-pointer" onClick={voltar} />
          <div className="flex-[3] cursor-pointer" onClick={avancar} />
        </div>
      )}

      {/* Rodapé */}
      <div className="relative z-10 pb-10 text-center">
        {slide.kind !== "share" && (
          <p className="text-[10px] tracking-[0.25em] uppercase font-mono-ui" style={{ color: "rgba(255,255,255,0.18)" }}>toque para avançar</p>
        )}
        {slide.kind === "share" && (
          <button onClick={onClose} className="text-[10px] tracking-[0.25em] uppercase font-mono-ui transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}>fechar</button>
        )}
      </div>
    </motion.div>,
    document.body
  )
}
