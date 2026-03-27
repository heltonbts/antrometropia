"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import type { Pergunta } from "@/lib/modelos-padrao"

interface FormData {
  id: string
  titulo: string
  status: string
  perguntas: Pergunta[]
  paciente?: { nome: string } | null
}

function PerguntaField({
  pergunta,
  valor,
  onChange,
}: {
  pergunta: Pergunta
  valor: any
  onChange: (v: any) => void
}) {
  switch (pergunta.tipo) {
    case "texto":
      return (
        <input
          type="text"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] bg-white"
          placeholder="Sua resposta..."
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "textarea":
      return (
        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] resize-none bg-white"
          rows={3}
          placeholder="Sua resposta..."
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    case "simnao":
      return (
        <div className="flex gap-3">
          {["Sim", "Não"].map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => onChange(op)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                valor === op
                  ? "bg-[#06b6d4] text-white border-[#06b6d4] shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-[#06b6d4]"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      )

    case "multipla":
      return (
        <div className="space-y-2">
          {pergunta.opcoes?.map((op) => (
            <button
              key={op}
              type="button"
              onClick={() => onChange(op)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                valor === op
                  ? "bg-[rgba(6,182,212,0.08)] border-[#06b6d4] text-[#06b6d4] font-semibold"
                  : "bg-white border-slate-200 text-slate-700 hover:border-[#06b6d4]"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      )

    case "checkbox":
      return (
        <div className="space-y-2">
          {pergunta.opcoes?.map((op) => {
            const selecionados: string[] = Array.isArray(valor) ? valor : []
            const marcado = selecionados.includes(op)
            return (
              <button
                key={op}
                type="button"
                onClick={() => {
                  if (marcado) onChange(selecionados.filter((s) => s !== op))
                  else onChange([...selecionados, op])
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all flex items-center gap-3 ${
                  marcado
                    ? "bg-[rgba(6,182,212,0.08)] border-[#06b6d4] text-[#06b6d4] font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-[#06b6d4]"
                }`}
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${marcado ? "bg-[#06b6d4] border-[#06b6d4]" : "border-slate-300"}`}>
                  {marcado && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                </span>
                {op}
              </button>
            )
          })}
        </div>
      )

    case "escala": {
      const min = pergunta.escalaMin ?? 1
      const max = pergunta.escalaMax ?? 10
      const nums = Array.from({ length: max - min + 1 }, (_, i) => i + min)
      return (
        <div>
          <div className="flex gap-1.5 flex-wrap">
            {nums.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(n)}
                className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                  valor === n
                    ? "bg-[#06b6d4] text-white border-[#06b6d4] shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#06b6d4]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {(pergunta.escalaMinLabel || pergunta.escalaMaxLabel) && (
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-400">{min} — {pergunta.escalaMinLabel}</span>
              <span className="text-xs text-slate-400">{max} — {pergunta.escalaMaxLabel}</span>
            </div>
          )}
        </div>
      )
    }

    case "data":
      return (
        <input
          type="date"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#06b6d4] bg-white"
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      )

    default:
      return null
  }
}

export default function FormularioPublico() {
  const { slug } = useParams<{ slug: string }>()
  const [form,      setForm]      = useState<FormData | null>(null)
  const [respostas, setRespostas] = useState<Record<string, any>>({})
  const [loading,   setLoading]   = useState(true)
  const [enviando,  setEnviando]  = useState(false)
  const [enviado,   setEnviado]   = useState(false)
  const [erro,      setErro]      = useState("")
  const [errosCampo, setErrosCampo] = useState<string[]>([])

  useEffect(() => {
    fetch(`/api/f/${slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setForm(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  function setResposta(id: string, valor: any) {
    setRespostas((prev) => ({ ...prev, [id]: valor }))
    setErrosCampo((prev) => prev.filter((e) => e !== id))
  }

  async function enviar() {
    if (!form) return

    // Validação de obrigatórias
    const faltando = form.perguntas
      .filter((p) => p.obrigatoria)
      .filter((p) => {
        const v = respostas[p.id]
        if (v == null || v === "") return true
        if (Array.isArray(v) && v.length === 0) return true
        return false
      })
      .map((p) => p.id)

    if (faltando.length > 0) {
      setErrosCampo(faltando)
      setErro("Responda todas as perguntas obrigatórias.")
      return
    }

    setEnviando(true)
    setErro("")
    try {
      const res = await fetch(`/api/f/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas }),
      })
      if (res.ok) setEnviado(true)
      else {
        const d = await res.json()
        setErro(d.erro || "Erro ao enviar.")
      }
    } catch {
      setErro("Erro de conexão. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center">
        <p className="text-slate-400 text-sm">Carregando...</p>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-slate-800">Formulário não encontrado</p>
          <p className="text-slate-400 mt-2 text-sm">O link pode estar incorreto ou expirado.</p>
        </div>
      </div>
    )
  }

  if (form.status === "PREENCHIDA" && !enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-slate-800">Formulário já preenchido</p>
          <p className="text-slate-400 mt-2 text-sm">Este formulário já foi respondido anteriormente.</p>
        </div>
      </div>
    )
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-slate-800">Enviado com sucesso!</p>
          <p className="text-slate-400 mt-2 text-sm">Suas respostas foram registradas. Obrigado!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">N</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Biometric Pro</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">{form.titulo}</h1>
          {form.paciente && (
            <p className="text-sm text-slate-400 mt-1">Olá, {form.paciente.nome}</p>
          )}
          <p className="text-xs text-slate-400 mt-3">
            Campos marcados com <span className="text-red-400">*</span> são obrigatórios.
          </p>
        </div>

        {/* Perguntas */}
        {form.perguntas.map((p, i) => (
          <div
            key={p.id}
            className={`bg-white rounded-[24px] p-5 shadow-sm border transition-all ${
              errosCampo.includes(p.id) ? "border-red-300" : "border-slate-100"
            }`}
          >
            <p className="text-sm font-semibold text-slate-800 mb-3">
              <span className="text-slate-400 font-normal mr-2">{i + 1}.</span>
              {p.pergunta}
              {p.obrigatoria && <span className="text-red-400 ml-1">*</span>}
            </p>
            <PerguntaField
              pergunta={p}
              valor={respostas[p.id]}
              onChange={(v) => setResposta(p.id, v)}
            />
            {errosCampo.includes(p.id) && (
              <p className="text-xs text-red-400 mt-2">Esta pergunta é obrigatória.</p>
            )}
          </div>
        ))}

        {/* Enviar */}
        {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}
        <button
          onClick={enviar}
          disabled={enviando}
          className="w-full py-4 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-[0_8px_28px_rgba(6,182,212,0.28)]"
        >
          {enviando ? "Enviando..." : "Enviar Respostas"}
        </button>
        <p className="text-center text-xs text-slate-300 pb-6">Biometric Pro · Formulário seguro</p>
      </div>
    </div>
  )
}
