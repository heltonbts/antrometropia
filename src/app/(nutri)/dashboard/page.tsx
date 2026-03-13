import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { formatarData } from "@/lib/utils"

const SECRET = new TextEncoder().encode(process.env.APP_SECRET || "secret")

async function getDashboardData() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value
    if (!token) return null

    const { payload } = await jwtVerify(token, SECRET)
    if (payload.tipo !== "nutricionista") return null
    const nutriId = payload.id as string

    const [totalPacientes, avaliacoesDoMes, ultimasAvaliacoes, nutri] = await Promise.all([
      prisma.paciente.count({ where: { nutricionistaId: nutriId } }),
      prisma.avaliacao.count({
        where: {
          paciente: { nutricionistaId: nutriId },
          dataAvaliacao: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.avaliacao.findMany({
        where: { paciente: { nutricionistaId: nutriId } },
        include: { paciente: { select: { nome: true, id: true } }, resultado: true },
        orderBy: { dataAvaliacao: "desc" },
        take: 5,
      }),
      prisma.nutricionista.findUnique({ where: { id: nutriId }, select: { nome: true } }),
    ])

    return { totalPacientes, avaliacoesDoMes, ultimasAvaliacoes, nome: nutri?.nome ?? "" }
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const stats = [
    { label: "Total de Pacientes",   valor: data?.totalPacientes?.toString() ?? "—",         tone: "from-[#1f8a70] to-[#2a9d8f]" },
    { label: "Avaliações este mês",  valor: data?.avaliacoesDoMes?.toString() ?? "—",         tone: "from-[#c96d42] to-[#d88c5b]" },
    { label: "Última avaliação",     valor: data?.ultimasAvaliacoes[0] ? formatarData(data.ultimasAvaliacoes[0].dataAvaliacao) : "—", tone: "from-[#264653] to-[#4d6a77]" },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">
            {data?.nome ? `Olá, ${data.nome.split(" ")[0]}` : "Visão geral"}
          </h1>
          <p className="text-slate-500 text-sm mt-3 max-w-xl leading-6">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="glass-panel rounded-[28px] p-5 flex flex-col justify-between">
          <div>
            <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Próxima ação</p>
            <p className="mt-3 text-xl font-semibold text-slate-900">Abrir uma nova avaliação com protocolo confirmado.</p>
          </div>
          <Link
            href="/avaliacao/nova"
            className="mt-5 inline-flex w-fit px-5 py-2.5 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(31,138,112,0.22)]"
          >
            + Nova Avaliação
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`metric-card rounded-[22px] bg-gradient-to-br ${s.tone} p-6 text-white`}>
            <p className="font-mono-ui text-[10px] uppercase tracking-[0.22em] text-white/70">{s.label}</p>
            <p className="text-4xl font-semibold mt-4">{s.valor}</p>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Ações rápidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/pacientes/novo" className="glass-panel rounded-[28px] p-6 hover:border-[rgba(31,138,112,0.22)] hover:shadow-md transition-all group">
            <div className="font-mono-ui text-sm mb-3 text-[color:var(--accent)]">01</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-[color:var(--accent)] transition-colors text-lg">Cadastrar Paciente</h3>
            <p className="text-slate-500 text-sm mt-2 leading-6">Adicione um novo paciente e gere o link de convite para acesso.</p>
          </Link>
          <Link href="/avaliacao/nova" className="glass-panel rounded-[28px] p-6 hover:border-[rgba(31,138,112,0.22)] hover:shadow-md transition-all group">
            <div className="font-mono-ui text-sm mb-3 text-[color:var(--accent-2)]">02</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-[color:var(--accent)] transition-colors text-lg">Nova Avaliação</h3>
            <p className="text-slate-500 text-sm mt-2 leading-6">Registre dobras, circunferências e calcule composição corporal completa.</p>
          </Link>
        </div>
      </div>

      {/* Últimas avaliações */}
      <div>
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-4">Últimas avaliações</p>
        {!data || data.ultimasAvaliacoes.length === 0 ? (
          <div className="glass-panel rounded-[28px] p-10 text-center text-slate-400">
            <p className="font-mono-ui text-sm mb-3 text-[color:var(--accent)]">EMPTY</p>
            <p className="font-medium">Nenhuma avaliação ainda</p>
            <p className="text-sm mt-1 leading-6">Comece cadastrando um paciente e realizando a primeira avaliação.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.ultimasAvaliacoes.map((a, i) => (
              <Link
                key={a.id}
                href={`/avaliacao/${a.id}/resultado`}
                className="glass-panel flex items-center justify-between rounded-[22px] p-4 hover:border-[rgba(31,138,112,0.22)] hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-[color:var(--accent)]" : "bg-slate-200"}`} />
                  <div className="w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center text-white text-sm font-bold">
                    {a.paciente.nome[0]}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{a.paciente.nome}</p>
                    <p className="text-slate-400 text-sm">{formatarData(a.dataAvaliacao)} · {a.peso} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.resultado?.imc && (
                    <span className="font-mono-ui text-[11px] bg-[rgba(38,70,83,0.08)] text-[color:var(--accent-3)] font-semibold px-2 py-1 rounded-lg">
                      IMC {a.resultado.imc.toFixed(1)}
                    </span>
                  )}
                  <span className="text-slate-300 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
