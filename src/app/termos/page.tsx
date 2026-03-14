import Link from "next/link"

export default function TermosPage() {
  return (
    <main className="min-h-screen hero-grid px-4 py-6 md:px-6">
      <div className="glass-panel-strong mx-auto max-w-4xl rounded-[32px] p-8 md:p-10">
        <div className="eyebrow">Legal</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Termos de Uso</h1>
        <p className="mt-3 text-sm text-slate-500">Versao de 13 de marco de 2026.</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Objeto</h2>
            <p>O NutriEval oferece software para gestao de pacientes, avaliacoes antropometricas e compartilhamento de resultados entre nutricionistas e pacientes.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Responsabilidades do profissional</h2>
            <p>O nutricionista e responsavel pela veracidade dos dados inseridos, pela base legal aplicavel ao atendimento e pelo uso clinico adequado das informacoes registradas na plataforma.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Acesso do paciente</h2>
            <p>O paciente acessa apenas os dados vinculados a sua propria conta e ao convite emitido pelo nutricionista responsavel.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Uso permitido</h2>
            <p>E proibido utilizar a plataforma para fins ilicitos, compartilhamento indevido de credenciais ou tratamento de dados sem autorizacao adequada.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Privacidade e dados</h2>
            <p>O tratamento de dados pessoais segue a Politica de Privacidade da plataforma e a legislacao aplicavel, incluindo a LGPD.</p>
          </section>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-medium text-[color:var(--accent)] hover:underline">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
