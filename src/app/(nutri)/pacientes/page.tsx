"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatarData, calcularIdade, formatarSexo } from "@/lib/utils"

interface Paciente {
  id: string
  nome: string
  email: string
  dataNascimento: string
  sexo: string
  avaliacoes: { dataAvaliacao: string; resultado: { imc: number; percGorduraPetroski: number } | null }[]
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-500 text-sm mt-1">{pacientes.length} pacientes cadastrados</p>
        </div>
        <Link
          href="/pacientes/novo"
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
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
        className="w-full max-w-sm px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
      />

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-400">
          <p className="text-3xl mb-3">👤</p>
          <p className="font-medium">Nenhum paciente encontrado</p>
          <p className="text-sm mt-1">
            <Link href="/pacientes/novo" className="text-cyan-600 hover:underline">
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
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between hover:border-cyan-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    {p.nome[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{p.nome}</p>
                    <p className="text-slate-400 text-sm">
                      {idade} anos · {formatarSexo(p.sexo)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {ultimaAval ? (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">Última avaliação</p>
                      <p className="text-sm font-medium text-slate-700">
                        {formatarData(ultimaAval.dataAvaliacao)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 hidden sm:block">Sem avaliações</span>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href={`/avaliacao/nova?pacienteId=${p.id}`}
                      className="px-3 py-1.5 text-xs font-medium bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition"
                    >
                      + Avaliação
                    </Link>
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition"
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
