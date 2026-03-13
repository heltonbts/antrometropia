import Link from "next/link"

// Dados fictícios para visualização — serão substituídos por dados reais da API
const stats = [
  { label: "Total de Pacientes", valor: "—", cor: "from-cyan-500 to-blue-600", icon: "👥" },
  { label: "Avaliações este mês", valor: "—", cor: "from-pink-400 to-rose-500", icon: "📋" },
  { label: "Última avaliação", valor: "—", cor: "from-violet-500 to-purple-600", icon: "📅" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Visão geral da sua clínica</p>
        </div>
        <Link
          href="/avaliacao/nova"
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm shadow-cyan-200"
        >
          + Nova Avaliação
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.cor} flex items-center justify-center text-xl`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{s.valor}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Ações rápidas */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/pacientes/novo"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-cyan-200 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-3">👤</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
              Cadastrar Paciente
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Adicione um novo paciente e envie o acesso
            </p>
          </Link>

          <Link
            href="/avaliacao/nova"
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:border-cyan-200 hover:shadow-md transition-all group"
          >
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
              Nova Avaliação
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Registre dobras, circunferências e calcule os resultados
            </p>
          </Link>
        </div>
      </div>

      {/* Últimas avaliações (placeholder) */}
      <div>
        <h2 className="text-base font-semibold text-slate-800 mb-4">Últimas avaliações</h2>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 text-center text-slate-400">
            <p className="text-3xl mb-3">📋</p>
            <p className="font-medium">Nenhuma avaliação ainda</p>
            <p className="text-sm mt-1">
              Comece cadastrando um paciente e realizando a primeira avaliação
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
