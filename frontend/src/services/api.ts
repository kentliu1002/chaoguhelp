import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
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

// Watchlist
export const getWatchlist = () =>
  api.get('/watchlist').then(r => Array.isArray(r.data) ? r.data : [])

export const addToWatchlist = (code: string, name: string, industry?: string) =>
  api.post('/watchlist', { code, name, industry }).then(r => r.data)

export const removeFromWatchlist = (code: string) =>
  api.delete(`/watchlist/${code}`).then(r => r.data)

export const checkWatchlist = (code: string) =>
  api.get(`/watchlist/check/${code}`).then(r => r.data.in_watchlist)

// Portfolio
export const getPortfolio = () =>
  api.get('/portfolio').then(r => {
    const d = r.data
    if (d && typeof d === 'object' && Array.isArray(d.positions)) return d
    return { positions: [], summary: { total_cost: 0, total_value: 0, total_profit: 0, total_profit_pct: 0 } }
  })

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
