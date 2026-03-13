"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

interface PacienteInfo {
  nome: string
  email: string
}

export default function ConvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()

  const [info, setInfo] = useState<PacienteInfo | null>(null)
  const [invalido, setInvalido] = useState(false)
  const [loading, setLoading] = useState(true)

  const [senha, setSenha] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [erro, setErro] = useState("")
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    fetch(`/api/auth/convite?token=${token}`)
      .then((r) => {
        if (!r.ok) { setInvalido(true); setLoading(false); return null }
        return r.json()
      })
      .then((d) => { if (d) setInfo(d); setLoading(false) })
      .catch(() => { setInvalido(true); setLoading(false) })
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro("")

    if (senha.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return }
    if (senha !== confirmar) { setErro("As senhas não coincidem."); return }

    setEnviando(true)
    try {
      const r = await fetch("/api/auth/convite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha }),
      })
      if (!r.ok) {
        const d = await r.json().catch(() => ({}))
        setErro(d.erro ?? "Erro ao aceitar convite.")
        setEnviando(false)
        return
      }
      router.push("/painel")
    } catch {
      setErro("Erro de conexão. Tente novamente.")
      setEnviando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen hero-grid flex items-center justify-center">
        <p className="text-slate-400 font-mono-ui text-sm uppercase tracking-[0.2em]">Verificando convite...</p>
      </div>
    )
  }

  if (invalido) {
    return (
      <div className="min-h-screen hero-grid flex items-center justify-center px-4">
        <div className="glass-panel-strong rounded-[32px] p-10 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(201,109,66,0.12)] flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Convite inválido</h1>
          <p className="text-slate-500 text-sm">
            Este link de convite é inválido ou já foi utilizado. Peça ao seu nutricionista um novo convite.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen hero-grid flex items-center justify-center px-4">
      <div className="glass-panel-strong rounded-[32px] p-8 md:p-10 max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center shadow-[0_12px_28px_rgba(31,138,112,0.22)]">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</p>
        </div>

        {/* Saudação */}
        <div>
          <div className="eyebrow">Convite</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-900">
            Olá, {info!.nome.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Seu nutricionista criou sua conta no NutriEval. Crie uma senha para acessar seu painel de evolução.
          </p>
          <p className="font-mono-ui text-[11px] text-slate-400 mt-3">{info!.email}</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Nova senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="glass-panel w-full px-4 py-3 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)]"
            />
          </div>
          <div>
            <label className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-slate-400 block mb-2">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
              required
              className="glass-panel w-full px-4 py-3 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(31,138,112,0.3)]"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-500 font-medium">{erro}</p>
          )}

          <button
            type="submit"
            disabled={enviando}
            className="w-full py-3 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(31,138,112,0.22)] disabled:opacity-50"
          >
            {enviando ? "Acessando..." : "Criar senha e acessar"}
          </button>
        </form>
      </div>
    </div>
  )
}
