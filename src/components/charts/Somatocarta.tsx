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
  Customized,
} from "recharts"

interface Ponto {
  data: string
  x: number
  y: number
}

const PALETA = [
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#f472b6", // pink
  "#1f8a70", // green
  "#6366f1", // indigo
  "#c96d42", // orange
  "#a78bfa", // violet
  "#10b981", // emerald
]

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

function makeShape(index: number, total: number) {
  const cor = PALETA[index % PALETA.length]
  const isUltimo = index === total - 1

  return (props: any) => {
    const { cx, cy } = props
    return (
      <g>
        {isUltimo && (
          <circle cx={cx} cy={cy} r={14} fill={cor} fillOpacity={0.15} />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isUltimo ? 8 : 6}
          fill={cor}
          stroke="#fff"
          strokeWidth={2}
        />
        <text
          x={cx}
          y={cy + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={isUltimo ? 9 : 8}
          fontWeight="bold"
          fill="#fff"
        >
          {index + 1}
        </text>
      </g>
    )
  }
}

function TrajetoriaCustomized({ pontos, ...props }: any) {
  const xAxisMap = props.xAxisMap
  const yAxisMap = props.yAxisMap
  if (!xAxisMap || !yAxisMap || pontos.length < 2) return null

  const xScale = (Object.values(xAxisMap)[0] as any)?.scale
  const yScale = (Object.values(yAxisMap)[0] as any)?.scale
  if (!xScale || !yScale) return null

  return (
    <g>
      {pontos.slice(0, -1).map((p: Ponto, i: number) => {
        const x1 = xScale(p.x)
        const y1 = yScale(p.y)
        const x2 = xScale(pontos[i + 1].x)
        const y2 = yScale(pontos[i + 1].y)
        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={PALETA[i % PALETA.length]}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            strokeOpacity={0.55}
          />
        )
      })}
    </g>
  )
}

export function Somatocarta({ pontos }: { pontos: Ponto[] }) {
  if (pontos.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-300 text-sm">
        Sem dados de somatotipo
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
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

          {/* Linha de trajetória usando escalas reais do gráfico */}
          {pontos.length > 1 && (
            <Customized component={(props: any) => (
              <TrajetoriaCustomized pontos={pontos} {...props} />
            )} />
          )}

          {/* Um Scatter por ponto — cor e forma individuais */}
          {pontos.map((p, i) => (
            <Scatter
              key={i}
              data={[{ x: p.x, y: p.y, data: p.data }]}
              fill={PALETA[i % PALETA.length]}
              line={false}
              shape={makeShape(i, pontos.length)}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legenda */}
      {pontos.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {pontos.map((p, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: PALETA[i % PALETA.length], fontSize: 8 }}
              >
                {i + 1}
              </span>
              {p.data}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
