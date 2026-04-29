// 演示数据 — 当后端返回空数据时自动启用
export const DEMO_WATCHLIST = [
  { id: 1, code: "600519", name: "贵州茅台", industry: "食品饮料", added_at: "2024-03-01T10:00:00" },
  { id: 2, code: "300750", name: "宁德时代", industry: "新能源",   added_at: "2024-03-02T10:00:00" },
  { id: 3, code: "002594", name: "比亚迪",   industry: "汽车",     added_at: "2024-03-03T10:00:00" },
  { id: 4, code: "600036", name: "招商银行", industry: "银行",     added_at: "2024-03-04T10:00:00" },
  { id: 5, code: "688981", name: "中芯国际", industry: "半导体",   added_at: "2024-03-05T10:00:00" },
  { id: 6, code: "601318", name: "中国平安", industry: "保险",     added_at: "2024-03-06T10:00:00" },
  { id: 7, code: "000858", name: "五粮液",   industry: "食品饮料", added_at: "2024-03-07T10:00:00" },
  { id: 8, code: "600900", name: "长江电力", industry: "电力",     added_at: "2024-03-08T10:00:00" },
]

const _raw = [
  { id:1, code:"600519", name:"贵州茅台", buy_price:1488.00, quantity:10,  current_price:1628.00, buy_date:"2024-03-15", note:"白酒龙头，长期持有",   change_pct: 1.23 },
  { id:2, code:"300750", name:"宁德时代", buy_price: 198.50, quantity:30,  current_price: 212.80, buy_date:"2024-06-20", note:"新能源赛道，看好未来", change_pct:-1.45 },
  { id:3, code:"002594", name:"比亚迪",   buy_price: 242.00, quantity:20,  current_price: 368.50, buy_date:"2024-08-10", note:"新能源汽车高增长",     change_pct: 2.86 },
  { id:4, code:"600036", name:"招商银行", buy_price:  32.80, quantity:100, current_price:  38.62, buy_date:"2024-10-05", note:"股息稳定，防御配置",   change_pct: 0.73 },
  { id:5, code:"688981", name:"中芯国际", buy_price:  58.20, quantity:50,  current_price:  51.30, buy_date:"2025-01-08", note:"国产芯片替代逻辑",     change_pct:-2.10 },
]

function buildPortfolio() {
  let totalCost = 0, totalValue = 0
  const positions = _raw.map(p => {
    const cost   = p.buy_price     * p.quantity
    const value  = p.current_price * p.quantity
    const profit = value - cost
    totalCost  += cost
    totalValue += value
    return { ...p, cost, value, profit,
      profit_pct: cost ? (profit / cost * 100) : 0,
      created_at: "2024-01-01T00:00:00" }
  })
  const totalProfit = totalValue - totalCost
  return {
    positions,
    summary: {
      total_cost: totalCost, total_value: totalValue,
      total_profit: totalProfit,
      total_profit_pct: totalCost ? (totalProfit / totalCost * 100) : 0,
    }
  }
}

export const DEMO_PORTFOLIO = buildPortfolio()
