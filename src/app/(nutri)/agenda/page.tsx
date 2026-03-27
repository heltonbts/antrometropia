"use client"

import { useEffect, useState, useCallback } from "react"
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { cn } from "@/lib/utils"

// ── Localizer pt-BR ───────────────────────────────────────────────────────────
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { "pt-BR": ptBR },
})

const MESSAGES = {
  today:     "Hoje",
  previous:  "‹",
  next:      "›",
  month:     "Mês",
  week:      "Semana",
  day:       "Dia",
  agenda:    "Lista",
  date:      "Data",
  time:      "Hora",
  event:     "Consulta",
  showMore:  (n: number) => `+${n} mais`,
  noEventsInRange: "Nenhuma consulta neste período.",
}

type Status = "AGENDADA" | "REALIZADA" | "CANCELADA" | "FALTA"
type FormaPag = "PIX" | "DINHEIRO" | "CARTAO" | "OUTRO"

interface Paciente { id: string; nome: string }
interface Lancamento { id: string; status: string; valor: number }

interface Consulta {
  id: string
  titulo: string
  inicio: string
  fim: string
  status: Status
  observacoes?: string | null
  paciente?: Paciente | null
  lancamento?: Lancamento | null
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Consulta
}

const STATUS_COR: Record<Status, string> = {
  AGENDADA:  "#2563eb",
  REALIZADA: "#1f8a70",
  CANCELADA: "#94a3b8",
  FALTA:     "#ef4444",
}

const STATUS_LABEL: Record<Status, string> = {
  AGENDADA:  "Agendada",
  REALIZADA: "Realizada",
  CANCELADA: "Cancelada",
  FALTA:     "Falta",
}

const STATUS_STYLE: Record<Status, string> = {
  AGENDADA:  "bg-blue-50 text-blue-700 border-blue-200",
  REALIZADA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELADA: "bg-slate-100 text-slate-500 border-slate-200",
  FALTA:     "bg-red-50 text-red-600 border-red-200",
}

