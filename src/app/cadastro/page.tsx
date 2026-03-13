"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CadastroPage() {
  const router = useRouter()
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (form.senha !== form.confirmar) {
      setErro("As senhas não conferem")
      return
    }
    if (form.senha.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres")
      return
    }

    setLoading(true)
    const res = await fetch("/api/auth/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: form.nome, email: form.email, senha: form.senha }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setErro(data.erro || "Erro ao criar conta")
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen hero-grid px-4 py-4 md:px-6 md:py-6">
      <div className="glass-panel-strong mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-stretch overflow-hidden rounded-[36px] md:grid-cols-[1fr_0.95fr]">
        <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</p>
                <p className="font-semibold text-slate-900">Create Workspace</p>
              </div>
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Crie sua conta</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Comece a usar o painel clínico com uma estrutura pronta para atendimento longitudinal.</p>
          </div>

        <div className="glass-panel rounded-[28px] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Dr(a). Seu Nome"
                className="w-full px-4 py-3 border border-[rgba(23,32,51,0.1)] rounded-2xl bg-[rgba(255,255,255,0.7)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 border border-[rgba(23,32,51,0.1)] rounded-2xl bg-[rgba(255,255,255,0.7)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 border border-[rgba(23,32,51,0.1)] rounded-2xl bg-[rgba(255,255,255,0.7)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmar senha
              </label>
              <input
                type="password"
                required
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                placeholder="Repita a senha"
                className="w-full px-4 py-3 border border-[rgba(23,32,51,0.1)] rounded-2xl bg-[rgba(255,255,255,0.7)] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)] transition"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-[0_16px_36px_rgba(31,138,112,0.22)]"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Já tem conta?{" "}
          <Link href="/login" className="text-[color:var(--accent)] font-medium hover:underline">
            Entrar
          </Link>
        </p>
        <p className="text-center text-slate-400 text-xs mt-2">
          <Link href="/" className="hover:text-slate-600">
            ← Voltar ao início
          </Link>
        </p>
        </div>
        </div>

        <div className="hidden border-l border-[rgba(23,32,51,0.08)] bg-[linear-gradient(180deg,rgba(255,248,235,0.8),rgba(38,70,83,0.08))] p-8 md:flex md:flex-col md:justify-between">
          <div>
            <div className="eyebrow">Setup clínico</div>
            <h2 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-900">Transforme a rotina de avaliação em uma base contínua.</h2>
          </div>
          <div className="grid gap-4">
            {[
              { t: "Base antropométrica", d: "Fórmulas organizadas por protocolo e sexo." },
              { t: "Leitura visual", d: "Resultados em cards, gráficos e histórico consolidado." },
              { t: "Escala", d: "Do cadastro ao painel do paciente sem trocar de ferramenta." },
            ].map((item) => (
              <div key={item.t} className="glass-panel rounded-[24px] p-5">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">{item.t}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
