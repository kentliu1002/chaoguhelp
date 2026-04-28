import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { getPortfolio, deletePosition } from '../services/api'
import { PageLoader } from '../components/LoadingSpinner'
import type { PortfolioPosition, PortfolioSummary } from '../types'
import clsx from 'clsx'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#FF6B8A', '#AB47BC', '#42A5F5', '#66BB6A', '#FFA726', '#EC407A', '#26C6DA']

export default function Portfolio() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    refetchInterval: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePosition(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })

  const positions: PortfolioPosition[] = data?.positions ?? []
  const summary: PortfolioSummary = data?.summary ?? { total_cost: 0, total_value: 0, total_profit: 0, total_profit_pct: 0 }
  const isProfit = summary.total_profit >= 0

  const pieData = positions.map(p => ({ name: p.name, value: p.value }))

  if (isLoading) return <div className="pt-14"><PageLoader /></div>

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">我的持仓</h1>
            <p className="text-xs text-gray-400 mt-0.5">{positions.length} 只股票</p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="w-9 h-9 bg-primary-400 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 mt-24">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
              <Wallet size={36} className="text-primary-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 mb-1">还没有持仓记录</p>
              <p className="text-sm text-gray-400">搜索股票后登记买入记录</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/search')}>
              去添加持仓
            </button>
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className={clsx(
              'rounded-2xl p-5 text-white',
              isProfit
                ? 'bg-gradient-to-br from-red-500 to-red-400'
                : 'bg-gradient-to-br from-teal-500 to-teal-400'
            )}>
              <div className="text-white/70 text-xs mb-1">总市值</div>
              <div className="text-3xl font-bold num mb-4">
                ¥{summary.total_value.toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '总成本', val: `¥${(summary.total_cost / 10000).toFixed(2)}万` },
                  { label: '总盈亏', val: `${isProfit ? '+' : ''}¥${summary.total_profit.toFixed(2)}` },
                  { label: '盈亏比例', val: `${isProfit ? '+' : ''}${summary.total_profit_pct.toFixed(2)}%` },
                ].map(item => (
                  <div key={item.label} className="bg-white/15 rounded-xl p-2 text-center">
                    <div className="text-white/60 text-[10px]">{item.label}</div>
                    <div className="text-white font-semibold text-sm num">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie chart */}
            {positions.length > 1 && (
              <div className="card">
                <h3 className="font-semibold text-gray-700 text-sm mb-3">持仓分布</h3>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={56}>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => `¥${v.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {positions.map((p, i) => {
                      const pct = summary.total_value > 0 ? (p.value / summary.total_value * 100) : 0
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-gray-600 flex-1 truncate">{p.name}</span>
                          <span className="text-xs font-medium num text-gray-500">{pct.toFixed(1)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Positions list */}
            <div className="space-y-2.5">
              {positions.map(pos => (
                <PositionCard
                  key={pos.id}
                  pos={pos}
                  onDelete={() => {
                    if (confirm(`确认删除 ${pos.name} 的持仓记录？`)) {
                      deleteMutation.mutate(pos.id)
                    }
                  }}
                  onTap={() => navigate(`/stock/${pos.code}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PositionCard({
  pos,
  onDelete,
  onTap,
}: {
  pos: PortfolioPosition
  onDelete: () => void
  onTap: () => void
}) {
  const isUp = pos.profit_pct >= 0
  const todayUp = pos.change_pct >= 0

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button
        className="w-full text-left px-4 pt-4 pb-3 active:bg-gray-50 transition-colors"
        onClick={onTap}
      >
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold text-gray-900">{pos.name}</div>
            <div className="text-xs text-gray-400 num">{pos.code} · {pos.quantity}股</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-800 num">¥{pos.current_price.toFixed(2)}</div>
            <div className={clsx('text-xs num', todayUp ? 'text-up' : 'text-down')}>
              今日 {todayUp ? '+' : ''}{pos.change_pct.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '买入价', val: `¥${pos.buy_price.toFixed(2)}` },
            { label: '持仓市值', val: `¥${pos.value.toFixed(2)}` },
            { label: '总盈亏', val: `${isUp ? '+' : ''}${pos.profit_pct.toFixed(2)}%` },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-2 text-center">
              <div className="text-gray-400 text-[10px]">{item.label}</div>
              <div className={clsx(
                'font-semibold text-xs num',
                item.label === '总盈亏' ? (isUp ? 'text-up' : 'text-down') : 'text-gray-700'
              )}>
                {item.val}
              </div>
            </div>
          ))}
        </div>
      </button>

      {/* Delete button */}
      <div className="border-t border-gray-100 px-4 py-2 flex justify-end">
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 text-xs text-gray-400 active:text-red-400 transition-colors py-1 px-2"
        >
          <Trash2 size={13} />
          删除记录
        </button>
      </div>
    </div>
  )
}