const FORMAS = [
  { value: "PIX",      label: "Pix" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO",   label: "Cartão" },
  { value: "OUTRO",    label: "Outro" },
]

const DURACOES = [
  { label: "30 min",  minutos: 30 },
  { label: "45 min",  minutos: 45 },
  { label: "1 hora",  minutos: 60 },
  { label: "1h 30min",minutos: 90 },
  { label: "2 horas", minutos: 120 },
]

function pad(n: number) { return String(n).padStart(2, "0") }

function toDatetimeLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function addMinutes(date: Date, min: number) {
  return new Date(date.getTime() + min * 60000)
}

// ── Modal de detalhe / edição ─────────────────────────────────────────────────
function ModalDetalhe({
  consulta,
  onClose,
  onStatusChange,
  onDelete,
}: {
  consulta: Consulta
  onClose: () => void
  onStatusChange: (id: string, status: Status) => void
  onDelete: (id: string) => void
}) {
  const [salvando, setSalvando] = useState(false)

  async function mudarStatus(novoStatus: Status) {
    setSalvando(true)
    const res = await fetch(`/api/agenda/${consulta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    })
    if (res.ok) onStatusChange(consulta.id, novoStatus)
    setSalvando(false)
  }

  async function excluir() {
    if (!confirm("Excluir esta consulta?")) return
    const res = await fetch(`/api/agenda/${consulta.id}`, { method: "DELETE" })
    if (res.ok) { onDelete(consulta.id); onClose() }
  }

  const inicio = new Date(consulta.inicio)
  const fim    = new Date(consulta.fim)
  const dur    = Math.round((fim.getTime() - inicio.getTime()) / 60000)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="w-3 h-3 rounded-full inline-block mr-2 mb-0.5"
              style={{ background: STATUS_COR[consulta.status] }}
            />
            <span className={cn("text-[10px] font-semibold border px-2 py-0.5 rounded-full", STATUS_STYLE[consulta.status])}>
              {STATUS_LABEL[consulta.status]}
            </span>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{consulta.titulo}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none mt-1">×</button>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-5 text-center">📅</span>
            <span>{inicio.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-5 text-center">🕐</span>
            <span>{inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – {fim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ({dur} min)</span>
          </div>
          {consulta.paciente && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 w-5 text-center">👤</span>
              <span>{consulta.paciente.nome}</span>
            </div>
          )}
          {consulta.lancamento && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 w-5 text-center">💰</span>
              <span>
                {consulta.lancamento.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                {" · "}
                <span className={cn(
                  "text-xs font-semibold",
                  consulta.lancamento.status === "PAGO" ? "text-emerald-600" : "text-amber-500"
                )}>
                  {consulta.lancamento.status === "PAGO" ? "Pago" : "Pendente"}
                </span>
              </span>
            </div>
          )}
          {consulta.observacoes && (
            <div className="flex items-start gap-2">
              <span className="text-slate-400 w-5 text-center mt-0.5">📝</span>
              <span className="text-slate-500">{consulta.observacoes}</span>
            </div>
          )}
        </div>

        {/* Ações de status */}
        {consulta.status === "AGENDADA" && (
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => mudarStatus("REALIZADA")}
              disabled={salvando}
              className="py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
            >
              Realizada
            </button>
            <button
              onClick={() => mudarStatus("FALTA")}
              disabled={salvando}
              className="py-2 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
            >
              Falta
            </button>
            <button
              onClick={() => mudarStatus("CANCELADA")}
              disabled={salvando}
              className="py-2 text-xs font-semibold rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors border border-slate-200"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Excluir */}
        <button
          onClick={excluir}
          className="w-full py-2 text-xs font-medium text-slate-400 hover:text-rose-500 transition-colors"
        >
          Excluir consulta
        </button>
      </div>
    </div>
  )
}

// ── Modal de nova consulta ────────────────────────────────────────────────────
function ModalNovaConsulta({
  inicio: inicioInicial,
  pacientes,
  onClose,
  onSalvo,
}: {
  inicio: Date
  pacientes: Paciente[]
  onClose: () => void
  onSalvo: (c: Consulta) => void
}) {
  const [form, setForm] = useState({
    titulo:         "Consulta",
    inicio:         toDatetimeLocal(inicioInicial),
    duracao:        60,
    pacienteId:     "",
    observacoes:    "",
    gerarLancamento: false,
    valor:          "",
    formaPagamento: "" as FormaPag | "",
  })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro]         = useState("")

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function salvar() {
    if (!form.titulo.trim() || !form.inicio) { setErro("Preencha título e data."); return }
    if (form.gerarLancamento && !form.valor)  { setErro("Informe o valor do lançamento."); return }

    setSalvando(true); setErro("")
    const inicioDate = new Date(form.inicio)
    const fimDate    = addMinutes(inicioDate, form.duracao)

    try {
      const res = await fetch("/api/agenda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo:          form.titulo.trim(),
          inicio:          inicioDate.toISOString(),
          fim:             fimDate.toISOString(),
          pacienteId:      form.pacienteId || null,
          observacoes:     form.observacoes || null,
          gerarLancamento: form.gerarLancamento,
          valorLancamento: form.gerarLancamento ? parseFloat(form.valor.replace(",", ".")) : null,
          formaPagamento:  form.gerarLancamento ? (form.formaPagamento || null) : null,
        }),
      })
      if (!res.ok) throw new Error()
      onSalvo(await res.json())
      onClose()
    } catch {
      setErro("Erro ao salvar. Tente novamente.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[28px] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Nova Consulta</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        </div>

        {/* Título */}
        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Título</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            placeholder="Ex: Consulta inicial, Retorno..."
          />
        </div>

        {/* Data/Hora + Duração */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Data e Hora</label>
            <input
              type="datetime-local"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={form.inicio}
              onChange={(e) => set("inicio", e.target.value)}
            />
          </div>
          <div>
            <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Duração</label>
            <select
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
              value={form.duracao}
              onChange={(e) => set("duracao", Number(e.target.value))}
            >
              {DURACOES.map((d) => (
                <option key={d.minutos} value={d.minutos}>{d.label}</option>
              ))}
            </select>
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

        {/* Observações */}
        <div>
          <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Observações (opcional)</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            rows={2}
            value={form.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder="Notas sobre a consulta..."
          />
        </div>

        {/* Gerar lançamento */}
        <label className="flex items-center gap-3 cursor-pointer glass-panel rounded-xl p-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded accent-cyan-500"
            checked={form.gerarLancamento}
            onChange={(e) => set("gerarLancamento", e.target.checked)}
          />
          <span className="text-sm font-medium text-slate-700">Gerar lançamento financeiro</span>
        </label>

        {form.gerarLancamento && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-slate-400 block mb-1">Valor (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => set("valor", e.target.value)}
              />
            </div>
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
          </div>
        )}

        {erro && <p className="text-sm text-rose-500">{erro}</p>}

        <button
          onClick={salvar}
          disabled={salvando}
          className="w-full py-3 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-[0_8px_24px_rgba(6,182,212,0.28)]"
        >
          {salvando ? "Salvando..." : "Agendar Consulta"}
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function AgendaPage() {
  const [consultas,        setConsultas]        = useState<Consulta[]>([])
  const [pacientes,        setPacientes]        = useState<Paciente[]>([])
  const [view,             setView]             = useState<View>("week")
  const [dataAtual,        setDataAtual]        = useState(new Date())
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null)
  const [modalNovo,        setModalNovo]        = useState(false)
  const [inicioNovo,       setInicioNovo]       = useState(new Date())
  const [loading,          setLoading]          = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const inicio = startOfMonth(subMonths(dataAtual, 1))
    const fim    = endOfMonth(addMonths(dataAtual, 1))
    try {
      const res = await fetch(
        `/api/agenda?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`
      )
      if (res.ok) setConsultas(await res.json())
    } finally {
      setLoading(false)
    }
  }, [dataAtual])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPacientes(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  const events: CalendarEvent[] = consultas.map((c) => ({
    id:       c.id,
    title:    c.paciente ? `${c.titulo} · ${c.paciente.nome}` : c.titulo,
    start:    new Date(c.inicio),
    end:      new Date(c.fim),
    resource: c,
  }))

  function abrirNovaConsulta(slotInfo?: { start: Date }) {
    const inicio = slotInfo?.start ?? new Date()
    // Arredondar para hora cheia
    inicio.setMinutes(0, 0, 0)
    setInicioNovo(inicio)
    setModalNovo(true)
  }

  function onEventoSalvo(nova: Consulta) {
    setConsultas((prev) => [...prev, nova])
  }

  function onStatusChange(id: string, status: Status) {
    setConsultas((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
    setConsultaSelecionada((prev) => prev?.id === id ? { ...prev, status } : prev)
  }

  function onDelete(id: string) {
    setConsultas((prev) => prev.filter((c) => c.id !== id))
  }

  // Estilo dos eventos por status
  function eventPropGetter(event: CalendarEvent) {
    const cor = STATUS_COR[event.resource.status]
    return {
      style: {
        backgroundColor: cor,
        borderColor:     cor,
        borderRadius:    "10px",
        fontSize:        "11px",
        fontWeight:      600,
        padding:         "2px 6px",
        opacity:         event.resource.status === "CANCELADA" ? 0.45 : 1,
      },
    }
  }

  return (
    <>
      <style>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-toolbar { flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
        .rbc-toolbar button {
          border-radius: 12px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 6px 14px !important;
          border: 1px solid rgba(15,23,42,0.1) !important;
          color: #475569 !important;
          background: white !important;
          transition: all 0.15s;
        }
        .rbc-toolbar button:hover { border-color: #06b6d4 !important; color: #06b6d4 !important; }
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg,#06b6d4,#2563eb) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 14px rgba(6,182,212,0.3) !important;
        }
        .rbc-toolbar-label { font-weight: 600; color: #0f172a; font-size: 14px; }
        .rbc-header { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 4px; border-bottom: 1px solid #f1f5f9 !important; }
        .rbc-time-header-content { border-left: 1px solid #f1f5f9 !important; }
        .rbc-time-content { border-top: 1px solid #f1f5f9 !important; }
        .rbc-timeslot-group { border-bottom: 1px solid #f8fafc !important; min-height: 48px; }
        .rbc-time-slot { font-size: 10px; color: #cbd5e1; }
        .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9 !important; }
        .rbc-today { background: rgba(6,182,212,0.04) !important; }
        .rbc-current-time-indicator { background-color: #06b6d4 !important; }
        .rbc-off-range-bg { background: #fafafa !important; }
        .rbc-month-row { border-top: 1px solid #f1f5f9 !important; }
        .rbc-date-cell { font-size: 12px; padding: 4px 8px; color: #64748b; }
        .rbc-date-cell.rbc-now { font-weight: 700; color: #06b6d4; }
        .rbc-event:focus { outline: none; }
        .rbc-show-more { font-size: 10px; font-weight: 600; color: #06b6d4; }
        .rbc-selected { box-shadow: 0 0 0 2px #06b6d4 !important; }
      `}</style>

      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="eyebrow">Agenda</div>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-[-0.03em] text-slate-900">
              Calendário de Consultas
            </h1>
          </div>
          <button
            onClick={() => abrirNovaConsulta()}
            className="self-start sm:self-auto px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_8px_24px_rgba(6,182,212,0.24)]"
          >
            + Nova Consulta
          </button>
        </div>

        {/* Legenda de status */}
        <div className="flex flex-wrap gap-3">
          {(Object.entries(STATUS_COR) as [Status, string][]).map(([s, cor]) => (
            <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: cor }} />
              {STATUS_LABEL[s]}
            </span>
          ))}
        </div>

        {/* Calendário */}
        <div className="glass-panel rounded-[24px] p-4 md:p-6">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center text-slate-400 text-sm font-mono-ui uppercase tracking-widest">
              Carregando...
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={events}
              view={view}
              onView={setView}
              date={dataAtual}
              onNavigate={setDataAtual}
              culture="pt-BR"
              messages={MESSAGES}
              style={{ height: 620 }}
              onSelectEvent={(event) => setConsultaSelecionada((event as CalendarEvent).resource)}
              onSelectSlot={abrirNovaConsulta}
              selectable
              eventPropGetter={eventPropGetter as any}
              formats={{
                timeGutterFormat: (date: Date) =>
                  date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
                eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                  `${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
                dayHeaderFormat: (date: Date) =>
                  date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }),
                monthHeaderFormat: (date: Date) =>
                  date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
                weekdayFormat: (date: Date) =>
                  date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
              }}
            />
          )}
        </div>
      </div>

      {/* Modal detalhe */}
      {consultaSelecionada && (
        <ModalDetalhe
          consulta={consultaSelecionada}
          onClose={() => setConsultaSelecionada(null)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      )}

      {/* Modal novo */}
      {modalNovo && (
        <ModalNovaConsulta
          inicio={inicioNovo}
          pacientes={pacientes}
          onClose={() => setModalNovo(false)}
          onSalvo={onEventoSalvo}
        />
      )}
    </>
  )
}
