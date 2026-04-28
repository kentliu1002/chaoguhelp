import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react'
import { searchStocks } from '../services/api'
import StockCard from '../components/StockCard'
import { PageLoader } from '../components/LoadingSpinner'
import type { Stock } from '../types'

const HOT_SEARCHES = ['贵州茅台', '宁德时代', '比亚迪', '中芯国际', '新能源', '银行', '医药']

export default function Search() {
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: results = [], isFetching, isError } = useQuery<Stock[]>({
    queryKey: ['search', submitted],
    queryFn: () => searchStocks(submitted),
    enabled: submitted.length > 0,
  })

  const handleSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    setQuery(trimmed)
    setSubmitted(trimmed)
  }

  const handleClear = () => {
    setQuery('')
    setSubmitted('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 sticky top-0 z-10 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-4">搜索股票</h1>
        <div className="relative flex items-center">
          <SearchIcon size={18} className="absolute left-3.5 text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(query)}
            placeholder="股票名称 / 代码 / 行业"
            className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary-300 transition-all"
          />
          {query ? (
            <button onClick={handleClear} className="absolute right-3.5">
              <X size={18} className="text-gray-400" />
            </button>
          ) : null}
        </div>
        {query && (
          <button
            onClick={() => handleSearch(query)}
            className="w-full mt-2 btn-primary text-center"
          >
            搜索
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-4">
        {!submitted ? (
          /* Hot searches */
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary-400" />
              <h2 className="font-semibold text-gray-700 text-sm">热门搜索</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {HOT_SEARCHES.map(kw => (
                <button
                  key={kw}
                  onClick={() => handleSearch(kw)}
                  className="px-4 py-2 bg-white rounded-full text-sm text-gray-600 shadow-card active:bg-primary-50 active:text-primary-400 transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 text-gray-300">
              <SearchIcon size={48} strokeWidth={1} />
              <p className="text-sm">输入关键词搜索A股股票</p>
            </div>
          </div>
        ) : isFetching ? (
          <PageLoader />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 mt-16 text-gray-400">
            <span className="text-4xl">😅</span>
            <p className="text-sm">搜索出错了，请重试</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 mt-16 text-gray-400">
            <span className="text-4xl">🔍</span>
            <p className="text-sm">未找到「{submitted}」相关股票</p>
            <p className="text-xs text-gray-300">试试股票代码或完整名称</p>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-400 mb-3">找到 {results.length} 只相关股票</div>
            <div className="space-y-2.5">
              {results.map(stock => (
                <StockCard key={stock.code} stock={stock} showIndustry />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
