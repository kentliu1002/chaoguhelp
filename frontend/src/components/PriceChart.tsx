import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { HistoryPoint } from '../types'

interface Props {
  data: HistoryPoint[]
  height?: number
  compact?: boolean
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as HistoryPoint
  const isUp = d.change_pct >= 0
  return (
    <div className="bg-white rounded-xl shadow-card-hover px-3 py-2 text-xs border border-gray-100">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className={`font-bold text-base num ${isUp ? 'text-up' : 'text-down'}`}>{d.close.toFixed(2)}</div>
      <div className={`num ${isUp ? 'text-up' : 'text-down'}`}>{isUp ? '+' : ''}{d.change_pct.toFixed(2)}%</div>
    </div>
  )
}

export default function PriceChart({ data, height = 160, compact = false }: Props) {
  const { color, gradientId, basePrice } = useMemo(() => {
    if (!data.length) return { color: '#8B8FA8', gradientId: 'g1', basePrice: 0 }
    const first = data[0].close
    const last = data[data.length - 1].close
    const isUp = last >= first
    return {
      color: isUp ? '#E84040' : '#2BAE8E',
      gradientId: isUp ? 'gradUp' : 'gradDown',
      basePrice: first,
    }
  }, [data])

  const formatted = data.map(d => ({
    ...d,
    date: d.date.slice(5), // MM-DD
  }))

  const prices = data.map(d => d.close)
  const minPrice = Math.min(...prices) * 0.998
  const maxPrice = Math.max(...prices) * 1.002

  if (!data.length) {
    return (
      <div className="flex items-center justify-center text-gray-300 text-sm" style={{ height }}>
        暂无数据
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E84040" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#E84040" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2BAE8E" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2BAE8E" stopOpacity={0} />
          </linearGradient>
        </defs>
        {!compact && (
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
        )}
        {!compact && (
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={v => v.toFixed(1)}
          />
        )}
        {!compact && <Tooltip content={<CustomTooltip />} />}
        <ReferenceLine y={basePrice} stroke="#E5E7EB" strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
