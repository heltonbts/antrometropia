"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type Uso = {
  plano: "FREE" | "PRO"
  assinaturaStatus: string | null
  totalPacientes: number
  limite: number | null
}

export function PlanoCard() {
  const [uso, setUso] = useState<Uso | null>(null)
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgraded = searchParams.get("upgraded") === "true"

  useEffect(() => {
    fetch("/api/billing/uso")
      .then((r) => r.json())
      .then(setUso)
  }, [])

  async function handleUpgrade() {
    setCarregando(true)
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" })
      const data = await res.json()
      console.log("[checkout]", res.status, data)
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        alert(data.erro ?? `Erro ${res.status} ao iniciar checkout`)
      }
    } catch (e) {
      console.error("[checkout] erro de rede:", e)
      alert("Erro de conexão ao iniciar checkout")
    } finally {
      setCarregando(false)
    }
  }

  if (!uso) {
    return (
      <div className="glass-panel rounded-[28px] p-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
        <div className="h-6 w-40 bg-slate-200 rounded" />
      </div>
    )
  }

  const isPro = uso.plano === "PRO"
  const percentual = uso.limite ? Math.min((uso.totalPacientes / uso.limite) * 100, 100) : 0

  return (
    <div
      className={`rounded-[28px] p-6 ${
        isPro
          ? "bg-[linear-gradient(145deg,#1f8a70,#264653)] text-white shadow-[0_20px_48px_rgba(31,138,112,0.24)]"
          : "glass-panel"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-mono-ui text-[11px] uppercase tracking-[0.26em] ${
              isPro ? "text-white/60" : "text-slate-400"
            }`}
          >
            Plano atual
          </p>
          <h2
            className={`mt-3 text-2xl font-semibold ${isPro ? "text-white" : "text-slate-900"}`}
          >
            {isPro ? "Pro" : "Gratuito"}
          </h2>
          {isPro ? (
            <p className="mt-1 text-sm text-white/70">Pacientes ilimitados · R$ 22,90/mês</p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              {uso.totalPacientes} de {uso.limite} pacientes usados
            </p>
          )}
        </div>

        {isPro && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white uppercase tracking-[0.2em]">
            Ativo
          </span>
        )}
      </div>

      {upgraded && (
        <div className="mt-4 rounded-2xl bg-white/20 px-4 py-3 text-sm text-white font-medium">
          Upgrade realizado com sucesso. Bem-vindo ao Pro!
        </div>
      )}

      {!isPro && (
        <>
          {/* Barra de progresso */}
          <div className="mt-5">
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#1f8a70,#264653)] transition-all"
                style={{ width: `${percentual}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-[rgba(23,32,51,0.08)] bg-[rgba(255,255,255,0.5)] p-4">
            <p className="text-sm font-semibold text-slate-800">Plano Pro — R$ 22,90/mês</p>
            <ul className="mt-3 space-y-1.5">
              {["Pacientes ilimitados", "Suporte prioritário"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1f8a70]" />
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={carregando}
              className="mt-4 w-full px-5 py-2.5 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_12px_28px_rgba(31,138,112,0.28)] disabled:opacity-50"
            >
              {carregando ? "Redirecionando..." : "Fazer upgrade para Pro"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
