import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-bold text-slate-800 text-lg">NutriEval</span>
        </div>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
          Plataforma para nutricionistas
        </div>

        <h1 className="text-5xl font-bold text-slate-900 max-w-2xl leading-tight mb-4">
          Avaliação física{" "}
          <span className="bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">
            completa e inteligente
          </span>
        </h1>

        <p className="text-slate-500 text-lg max-w-xl mb-8">
          Calcule automaticamente IMC, % de gordura, somatotipo, composição corporal e muito mais.
          Seus pacientes acompanham a evolução em tempo real.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/cadastro"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-200"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full">
          {[
            {
              icon: "📊",
              title: "13 fórmulas científicas",
              desc: "Heath-Carter, Faulkner, Petroski, Lee e mais",
            },
            {
              icon: "📈",
              title: "Gráficos interativos",
              desc: "Evolução do paciente com visualizações modernas",
            },
            {
              icon: "👤",
              title: "Painel do paciente",
              desc: "Acesso individual para acompanhar a evolução",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-left"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-slate-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
