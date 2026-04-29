import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Star } from 'lucide-react'
import { getWatchlist, removeFromWatchlist } from '../services/api'
import { PageLoader } from '../components/LoadingSpinner'
import type { WatchlistItem } from '../types'

export default function Watchlist() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: items = [], isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
  })

  const removeMutation = useMutation({
    mutationFn: (code: string) => removeFromWatchlist(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  })

  if (isLoading) return (<div className="pt-14"><PageLoader /></div>)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-white px-5 pt-14 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">自选股</h1>
            <p className="text-xs text-gray-400 mt-0.5">共 {items.length} 只</p>
          </div>
          <button
            onClick={() => navigate('/analysis')}
            className="w-9 h-9 bg-primary-400 rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 mt-24">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center">
              <Star size={36} className="text-primary-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 mb-1">还没有自选股</p>
              <p className="text-sm text-gray-400">从分析页面添加感兴趣的股票</p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/analysis')}>
              去添加
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map(item => (
              <WatchlistRow
                key={item.code}
                item={item}
                onRemove={() => removeMutation.mutate(item.code)}
                onTap={() => navigate(`/stock/${item.code}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function WatchlistRow({ item, onRemove, onTap }: {
  item: WatchlistItem; onRemove: () => void; onTap: () => void
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden flex">
      <button
        className="flex-1 flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left"
        onClick={onTap}
      >
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <Star size={18} className="text-primary-400" fill="#FF6B8A" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 text-[15px]">{item.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400 num">{item.code}</span>
            {item.industry && (
              <span className="tag bg-gray-100 text-gray-500">{item.industry}</span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-300">查看 →</div>
      </button>
      <button
        onClick={onRemove}
        className="px-4 border-l border-gray-100 text-gray-300 active:text-red-400 active:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
