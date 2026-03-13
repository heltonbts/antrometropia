"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface Ponto {
  data: string
  massaGorda: number | null
  massaMagra: number | null
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm space-y-1">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}:</span>
            <span className="font-bold text-slate-900">{p.value?.toFixed(1)} kg</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function GraficoAreaEmpilhada({ dados }: { dados: Ponto[] }) {
  const filtrados = dados.filter((d) => d.massaGorda !== null && d.massaMagra !== null)

  if (filtrados.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-300 text-sm">
        Sem dados suficientes
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={filtrados} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradGorda" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#f472b6" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gradMagra" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="data" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
        />
        <Area
          type="monotone"
          dataKey="massaGorda"
          name="Massa Gorda"
          stroke="#f472b6"
          strokeWidth={2}
          fill="url(#gradGorda)"
          dot={{ fill: "#f472b6", r: 3, strokeWidth: 2, stroke: "#fff" }}
        />
        <Area
          type="monotone"
          dataKey="massaMagra"
          name="Massa Magra"
          stroke="#06b6d4"
          strokeWidth={2}
          fill="url(#gradMagra)"
          dot={{ fill: "#06b6d4", r: 3, strokeWidth: 2, stroke: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
