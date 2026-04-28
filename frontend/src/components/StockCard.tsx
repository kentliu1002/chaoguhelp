import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { Stock } from '../types'

interface Props {
  stock: Stock
  showIndustry?: boolean
  rightSlot?: React.ReactNode
}

export default function StockCard({ stock, showIndustry, rightSlot }: Props) {
  const navigate = useNavigate()
  const isUp = stock.change_pct >= 0

  return (
    <div
      className="flex items-center justify-between py-3.5 px-4 bg-white rounded-2xl shadow-card active:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/stock/${stock.code}`)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-[15px]">{stock.name}</span>
          {stock.industry && showIndustry && (
            <span className="tag bg-primary-50 text-primary-400">{stock.industry}</span>
          )}
        </div>
        <span className="text-xs text-gray-400 num">{stock.code}</span>
      </div>

      <div className="flex items-center gap-3">
        {rightSlot}
        <div className="text-right">
          <div className={clsx('font-bold text-[17px] num', isUp ? 'text-up' : 'text-down')}>
            {stock.price.toFixed(2)}
          </div>
          <div className={clsx(
            'text-xs num font-medium px-2 py-0.5 rounded-lg',
            isUp ? 'bg-red-50 text-up' : 'bg-emerald-50 text-down'
          )}>
            {isUp ? '+' : ''}{stock.change_pct.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  )
}
