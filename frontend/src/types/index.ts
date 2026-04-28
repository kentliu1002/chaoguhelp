export interface Stock {
  code: string
  name: string
  price: number
  change_pct: number
  change_amount: number
  volume: number
  turnover: number
  high: number
  low: number
  open: number
  prev_close: number
  total_value: number
  pe_ratio: number
  pb_ratio: number
  turnover_rate: number
  industry?: string
}

export interface StockInfo extends Stock {
  listing_date?: string
  total_shares?: number
  float_shares?: number
  description?: string
}

export interface HistoryPoint {
  date: string
  open: number
  close: number
  high: number
  low: number
  volume: number
  turnover: number
  change_pct: number
}

export interface NewsItem {
  title: string
  source: string
  time: string
  url: string
  content: string
}

export interface WatchlistItem {
  id: number
  code: string
  name: string
  industry?: string
  added_at: string
}

export interface PortfolioPosition {
  id: number
  code: string
  name: string
  buy_price: number
  quantity: number
  buy_date?: string
  note?: string
  current_price: number
  cost: number
  value: number
  profit: number
  profit_pct: number
  change_pct: number
  created_at: string
}

export interface PortfolioSummary {
  total_cost: number
  total_value: number
  total_profit: number
  total_profit_pct: number
}

export interface Recommendation {
  action: string
  reason: string
  risk: string
  confidence: string
}

export interface Sentiment {
  score: number
  label: string
  positive: string[]
  negative: string[]
  summary: string
}
