import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check } from 'lucide-react'
import { getStockInfo, addPosition } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import clsx from 'clsx'
import dayjs from 'dayjs'

export default function AddPosition() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: stock } = useQuery({
    queryKey: ['stockInfo', code],
    queryFn: () => getStockInfo(code!),
    enabled: !!code,
  })

  const [buyPrice, setBuyPrice] = useState(stock?.price?.toFixed(2) ?? '')
  const [quantity, setQuantity] = useState('')
  const [buyDate, setBuyDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [note, setNote] = useState('')

  // Update buyPrice when stock loads
  const price = stock?.price
  if (price && !buyPrice) setBuyPrice(price.toFixed(2))

  const cost = (parseFloat(buyPrice) || 0) * (parseInt(quantity) || 0)

  const mutation = useMutation({
    mutationFn: () => addPosition({
      code: code!,
      name: stock?.name ?? '',
      buy_price: parseFloat(buyPrice),
      quantity: parseInt(quantity),
      buy_date: buyDate,
      note: note || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      navigate('/portfolio')
    },
  })

  const canSubmit = buyPrice && parseFloat(buyPrice) > 0 && quantity && parseInt(quantity) > 0

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6FF]">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div>
          <div className="font-bold text-gray-900">登记买入</div>
          {stock && <div className="text-xs text-gray-400">{stock.name} · {code}</div>}
        </div>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Stock info */}
        {stock && (
          <div className="card flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-lg font-bold text-primary-400">
              {stock.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{stock.name}</div>
              <div className="text-xs text-gray-400 num">{code} · 当前 ¥{stock.price?.toFixed(2)}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="card space-y-5">
          <FormField label="买入价格（元）" required>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
              <input
                type="number"
                value={buyPrice}
                onChange={e => setBuyPrice(e.target.value)}
                placeholder="请输入买入价格"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-300 num"
              />
            </div>
            {stock?.price && (
              <div className="flex gap-2 mt-2">
                {[stock.price * 0.98, stock.price, stock.price * 1.02].map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setBuyPrice(p.toFixed(2))}
                    className={clsx(
                      'flex-1 py-1.5 rounded-lg text-xs num',
                      buyPrice === p.toFixed(2)
                        ? 'bg-primary-400 text-white'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {i === 0 ? '低2%' : i === 1 ? '现价' : '高2%'}
                    <div className="font-semibold">{p.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </FormField>

          <FormField label="买入数量（股）" required>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="输入股数（最少100股/手）"
              min="100"
              step="100"
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-300 num"
            />
            <div className="flex gap-2 mt-2">
              {[100, 200, 500, 1000].map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(String(q))}
                  className={clsx(
                    'flex-1 py-1.5 rounded-lg text-xs num',
                    quantity === String(q)
                      ? 'bg-primary-400 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {q}股
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="买入日期">
            <input
              type="date"
              value={buyDate}
              onChange={e => setBuyDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
          </FormField>

          <FormField label="备注">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="可以记录买入理由..."
              rows={2}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            />
          </FormField>
        </div>

        {/* Cost preview */}
        {cost > 0 && (
          <div className="card bg-primary-50 border border-primary-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">预计总成本</span>
              <span className="text-xl font-bold text-primary-500 num">
                ¥{cost.toLocaleString('zh', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={() => canSubmit && mutation.mutate()}
          disabled={!canSubmit || mutation.isPending}
          className={clsx(
            'w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 active:scale-95 transition-all',
            canSubmit && !mutation.isPending
              ? 'bg-primary-400 shadow-md'
              : 'bg-gray-200 text-gray-400'
          )}
        >
          {mutation.isPending ? (
            <LoadingSpinner size={20} />
          ) : (
            <>
              <Check size={18} />
              确认登记
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
        {label}
        {required && <span className="text-primary-400">*</span>}
      </label>
      {children}
    </div>
  )
}
