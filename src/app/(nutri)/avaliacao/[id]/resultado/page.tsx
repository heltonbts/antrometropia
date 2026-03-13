import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatarNumero, bgRisco, corRisco } from "@/lib/utils"

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: {
      resultado: true,
      paciente: true,
    },
  })

  if (!avaliacao || !avaliacao.resultado) return notFound()

  const r = avaliacao.resultado
  const p = avaliacao.paciente

  const cards = [
    {
      titulo: "IMC",
      valor: formatarNumero(r.imc),
      unidade: "kg/m²",
      class: r.classificacaoImc ? bgRisco(r.classificacaoImc) : "",
      badge: r.classificacaoImc,
      badgeClass: r.classificacaoImc ? corRisco(r.classificacaoImc) : "",
    },
    {
      titulo: "% Gordura — Faulkner",
      valor: formatarNumero(r.percGorduraFaulkner),
      unidade: "%",
      class: "bg-pink-50 border-pink-200",
    },
    {
      titulo: "% Gordura — Petroski",
      valor: formatarNumero(r.percGorduraPetroski),
      unidade: "%",
      class: "bg-violet-50 border-violet-200",
    },
    {
      titulo: "Massa Gorda",
      valor: formatarNumero(r.massaGorda),
      unidade: "kg",
      class: "bg-orange-50 border-orange-200",
    },
    {
      titulo: "Massa Magra",
      valor: formatarNumero(r.massaMagra),
      unidade: "kg",
      class: "bg-emerald-50 border-emerald-200",
    },
    {
      titulo: "Massa Muscular (SMM)",
      valor: formatarNumero(r.massaMuscular),
      unidade: "kg",
      class: "bg-cyan-50 border-cyan-200",
    },
    {
      titulo: "Massa Óssea",
      valor: formatarNumero(r.massaOssea),
      unidade: "kg",
      class: "bg-slate-50 border-slate-200",
    },
    {
      titulo: "RCQ",
      valor: formatarNumero(r.rcq, 2),
      unidade: "",
      class: r.classificacaoRcq ? bgRisco(r.classificacaoRcq) : "",
      badge: r.classificacaoRcq,
      badgeClass: r.classificacaoRcq ? corRisco(r.classificacaoRcq) : "",
    },
    {
      titulo: "Risco — Cintura",
      valor: "",
      unidade: "",
      class: r.riscoCintura ? bgRisco(r.riscoCintura) : "",
      badge: r.riscoCintura,
      badgeClass: r.riscoCintura ? corRisco(r.riscoCintura) : "",
    },
    {
      titulo: "CMB (Circ. Musc. Braço)",
      valor: formatarNumero(r.cmb),
      unidade: "cm",
      class: "bg-blue-50 border-blue-200",
    },
    {
      titulo: "CMC (Circ. Musc. Coxa)",
      valor: formatarNumero(r.cmc),
      unidade: "cm",
      class: "bg-blue-50 border-blue-200",
    },
    {
      titulo: "Soma 6 Dobras",
      valor: formatarNumero(r.soma6Dobras),
      unidade: "mm",
      class: "bg-amber-50 border-amber-200",
      badge: r.classificacao6Dobras,
      badgeClass: "",
    },
  ]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link href={`/pacientes/${p.id}`} className="text-sm text-slate-400 hover:text-slate-600">
          ← Voltar ao perfil
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Resultado da Avaliação</h1>
        <p className="text-slate-500 text-sm">
          {p.nome} ·{" "}
          {new Date(avaliacao.dataAvaliacao).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "long", year: "numeric",
          })}
        </p>
      </div>

      {/* Cards de resultado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className={`rounded-2xl border p-5 ${c.class || "bg-white border-slate-100"}`}
          >
            <p className="text-xs font-medium text-slate-500 mb-2">{c.titulo}</p>
            {c.valor ? (
              <p className="text-2xl font-bold text-slate-900">
                {c.valor}
                {c.unidade && (
                  <span className="text-sm font-normal text-slate-400 ml-1">{c.unidade}</span>
                )}
              </p>
            ) : null}
            {c.badge && (
              <p className={`text-sm font-semibold mt-1 ${c.badgeClass}`}>{c.badge}</p>
            )}
          </div>
        ))}
      </div>

      {/* Somatotipo */}
      {r.endomorfia !== null && r.mesomorfia !== null && r.ectomorfia !== null && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Somatotipo — Heath-Carter</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-rose-50 rounded-xl p-4">
              <p className="text-xs text-rose-500 font-medium mb-1">Endomorfia</p>
              <p className="text-3xl font-bold text-rose-600">{formatarNumero(r.endomorfia, 2)}</p>
              <p className="text-xs text-slate-400 mt-1">Adiposidade</p>
            </div>
            <div className="bg-cyan-50 rounded-xl p-4">
              <p className="text-xs text-cyan-500 font-medium mb-1">Mesomorfia</p>
              <p className="text-3xl font-bold text-cyan-600">{formatarNumero(r.mesomorfia, 2)}</p>
              <p className="text-xs text-slate-400 mt-1">Muscularidade</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-500 font-medium mb-1">Ectomorfia</p>
              <p className="text-3xl font-bold text-blue-600">{formatarNumero(r.ectomorfia, 2)}</p>
              <p className="text-xs text-slate-400 mt-1">Linearidade</p>
            </div>
          </div>
          {r.biotipo && (
            <div className="mt-4 text-center">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 text-cyan-700 text-sm font-semibold px-4 py-2 rounded-full">
                Biotipo: {r.biotipo}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="flex gap-3">
        <Link
          href={`/avaliacao/nova?pacienteId=${p.id}`}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
        >
          Nova Avaliação
        </Link>
        <Link
          href={`/pacientes/${p.id}`}
          className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
        >
          Ver histórico
        </Link>
      </div>
    </div>
  )
}
