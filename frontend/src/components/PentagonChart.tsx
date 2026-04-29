import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

interface Props {
  industry: number
  business: number
  market: number
  sentiment: number
  environment: number
}

export default function PentagonChart({ industry, business, market, sentiment, environment }: Props) {
  const data = [
    { dim: '行业', score: industry, full: 100 },
    { dim: '经营', score: business, full: 100 },
    { dim: '行情', score: market, full: 100 },
    { dim: '舆情', score: sentiment, full: 100 },
    { dim: '环境', score: environment, full: 100 },
  ]

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#E5E7EB" />
          <PolarAngleAxis
            dataKey="dim"
            tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
          />
          <Radar
            name="评分"
            dataKey="score"
            stroke="#FF6B8A"
            fill="#FF6B8A"
            fillOpacity={0.45}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
