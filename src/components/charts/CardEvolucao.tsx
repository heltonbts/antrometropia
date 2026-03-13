"use client"

import { GraficoLinha } from "./GraficoLinha"
import { cn } from "@/lib/utils"

interface Props {
  titulo: string
  valorAtual: number | null
  valorAnterior?: number | null
  unidade?: string
  dados: { data: string; valor: number | null }[]
  cor?: string
  refMin?: number
  refMax?: number
  classificacao?: string | null
  corClass?: string
}

export function CardEvolucao({
  titulo,
  valorAtual,
  valorAnterior,
  unidade = "",
  dados,
  cor = "#06B6D4",
  refMin,
  refMax,
  classificacao,
  corClass,
}: Props) {
  const diff =
    valorAtual !== null && valorAnterior !== null && valorAnterior !== undefined
      ? valorAtual - valorAnterior
      : null

  const subiu = diff !== null && diff > 0
  const desceu = diff !== null && diff < 0

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{titulo}</p>
          <div className="flex items-end gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">
              {valorAtual !== null && valorAtual !== undefined
                ? valorAtual.toFixed(1)
                : "—"}
            </span>
            {unidade && (
              <span className="text-sm text-slate-400 mb-1">{unidade}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {diff !== null && (
            <span
              className={cn(
                "text-xs font-semibold px-2 py-1 rounded-full",
                subiu ? "bg-rose-50 text-rose-500" : desceu ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
              )}
            >
              {subiu ? "▲" : desceu ? "▼" : "="} {Math.abs(diff).toFixed(1)}
            </span>
          )}
          {classificacao && (
            <span className={cn("text-xs font-medium", corClass || "text-slate-500")}>
              {classificacao}
            </span>
          )}
        </div>
      </div>

      <GraficoLinha
        dados={dados}
        cor={cor}
        unidade={unidade}
        refMin={refMin}
        refMax={refMax}
        altura={160}
      />
    </div>
  )
}
