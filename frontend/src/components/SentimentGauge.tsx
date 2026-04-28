import type { Sentiment } from '../types'

interface Props {
  sentiment: Sentiment
}

export default function SentimentGauge({ sentiment }: Props) {
  const score = sentiment.score
  const angle = (score / 100) * 180 - 90 // -90 to 90 degrees

  const getColor = (score: number) => {
    if (score >= 70) return '#E84040'
    if (score >= 55) return '#FF8A65'
    if (score >= 45) return '#8B8FA8'
    if (score >= 30) return '#66BB6A'
    return '#2BAE8E'
  }

  const color = getColor(score)

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">市场舆情</h3>

      {/* Gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-40 h-20 overflow-hidden">
          <svg viewBox="0 0 160 80" className="w-full h-full">
            {/* Background arc */}
            <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="#F3F4F6" strokeWidth="14" strokeLinecap="round" />
            {/* Colored arc based on score */}
            <path
              d="M 10 80 A 70 70 0 0 1 150 80"
              fill="none"
              stroke={color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 220} 220`}
              opacity="0.3"
            />
            {/* Needle */}
            <g transform={`translate(80, 80) rotate(${angle})`}>
              <line x1="0" y1="0" x2="0" y2="-58" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill={color} />
            </g>
          </svg>
        </div>
        <div className="text-center -mt-2">
          <div className="text-2xl font-bold num" style={{ color }}>{score}</div>
          <div className="text-sm font-medium mt-0.5" style={{ color }}>{sentiment.label}</div>
        </div>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between text-[10px] text-gray-400 mb-4 px-2">
        <span>非常消极</span>
        <span>中性</span>
        <span>非常积极</span>
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3 mb-3">
        {sentiment.summary}
      </p>

      {/* Positive / Negative signals */}
      {sentiment.positive.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-medium text-up mb-1.5">✦ 正面信号</div>
          <div className="space-y-1">
            {sentiment.positive.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="text-up mt-0.5 shrink-0">+</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {sentiment.negative.length > 0 && (
        <div>
          <div className="text-xs font-medium text-down mb-1.5">✦ 负面信号</div>
          <div className="space-y-1">
            {sentiment.negative.map((item, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                <span className="text-down mt-0.5 shrink-0">-</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
