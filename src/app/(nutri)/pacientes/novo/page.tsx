"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const inputCls = "w-full px-4 py-3 border border-[rgba(15,23,42,0.10)] rounded-2xl bg-[rgba(255,255,255,0.7)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(6,182,212,0.30)] transition"

export default function NovoPacientePage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: "", email: "", dataNascimento: "", sexo: "", raca: "", observacoes: "" })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setLoading(true)

    const res = await fetch("/api/pacientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) { setErro(data.erro || "Erro ao cadastrar paciente"); return }

    setLink(`${window.location.origin}/convite/${data.tokenConvite}`)
  }

  if (link) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="glass-panel rounded-[32px] p-8 text-center">
          <div className="w-14 h-14 rounded-[22px] bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center text-white text-2xl mx-auto mb-5 shadow-[0_16px_36px_rgba(6,182,212,0.28)]">
            ✓
          </div>
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-[color:var(--accent)] mb-2">Cadastrado</p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-900 mb-2">Paciente registrado!</h2>
          <p className="text-slate-500 text-sm mb-6">Compartilhe o link com o paciente para que ele crie a senha de acesso.</p>
          <div className="glass-panel rounded-2xl px-4 py-3 text-sm text-slate-700 break-all font-mono-ui mb-5 text-left">
            {link}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(link)}
            className="w-full py-3 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white font-semibold rounded-2xl hover:opacity-90 transition mb-3 shadow-[0_14px_34px_rgba(6,182,212,0.28)]"
          >
            Copiar link
          </button>
          <button
            onClick={() => router.push("/pacientes")}
            className="w-full py-3 glass-panel text-slate-700 font-semibold rounded-2xl hover:bg-white transition"
          >
            Ver pacientes
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/pacientes" className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 hover:text-slate-600">
          ← Voltar
        </Link>
        <div className="eyebrow mt-4">Novo registro</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Cadastrar Paciente</h1>
        <p className="text-slate-400 text-sm mt-2">Preencha os dados antropométricos e clínicos do paciente.</p>
      </div>

      <div className="glass-panel rounded-[32px] p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
              <input type="text" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome do paciente" className={inputCls} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@paciente.com" className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de nascimento</label>
              <input type="date" required value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
              <select required value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })} className={inputCls + " bg-[rgba(255,255,255,0.7)]"}>
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Raça / Etnia</label>
              <select required value={form.raca} onChange={(e) => setForm({ ...form, raca: e.target.value })} className={inputCls + " bg-[rgba(255,255,255,0.7)]"}>
                <option value="">Selecione</option>
                <option value="branco">Branco</option>
                <option value="negro">Negro</option>
                <option value="asiatico">Asiático</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Observações clínicas <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Histórico, restrições, objetivos..."
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white font-semibold rounded-2xl hover:opacity-90 transition disabled:opacity-60 shadow-[0_16px_36px_rgba(6,182,212,0.28)]"
          >
            {loading ? "Cadastrando..." : "Cadastrar Paciente"}
          </button>
        </form>
      </div>
    </div>
  )
}
