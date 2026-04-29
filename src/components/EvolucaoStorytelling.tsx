"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"

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
  } | null
}

// ─── Tipos de slide ───────────────────────────────────────────────────────────

type SlideTexto  = { kind: "texto";   texto: string; tamanho: "xs" | "md" | "lg" | "xl"; cor?: string }
type SlidePeso   = { kind: "peso";    anterior: number; atual: number }
type SlideGord   = { kind: "gordura"; anteriorPct: number; atualPct: number; deltaPct: number }
type SlideMusc   = { kind: "musculo"; anterior: number; atual: number; delta: number }
type SlideResumo = { kind: "resumo";  items: { label: string; valor: string; delta: string | null; bom: boolean | null }[] }

type Slide = SlideTexto | SlidePeso | SlideGord | SlideMusc | SlideResumo

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
  return 5500
}

// ─── Gerador de slides ────────────────────────────────────────────────────────

function gerarSlides(nome: string, avaliacoes: AvaliacaoStory[]): Slide[] {
  const primeiro = nome.split(" ")[0]

  if (!avaliacoes.length) return [{ kind: "texto", texto: "Nenhuma avaliação.", tamanho: "md" }]

  const ult = avaliacoes[avaliacoes.length - 1]
  const pen = avaliacoes.length >= 2 ? avaliacoes[avaliacoes.length - 2] : null
  const mes = mesNome(ult.dataAvaliacao)

  // ── Apenas 1 avaliação ──
  if (!pen) {
    return [
      { kind: "texto", texto: mes.toUpperCase(), tamanho: "xs", cor: "rgba(255,255,255,0.32)" },
      { kind: "texto", texto: primeiro + ".", tamanho: "xl" },
      { kind: "texto", texto: "Este é o seu ponto de partida.", tamanho: "lg" },
      { kind: "peso",  anterior: ult.peso, atual: ult.peso },
      { kind: "texto", texto: "Cada número aqui é uma linha de largada.", tamanho: "md" },
      { kind: "texto", texto: "A história está só começando.", tamanho: "md" },
      { kind: "texto", texto: "Continue.", tamanho: "xl", cor: "#06b6d4" },
    ]
  }

  // ── 2+ avaliações ──
  const dPeso  = +(ult.peso - pen.peso).toFixed(1)
  const gAtu   = percG(ult)
  const gAnt   = percG(pen)
  const dGord  = dif(gAtu, gAnt)
  const dGordKg = dif(ult.resultado?.massaGorda ?? null, pen.resultado?.massaGorda ?? null)
  const mAtu   = ult.resultado?.massaMuscular ?? null
  const mAnt   = pen.resultado?.massaMuscular ?? null
  const dMusc  = dif(mAtu, mAnt)

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
        texto: dMusc !== null && dMusc > 0 && dMusc >= dPeso * 0.5
          ? "Em grande parte, é músculo."
          : "O caminho é longo. E você está nele.",
        tamanho: "md",
        cor: dMusc !== null && dMusc > 0 && dMusc >= dPeso * 0.5 ? "#06b6d4" : undefined,
      })
    }
  } else {
    ss.push({ kind: "texto", texto: "O peso se manteve.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Estabilidade também é conquista.", tamanho: "md" })
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

  // Resumo
  const resumo: SlideResumo["items"] = [
    {
      label: "Peso",
      valor: `${ult.peso.toFixed(1)} kg`,
      delta: Math.abs(dPeso) >= 0.1 ? `${dPeso > 0 ? "+" : ""}${dPeso.toFixed(1)} kg` : null,
      bom:   dPeso < -0.05 ? true : dPeso > 0.05 ? false : null,
    },
  ]
  if (gAtu !== null && dGord !== null)
    resumo.push({
      label: "% Gordura",
      valor: `${gAtu.toFixed(1)}%`,
      delta: Math.abs(dGord) >= 0.3 ? `${dGord > 0 ? "+" : ""}${dGord.toFixed(1)}%` : null,
      bom:   dGord < 0 ? true : dGord > 0 ? false : null,
    })
  if (mAtu !== null && dMusc !== null)
    resumo.push({
      label: "Massa Muscular",
      valor: `${mAtu.toFixed(1)} kg`,
      delta: Math.abs(dMusc) >= 0.2 ? `${dMusc > 0 ? "+" : ""}${dMusc.toFixed(1)} kg` : null,
      bom:   dMusc > 0 ? true : dMusc < 0 ? false : null,
    })
  ss.push({ kind: "resumo", items: resumo })

  // Fechamento
  const positivo = dPeso < -0.05 || (dGord !== null && dGord < 0) || (dMusc !== null && dMusc > 0)
  if (positivo) {
    ss.push({ kind: "texto", texto: "Você compareceu.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Mediu.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Evoluiu.", tamanho: "xl", cor: "#06b6d4" })
  } else {
    ss.push({ kind: "texto", texto: "Todo mês é uma nova chance.", tamanho: "lg" })
    ss.push({ kind: "texto", texto: "Continue.", tamanho: "xl", cor: "#06b6d4" })
  }

  return ss
}

