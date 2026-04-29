import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import Watchlist from './pages/Watchlist'
import Portfolio from './pages/Portfolio'
import StockDetail from './pages/StockDetail'
import AddPosition from './pages/AddPosition'
import { ErrorBoundary } from './components/ErrorBoundary'

function AppRoutes() {
  const location = useLocation()
  const hideNav = location.pathname.startsWith('/stock/') || location.pathname.startsWith('/add-position') || location.pathname.startsWith('/analysis')

  return (
    <div className="min-h-screen bg-[#F8F6FF] max-w-lg mx-auto relative">
      <div className={hideNav ? 'min-h-screen' : 'pb-20'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/stock/:code" element={<StockDetail />} />
          <Route path="/add-position/:code" element={<AddPosition />} />
        </Routes>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
