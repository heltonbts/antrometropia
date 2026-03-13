"use client"

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface Props {
  tricipital?: number | null
  subescapular?: number | null
  suprailíaca?: number | null
  abdominal?: number | null
  coxa?: number | null
  panturrilha?: number | null
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="font-semibold text-slate-800">{payload[0].payload.dobra}</p>
        <p className="text-slate-500">{payload[0].value?.toFixed(1)} mm</p>
      </div>
    )
  }
  return null
}

export function GraficoRadarDobras({
  tricipital,
  subescapular,
  suprailíaca,
  abdominal,
  coxa,
  panturrilha,
}: Props) {
  const dados = [
    { dobra: "Tricipital", valor: tricipital ?? 0 },
    { dobra: "Subescapular", valor: subescapular ?? 0 },
    { dobra: "Suprailíaca", valor: suprailíaca ?? 0 },
    { dobra: "Abdominal", valor: abdominal ?? 0 },
    { dobra: "Coxa", valor: coxa ?? 0 },
    { dobra: "Panturrilha", valor: panturrilha ?? 0 },
  ]

  const temDados = dados.some((d) => d.valor > 0)
  if (!temDados) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
        Sem dobras registradas
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={dados} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#f1f5f9" />
        <PolarAngleAxis
          dataKey="dobra"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
        />
        <Radar
          name="Dobras"
          dataKey="valor"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ fill: "#06b6d4", r: 3 }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
