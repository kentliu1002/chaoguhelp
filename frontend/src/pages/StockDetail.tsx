import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Star, Plus, RefreshCw, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react'
import {
  getStockInfo, getHistory, getNews, checkWatchlist,
  addToWatchlist, removeFromWatchlist, getRecommendation, getSentiment
} from '../services/api'
import PriceChart from '../components/PriceChart'
import SentimentGauge from '../components/SentimentGauge'
import RecommendCard from '../components/RecommendCard'
import { PageLoader } from '../components/LoadingSpinner'
import type { StockInfo, HistoryPoint, NewsItem, Recommendation, Sentiment } from '../types'
import clsx from 'clsx'

const PERIOD_OPTIONS = [
  { label: '5日', days: 5 },
  { label: '1月', days: 30 },
  { label: '3月', days: 90 },
  { label: '6月', days: 180 },
  { label: '1年', days: 365 },
]

export default function StockDetail() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [period, setPeriod] = useState(30)
  const [showDesc, setShowDesc] = useState(false)

  const { data: stock, isLoading: stockLoading, refetch: refetchStock } = useQuery<StockInfo>({
    queryKey: ['stockInfo', code],
    queryFn: () => getStockInfo(code!),
    enabled: !!code,
    refetchInterval: 60_000,
  })

  const { data: history = [], isLoading: histLoading } = useQuery<HistoryPoint[]>({
    queryKey: ['history', code, period],
    queryFn: () => getHistory(code!, period),
    enabled: !!code,
  })

  const { data: news = [] } = useQuery<NewsItem[]>({
    queryKey: ['news', code],
    queryFn: () => getNews(code!),
    enabled: !!code,
  })

  const { data: inWatchlist } = useQuery<boolean>({
    queryKey: ['watchlistCheck', code],
    queryFn: () => checkWatchlist(code!),
    enabled: !!code,
  })

  const { data: rec, isLoading: recLoading, refetch: refetchRec } = useQuery<Recommendation>({
    queryKey: ['recommendation', code],
    queryFn: () => getRecommendation(code!),
    enabled: !!code,
    staleTime: 300_000,
  })

  const { data: sentiment, isLoading: sentLoading, refetch: refetchSent } = useQuery<Sentiment>({
    queryKey: ['sentiment', code],
    queryFn: () => getSentiment(code!),
    enabled: !!code,
    staleTime: 300_000,
  })

  const toggleWatchlist = useMutation({
    mutationFn: async () => {
      if (inWatchlist) {
        await removeFromWatchlist(code!)
      } else {
        await addToWatchlist(code!, stock?.name ?? '', stock?.industry)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlistCheck', code] })
      qc.invalidateQueries({ queryKey: ['watchlist'] })
    },
  })

  if (stockLoading) return <div className="pt-14"><PageLoader /></div>
  if (!stock) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-400">
      <span className="text-4xl">😅</span>
      <p>找不到该股票</p>
      <button className="btn-ghost" onClick={() => navigate(-1)}>返回</button>
    </div>
  )

  const isUp = stock.change_pct >= 0
  const color = isUp ? '#E84040' : '#2BAE8E'

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6FF]">
      {/* Sticky Header */}
      <div className="bg-white px-4 pt-14 pb-3 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-900 text-lg leading-tight">{stock.name}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 num">{stock.code}</span>
              {stock.industry && (
                <span className="tag bg-primary-50 text-primary-400">{stock.industry}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleWatchlist.mutate()}
              className={clsx(
                'w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all',
                inWatchlist ? 'bg-yellow-50' : 'bg-gray-100'
              )}
            >
              <Star
                size={18}
                className={inWatchlist ? 'text-yellow-400' : 'text-gray-400'}
                fill={inWatchlist ? '#FBBF24' : 'none'}
              />
            </button>
            <button
              onClick={() => navigate(`/add-position/${code}`)}
              className="w-9 h-9 bg-primary-400 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-md"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 px-4 py-4">
        {/* Price Card */}
        <div className="bg-white rounded-2xl shadow-card px-5 pt-5 pb-4">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-4xl font-bold num" style={{ color }}>
                {stock.price.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={clsx('text-sm font-medium num px-2.5 py-0.5 rounded-lg', isUp ? 'bg-red-50 text-up' : 'bg-emerald-50 text-down')}>
                  {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
                </span>
                <span className={clsx('text-sm num', isUp ? 'text-up' : 'text-down')}>
                  {isUp ? '+' : ''}{stock.change_amount.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={() => refetchStock()}
              className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full"
            >
              <RefreshCw size={12} />
              刷新
            </button>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '今开', val: stock.open.toFixed(2) },
              { label: '最高', val: stock.high.toFixed(2), up: true },
              { label: '最低', val: stock.low.toFixed(2), up: false },
              { label: '昨收', val: stock.prev_close.toFixed(2) },
              { label: '市盈率', val: stock.pe_ratio > 0 ? stock.pe_ratio.toFixed(1) : '-' },
              { label: '市净率', val: stock.pb_ratio > 0 ? stock.pb_ratio.toFixed(2) : '-' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl px-2.5 py-2">
                <div className="text-[10px] text-gray-400">{item.label}</div>
                <div className={clsx(
                  'text-xs font-semibold num',
                  item.up === true ? 'text-up' : item.up === false ? 'text-down' : 'text-gray-700'
                )}>
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl shadow-card px-4 pt-4 pb-2">
          {/* Period selector */}
          <div className="flex gap-1 mb-4 bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => setPeriod(opt.days)}
                className={clsx(
                  'flex-1 py-1.5 rounded-lg text-xs font-medium transition-all',
                  period === opt.days
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {histLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="skeleton w-full h-full rounded-xl" />
            </div>
          ) : (
            <PriceChart data={history} height={160} />
          )}
        </div>

        {/* Market info */}
        <div className="bg-white rounded-2xl shadow-card p-4">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">市场数据</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '总市值', val: stock.total_value >= 1e8 ? `${(stock.total_value / 1e8).toFixed(2)}亿` : `${(stock.total_value / 1e4).toFixed(0)}万` },
              { label: '成交量', val: `${(stock.volume / 1e4).toFixed(2)}万手` },
              { label: '成交额', val: stock.turnover >= 1e8 ? `${(stock.turnover / 1e8).toFixed(2)}亿` : `${(stock.turnover / 1e4).toFixed(0)}万` },
              { label: '换手率', val: `${stock.turnover_rate.toFixed(2)}%` },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="text-[10px] text-gray-400 mb-1">{item.label}</div>
                <div className="text-sm font-semibold text-gray-700 num">{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation */}
        {recLoading ? (
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
              AI 分析中...
            </div>
          </div>
        ) : rec ? (
          <RecommendCard rec={rec} />
        ) : null}

        {/* Sentiment */}
        {sentLoading ? (
          <div className="card">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" />
              舆情分析中...
            </div>
          </div>
        ) : sentiment ? (
          <SentimentGauge sentiment={sentiment} />
        ) : null}

        {/* Company description */}
        {stock.description && (
          <div className="card">
            <button
              className="w-full flex items-center justify-between"
              onClick={() => setShowDesc(v => !v)}
            >
              <h3 className="font-semibold text-gray-700 text-sm">公司简介</h3>
              {showDesc ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {showDesc && (
              <p className="text-xs text-gray-500 leading-relaxed mt-3 line-clamp-10">
                {stock.description}
              </p>
            )}
          </div>
        )}

        {/* News */}
        {news.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-700 text-sm mb-3">相关资讯</h3>
            <div className="space-y-3">
              {news.slice(0, 8).map((item, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
                  <div className="text-xs text-gray-800 leading-relaxed mb-1 font-medium line-clamp-2">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.time?.slice(0, 16)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom action */}
        <button
          onClick={() => navigate(`/add-position/${code}`)}
          className="w-full py-4 bg-primary-400 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          登记买入记录
        </button>

        <div className="h-4" />
      </div>
    </div>
  )
}