// ─── Sub-componentes visuais ──────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1]

function ColunaBarra({ label, valor, pct, cor, delay }: {
  label: string; valor: number; pct: number; cor: string; delay: number
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.span
        className="text-2xl font-bold text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.7 }}
      >
        {valor.toFixed(1)}
      </motion.span>
      <span className="text-white/40 text-xs -mt-2">kg</span>
      <div
        className="w-[72px] rounded-[16px] relative overflow-hidden"
        style={{ height: 140, background: "rgba(255,255,255,0.06)" }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-[16px]"
          style={{ background: cor }}
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 1.3, delay, ease: EASE }}
        />
      </div>
      <span className="text-white/40 text-[11px] tracking-widest uppercase font-mono-ui">{label}</span>
    </div>
  )
}

function SlidePesoRender({ slide }: { slide: SlidePeso }) {
  const { anterior, atual } = slide
  const unico = anterior === atual
  const max   = Math.max(anterior, atual) * 1.1
  const corAtu = atual < anterior ? "#10b981" : atual > anterior ? "#f59e0b" : "#06b6d4"

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">
        {unico ? "Peso atual" : "Evolução do peso"}
      </p>
      <div className="flex items-end gap-8 justify-center">
        {unico ? (
          <ColunaBarra label="Atual"  valor={atual}    pct={(atual / max) * 100}    cor="#06b6d4"                    delay={0.2} />
        ) : (
          <>
            <ColunaBarra label="Antes" valor={anterior} pct={(anterior / max) * 100} cor="rgba(255,255,255,0.22)"    delay={0.2} />
            <ColunaBarra label="Agora" valor={atual}    pct={(atual / max) * 100}    cor={corAtu}                    delay={0.5} />
          </>
        )}
      </div>
    </div>
  )
}

function AnelGordura({ pct, cor, delay, label }: { pct: number; cor: string; delay: number; label: string }) {
  const R = 60
  const SIZE = 152
  const cx = SIZE / 2
  const cy = SIZE / 2
  const circum = 2 * Math.PI * R
  const dash   = circum * (1 - Math.min(pct, 60) / 60)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ overflow: "visible" }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
          <g transform={`rotate(-90, ${cx}, ${cy})`}>
            <motion.circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={cor}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circum}
              initial={{ strokeDashoffset: circum }}
              animate={{ strokeDashoffset: dash }}
              transition={{ duration: 1.6, delay, ease: EASE }}
            />
          </g>
        </svg>
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.9 }}
        >
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
        <AnelGordura pct={atualPct}   cor={melhorou ? "#10b981" : "#ec4899"} delay={0.5} label="agora" />
      </div>
      {Math.abs(deltaPct) >= 0.3 && (
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: melhorou ? "rgba(16,185,129,0.12)" : "rgba(236,72,153,0.12)",
            color:      melhorou ? "#10b981" : "#ec4899",
            border:     `1px solid ${melhorou ? "rgba(16,185,129,0.25)" : "rgba(236,72,153,0.25)"}`,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          {deltaPct > 0 ? "+" : ""}{deltaPct.toFixed(1)}%
        </motion.div>
      )}
    </div>
  )
}

function SlideMuscRender({ slide }: { slide: SlideMusc }) {
  const { anterior, atual, delta } = slide
  const max     = Math.max(anterior, atual) * 1.1 || 1
  const cresceu = delta > 0

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[300px]">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">Massa muscular</p>
      <div className="w-full space-y-4">
        {[
          { label: "Antes", valor: anterior, pct: (anterior / max) * 100, cor: "rgba(255,255,255,0.22)", delay: 0.2,  valorCor: "rgba(255,255,255,0.6)" },
          { label: "Agora", valor: atual,    pct: (atual / max) * 100,    cor: cresceu ? "#06b6d4" : "#f59e0b", delay: 0.55, valorCor: cresceu ? "#06b6d4" : "#f59e0b" },
        ].map((b) => (
          <div key={b.label} className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-white/40 text-[11px] tracking-widest uppercase font-mono-ui">{b.label}</span>
              <motion.span
                className="text-lg font-bold"
                style={{ color: b.valorCor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: b.delay + 0.8 }}
              >
                {b.valor.toFixed(1)} kg
              </motion.span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: b.cor }}
                initial={{ width: 0 }}
                animate={{ width: `${b.pct}%` }}
                transition={{ duration: 1.3, delay: b.delay, ease: EASE }}
              />
            </div>
          </div>
        ))}
      </div>
      {Math.abs(delta) >= 0.2 && (
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: cresceu ? "rgba(6,182,212,0.12)" : "rgba(245,158,11,0.12)",
            color:      cresceu ? "#06b6d4" : "#f59e0b",
            border:     `1px solid ${cresceu ? "rgba(6,182,212,0.25)" : "rgba(245,158,11,0.25)"}`,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg {delta > 0 ? "↑" : "↓"}
        </motion.div>
      )}
    </div>
  )
}

