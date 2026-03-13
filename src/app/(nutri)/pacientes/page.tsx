"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { formatarData, calcularIdade, formatarSexo } from "@/lib/utils"

interface Paciente {
  id: string
  nome: string
  email: string
  dataNascimento: string
  sexo: string
  conviteAceito: boolean
  tokenConvite: string | null
  avaliacoes: { dataAvaliacao: string; resultado: { imc: number; percGorduraPetroski: number } | null }[]
}

function ConviteBtn({ paciente }: { paciente: Paciente }) {
  const [copiado, setCopiado] = useState(false)
  const [loading, setLoading] = useState(false)

  const copiarLink = useCallback(async (token: string) => {
    const link = `${window.location.origin}/convite/${token}`
    await navigator.clipboard.writeText(link)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }, [])

  const reenviar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`/api/pacientes/${paciente.id}/convite`, { method: "POST" })
      if (r.ok) {
        const { tokenConvite } = await r.json()
        await copiarLink(tokenConvite)
      }
    } finally {
      setLoading(false)
    }
  }, [paciente.id, copiarLink])

  if (!paciente.conviteAceito && paciente.tokenConvite) {
    return (
      <button
        onClick={() => copiarLink(paciente.tokenConvite!)}
        className="px-3 py-2 text-xs font-medium bg-[rgba(236,72,153,0.10)] text-[color:var(--accent-2)] rounded-xl hover:bg-[rgba(236,72,153,0.16)] transition"
      >
        {copiado ? "Copiado!" : "Copiar convite"}
      </button>
    )
  }

  return (
    <button
      onClick={reenviar}
      disabled={loading}
      className="px-3 py-2 text-xs font-medium bg-[rgba(236,72,153,0.10)] text-[color:var(--accent-2)] rounded-xl hover:bg-[rgba(236,72,153,0.16)] transition disabled:opacity-50"
    >
      {loading ? "..." : copiado ? "Copiado!" : "Reenviar acesso"}
    </button>
  )
}

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")

  useEffect(() => {
    fetch("/api/pacientes")
      .then(async (r) => {
        if (r.status === 401) { window.location.href = "/login"; return [] }
        if (!r.ok) return []
        return r.json().catch(() => [])
      })
      .then((data) => {
        setPacientes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = pacientes.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="eyebrow">Pacientes</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Base de pacientes</h1>
          <p className="text-slate-500 text-sm mt-3">{pacientes.length} pacientes cadastrados</p>
        </div>
        <Link
          href="/pacientes/novo"
          className="px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(6,182,212,0.28)]"
        >
          + Novo Paciente
        </Link>
      </div>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar paciente..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="glass-panel w-full max-w-sm px-4 py-3 rounded-2xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgba(6,182,212,0.30)]"
      />

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="glass-panel rounded-[28px] p-12 text-center text-slate-400">
          <p className="font-mono-ui text-sm mb-3 text-[color:var(--accent)]">EMPTY</p>
          <p className="font-medium">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1">
            <Link href="/pacientes/novo" className="text-[color:var(--accent)] hover:underline">
              Cadastrar primeiro paciente
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtrados.map((p) => {
            const ultimaAval = p.avaliacoes[0]
            const idade = calcularIdade(p.dataNascimento)
            return (
              <div
                key={p.id}
                className="glass-panel rounded-[28px] p-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between hover:border-[rgba(6,182,212,0.22)] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#2563eb)] flex items-center justify-center text-white font-bold text-lg shadow-[0_14px_32px_rgba(6,182,212,0.22)]">
                    {p.nome[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{p.nome}</p>
                      {!p.conviteAceito && (
                        <span className="font-mono-ui text-[9px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full bg-[rgba(236,72,153,0.10)] text-[color:var(--accent-2)]">
                          Convite pendente
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {idade} anos · {formatarSexo(p.sexo)}
                    </p>
                    <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-slate-400 mt-2">{p.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {ultimaAval ? (
                    <div className="text-right hidden sm:block">
                      <p className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-slate-400">Última avaliação</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">
                        {formatarData(ultimaAval.dataAvaliacao)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 hidden sm:block">Sem avaliações</span>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <ConviteBtn paciente={p} />
                    <Link
                      href={`/avaliacao/nova?pacienteId=${p.id}`}
                      className="px-3 py-2 text-xs font-medium bg-[rgba(6,182,212,0.10)] text-[color:var(--accent)] rounded-xl hover:bg-[rgba(6,182,212,0.16)] transition"
                    >
                      + Avaliação
                    </Link>
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="px-3 py-2 text-xs font-medium bg-[rgba(15,23,42,0.06)] text-slate-600 rounded-xl hover:bg-[rgba(15,23,42,0.10)] transition"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
