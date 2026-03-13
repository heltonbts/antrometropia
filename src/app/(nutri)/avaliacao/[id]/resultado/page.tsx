import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { formatarNumero, corDobras } from "@/lib/utils"

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const avaliacao = await prisma.avaliacao.findUnique({
    where: { id },
    include: { resultado: true, paciente: true },
  })

  if (!avaliacao || !avaliacao.resultado) return notFound()

  const r = avaliacao.resultado
  const p = avaliacao.paciente
  const formula = r.formulaReferencia === "faulkner" ? "faulkner" : "petroski"

  const cards = [
    {
      titulo: "IMC",
      valor: formatarNumero(r.imc),
      unidade: "kg/m²",
      badge: r.classificacaoImc,
      tone: "from-[#264653] to-[#4d6a77]",
    },
    {
      titulo: formula === "faulkner" ? "% Gordura — Faulkner" : "% Gordura — Petroski",
      valor: formula === "faulkner" ? formatarNumero(r.percGorduraFaulkner) : formatarNumero(r.percGorduraPetroski),
      unidade: "%",
      tone: "from-[#c96d42] to-[#d88c5b]",
    },
    {
      titulo: "Massa Gorda",
      valor: formatarNumero(r.massaGorda),
      unidade: "kg",
      tone: "from-[#c96d42] to-[#264653]",
    },
    {
      titulo: "Massa Magra",
      valor: formatarNumero(r.massaMagra),
      unidade: "kg",
      tone: "from-[#1f8a70] to-[#2a9d8f]",
    },
    {
      titulo: "Massa Muscular (SMM)",
      valor: formatarNumero(r.massaMuscular),
      unidade: "kg",
      tone: "from-[#1f8a70] to-[#264653]",
    },
    {
      titulo: "Massa Óssea",
      valor: formatarNumero(r.massaOssea),
      unidade: "kg",
      tone: "from-[#264653] to-[#172033]",
    },
    {
      titulo: "RCQ",
      valor: formatarNumero(r.rcq, 2),
      unidade: "",
      badge: r.classificacaoRcq,
      tone: "from-[#264653] to-[#1f8a70]",
    },
    {
      titulo: "Risco — Cintura",
      valor: "",
      unidade: "",
      badge: r.riscoCintura,
      tone: "from-[#172033] to-[#264653]",
    },
    {
      titulo: "CMB",
      valor: formatarNumero(r.cmb),
      unidade: "cm",
      tone: "from-[#1f8a70] to-[#2a9d8f]",
    },
    {
      titulo: "CMC",
      valor: formatarNumero(r.cmc),
      unidade: "cm",
      tone: "from-[#1f8a70] to-[#2a9d8f]",
    },
    {
      titulo: "Soma 6 Dobras",
      valor: formatarNumero(r.soma6Dobras),
      unidade: "mm",
      badge: r.classificacao6Dobras,
      badgeDobras: true,
      tone: "from-[#c96d42] to-[#264653]",
    },
    {
      titulo: "Soma de Todas as Dobras",
      valor: formatarNumero(r.somaTodasDobras),
      unidade: "mm",
      tone: "from-[#264653] to-[#c96d42]",
    },
  ] as { titulo: string; valor: string; unidade: string; badge?: string | null; badgeDobras?: boolean; tone: string }[]

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <Link href={`/pacientes/${p.id}`} className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 hover:text-slate-600">
          ← Voltar ao perfil
        </Link>
        <div className="mt-4">
          <div className="eyebrow">Resultado</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Avaliação Física</h1>
          <p className="text-slate-400 text-sm mt-2">
            {p.nome} ·{" "}
            {new Date(avaliacao.dataAvaliacao).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Cards de resultado */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div
            key={c.titulo}
            className={`metric-card rounded-[22px] bg-gradient-to-br ${c.tone} p-5 text-white`}
          >
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">{c.titulo}</p>
            {c.valor ? (
              <p className="text-2xl font-bold mt-3">
                {c.valor}
                {c.unidade && <span className="text-sm font-normal text-white/60 ml-1">{c.unidade}</span>}
              </p>
            ) : null}
            {c.badge && (
              c.badgeDobras
                ? <span className={`inline-block mt-3 px-2.5 py-1 rounded-lg text-xs font-bold font-mono-ui uppercase tracking-[0.14em] ${corDobras(c.badge)}`}>{c.badge}</span>
                : <p className="text-sm font-semibold mt-2 text-white/90">{c.badge}</p>
            )}
          </div>
        ))}
      </div>

      {/* Somatotipo */}
      {r.endomorfia !== null && r.mesomorfia !== null && r.ectomorfia !== null && (
        <div className="glass-panel rounded-[28px] p-6">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-5">Somatotipo — Heath-Carter</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="metric-card rounded-[22px] bg-gradient-to-br from-[#c96d42] to-[#d88c5b] p-5 text-white">
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">Endomorfia</p>
              <p className="text-4xl font-bold mt-3">{formatarNumero(r.endomorfia, 2)}</p>
              <p className="text-xs text-white/60 mt-2">Adiposidade</p>
            </div>
            <div className="metric-card rounded-[22px] bg-gradient-to-br from-[#1f8a70] to-[#2a9d8f] p-5 text-white">
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">Mesomorfia</p>
              <p className="text-4xl font-bold mt-3">{formatarNumero(r.mesomorfia, 2)}</p>
              <p className="text-xs text-white/60 mt-2">Muscularidade</p>
            </div>
            <div className="metric-card rounded-[22px] bg-gradient-to-br from-[#264653] to-[#4d6a77] p-5 text-white">
              <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">Ectomorfia</p>
              <p className="text-4xl font-bold mt-3">{formatarNumero(r.ectomorfia, 2)}</p>
              <p className="text-xs text-white/60 mt-2">Linearidade</p>
            </div>
          </div>
          {r.biotipo && (
            <div className="mt-5 text-center">
              <span className="inline-flex items-center gap-2 bg-[rgba(31,138,112,0.1)] border border-[rgba(31,138,112,0.2)] text-[color:var(--accent)] text-sm font-semibold px-4 py-2 rounded-full">
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
          className="px-5 py-2.5 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition shadow-[0_14px_34px_rgba(31,138,112,0.22)]"
        >
          Nova Avaliação
        </Link>
        <Link
          href={`/avaliacao/${avaliacao.id}/editar`}
          className="px-5 py-2.5 glass-panel text-slate-700 text-sm font-semibold rounded-2xl hover:bg-white transition"
        >
          Editar
        </Link>
        <Link
          href={`/pacientes/${p.id}`}
          className="px-5 py-2.5 glass-panel text-slate-700 text-sm font-semibold rounded-2xl hover:bg-white transition"
        >
          Ver histórico
        </Link>
      </div>
    </div>
  )
}
