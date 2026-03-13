"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NovoPacientePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: "",
    email: "",
    dataNascimento: "",
    sexo: "",
    raca: "",
    observacoes: "",
  })
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

    if (!res.ok) {
      setErro(data.erro || "Erro ao cadastrar paciente")
      return
    }

    const url = `${window.location.origin}/convite/${data.tokenConvite}`
    setLink(url)
  }

  if (link) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Paciente cadastrado!</h2>
          <p className="text-slate-500 text-sm mb-6">
            Compartilhe o link abaixo com o paciente para que ele crie a senha de acesso.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 break-all font-mono mb-4">
            {link}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(link)}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition mb-3"
          >
            Copiar link
          </button>
          <button
            onClick={() => router.push("/pacientes")}
            className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
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
        <Link href="/pacientes" className="text-sm text-slate-400 hover:text-slate-600">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Novo Paciente</h1>
        <p className="text-slate-500 text-sm">Preencha os dados para cadastrar um novo paciente</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Nome do paciente"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@paciente.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Data de nascimento</label>
              <input
                type="date"
                required
                value={form.dataNascimento}
                onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
              <select
                required
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition bg-white"
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Raça / Etnia</label>
              <select
                required
                value={form.raca}
                onChange={(e) => setForm({ ...form, raca: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition bg-white"
              >
                <option value="">Selecione</option>
                <option value="branco">Branco</option>
                <option value="negro">Negro</option>
                <option value="asiatico">Asiático</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Observações clínicas{" "}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                placeholder="Histórico, restrições, objetivos..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition resize-none"
              />
            </div>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Cadastrar Paciente"}
          </button>
        </form>
      </div>
    </div>
  )
}
