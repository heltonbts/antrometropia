"use client"

export function ContaActions({ tipo }: { tipo: "nutricionista" | "paciente" }) {
  async function excluirConta() {
    const confirmar = window.confirm("Esta acao e permanente. Deseja excluir sua conta agora?")
    if (!confirmar) return

    const res = await fetch("/api/lgpd/delete", { method: "DELETE" })
    if (!res.ok) {
      alert("Nao foi possivel excluir a conta.")
      return
    }

    window.location.href = "/login"
  }

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-[28px] p-6">
        <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400">LGPD</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Privacidade e dados</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Exporte seus dados em JSON ou solicite a exclusao definitiva da conta. A exclusao remove os registros vinculados a este acesso.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-slate-400">Exportacao</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Baixar meus dados</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Gera um arquivo JSON com os dados da conta, historico e registros relacionados ao seu perfil.
          </p>
          <button
            onClick={() => {
              window.location.href = "/api/lgpd/export"
            }}
            className="mt-5 px-5 py-2.5 bg-[linear-gradient(135deg,#06b6d4,#2563eb)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(6,182,212,0.28)]"
          >
            Exportar dados
          </button>
        </div>

        <div className="glass-panel rounded-[28px] p-6 border border-[rgba(201,109,66,0.18)]">
          <p className="font-mono-ui text-[11px] uppercase tracking-[0.22em] text-[#c96d42]">Exclusao</p>
          <h3 className="mt-3 text-lg font-semibold text-slate-900">Excluir minha conta</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {tipo === "nutricionista"
              ? "Esta acao remove sua conta, seus pacientes, avaliacoes e resultados vinculados."
              : "Esta acao remove sua conta de paciente e todo o historico vinculado ao seu acesso."}
          </p>
          <button
            onClick={excluirConta}
            className="mt-5 px-5 py-2.5 bg-[linear-gradient(135deg,#c96d42,#d88c5b)] text-white text-sm font-semibold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_14px_34px_rgba(201,109,66,0.28)]"
          >
            Excluir conta
          </button>
        </div>
      </div>
    </div>
  )
}
