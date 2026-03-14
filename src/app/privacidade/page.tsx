import Link from "next/link"

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen hero-grid px-4 py-6 md:px-6">
      <div className="glass-panel-strong mx-auto max-w-4xl rounded-[32px] p-8 md:p-10">
        <div className="eyebrow">Legal</div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Politica de Privacidade</h1>
        <p className="mt-3 text-sm text-slate-500">Versao de 13 de marco de 2026.</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">1. Dados coletados</h2>
            <p>Coletamos dados cadastrais, dados de autenticacao e, quando aplicavel, dados de saude inseridos durante o acompanhamento nutricional.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">2. Finalidade</h2>
            <p>Os dados sao tratados para permitir o uso da plataforma, registrar avaliacoes, exibir historico clinico e manter a relacao entre nutricionista e paciente.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">3. Dados sensiveis</h2>
            <p>Dados de saude do paciente sao tratados mediante consentimento especifico no primeiro acesso e dentro das finalidades de acompanhamento nutricional.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">4. Compartilhamento e seguranca</h2>
            <p>Os dados sao acessados apenas por usuarios autorizados dentro da plataforma e devem ser protegidos com controles tecnicos e administrativos adequados.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-slate-900">5. Direitos do titular</h2>
            <p>O titular pode solicitar confirmacao de tratamento, acesso, correcao, exportacao e exclusao de dados, observadas as obrigacoes legais de guarda.</p>
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