function SlideResumoRender({ slide }: { slide: SlideResumo }) {
  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-[300px]">
      <p className="font-mono-ui text-[10px] uppercase tracking-[0.28em] text-white/30">Resumo do período</p>
      <div className="w-full space-y-2">
        {slide.items.map((item, i) => (
          <motion.div
            key={item.label}
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.055)" }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 + 0.2, ease: EASE }}
          >
            <span className="text-white/50 text-sm">{item.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-sm">{item.valor}</span>
              {item.delta && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-lg"
                  style={{
                    color:      item.bom === true ? "#10b981" : item.bom === false ? "#f59e0b" : "rgba(255,255,255,0.4)",
                    background: item.bom === true ? "rgba(16,185,129,0.12)" : item.bom === false ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.07)",
                  }}
                >
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
  if (slide.kind === "resumo")  return "rgba(124,58,237,0.18)"
  if (slide.kind === "peso")    return "rgba(245,158,11,0.11)"
  return "rgba(124,58,237,0.15)"
}

// ─── Tamanhos de texto ────────────────────────────────────────────────────────

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
  const [idx, setIdx]       = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const avancar = useCallback(() => setIdx((i) => Math.min(i + 1, slides.length - 1)), [slides.length])
  const voltar  = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), [])

  const slide   = slides[idx]
  const duracao = duracaoSlide(slide)
  const isLast  = idx === slides.length - 1

  // Auto-avanço
  useEffect(() => {
    if (isLast) return
    const t = setTimeout(avancar, duracao)
    return () => clearTimeout(t)
  }, [idx, isLast, duracao, avancar])

  // Teclado
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape")                              { onClose(); return }
      if (e.key === "ArrowRight" || e.key === " ")         { e.preventDefault(); avancar() }
      if (e.key === "ArrowLeft")                             voltar()
    }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onClose, avancar, voltar])

  if (!mounted) return null

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col select-none"
      style={{ background: "#020617" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Orb de fundo */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse at 50% 42%, ${bgOrb(slide)} 0%, transparent 65%)` }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />

      {/* Barra de progresso estilo stories */}
      <div className="relative z-10 flex gap-[3px] px-5 pt-10 md:pt-8">
        {slides.map((s, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.13)" }}>
            {i < idx && (
              <div className="h-full w-full rounded-full" style={{ background: "rgba(255,255,255,0.55)" }} />
            )}
            {i === idx && (
              <motion.div
                key={`bar-${idx}`}
                className="h-full rounded-full origin-left"
                style={{ background: "white" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: duracaoSlide(s) / 1000, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Fechar */}
      <button
        onClick={onClose}
        className="absolute top-8 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white text-xs transition-colors"
        style={{ background: "rgba(255,255,255,0.10)" }}
      >
        ✕
      </button>

      {/* Conteúdo do slide */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
          >
            {slide.kind === "texto"   && (
              <p
                className={`text-center max-w-xs md:max-w-sm ${TAMANHO[slide.tamanho]}`}
                style={{ color: slide.cor ?? "white" }}
              >
                {slide.texto}
              </p>
            )}
            {slide.kind === "peso"    && <SlidePesoRender slide={slide} />}
            {slide.kind === "gordura" && <SlideGordRender  slide={slide} />}
            {slide.kind === "musculo" && <SlideMuscRender  slide={slide} />}
            {slide.kind === "resumo"  && <SlideResumoRender slide={slide} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Zonas de toque: esquerda = voltar | direita = avançar */}
      <div className="absolute z-[5] flex" style={{ inset: 0, top: 72, bottom: 64 }}>
        <div className="flex-[2] cursor-pointer" onClick={voltar} />
        <div className="flex-[3] cursor-pointer" onClick={avancar} />
      </div>

      {/* Rodapé */}
      <div className="relative z-10 pb-10 text-center flex flex-col items-center gap-2">
        {isLast && (
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl text-white/70 text-sm font-medium mb-1 transition-colors"
            style={{ background: "rgba(255,255,255,0.10)" }}
          >
            Fechar
          </button>
        )}
        <p className="text-[10px] tracking-[0.25em] uppercase font-mono-ui" style={{ color: "rgba(255,255,255,0.18)" }}>
          {isLast ? "antrometropia" : "toque para avançar"}
        </p>
      </div>
    </motion.div>,
    document.body
  )
}
