import clsx from 'clsx'
import type { Recommendation } from '../types'
import { AlertTriangle, TrendingUp, TrendingDown, Minus, ChevronUp, ChevronDown } from 'lucide-react'

const ACTION_CONFIG: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  '强烈买入': { color: '#E84040', bg: 'bg-red-50', icon: <ChevronUp size={18} />, label: '强烈买入' },
  '适量买入': { color: '#FF8A65', bg: 'bg-orange-50', icon: <TrendingUp size={18} />, label: '适量买入' },
  '继续持有': { color: '#8B8FA8', bg: 'bg-gray-50', icon: <Minus size={18} />, label: '继续持有' },
  '适量减持': { color: '#66BB6A', bg: 'bg-emerald-50', icon: <TrendingDown size={18} />, label: '适量减持' },
  '及时卖出': { color: '#2BAE8E', bg: 'bg-teal-50', icon: <ChevronDown size={18} />, label: '及时卖出' },
}

interface Props {
  rec: Recommendation
}

export default function RecommendCard({ rec }: Props) {
  const cfg = ACTION_CONFIG[rec.action] ?? ACTION_CONFIG['继续持有']
  const confidenceMap: Record<string, number> = { '高': 3, '中': 2, '低': 1 }
  const confLevel = confidenceMap[rec.confidence] ?? 2

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm">AI 操作建议</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">置信度</span>
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={clsx('w-2 h-2 rounded-full', i <= confLevel ? 'opacity-100' : 'opacity-20')}
              style={{ backgroundColor: cfg.color }}
            />
          ))}
        </div>
      </div>

      {/* Action badge */}
      <div className={clsx('flex items-center gap-2 rounded-2xl p-4', cfg.bg)}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm" style={{ color: cfg.color }}>
          {cfg.icon}
        </div>
        <div>
          <div className="text-xs text-gray-400">建议操作</div>
          <div className="text-xl font-bold" style={{ color: cfg.color }}>{rec.action}</div>
        </div>
      </div>

      {/* Reason */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-500">分析理由</div>
        <p className="text-sm text-gray-700 leading-relaxed">{rec.reason}</p>
      </div>

      {/* Risk */}
      <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">{rec.risk}</p>
      </div>
    </div>
  )
}
