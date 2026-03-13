"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface Ponto {
  data: string
  valor: number | null
}

interface Props {
  dados: Ponto[]
  cor?: string
  unidade?: string
  refMin?: number
  refMax?: number
  refLabel?: string
  altura?: number
}

const CustomTooltip = ({ active, payload, label, unidade }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-slate-900">
          {payload[0].value?.toFixed(1)}{" "}
          <span className="font-normal text-slate-400">{unidade}</span>
        </p>
      </div>
    )
  }
  return null
}

export function GraficoLinha({
  dados,
  cor = "#06B6D4",
  unidade = "",
  refMin,
  refMax,
  altura = 220,
}: Props) {
  const filtrados = dados.filter((d) => d.valor !== null)

  if (filtrados.length === 0) {
    return (
      <div
        style={{ height: altura }}
        className="flex items-center justify-center text-slate-300 text-sm"
      >
        Sem dados suficientes
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <LineChart data={filtrados} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${cor.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cor} stopOpacity={0.15} />
            <stop offset="100%" stopColor={cor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="data"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip unidade={unidade} />} />
        {refMin !== undefined && (
          <ReferenceLine y={refMin} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
        )}
        {refMax !== undefined && (
          <ReferenceLine y={refMax} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
        )}
        <Line
          type="monotone"
          dataKey="valor"
          stroke={cor}
          strokeWidth={2.5}
          dot={{ fill: cor, r: 4, strokeWidth: 2, stroke: "#fff" }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
