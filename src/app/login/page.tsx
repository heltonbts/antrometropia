"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: "", senha: "" })
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")
    setLoading(true)

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setErro(data.erro || "Erro ao fazer login")
      return
    }

    router.refresh()
    if (data.tipo === "nutricionista") {
      router.push("/dashboard")
    } else {
      router.push("/painel")
    }
  }

  return (
    <div className="min-h-screen hero-grid px-4 py-4 md:px-6 md:py-6">
      <div className="glass-panel-strong mx-auto grid min-h-[calc(100vh-2rem)] w-full max-w-6xl items-stretch overflow-hidden rounded-[36px] md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between border-r border-[rgba(23,32,51,0.08)] bg-[linear-gradient(160deg,rgba(31,138,112,0.12),rgba(255,255,255,0.18),rgba(38,70,83,0.14))] p-8 md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center shadow-[0_16px_34px_rgba(31,138,112,0.22)]">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</p>
                <p className="font-semibold text-slate-900">Clinical Access</p>
              </div>
            </div>

            <div className="mt-16">
              <div className="eyebrow">Ambiente de atendimento</div>
              <h1 className="mt-6 text-5xl font-semibold tracking-[-0.05em] text-slate-900">
                Entre no painel e continue a consulta de onde parou.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-600">
                Acesso rápido ao histórico do paciente, avaliações em andamento e composição corporal validada.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              "Confirmação de protocolo por avaliação.",
              "Resultados organizados para leitura clínica.",
              "Histórico longitudinal do paciente em um só fluxo.",
            ].map((item) => (
              <div key={item} className="glass-panel rounded-[22px] px-4 py-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</p>
                <p className="font-semibold text-slate-900">Clinical Access</p>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Entrar</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Bem-vindo de volta</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Entre com sua conta para continuar o fluxo de avaliação.</p>
          </div>

        <div className="glass-panel rounded-[28px] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
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
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-[color:var(--accent)] font-medium hover:underline">
            Criar conta
          </Link>
        </p>
        <p className="text-center text-slate-400 text-xs mt-2">
          <Link href="/" className="hover:text-slate-600">
            ← Voltar ao início
          </Link>
        </p>
        </div>
        </div>
      </div>
    </div>
  )
}
