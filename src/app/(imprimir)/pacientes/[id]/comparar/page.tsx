import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatarNumero, calcularIdade, formatarSexo } from "@/lib/utils"
import { PrintTrigger } from "./PrintTrigger"

function delta(atual: number | null | undefined, anterior: number | null | undefined) {
  if (atual == null || anterior == null) return null
  const diff = atual - anterior
  return { diff: Math.abs(diff).toFixed(2), positivo: diff >= 0 }
}

export default async function CompararAvaliacoesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ a1?: string; a2?: string }>
}) {
  const { id } = await params
  const { a1, a2 } = await searchParams

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      avaliacoes: {
        include: { resultado: true },
        orderBy: { dataAvaliacao: "asc" },
      },
    },
  })

  if (!paciente || paciente.avaliacoes.length < 2) return notFound()

  const avals = paciente.avaliacoes
  // Usa query params ou pega as 2 últimas
  const av1 = a1 ? avals.find((a) => a.id === a1) : avals[avals.length - 2]
  const av2 = a2 ? avals.find((a) => a.id === a2) : avals[avals.length - 1]

  if (!av1 || !av2) return notFound()

  const p = paciente
  const idade = calcularIdade(p.dataNascimento)
  const fmt = (d: Date | string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

  const formula1 = av1.resultado?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"
  const formula2 = av2.resultado?.formulaReferencia === "faulkner" ? "Faulkner" : "Petroski"

  const linhas = [
    { label: "Peso (kg)", v1: av1.peso, v2: av2.peso, inv: false },
    { label: "IMC (kg/m²)", v1: av1.resultado?.imc, v2: av2.resultado?.imc, badge1: av1.resultado?.classificacaoImc, badge2: av2.resultado?.classificacaoImc, inv: false },
    { label: `% Gordura (${formula2})`, v1: formula1 === "Faulkner" ? av1.resultado?.percGorduraFaulkner : av1.resultado?.percGorduraPetroski, v2: formula2 === "Faulkner" ? av2.resultado?.percGorduraFaulkner : av2.resultado?.percGorduraPetroski, inv: true },
    { label: "Massa Gorda (kg)", v1: av1.resultado?.massaGorda, v2: av2.resultado?.massaGorda, inv: true },
    { label: "Massa Magra (kg)", v1: av1.resultado?.massaMagra, v2: av2.resultado?.massaMagra, inv: false },
    { label: "Massa Muscular SMM (kg)", v1: av1.resultado?.massaMuscular, v2: av2.resultado?.massaMuscular, inv: false },
    { label: "Massa Óssea (kg)", v1: av1.resultado?.massaOssea, v2: av2.resultado?.massaOssea, inv: false },
    { label: "RCQ", v1: av1.resultado?.rcq, v2: av2.resultado?.rcq, badge1: av1.resultado?.classificacaoRcq, badge2: av2.resultado?.classificacaoRcq, inv: true },
    { label: "CMB (cm)", v1: av1.resultado?.cmb, v2: av2.resultado?.cmb, inv: false },
    { label: "Soma 6 Dobras (mm)", v1: av1.resultado?.soma6Dobras, v2: av2.resultado?.soma6Dobras, badge1: av1.resultado?.classificacao6Dobras, badge2: av2.resultado?.classificacao6Dobras, inv: true },
    { label: "Soma Todas as Dobras (mm)", v1: av1.resultado?.somaTodasDobras, v2: av2.resultado?.somaTodasDobras, inv: true },
  ] as { label: string; v1?: number | null; v2?: number | null; badge1?: string | null; badge2?: string | null; inv: boolean }[]

  const somato1 = av1.resultado
  const somato2 = av2.resultado

  return (
    <>
      <PrintTrigger />

      <div className="max-w-3xl mx-auto px-8 py-10 print:px-6 print:py-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[#1f8a70] flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Nutrieval</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Comparação de Avaliações</h1>
            <p className="text-slate-500 text-sm mt-1">{fmt(av1.dataAvaliacao)} → {fmt(av2.dataAvaliacao)}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="font-semibold text-slate-800">{p.nome}</p>
            <p>{idade} anos · {formatarSexo(p.sexo)}</p>
          </div>
        </div>

        {/* Tabela de comparação */}
        <section className="mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 text-xs font-mono uppercase tracking-wider text-slate-400 w-[44%]">Indicador</th>
                <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500 w-[22%]">{fmt(av1.dataAvaliacao)}</th>
                <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500 w-[22%]">{fmt(av2.dataAvaliacao)}</th>
                <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-400 w-[12%]">Δ</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ label, v1, v2, badge1, badge2, inv }) => {
                if (v1 == null && v2 == null) return null
                const d = delta(v2, v1)
                // melhora: se inv=true (menor = melhor) e diff negativo, ou se inv=false e diff positivo
                const melhora = d ? (inv ? !d.positivo : d.positivo) : null
                return (
                  <tr key={label} className="border-b border-slate-100">
                    <td className="py-2 text-slate-600">{label}</td>
                    <td className="py-2 text-center font-semibold text-slate-700">
                      {v1 != null ? formatarNumero(v1, 2) : "—"}
                      {badge1 && <span className="block text-[10px] text-slate-400">{badge1}</span>}
                    </td>
                    <td className="py-2 text-center font-bold text-slate-900">
                      {v2 != null ? formatarNumero(v2, 2) : "—"}
                      {badge2 && <span className="block text-[10px] text-slate-400">{badge2}</span>}
                    </td>
                    <td className="py-2 text-center text-xs font-semibold">
                      {d && (
                        <span className={melhora ? "text-emerald-600" : "text-rose-500"}>
                          {d.positivo ? "+" : "−"}{d.diff}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="text-[10px] text-slate-400 mt-2">
            Δ verde = melhora · Δ vermelho = piora (considerando o objetivo de redução de gordura)
          </p>
        </section>

        {/* Circunferências */}
        {(av1.circCintura != null || av2.circCintura != null || av1.circQuadril != null || av2.circQuadril != null) && (
          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Circunferências</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2 text-xs font-mono uppercase tracking-wider text-slate-400 w-[44%]">Medida</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500 w-[22%]">{fmt(av1.dataAvaliacao)}</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500 w-[22%]">{fmt(av2.dataAvaliacao)}</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-400 w-[12%]">Δ</th>
                </tr>
              </thead>
              <tbody>
                {([
                  { label: "Cintura (cm)", v1: av1.circCintura, v2: av2.circCintura, inv: true },
                  { label: "Quadril (cm)", v1: av1.circQuadril, v2: av2.circQuadril, inv: false },
                  { label: "Braço Relaxado (cm)", v1: av1.circBracoRelaxado, v2: av2.circBracoRelaxado, inv: false },
                  { label: "Braço Contraído (cm)", v1: av1.circBracoContraido, v2: av2.circBracoContraido, inv: false },
                  { label: "Panturrilha (cm)", v1: av1.circPanturrilha, v2: av2.circPanturrilha, inv: false },
                  { label: "Coxa Média (cm)", v1: av1.circCoxaMedia, v2: av2.circCoxaMedia, inv: false },
                  { label: "Abdômen (cm)", v1: av1.circAbdomen, v2: av2.circAbdomen, inv: true },
                ] as { label: string; v1: number | null | undefined; v2: number | null | undefined; inv: boolean }[])
                  .filter(({ v1, v2 }) => v1 != null || v2 != null)
                  .map(({ label, v1, v2, inv }) => {
                    const d = delta(v2, v1)
                    const melhora = d ? (inv ? !d.positivo : d.positivo) : null
                    return (
                      <tr key={label} className="border-b border-slate-100">
                        <td className="py-2 text-slate-600">{label}</td>
                        <td className="py-2 text-center font-semibold text-slate-700">{v1 != null ? formatarNumero(v1, 1) : "—"}</td>
                        <td className="py-2 text-center font-bold text-slate-900">{v2 != null ? formatarNumero(v2, 1) : "—"}</td>
                        <td className="py-2 text-center text-xs font-semibold">
                          {d && <span className={melhora ? "text-emerald-600" : "text-rose-500"}>{d.positivo ? "+" : "−"}{d.diff}</span>}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </section>
        )}

        {/* Somatotipo comparado */}
        {somato1?.endomorfia != null && somato2?.endomorfia != null && (
          <section className="mb-8">
            <h2 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3">Somatotipo — Heath-Carter</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-2 text-xs font-mono uppercase tracking-wider text-slate-400">Componente</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500">{fmt(av1.dataAvaliacao)}</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-500">{fmt(av2.dataAvaliacao)}</th>
                  <th className="text-center py-2 text-xs font-mono uppercase tracking-wider text-slate-400">Δ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Endomorfia (Adiposidade)", v1: somato1.endomorfia, v2: somato2.endomorfia, inv: true },
                  { label: "Mesomorfia (Muscularidade)", v1: somato1.mesomorfia, v2: somato2.mesomorfia, inv: false },
                  { label: "Ectomorfia (Linearidade)", v1: somato1.ectomorfia, v2: somato2.ectomorfia, inv: false },
                ].map(({ label, v1, v2, inv }) => {
                  const d = delta(v2, v1)
                  const melhora = d ? (inv ? !d.positivo : d.positivo) : null
                  return (
                    <tr key={label} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">{label}</td>
                      <td className="py-2 text-center font-semibold text-slate-700">{formatarNumero(v1, 2)}</td>
                      <td className="py-2 text-center font-bold text-slate-900">{formatarNumero(v2, 2)}</td>
                      <td className="py-2 text-center text-xs font-semibold">
                        {d && <span className={melhora ? "text-emerald-600" : "text-rose-500"}>{d.positivo ? "+" : "−"}{d.diff}</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {(somato1.biotipo || somato2.biotipo) && (
              <p className="text-sm text-slate-600 mt-2">
                Biotipo: <span className="font-semibold">{somato1.biotipo ?? "—"}</span> → <span className="font-semibold">{somato2.biotipo ?? "—"}</span>
              </p>
            )}
          </section>
        )}

        {/* Rodapé */}
        <footer className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
          <span>Nutrieval · nutrieval.com.br</span>
          <span>Impresso em {new Date().toLocaleDateString("pt-BR")}</span>
        </footer>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 1.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </>
  )
}
