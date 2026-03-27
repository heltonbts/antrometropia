"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Modelo { id: string; nome: string; descricao?: string | null; padrao: boolean; perguntas: any[] }
interface Paciente { id: string; nome: string }
interface Anamnese {
  id: string
  titulo: string
  status: "PENDENTE" | "PREENCHIDA"
  slug: string
  criadoEm: string
  preenchidaEm?: string | null
  paciente?: { id: string; nome: string } | null
  modelo?:   { id: string; nome: string } | null
  perguntas: any[]
  respostas?: Record<string, any> | null
}

const STATUS_STYLE = {
  PENDENTE:   "bg-amber-50 text-amber-700 border-amber-200",
  PREENCHIDA: "bg-emerald-50 text-emerald-700 border-emerald-200",
}
const STATUS_LABEL = { PENDENTE: "Pendente", PREENCHIDA: "Preenchida" }

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

// ── Modal: enviar anamnese ────────────────────────────────────────────────────
function ModalEnviar({
  modelos, pacientes, modeloPreSelecionado, onClose, onSalvo,
}: {
  modelos: Modelo[]; pacientes: Paciente[]
  modeloPreSelecionado?: string
  onClose: () => void; onSalvo: (a: Anamnese) => void
}) {
  const [modeloId,   setModeloId]   = useState(modeloPreSelecionado ?? "")
  const [pacienteId, setPacienteId] = useState("")
  const [titulo,     setTitulo]     = useState("")
  const [salvando,   setSalvando]   = useState(false)
  const [erro,       setErro]       = useState("")

  async function enviar() {
    if (!modeloId) { setErro("Selecione um modelo."); return }
    setSalvando(true); setErro("")
    try {
      const res = await fetch("/api/anamnese", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ modeloId, pacienteId: pacienteId || null, titulo: titulo || undefined }),
      })
      if (!res.ok) throw new Error()
      onSalvo(await res.json())
      onClose()
    } catch { setErro("Erro ao criar. Tente novamente.") }
    finally { setSalvando(false) }
  }

  const modeloSelecionado = modelos.find((m) => m.id === modeloId)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Enviar Anamnese</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>

        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Modelo</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={modeloId}
            onChange={(e) => setModeloId(e.target.value)}
          >
            <option value="">— Selecionar modelo —</option>
            {modelos.map((m) => (
              <option key={m.id} value={m.id}>{m.nome}{m.padrao ? " ★" : ""}</option>
            ))}
          </select>
          {modeloSelecionado && (
            <p className="text-xs text-slate-400 mt-1">{modeloSelecionado.perguntas.length} pergunta(s) · {modeloSelecionado.descricao}</p>
          )}
        </div>

        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Paciente (opcional)</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={pacienteId}
            onChange={(e) => setPacienteId(e.target.value)}
          >
            <option value="">— Sem paciente —</option>
            {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>

        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Título personalizado (opcional)</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder={modeloSelecionado?.nome ?? "Título do formulário..."}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {erro && <p className="text-sm text-rose-500">{erro}</p>}
        <button
          onClick={enviar}
          disabled={salvando}
          className="w-full py-3 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 disabled:opacity-60 shadow-[0_8px_24px_rgba(6,182,212,0.28)]"
        >
          {salvando ? "Gerando link..." : "Gerar Link"}
        </button>
      </div>
    </div>
  )
}

