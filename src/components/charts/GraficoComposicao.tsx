"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface Props {
  massaGorda: number
  massaMagra: number // Fat-Free Mass (FFM)
  massaOssea?: number | null
  massaMuscular?: number | null
  peso: number
}

const CORES = ["#f472b6", "#10b981", "#6366f1", "#94a3b8"]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0]
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{item.name}</p>
        <p className="text-slate-500">
          {item.value.toFixed(1)} kg{" "}
          <span className="text-slate-400">
            ({((item.value / item.payload.total) * 100).toFixed(1)}%)
          </span>
        </p>
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  )
}

export function GraficoComposicao({ massaGorda, massaMagra, massaOssea, massaMuscular, peso }: Props) {
  const ossea = massaOssea ?? 0
  const muscular = massaMuscular ?? 0
  
  // No modelo de 4 componentes: Peso = Gordura + Músculo + Osso + Residual
  // Aqui temos:
  // - Massa Gorda
  // - Massa Muscular (estimada por Lee)
  // - Massa Óssea (estimada por Von Dobeln)
  // - Residual (o que sobrar para fechar o peso)
  
  const residual = Math.max(0, peso - massaGorda - muscular - ossea)

  const dados = [
    { name: "Massa Gorda", valor: massaGorda, total: peso },
    { name: "Massa Muscular", valor: muscular, total: peso },
    ...(ossea > 0 ? [{ name: "Massa Óssea", valor: ossea, total: peso }] : []),
    ...(residual > 0 ? [{ name: "Massa Residual", valor: residual, total: peso }] : []),
  ]

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart margin={{ top: 0, right: 0, bottom: 10, left: 0 }}>
        <Pie
          data={dados}
          dataKey="valor"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={50}
          labelLine={false}
          label={CustomLabel}
          strokeWidth={2}
          stroke="#fff"
        >
          {dados.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ paddingTop: 16 }}
          formatter={(v) => <span className="text-xs text-slate-600">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
