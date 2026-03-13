"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts"

interface Ponto {
  data: string
  x: number
  y: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0]?.payload
    return (
      <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-4 py-3 text-sm">
        <p className="text-slate-400 text-xs mb-1">{d?.data}</p>
        <p className="text-slate-600">X: <span className="font-bold text-slate-900">{d?.x?.toFixed(2)}</span></p>
        <p className="text-slate-600">Y: <span className="font-bold text-slate-900">{d?.y?.toFixed(2)}</span></p>
      </div>
    )
  }
  return null
}

export function Somatocarta({ pontos }: { pontos: Ponto[] }) {
  if (pontos.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-300 text-sm">
        Sem dados de somatotipo
      </div>
    )
  }

  // Cria linha de trajetória entre pontos
  const linha = pontos.map((p) => ({ x: p.x, y: p.y }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          type="number"
          dataKey="x"
          domain={[-8, 8]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        >
          <Label
            value="← Endomorfo | Ectomorfo →"
            position="insideBottom"
            offset={-10}
            style={{ fontSize: 10, fill: "#cbd5e1" }}
          />
        </XAxis>
        <YAxis
          type="number"
          dataKey="y"
          domain={[-8, 8]}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
        >
          <Label
            value="Mesomorfo ↑"
            position="insideLeft"
            angle={-90}
            offset={10}
            style={{ fontSize: 10, fill: "#cbd5e1" }}
          />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="#e2e8f0" strokeWidth={1.5} />
        <ReferenceLine y={0} stroke="#e2e8f0" strokeWidth={1.5} />

        {/* Trajetória — pontos anteriores em cinza */}
        {pontos.length > 1 && (
          <Scatter
            data={pontos.slice(0, -1).map((p) => ({ x: p.x, y: p.y, data: p.data }))}
            fill="#cbd5e1"
            line={{ stroke: "#e2e8f0", strokeWidth: 1.5, strokeDasharray: "4 4" }}
          />
        )}

        {/* Ponto atual em destaque */}
        <Scatter
          data={[pontos[pontos.length - 1]]}
          fill="#06b6d4"
          line={false}
          shape={(props: any) => {
            const { cx, cy } = props
            return (
              <g>
                <circle cx={cx} cy={cy} r={10} fill="#06b6d4" fillOpacity={0.2} />
                <circle cx={cx} cy={cy} r={6} fill="#06b6d4" stroke="#fff" strokeWidth={2} />
              </g>
            )
          }}
        />
      </ScatterChart>
    </ResponsiveContainer>
  )
}
