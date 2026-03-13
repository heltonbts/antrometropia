"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Dobra {
  nome: string
  valor: number
  cor: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-slate-900">
          {payload[0].value?.toFixed(1)}{" "}
          <span className="font-normal text-slate-400">mm</span>
        </p>
      </div>
    )
  }
  return null
}

export function GraficoBarrasAgrupadas({ dobras }: { dobras: Dobra[] }) {
  const filtradas = dobras.filter((d) => d.valor > 0)

  if (filtradas.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
        Sem dobras registradas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={filtradas} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="nome"
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={48}>
          {filtradas.map((d, i) => (
            <Cell key={i} fill={d.cor} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
