import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { getWatchlist, getPortfolio } from '../services/api'
import { SkeletonCard } from '../components/LoadingSpinner'
import clsx from 'clsx'
import dayjs from 'dayjs'

function StatBadge({ label, value, isUp }: { label: string; value: string; isUp?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={clsx('text-lg font-bold num', isUp === undefined ? 'text-gray-700' : isUp ? 'text-up' : 'text-down')}>
        {value}
      </span>
      <span className="text-xs text-gray-400 mt-0.5">{label}</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { data: watchlist = [], isLoading: wLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
    refetchInterval: 60_000,
  })
  const { data: portfolio, isLoading: pLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    refetchInterval: 60_000,
  })

  const summary = portfolio?.summary
  const positions = portfolio?.positions ?? []
  const totalProfit = summary?.total_profit ?? 0
  const totalProfitPct = summary?.total_profit_pct ?? 0
  const isProfitable = totalProfit >= 0

  const hour = dayjs().hour()
  const greeting = hour < 12 ? '早安' : hour < 18 ? '下午好' : '晚上好'

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-600 px-5 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-10 -translate-x-10" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-white/70 text-sm">{greeting}，投资者 👋</div>
              <div className="text-white font-bold text-xl mt-0.5">炒股助手</div>
            </div>
            <button className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <Bell size={18} className="text-white" />
            </button>
          </div>

          {/* Portfolio Summary Card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-white/70 text-xs mb-1">持仓总市值</div>
            {pLoading ? (
              <div className="skeleton h-8 w-40 bg-white/20 mb-3" />
            ) : (
              <div className="text-white text-3xl font-bold num mb-3">
                ¥{(summary?.total_value ?? 0).toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
            <div className="flex items-center justify-around">
              <StatBadge
                label="总成本"
                value={`¥${((summary?.total_cost ?? 0) / 10000).toFixed(2)}万`}
              />
              <div className="w-px h-8 bg-white/20" />
              <StatBadge
                label="总盈亏"
                value={`${isProfitable ? '+' : ''}¥${totalProfit.toFixed(2)}`}
                isUp={isProfitable}
              />
              <div className="w-px h-8 bg-white/20" />
              <StatBadge
                label="盈亏比例"
                value={`${isProfitable ? '+' : ''}${totalProfitPct.toFixed(2)}%`}
                isUp={isProfitable}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-5">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🔍', label: '搜索股票', path: '/search' },
            { icon: '⭐', label: '我的自选', path: '/watchlist' },
            { icon: '💼', label: '我的持仓', path: '/portfolio' },
          ].map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="card flex flex-col items-center gap-2 py-4 active:scale-95 transition-transform"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Holdings preview */}
        {positions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">持仓概览</h2>
              <button className="text-xs text-primary-400 flex items-center gap-0.5" onClick={() => navigate('/portfolio')}>
                查看全部 <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2.5">
              {positions.slice(0, 3).map((pos: any) => {
                const isUp = pos.profit_pct >= 0
                return (
                  <div
                    key={pos.id}
                    className="card flex items-center gap-3 cursor-pointer active:bg-gray-50"
                    onClick={() => navigate(`/stock/${pos.code}`)}
                  >
                    <div className={clsx(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      isUp ? 'bg-red-50' : 'bg-emerald-50'
                    )}>
                      {isUp
                        ? <TrendingUp size={18} className="text-up" />
                        : <TrendingDown size={18} className="text-down" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{pos.name}</div>
                      <div className="text-xs text-gray-400 num">{pos.quantity}股 · 成本¥{pos.buy_price.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className={clsx('font-bold num text-sm', isUp ? 'text-up' : 'text-down')}>
                        {isUp ? '+' : ''}{pos.profit.toFixed(2)}
                      </div>
                      <div className={clsx('text-xs num', isUp ? 'text-up' : 'text-down')}>
                        {isUp ? '+' : ''}{pos.profit_pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Watchlist preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">自选股</h2>
            <button className="text-xs text-primary-400 flex items-center gap-0.5" onClick={() => navigate('/watchlist')}>
              查看全部 <ChevronRight size={14} />
            </button>
          </div>
          {wLoading ? (
            <div className="space-y-2">
              <SkeletonCard /><SkeletonCard />
            </div>
          ) : watchlist.length === 0 ? (
            <div className="card flex flex-col items-center py-8 gap-3">
              <span className="text-4xl">⭐</span>
              <p className="text-gray-400 text-sm">还没有自选股</p>
              <button className="btn-primary" onClick={() => navigate('/search')}>去搜索添加</button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {watchlist.slice(0, 5).map((item: any) => (
                <div
                  key={item.code}
                  className="card flex items-center justify-between cursor-pointer active:bg-gray-50"
                  onClick={() => navigate(`/stock/${item.code}`)}
                >
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400 num">{item.code}</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tip Banner */}
        <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-medium text-gray-800 text-sm mb-1">新手提示</div>
              <p className="text-xs text-gray-500 leading-relaxed">
                炒股有风险，入市需谨慎。建议分散投资，不要把所有资金押注于单一股票。本站提供的建议仅供参考，不构成投资建议。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
