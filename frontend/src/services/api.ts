import axios from 'axios'
import { DEMO_WATCHLIST, DEMO_PORTFOLIO } from '../lib/demoData'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// Stocks
export const searchStocks = (q: string) =>
  api.get('/stocks/search', { params: { q } }).then(r => r.data.results)

export const getQuote = (code: string) =>
  api.get(`/stocks/${code}/quote`).then(r => r.data)

export const getQuotesBatch = (codes: string[]) =>
  api.get(`/stocks/${codes[0]}/quotes-batch`, { params: { codes: codes.join(',') } }).then(r => r.data)

export const getStockInfo = (code: string) =>
  api.get(`/stocks/${code}/info`).then(r => r.data)

export const getHistory = (code: string, days = 30) =>
  api.get(`/stocks/${code}/history`, { params: { days } }).then(r => r.data.history)

export const getNews = (code: string) =>
  api.get(`/stocks/${code}/news`).then(r => r.data.news)

export const getIndustries = () =>
  api.get('/stocks/industries').then(r => r.data.industries)

// Watchlist — 后端空/失败时自动用演示数据
export const getWatchlist = () =>
  api.get('/watchlist')
    .then(r => {
      const data = r.data
      if (Array.isArray(data) && data.length > 0) return data
      return DEMO_WATCHLIST
    })
    .catch(() => DEMO_WATCHLIST)

export const addToWatchlist = (code: string, name: string, industry?: string) =>
  api.post('/watchlist', { code, name, industry }).then(r => r.data)

export const removeFromWatchlist = (code: string) =>
  api.delete(`/watchlist/${code}`).then(r => r.data)

export const checkWatchlist = (code: string) =>
  api.get(`/watchlist/check/${code}`).then(r => r.data.in_watchlist).catch(() => false)

// Portfolio — 后端空/失败时自动用演示数据
export const getPortfolio = () =>
  api.get('/portfolio')
    .then(r => {
      const d = r.data
      if (d && typeof d === 'object' && Array.isArray(d.positions) && d.positions.length > 0) return d
      return DEMO_PORTFOLIO
    })
    .catch(() => DEMO_PORTFOLIO)

export const addPosition = (data: {
  code: string; name: string; buy_price: number
  quantity: number; buy_date?: string; note?: string
}) => api.post('/portfolio', data).then(r => r.data)

export const updatePosition = (id: number, data: {
  buy_price?: number; quantity?: number; buy_date?: string; note?: string
}) => api.put(`/portfolio/${id}`, data).then(r => r.data)

export const deletePosition = (id: number) =>
  api.delete(`/portfolio/${id}`).then(r => r.data)

// AI
export const getRecommendation = (code: string, portfolioItem?: object) =>
  api.post('/ai/recommend', { code, portfolio_item: portfolioItem }).then(r => r.data)

export const getSentiment = (code: string) =>
  api.get(`/ai/sentiment/${code}`).then(r => r.data)

export default api
