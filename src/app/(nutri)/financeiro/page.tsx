"use client"

import { useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

type Status = "PENDENTE" | "PAGO" | "CANCELADO"
type FormaPag = "PIX" | "DINHEIRO" | "CARTAO" | "OUTRO"

interface Paciente { id: string; nome: string }

interface Lancamento {
  id: string
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento: string | null
  status: Status
  formaPagamento: FormaPag | null
  paciente: Paciente | null
}

const FORMAS: { value: FormaPag; label: string }[] = [
  { value: "PIX",      label: "Pix" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO",   label: "Cartão" },
  { value: "OUTRO",    label: "Outro" },
]

const STATUS_STYLE: Record<Status, string> = {
  PAGO:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDENTE:  "bg-amber-50  text-amber-700  border-amber-200",
  CANCELADO: "bg-slate-50  text-slate-500  border-slate-200",
}

const STATUS_LABEL: Record<Status, string> = {
  PAGO:      "Pago",
  PENDENTE:  "Pendente",
  CANCELADO: "Cancelado",
}

function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
}

function fmtValor(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function mesesDisponiveis() {
  const meses = []
  const hoje = new Date()
  for (let i = 5; i >= -2; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const valor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    meses.push({ valor, label: label.charAt(0).toUpperCase() + label.slice(1) })
  }
  return meses
}

// ── Modal de novo lançamento ──────────────────────────────────────────────────
function ModalNovoLancamento({
  pacientes,
  onClose,
  onSalvo,
}: {
  pacientes: Paciente[]
  onClose: () => void
  onSalvo: (l: Lancamento) => void
}) {
  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    dataVencimento: new Date().toISOString().slice(0, 10),
    pacienteId: "",
    formaPagamento: "" as FormaPag | "",
    status: "PENDENTE" as Status,
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function salvar() {
    if (!form.descricao.trim() || !form.valor || !form.dataVencimento) {
      setErro("Preencha descrição, valor e data.")
      return
    }
    setSalvando(true)
    setErro("")
    try {
      const res = await fetch("/api/financeiro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: form.descricao.trim(),
          valor: parseFloat(form.valor.replace(",", ".")),
          dataVencimento: form.dataVencimento,
          pacienteId: form.pacienteId || null,
          formaPagamento: form.formaPagamento || null,
          status: form.status,
        }),
      })
      if (!res.ok) throw new Error()
      const novo = await res.json()
      onSalvo(novo)
      onClose()
    } catch {
      setErro("Erro ao salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Novo Lançamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        {/* Descrição */}
        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Descrição</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Ex: Consulta inicial"
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
          />
        </div>

        {/* Valor + Data */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Valor (R$)</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
              value={form.valor}
              onChange={(e) => set("valor", e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Data</label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              type="date"
              value={form.dataVencimento}
              onChange={(e) => set("dataVencimento", e.target.value)}
            />
          </div>
        </div>

        {/* Paciente */}
        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Paciente (opcional)</label>
          <select
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
            value={form.pacienteId}
            onChange={(e) => set("pacienteId", e.target.value)}
          >
            <option value="">— Sem paciente —</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {/* Forma de pagamento + Status */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Forma de Pagamento</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
              value={form.formaPagamento}
              onChange={(e) => set("formaPagamento", e.target.value)}
            >
              <option value="">— Selecionar —</option>
              {FORMAS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Status</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
            >
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>
        </div>

        {erro && <p className="text-sm text-rose-500">{erro}</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full py-3 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-[0_8px_24px_rgba(6,182,212,0.28)]"
        >
          {salvando ? "Salvando..." : "Salvar Lançamento"}
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [mes, setMes] = useState(mesAtual)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/financeiro?mes=${mes}`)
      if (res.ok) setLancamentos(await res.json())
    } finally {
      setLoading(false)
    }
  }, [mes])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPacientes(Array.isArray(d) ? d : (d.pacientes ?? [])))
      .catch(() => {})
  }, [])

  async function toggleStatus(l: Lancamento) {
    const novoStatus: Status = l.status === "PAGO" ? "PENDENTE" : "PAGO"
    const res = await fetch(`/api/financeiro/${l.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    })
    if (res.ok) {
      const atualizado = await res.json()
      setLancamentos((prev) => prev.map((x) => x.id === l.id ? atualizado : x))
    }
  }

  async function excluir(id: string) {
    if (!confirm("Excluir este lançamento?")) return
    const res = await fetch(`/api/financeiro/${id}`, { method: "DELETE" })
    if (res.ok) setLancamentos((prev) => prev.filter((x) => x.id !== id))
  }

  // Resumo
  const pagos     = lancamentos.filter((l) => l.status === "PAGO")
  const pendentes = lancamentos.filter((l) => l.status === "PENDENTE")
  const totalPago     = pagos.reduce((s, l) => s + l.valor, 0)
  const totalPendente = pendentes.reduce((s, l) => s + l.valor, 0)

  const meses = mesesDisponiveis()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="eyebrow">Financeiro</div>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-slate-900">
            Controle de Caixa
          </h1>
        </div>
        <button
          onClick={() => setModal(true)}
          className="self-start sm:self-auto px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_8px_24px_rgba(6,182,212,0.24)]"
        >
          + Novo Lançamento
        </button>
      </div>

      {/* Filtro de mês */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {meses.map((m) => (
          <button
            key={m.valor}
            onClick={() => setMes(m.valor)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold border transition-all",
              mes === m.valor
                ? "bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white border-transparent shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-cyan-300"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-[24px] p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400">Recebido</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{fmtValor(totalPago)}</p>
          <p className="text-xs text-slate-400 mt-1">{pagos.length} lançamento{pagos.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400">A Receber</p>
          <p className="mt-2 text-2xl font-bold text-amber-500">{fmtValor(totalPendente)}</p>
          <p className="text-xs text-slate-400 mt-1">{pendentes.length} lançamento{pendentes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="glass-panel rounded-[24px] p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400">Total do Mês</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{fmtValor(totalPago + totalPendente)}</p>
          <p className="text-xs text-slate-400 mt-1">{lancamentos.length} lançamento{lancamentos.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Lista de lançamentos */}
      <div className="glass-panel rounded-[24px] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm font-mono-ui uppercase tracking-widest">
            Carregando...
          </div>
        ) : lancamentos.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-400 text-sm">Nenhum lançamento neste mês.</p>
            <button
              onClick={() => setModal(true)}
              className="mt-4 text-sm font-semibold text-[color:var(--accent)] hover:underline"
            >
              Adicionar primeiro lançamento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lancamentos.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Toggle status */}
                <button
                  onClick={() => toggleStatus(l)}
                  title={l.status === "PAGO" ? "Marcar como pendente" : "Marcar como pago"}
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                    l.status === "PAGO"
                      ? "bg-emerald-500 border-emerald-500"
                      : "border-slate-300 hover:border-cyan-400"
                  )}
                >
                  {l.status === "PAGO" && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn("text-sm font-medium text-slate-800", l.status === "CANCELADO" && "line-through text-slate-400")}>
                      {l.descricao}
                    </p>
                    <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", STATUS_STYLE[l.status])}>
                      {STATUS_LABEL[l.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {l.paciente && (
                      <span className="text-xs text-slate-400">{l.paciente.nome}</span>
                    )}
                    {l.paciente && l.formaPagamento && (
                      <span className="text-slate-300 text-xs">·</span>
                    )}
                    {l.formaPagamento && (
                      <span className="text-xs text-slate-400">{FORMAS.find((f) => f.value === l.formaPagamento)?.label ?? l.formaPagamento}</span>
                    )}
                    <span className="text-slate-300 text-xs">·</span>
                    <span className="text-xs text-slate-400">{fmtData(l.dataVencimento)}</span>
                  </div>
                </div>

                {/* Valor */}
                <p className={cn(
                  "text-sm font-bold flex-shrink-0",
                  l.status === "PAGO" ? "text-emerald-600" : l.status === "CANCELADO" ? "text-slate-400" : "text-slate-800"
                )}>
                  {fmtValor(l.valor)}
                </p>

                {/* Excluir */}
                <button
                  onClick={() => excluir(l.id)}
                  className="text-slate-300 hover:text-rose-400 transition-colors ml-1 flex-shrink-0"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <ModalNovoLancamento
          pacientes={pacientes}
          onClose={() => setModal(false)}
          onSalvo={(novo) => {
            setLancamentos((prev) => [novo, ...prev])
          }}
        />
      )}
    </div>
  )
}
