import Link from "next/link"
import { redirect } from "next/navigation"
import { ContaActions } from "@/components/account/ContaActions"
import { getSessionUsuario } from "@/lib/session"

export default async function ContaPage() {
  const session = await getSessionUsuario()

  if (!session) {
    redirect("/login")
  }

  return (
    <main className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="glass-panel-strong mx-auto max-w-5xl rounded-[32px] p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow">Conta</div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-slate-900">Privacidade e seguranca</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Controles de exportacao, exclusao e informacoes legais da sua conta no NutriEval.
            </p>
          </div>
          <Link
            href={session.tipo === "nutricionista" ? "/dashboard" : "/painel"}
            className="text-sm font-medium text-[color:var(--accent)] hover:underline"
          >
            Voltar
          </Link>
        </div>

        <div className="mt-8">
          <ContaActions tipo={session.tipo} />
        </div>
      </div>
    </main>
  )
}