// ── Modal: ver respostas ──────────────────────────────────────────────────────
function ModalRespostas({ anamnese, onClose }: { anamnese: Anamnese; onClose: () => void }) {
  const perguntas: any[] = anamnese.perguntas ?? []
  const respostas: Record<string, any> = (anamnese.respostas as any) ?? {}

  function fmtResposta(valor: any) {
    if (valor == null || valor === "") return <span className="text-slate-300 italic">Não respondida</span>
    if (Array.isArray(valor)) return valor.join(", ")
    return String(valor)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{anamnese.titulo}</h2>
            {anamnese.paciente && <p className="text-sm text-slate-400">{anamnese.paciente.nome}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl">×</button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {perguntas.map((p: any, i: number) => (
            <div key={p.id} className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {i + 1}. {p.pergunta}
              </p>
              <p className="text-sm text-slate-800 bg-slate-50 rounded-xl px-3 py-2">
                {fmtResposta(respostas[p.id])}
              </p>
            </div>
          ))}
        </div>
        {anamnese.preenchidaEm && (
          <div className="px-6 pb-4 text-xs text-slate-400 text-right border-t border-slate-100 pt-3">
            Preenchido em {fmtData(anamnese.preenchidaEm)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AnamnesePage() {
  const router = useRouter()
  const [aba,       setAba]       = useState<"enviadas" | "modelos">("enviadas")
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [modelos,   setModelos]   = useState<Modelo[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading,   setLoading]   = useState(true)
  const [modalEnviar,         setModalEnviar]         = useState(false)
  const [modeloPreSelecionado, setModeloPreSelecionado] = useState<string | undefined>(undefined)
  const [anamneseSelecionada,  setAnamneseSelecionada]  = useState<Anamnese | null>(null)
  const [copiado, setCopiado] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [ra, rm] = await Promise.all([
      fetch("/api/anamnese").then((r) => r.ok ? r.json() : []),
      fetch("/api/anamnese/modelos").then((r) => r.ok ? r.json() : []),
    ])
    setAnamneses(Array.isArray(ra) ? ra : [])
    setModelos(Array.isArray(rm) ? rm : [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPacientes(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function abrirModalEnviar(modeloId?: string) {
    setModeloPreSelecionado(modeloId)
    setModalEnviar(true)
  }

  async function copiarLink(slug: string) {
    const url = `${window.location.origin}/f/${slug}`
    await navigator.clipboard.writeText(url)
    setCopiado(slug)
    setTimeout(() => setCopiado(null), 2000)
  }

  async function excluirAnamnese(id: string) {
    if (!confirm("Excluir esta anamnese?")) return
    const res = await fetch(`/api/anamnese/${id}`, { method: "DELETE" })
    if (res.ok) setAnamneses((prev) => prev.filter((a) => a.id !== id))
  }

  async function excluirModelo(id: string) {
    if (!confirm("Excluir este modelo?")) return
    const res = await fetch(`/api/anamnese/modelos/${id}`, { method: "DELETE" })
    if (res.ok) setModelos((prev) => prev.filter((m) => m.id !== id))
  }

  async function novoModelo() {
    const res = await fetch("/api/anamnese/modelos", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nome: "Novo modelo", perguntas: [] }),
    })
    if (res.ok) {
      const m = await res.json()
      router.push(`/anamnese/modelos/${m.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="eyebrow">Anamnese</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-slate-900">
            Formulários
          </h1>
        </div>
        <button
          onClick={() => abrirModalEnviar()}
          className="self-start sm:self-auto px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_8px_24px_rgba(6,182,212,0.24)]"
        >
          + Enviar Anamnese
        </button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-slate-100">
        {(["enviadas", "modelos"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px",
              aba === a
                ? "border-[#06b6d4] text-[#06b6d4]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            {a === "enviadas" ? `Enviadas ${anamneses.length > 0 ? `(${anamneses.length})` : ""}` : "Modelos"}
          </button>
        ))}
      </div>

      {/* Aba: Enviadas */}
      {aba === "enviadas" && (
        <div className="glass-panel rounded-[24px] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Carregando...</div>
          ) : anamneses.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400 text-sm">Nenhuma anamnese enviada ainda.</p>
              <button onClick={() => abrirModalEnviar()} className="mt-3 text-sm font-semibold text-[#06b6d4] hover:underline">
                Enviar primeira anamnese
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {anamneses.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-slate-800">{a.titulo}</p>
                      <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", STATUS_STYLE[a.status])}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 flex-wrap">
                      {a.paciente && <span>{a.paciente.nome}</span>}
                      {a.paciente && <span>·</span>}
                      <span>{fmtData(a.criadoEm)}</span>
                      {a.modelo && <><span>·</span><span>{a.modelo.nome}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {a.status === "PREENCHIDA" && (
                      <button
                        onClick={() => setAnamneseSelecionada(a)}
                        className="text-xs font-semibold text-[#06b6d4] hover:underline"
                      >
                        Ver respostas
                      </button>
                    )}
                    <button
                      onClick={() => copiarLink(a.slug)}
                      className={cn(
                        "text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all",
                        copiado === a.slug
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:border-cyan-300"
                      )}
                    >
                      {copiado === a.slug ? "✓ Copiado" : "Copiar link"}
                    </button>
                    <button onClick={() => excluirAnamnese(a.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aba: Modelos */}
      {aba === "modelos" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              onClick={novoModelo}
              className="px-4 py-2 text-sm font-semibold text-[#06b6d4] border border-[rgba(6,182,212,0.3)] rounded-xl hover:bg-[rgba(6,182,212,0.06)] transition-colors"
            >
              + Novo modelo
            </button>
          </div>
          {loading ? (
            <div className="text-center text-slate-400 text-sm py-8">Carregando...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {modelos.map((m) => (
                <div key={m.id} className="glass-panel rounded-[24px] p-5 flex flex-col gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800 text-sm">{m.nome}</p>
                      {m.padrao && (
                        <span className="text-[10px] font-semibold bg-[rgba(6,182,212,0.1)] text-[#06b6d4] px-2 py-0.5 rounded-full">Padrão</span>
                      )}
                    </div>
                    {m.descricao && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{m.descricao}</p>}
                    <p className="text-xs text-slate-400 mt-1">{m.perguntas.length} pergunta(s)</p>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => router.push(`/anamnese/modelos/${m.id}`)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => abrirModalEnviar(m.id)}
                      className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[rgba(6,182,212,0.08)] text-[#06b6d4] hover:bg-[rgba(6,182,212,0.14)] border border-[rgba(6,182,212,0.2)] transition-colors"
                    >
                      Usar
                    </button>
                    {!m.padrao && (
                      <button onClick={() => excluirModelo(m.id)} className="text-slate-300 hover:text-rose-400 transition-colors px-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalEnviar && (
        <ModalEnviar
          modelos={modelos}
          pacientes={pacientes}
          modeloPreSelecionado={modeloPreSelecionado}
          onClose={() => { setModalEnviar(false); setModeloPreSelecionado(undefined) }}
          onSalvo={(a) => { setAnamneses((prev) => [a, ...prev]); setAba("enviadas") }}
        />
      )}

      {anamneseSelecionada && (
        <ModalRespostas anamnese={anamneseSelecionada} onClose={() => setAnamneseSelecionada(null)} />
      )}
    </div>
  )
}
