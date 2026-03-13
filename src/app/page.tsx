import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen hero-grid flex flex-col px-4 py-4 md:px-6 md:py-6">
      <div className="glass-panel-strong flex min-h-[calc(100vh-2rem)] flex-col rounded-[36px]">
      {/* Header */}
      <header className="px-6 py-5 md:px-8 md:py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,#1f8a70,#264653)] flex items-center justify-center shadow-[0_16px_36px_rgba(31,138,112,0.2)]">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <div>
            <span className="font-mono-ui text-[11px] uppercase tracking-[0.28em] text-slate-500">Nutrieval</span>
            <p className="font-semibold text-slate-900 leading-none mt-1">Anthropometry Studio</p>
          </div>
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
            className="px-4 py-2 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white text-sm font-medium rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(31,138,112,0.22)]"
          >
            Começar grátis
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 grid gap-10 px-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-14">
        <div className="flex flex-col justify-center">
          <div className="eyebrow mb-6">Plataforma para nutricionistas</div>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] text-slate-900 md:text-7xl">
            Avaliação física com uma interface mais
            <span className="block text-[color:var(--accent)]">clínica, legível e estratégica.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Organize fórmulas, acompanhe evolução corporal e conduza atendimentos com um painel que
            parece instrumento de trabalho, não um formulário genérico.
          </p>

          <div className="mt-8 flex gap-4 flex-wrap">
            <Link
              href="/cadastro"
              className="px-6 py-3 bg-[linear-gradient(135deg,#1f8a70,#264653)] text-white font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_18px_44px_rgba(31,138,112,0.24)]"
            >
              Criar conta grátis
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 glass-panel text-slate-700 font-semibold rounded-2xl transition-colors"
            >
              Já tenho conta
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
            {[
              ["Protocolos", "Petroski, Faulkner, Heath-Carter e Lee no mesmo fluxo."],
              ["Histórico", "Evolução visual do paciente com leitura rápida por consulta."],
              ["Paciente", "Compartilhe resultados e acompanhe retorno sem ruído operacional."],
            ].map(([titulo, desc]) => (
              <div key={titulo} className="glass-panel rounded-[24px] p-5">
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-slate-500">{titulo}</p>
                <p className="mt-3 text-sm leading-6 text-slate-700">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <div className="glass-panel-strong w-full rounded-[32px] p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-[rgba(23,32,51,0.08)] pb-4">
              <div>
                <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Session Board</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Painel de decisão clínica</h2>
              </div>
              <div className="rounded-full bg-[rgba(31,138,112,0.12)] px-3 py-1 text-xs font-semibold text-[color:var(--accent)]">
                Online
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {[
                {
                  k: "Paciente ativo",
                  v: "Marina Costa",
                  note: "7ª avaliação em andamento",
                  tone: "from-[#1f8a70] to-[#2a9d8f]",
                },
                {
                  k: "Composição",
                  v: "38,4% gordura",
                  note: "Petroski feminino confirmado",
                  tone: "from-[#c96d42] to-[#d88c5b]",
                },
                {
                  k: "Observação",
                  v: "Massa muscular incompleta",
                  note: "Circunferências corrigidas ainda pendentes",
                  tone: "from-[#264653] to-[#4d6a77]",
                },
              ].map((item) => (
                <div key={item.k} className={`metric-card rounded-[26px] bg-gradient-to-br ${item.tone} p-5 text-white`}>
                  <p className="font-mono-ui text-[11px] uppercase tracking-[0.24em] text-white/70">{item.k}</p>
                  <p className="mt-3 text-2xl font-semibold">{item.v}</p>
                  <p className="mt-2 text-sm text-white/78">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[24px] border border-[rgba(23,32,51,0.08)] bg-[rgba(255,255,255,0.56)] p-5">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.26em] text-slate-500">Por que funciona</p>
              <div className="mt-4 grid gap-3">
                {[
                  "Protocolos separados por sexo e fórmula escolhida.",
                  "Medições opcionais não bloqueiam o restante da composição corporal.",
                  "Visual pensado para consulta rápida e acompanhamento longitudinal.",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--accent-2)]" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 mt-2 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {[
            {
              icon: "01",
              title: "13 fórmulas científicas",
              desc: "Heath-Carter, Faulkner, Petroski, Lee e outros protocolos em uma mesma base.",
            },
            {
              icon: "02",
              title: "Gráficos interativos",
              desc: "A leitura de evolução vira parte da consulta, sem poluição visual.",
            },
            {
              icon: "03",
              title: "Painel do paciente",
              desc: "O paciente acompanha o progresso com autonomia e contexto.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="glass-panel rounded-[28px] p-6 text-left"
            >
              <div className="font-mono-ui text-sm mb-4 text-[color:var(--accent)]">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-2 text-lg">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-6">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
      </div>
    </main>
  )
}
