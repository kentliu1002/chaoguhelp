import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Search, AlertTriangle, ArrowLeft, ChevronRight } from 'lucide-react'
import {
  ANALYSIS_DATA, STOCK_PRICES, STOCK_NAME_TO_CODE,
  RATING_SCORE, RATING_COLOR,
  type Rating, type DimensionAnalysis, type StockAnalysis,
} from '../lib/demoAnalysis'
import PentagonChart from '../components/PentagonChart'

type Step = 'budget' | 'lookup' | 'check' | 'result'

export default function Analysis() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('budget')
  const [budget, setBudget] = useState<string>('')
  const [query, setQuery] = useState<string>('')
  const [matchedCode, setMatchedCode] = useState<string>('')

  const resolveCode = (input: string): string | null => {
    const v = input.trim()
    if (!v) return null
    if (/^\d{6}$/.test(v) && STOCK_PRICES[v]) return v
    for (const [name, code] of Object.entries(STOCK_NAME_TO_CODE)) {
      if (name.includes(v) || v.includes(name)) return code
    }
    return null
  }

  const budgetNum = Number(budget) || 0

  const onConfirmBudget = () => {
    if (budgetNum < 100) { alert('请输入合理的预算（至少 100 元）'); return }
    setStep('lookup')
  }

  const onLookup = () => {
    const code = resolveCode(query)
    if (!code) {
      alert('未找到这只股票，请尝试输入完整代码或名称\n演示版本支持：贵州茅台/宁德时代/比亚迪/招商银行/中芯国际/中国平安/五粮液/长江电力')
      return
    }
    setMatchedCode(code)
    setStep('check')
  }

  const stockInfo = matchedCode ? STOCK_PRICES[matchedCode] : null
  const minCost = stockInfo ? stockInfo.price * 100 : 0
  const canAfford = budgetNum >= minCost
  const maxLots = Math.floor(budgetNum / minCost)

  if (step === 'budget') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="股票分析" subtitle="一步步看清这只股票" onBack={() => navigate('/')} />
        <div className="flex-1 px-5 py-8">
          <div className="card mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Sparkles size={20} className="text-primary-400" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 mb-1">第一步：你打算投多少？</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  A 股最少买 100 股（一手）。先告诉我们你的预算，我们会帮你看够不够买。
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-4">
              <label className="text-xs text-gray-500 mb-2 block">本次投入预算（元）</label>
              <input
                type="number" inputMode="numeric" placeholder="例如：10000"
                value={budget} onChange={e => setBudget(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold text-gray-800 num placeholder:text-gray-300 outline-none"
              />
              <div className="text-xs text-gray-400 mt-2">建议：新手第一笔最好不超过你月收入的 20%</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[5000, 10000, 30000, 50000, 100000, 200000].map(v => (
              <button key={v} onClick={() => setBudget(String(v))}
                className="py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 active:bg-primary-50 active:border-primary-300">
                {v >= 10000 ? `${v / 10000}万` : `${v}元`}
              </button>
            ))}
          </div>
          <button onClick={onConfirmBudget} disabled={!budgetNum} className="btn-primary w-full disabled:opacity-40">
            下一步 →
          </button>
          <div className="card mt-6 bg-amber-50 border border-amber-100">
            <div className="flex gap-2 items-start">
              <span>💡</span>
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>新手贴士：</strong>不要拿生活急用钱炒股，更不要借钱炒股。投资有风险，亏的起的钱才是合理的预算。
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'lookup') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="股票分析" subtitle={`预算 ¥${budgetNum.toLocaleString()}`} onBack={() => setStep('budget')} />
        <div className="flex-1 px-5 py-6">
          <div className="card mb-5">
            <h2 className="font-bold text-gray-800 mb-1">第二步：你想分析哪只股票？</h2>
            <p className="text-xs text-gray-500 mb-4">输入股票代码或名称，我们会从五个维度全面分析。</p>
            <div className="bg-gray-50 rounded-xl flex items-center gap-2 px-4 py-3">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                type="text" placeholder="代码或名称，如：600519 / 茅台"
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onLookup()}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                autoFocus
              />
            </div>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-3">🔥 演示版本支持以下股票（点击直接选择）：</p>
            <div className="space-y-2">
              {Object.entries(STOCK_PRICES).map(([code, info]) => (
                <button key={code}
                  onClick={() => { setQuery(info.name); setMatchedCode(code); setStep('check') }}
                  className="card w-full flex items-center justify-between active:bg-primary-50">
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 text-sm">{info.name}</div>
                    <div className="text-xs text-gray-400 num mt-0.5">{code}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-700 num">¥{info.price.toFixed(2)}</div>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={onLookup} disabled={!query.trim()} className="btn-primary w-full mt-6 disabled:opacity-40">
            开始分析 →
          </button>
        </div>
      </div>
    )
  }

  if (step === 'check' && stockInfo) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header title="预算检查" subtitle={stockInfo.name} onBack={() => setStep('lookup')} />
        <div className="flex-1 px-5 py-6">
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-500">当前股价</div>
                <div className="text-3xl font-bold text-gray-800 num mt-0.5">¥{stockInfo.price.toFixed(2)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">最低买入</div>
                <div className="text-lg font-bold text-gray-800 num mt-0.5">¥{minCost.toLocaleString('zh', { maximumFractionDigits: 0 })}</div>
                <div className="text-[10px] text-gray-400">100 股 = 1 手</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">你的预算</span>
                <span className="font-semibold text-gray-800 num">¥{budgetNum.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">买 1 手需要</span>
                <span className="font-semibold text-gray-800 num">¥{minCost.toLocaleString('zh', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {canAfford ? (
            <div className="card bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 mb-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <div className="font-bold text-emerald-700 mb-1">预算够买！</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    你的预算最多可以买 <strong className="text-emerald-700">{maxLots} 手</strong>（{maxLots * 100} 股），
                    实际花费约 <strong className="text-emerald-700">¥{(minCost * maxLots).toLocaleString('zh', { maximumFractionDigits: 0 })}</strong>。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 mb-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-amber-700 mb-1">预算不够买这只股票</div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    买这只股票最少需要 <strong className="text-amber-700">¥{minCost.toLocaleString('zh', { maximumFractionDigits: 0 })}</strong>，
                    你现在还差 <strong className="text-amber-700">¥{(minCost - budgetNum).toLocaleString('zh', { maximumFractionDigits: 0 })}</strong>。
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">建议：换一只价格低的股票，或等手头宽裕了再考虑。</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            {canAfford && (
              <button onClick={() => setStep('result')} className="btn-primary w-full">
                查看完整分析报告 →
              </button>
            )}
            <button onClick={() => setStep('lookup')} className="w-full py-3 text-sm text-primary-400 font-medium">
              换一只股票
            </button>
            <button onClick={() => setStep('budget')} className="w-full py-3 text-sm text-gray-500">
              修改预算
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && matchedCode) {
    const analysis = ANALYSIS_DATA[matchedCode]
    if (!analysis) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-gray-500 mb-4">暂无该股票的分析数据</p>
          <button onClick={() => setStep('lookup')} className="btn-primary">返回选择</button>
        </div>
      )
    }
    return <AnalysisResult analysis={analysis} budget={budgetNum} maxLots={maxLots} onBack={() => setStep('check')} />
  }

  return null
}

function Header({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
  return (
    <div className="bg-gradient-to-br from-primary-400 to-primary-600 px-5 pt-14 pb-6 text-white">
      <button onClick={onBack} className="flex items-center gap-1 text-white/80 mb-3">
        <ArrowLeft size={18} />
        <span className="text-sm">返回</span>
      </button>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-white/80 mt-1">{subtitle}</p>
    </div>
  )
}

function AnalysisResult({ analysis, budget, maxLots, onBack }: {
  analysis: StockAnalysis; budget: number; maxLots: number; onBack: () => void
}) {
  const dims = [
    { key: 'industry',    title: '行业前景', icon: '🏭', data: analysis.industry },
    { key: 'business',    title: '公司经营', icon: '💼', data: analysis.business },
    { key: 'market',      title: '行情走势', icon: '📈', data: analysis.market },
    { key: 'sentiment',   title: '市场口碑', icon: '💬', data: analysis.sentiment },
    { key: 'environment', title: '发展环境', icon: '🌍', data: analysis.environment },
  ] as const

  return (
    <div className="flex flex-col min-h-screen pb-8">
      <Header title={analysis.name} subtitle={`${analysis.code} · ¥${analysis.current_price.toFixed(2)}`} onBack={onBack} />
      <div className="px-5 -mt-2 space-y-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">综合评分</h2>
            <RatingBadge rating={analysis.overall.rating} />
          </div>
          <PentagonChart
            industry={RATING_SCORE[analysis.industry.rating]}
            business={RATING_SCORE[analysis.business.rating]}
            market={RATING_SCORE[analysis.market.rating]}
            sentiment={RATING_SCORE[analysis.sentiment.rating]}
            environment={RATING_SCORE[analysis.environment.rating]}
          />
          <div className="mt-3 grid grid-cols-5 gap-1 text-center">
            {dims.map(d => (
              <div key={d.key}>
                <div className="text-[10px] text-gray-400 mb-0.5">{d.title.slice(0, 2)}</div>
                <div className="text-xs font-bold num" style={{ color: RATING_COLOR[d.data.rating] }}>{d.data.rating}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-primary-50 to-purple-50 border border-primary-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-bold text-gray-800 mb-1.5">给你的建议</div>
              <p className="text-sm text-gray-600 leading-relaxed">{analysis.overall.suggestion}</p>
              <div className="mt-3 pt-3 border-t border-primary-100 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-500">你的预算</div>
                  <div className="font-bold text-gray-800 num">¥{budget.toLocaleString()}</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-500">最多可买</div>
                  <div className="font-bold text-primary-500 num">{maxLots} 手</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {dims.map(d => (
          <DimensionCard key={d.key} icon={d.icon} title={d.title} data={d.data} />
        ))}

        <div className="card bg-gray-50">
          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            ⚠️ 以上分析基于公开信息和模型推理生成，仅供学习参考，不构成投资建议。
            <br />股市有风险，入市需谨慎。
          </p>
        </div>
      </div>
    </div>
  )
}

function DimensionCard({ icon, title, data }: { icon: string; title: string; data: DimensionAnalysis }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-bold text-gray-800">{title}</h3>
        </div>
        <RatingBadge rating={data.rating} small />
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">{data.summary}</p>
      <div className="space-y-1.5">
        {data.highlights.map((h, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="text-primary-300 mt-0.5">▸</span>
            <span className="flex-1 leading-relaxed">{h}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RatingBadge({ rating, small }: { rating: Rating; small?: boolean }) {
  return (
    <div className={`rounded-full font-bold text-white ${small ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}
      style={{ backgroundColor: RATING_COLOR[rating] }}>
      {rating}
    </div>
  )
}
