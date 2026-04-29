import { NavLink } from 'react-router-dom'
import { Home, Sparkles, Star, TrendingUp } from 'lucide-react'
import clsx from 'clsx'

const tabs = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/analysis', icon: Sparkles, label: '股票分析' },
  { to: '/watchlist', icon: Star, label: '自选' },
  { to: '/portfolio', icon: TrendingUp, label: '持仓' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all',
                isActive ? 'text-primary-400' : 'text-gray-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={clsx('text-xs font-medium', isActive ? 'text-primary-400' : 'text-gray-400')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
