"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Dot,
} from "recharts"

interface AvaliacaoComDobras {
  data: string
  tricipital?: number | null
  subescapular?: number | null
  supraespinal?: number | null
  abdominal?: number | null
  coxa?: number | null
  panturrilha?: number | null
}

interface Props {
  avaliacoes: AvaliacaoComDobras[]
}

const DOBRAS = [
  { key: "tricipital",   nome: "Tricipital",   cor: "#1f8a70" },
  { key: "subescapular", nome: "Subescap.",     cor: "#264653" },
  { key: "supraespinal", nome: "Supraespinal",  cor: "#c96d42" },
  { key: "abdominal",    nome: "Abdominal",     cor: "#f472b6" },
  { key: "coxa",         nome: "Coxa",          cor: "#f59e0b" },
  { key: "panturrilha",  nome: "Panturrilha",   cor: "#10b981" },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm min-w-[150px]">
        <p className="text-slate-400 text-xs mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-semibold" style={{ color: p.stroke }}>
            {p.name}:{" "}
            <span className="text-slate-800">{p.value?.toFixed(1)}</span>{" "}
            <span className="font-normal text-slate-400">mm</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

function Delta({ atual, anterior }: { atual: number | null | undefined; anterior: number | null | undefined }) {
  if (atual == null || anterior == null || atual === 0 || anterior === 0) return null
  const diff = atual - anterior
  if (Math.abs(diff) < 0.1) {
    return <span className="text-[10px] font-mono font-bold text-slate-400">= 0</span>
  }
  const up = diff > 0
  return (
    <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${up ? "text-rose-500" : "text-emerald-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(diff).toFixed(1)}
    </span>
  )
}

export function GraficoComparacaoDobras({ avaliacoes }: Props) {
  if (avaliacoes.length < 2) return null

  // X = avaliações, cada linha = uma dobra
  const dados = avaliacoes.map((a) => {
    const row: Record<string, any> = { data: a.data }
    DOBRAS.forEach((d) => {
      const val = (a as any)[d.key]
      row[d.key] = val != null && val > 0 ? val : null
    })
    return row
  })

  // Quais dobras têm ao menos 1 valor?
  const dobrasAtivas = DOBRAS.filter((d) =>
    avaliacoes.some((a) => {
      const v = (a as any)[d.key]
      return v != null && v > 0
    })
  )

  const ultima    = avaliacoes[avaliacoes.length - 1]
  const penultima = avaliacoes[avaliacoes.length - 2]

  return (
    <div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={dados} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="data"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            width={30}
            unit=" mm"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8", paddingTop: "8px" }} />
          {dobrasAtivas.map((d) => (
            <Line
              key={d.key}
              type="monotone"
              dataKey={d.key}
              name={d.nome}
              stroke={d.cor}
              strokeWidth={2}
              dot={{ r: 4, fill: d.cor, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Indicadores de variação dobra por dobra */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {dobrasAtivas.map((d) => {
          const atual = (ultima as any)[d.key]
          const ant   = (penultima as any)[d.key]
          return (
            <div key={d.key} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-1.5">
              <span className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <span style={{ color: d.cor }}>●</span> {d.nome}
              </span>
              <Delta atual={atual} anterior={ant} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
