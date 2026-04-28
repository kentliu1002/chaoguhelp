"""
股票数据服务。

- 本地 / 自托管：使用 AKShare 拉取真实行情（需 akshare / pandas）
- Vercel 部署  ：VERCEL 环境变量自动触发，完全使用内置 Demo 数据，
                 无需 AKShare / pandas / numpy，冷启动秒级响应。
"""
import os
import asyncio
import random
import datetime
import threading
from cachetools import TTLCache

IS_VERCEL = bool(os.environ.get("VERCEL"))

# ── AKShare 懒加载（本地模式下才会真正 import） ────────────────────────────────
try:
    if not IS_VERCEL:
        import akshare as ak
        import pandas as pd
        HAS_AKSHARE = True
    else:
        HAS_AKSHARE = False
except ImportError:
    HAS_AKSHARE = False

# ── 缓存 ──────────────────────────────────────────────────────────────────────
_realtime_cache = TTLCache(maxsize=500, ttl=60)
_info_cache     = TTLCache(maxsize=200, ttl=3600)
_history_cache  = TTLCache(maxsize=200, ttl=300)
_news_cache     = TTLCache(maxsize=100, ttl=600)
_cache_lock     = threading.Lock()

_market_snapshot: dict = {}
_snapshot_lock   = threading.Lock()
_snapshot_time: datetime.datetime | None = None

# ── Demo 行情（Vercel 模式 / AKShare 故障时的兜底） ───────────────────────────
DEMO_PRICES: dict[str, dict] = {
    "600519": {"code":"600519","name":"贵州茅台","price":1628.00,"change_pct": 1.23,"change_amount": 19.76,
               "volume":32156,"turnover":5.21e9,"high":1635.00,"low":1612.00,"open":1615.00,"prev_close":1608.24,
               "total_value":2.05e12,"pe_ratio":22.4,"pb_ratio":7.1,"turnover_rate":0.25,"industry":"食品饮料"},
    "300750": {"code":"300750","name":"宁德时代","price":212.80,"change_pct":-1.45,"change_amount": -3.13,
               "volume":358200,"turnover":7.63e9,"high":218.50,"low":211.30,"open":217.00,"prev_close":215.93,
               "total_value":4.68e11,"pe_ratio":18.6,"pb_ratio":2.8,"turnover_rate":1.63,"industry":"新能源"},
    "002594": {"code":"002594","name":"比亚迪","price":368.50,"change_pct": 2.86,"change_amount": 10.26,
               "volume":425600,"turnover":1.55e10,"high":372.00,"low":358.80,"open":360.00,"prev_close":358.24,
               "total_value":1.07e12,"pe_ratio":20.1,"pb_ratio":3.9,"turnover_rate":1.47,"industry":"汽车"},
    "600036": {"code":"600036","name":"招商银行","price":38.62,"change_pct": 0.73,"change_amount":  0.28,
               "volume":1258000,"turnover":4.85e9,"high":38.90,"low":38.21,"open":38.35,"prev_close":38.34,
               "total_value":9.72e11,"pe_ratio":5.8,"pb_ratio":0.82,"turnover_rate":0.50,"industry":"银行"},
    "688981": {"code":"688981","name":"中芯国际","price":51.30,"change_pct":-2.10,"change_amount": -1.10,
               "volume":892000,"turnover":4.58e9,"high":53.20,"low":50.88,"open":52.80,"prev_close":52.40,
               "total_value":3.87e11,"pe_ratio":68.2,"pb_ratio":2.1,"turnover_rate":1.18,"industry":"半导体"},
    "601318": {"code":"601318","name":"中国平安","price":46.82,"change_pct": 0.41,"change_amount":  0.19,
               "volume":1580000,"turnover":7.40e9,"high":47.20,"low":46.50,"open":46.63,"prev_close":46.63,
               "total_value":8.53e11,"pe_ratio":8.2,"pb_ratio":0.95,"turnover_rate":0.87,"industry":"保险"},
    "000858": {"code":"000858","name":"五粮液","price":102.50,"change_pct": 1.58,"change_amount":  1.60,
               "volume":215000,"turnover":2.20e9,"high":103.20,"low":100.80,"open":101.00,"prev_close":100.90,
               "total_value":3.97e11,"pe_ratio":14.8,"pb_ratio":3.2,"turnover_rate":0.56,"industry":"食品饮料"},
    "600900": {"code":"600900","name":"长江电力","price":27.85,"change_pct": 0.18,"change_amount":  0.05,
               "volume":982000,"turnover":2.74e9,"high":28.00,"low":27.62,"open":27.70,"prev_close":27.80,
               "total_value":6.19e11,"pe_ratio":19.6,"pb_ratio":3.4,"turnover_rate":0.44,"industry":"电力"},
    # 搜索用扩充（仅基础行情）
    "000001": {"code":"000001","name":"平安银行","price":11.28,"change_pct": 0.54,"change_amount":0.06,
               "volume":2300000,"turnover":2.6e9,"high":11.40,"low":11.15,"open":11.22,"prev_close":11.22,
               "total_value":2.19e11,"pe_ratio":4.2,"pb_ratio":0.52,"turnover_rate":1.18,"industry":"银行"},
    "000002": {"code":"000002","name":"万科A","price":7.62,"change_pct":-0.91,"change_amount":-0.07,
               "volume":3100000,"turnover":2.4e9,"high":7.80,"low":7.58,"open":7.74,"prev_close":7.69,
               "total_value":8.93e10,"pe_ratio":0.0,"pb_ratio":0.38,"turnover_rate":0.27,"industry":"房地产"},
    "600000": {"code":"600000","name":"浦发银行","price":8.45,"change_pct": 0.24,"change_amount":0.02,
               "volume":1800000,"turnover":1.5e9,"high":8.52,"low":8.38,"open":8.43,"prev_close":8.43,
               "total_value":2.45e11,"pe_ratio":3.8,"pb_ratio":0.40,"turnover_rate":0.62,"industry":"银行"},
    "601166": {"code":"601166","name":"兴业银行","price":18.72,"change_pct": 0.86,"change_amount":0.16,
               "volume":2100000,"turnover":3.9e9,"high":18.90,"low":18.55,"open":18.56,"prev_close":18.56,
               "total_value":3.99e11,"pe_ratio":4.5,"pb_ratio":0.55,"turnover_rate":0.99,"industry":"银行"},
    "600276": {"code":"600276","name":"恒瑞医药","price":38.25,"change_pct": 1.22,"change_amount":0.46,
               "volume":980000,"turnover":3.7e9,"high":38.80,"low":37.90,"open":37.90,"prev_close":37.79,
               "total_value":2.43e11,"pe_ratio":42.1,"pb_ratio":6.8,"turnover_rate":1.54,"industry":"医药"},
    "300015": {"code":"300015","name":"爱尔眼科","price":14.88,"change_pct": 0.95,"change_amount":0.14,
               "volume":1200000,"turnover":1.8e9,"high":15.10,"low":14.72,"open":14.75,"prev_close":14.74,
               "total_value":1.17e11,"pe_ratio":32.6,"pb_ratio":5.2,"turnover_rate":1.53,"industry":"医药"},
    "002415": {"code":"002415","name":"海康威视","price":28.16,"change_pct":-0.49,"change_amount":-0.14,
               "volume":2500000,"turnover":7.1e9,"high":28.60,"low":28.00,"open":28.35,"prev_close":28.30,
               "total_value":2.64e11,"pe_ratio":18.3,"pb_ratio":3.5,"turnover_rate":0.27,"industry":"电子"},
    "000651": {"code":"000651","name":"格力电器","price":35.42,"change_pct": 0.37,"change_amount":0.13,
               "volume":1600000,"turnover":5.7e9,"high":35.68,"low":35.10,"open":35.28,"prev_close":35.29,
               "total_value":2.11e11,"pe_ratio":8.9,"pb_ratio":1.8,"turnover_rate":0.27,"industry":"家电"},
    "000333": {"code":"000333","name":"美的集团","price":58.20,"change_pct": 1.08,"change_amount":0.62,
               "volume":1900000,"turnover":1.1e10,"high":58.65,"low":57.60,"open":57.60,"prev_close":57.58,
               "total_value":4.04e11,"pe_ratio":12.8,"pb_ratio":2.6,"turnover_rate":0.27,"industry":"家电"},
    "601888": {"code":"601888","name":"中国中免","price":62.50,"change_pct": 0.56,"change_amount":0.35,
               "volume":720000,"turnover":4.5e9,"high":63.10,"low":62.00,"open":62.15,"prev_close":62.15,
               "total_value":1.27e11,"pe_ratio":22.4,"pb_ratio":3.8,"turnover_rate":0.35,"industry":"零售"},
    "601012": {"code":"601012","name":"隆基绿能","price":12.35,"change_pct":-1.20,"change_amount":-0.15,
               "volume":3800000,"turnover":4.7e9,"high":12.68,"low":12.28,"open":12.52,"prev_close":12.50,
               "total_value":9.28e10,"pe_ratio":28.5,"pb_ratio":1.3,"turnover_rate":0.51,"industry":"新能源"},
    "002049": {"code":"002049","name":"紫光国微","price":62.80,"change_pct": 2.28,"change_amount":1.40,
               "volume":450000,"turnover":2.8e9,"high":63.40,"low":61.30,"open":61.50,"prev_close":61.40,
               "total_value":5.15e10,"pe_ratio":35.2,"pb_ratio":5.1,"turnover_rate":0.55,"industry":"半导体"},
    "603259": {"code":"603259","name":"药明康德","price":48.60,"change_pct":-1.42,"change_amount":-0.70,
               "volume":1100000,"turnover":5.3e9,"high":49.50,"low":48.30,"open":49.30,"prev_close":49.30,
               "total_value":2.07e11,"pe_ratio":19.8,"pb_ratio":3.2,"turnover_rate":0.26,"industry":"医药"},
    "600031": {"code":"600031","name":"三一重工","price":14.22,"change_pct": 0.85,"change_amount":0.12,
               "volume":2200000,"turnover":3.1e9,"high":14.38,"low":14.05,"open":14.10,"prev_close":14.10,
               "total_value":1.30e11,"pe_ratio":16.5,"pb_ratio":1.4,"turnover_rate":0.24,"industry":"机械"},
}

DEMO_INFO: dict[str, dict] = {
    "600519": {"listing_date":"2001-08-27","total_shares":1256197800,"float_shares":1256197800,
               "description":"贵州茅台酒股份有限公司是中国著名的蒸馏酒生产企业，主要产品为茅台酒。公司坐落于贵州省仁怀市茅台镇，品牌护城河极深，是全球市值最高的烈酒企业，也是A股白马股代表之一。茅台酒以酱香突出、幽雅细腻、酒体醇厚、回味悠长的特点享誉全球。"},
    "300750": {"listing_date":"2018-06-11","total_shares":2202427150,"float_shares":2202427150,
               "description":"宁德时代新能源科技股份有限公司是全球领先的动力电池及储能系统提供商，致力于为全球新能源应用提供一流解决方案。公司在电池材料、电芯、电池系统、电池回收等多个产业链环节拥有核心技术，全球动力电池市占率连续多年第一。"},
    "002594": {"listing_date":"2011-07-01","total_shares":2902395000,"float_shares":2741000000,
               "description":"比亚迪股份有限公司是一家以汽车、电池及电子为核心业务的高科技企业。公司在新能源汽车领域持续深耕，已形成纯电动、插电混动等多元产品矩阵，旗下拥有王朝、海洋、腾势及仰望等多个品牌，月销量稳居全球新能源汽车首位。"},
    "600036": {"listing_date":"2002-04-09","total_shares":25218999500,"float_shares":25218999500,
               "description":"招商银行股份有限公司是中国第一家完全由企业法人持股的股份制商业银行，总部位于深圳。公司以零售银行业务见长，App月活用户超1亿，在私人银行、财富管理领域具有显著竞争优势，是A股银行板块的核心标的。"},
    "688981": {"listing_date":"2020-07-16","total_shares":7547050900,"float_shares":5030000000,
               "description":"中芯国际集成电路制造有限公司是中国大陆规模最大、技术最先进的集成电路晶圆代工企业。公司可以提供从0.35微米到14纳米不同技术节点的晶圆代工与技术服务，是国产芯片替代逻辑的核心受益标的。"},
    "601318": {"listing_date":"2007-03-01","total_shares":18280241000,"float_shares":18280241000,
               "description":"中国平安保险（集团）股份有限公司是一家国际领先的综合金融服务集团，主要经营保险、银行、投资等金融业务。公司旗下平安寿险、平安银行等子公司在各自领域均具有领先地位，是A股金融蓝筹的代表企业。"},
    "000858": {"listing_date":"1998-04-27","total_shares":3876500000,"float_shares":3876500000,
               "description":"宜宾五粮液股份有限公司是中国大型白酒生产企业，主要产品五粮液以高粱、大米、糯米、小麦、玉米五种粮食酿造，是中国浓香型白酒的代表，与茅台并列中国两大顶级白酒品牌。"},
    "600900": {"listing_date":"2003-11-18","total_shares":22264000000,"float_shares":22264000000,
               "description":"长江电力股份有限公司是国内最大的水力发电上市公司，经营管理三峡、葛洲坝、溪洛渡、向家坝四座水电站，年均发电量超2500亿千瓦时，是A股最优质的现金奶牛之一，具有典型的类债券特征。"},
}

DEMO_NEWS: dict[str, list] = {
    "600519": [
        {"title":"贵州茅台一季度净利润同比增长1.47%，主营收入538亿元","source":"财联社","time":"2026-04-25 19:11","url":"","content":""},
        {"title":"茅台飞天批价近期企稳回升，渠道库存压力有所缓解","source":"证券时报","time":"2026-04-24 10:30","url":"","content":""},
        {"title":"贵州茅台宣布将于5月召开业绩说明会，机构关注度高","source":"东方财富","time":"2026-04-28 17:10","url":"","content":""},
        {"title":"外资加仓茅台，北向资金本月净买入超30亿元","source":"界面新闻","time":"2026-04-22 09:15","url":"","content":""},
        {"title":"白酒板块整体回暖，茅台引领高端消费复苏预期","source":"每日经济新闻","time":"2026-04-20 16:45","url":"","content":""},
    ],
    "300750": [
        {"title":"宁德时代固态电池量产时间表曝光，2027年将推出消费级产品","source":"财联社","time":"2026-04-27 14:22","url":"","content":""},
        {"title":"宁德时代欧洲工厂全面投产，海外市占率提升至18%","source":"证券日报","time":"2026-04-26 10:05","url":"","content":""},
        {"title":"一季度动力电池装机量：宁德时代市占率43.2%，依旧领跑","source":"高工锂电","time":"2026-04-23 09:30","url":"","content":""},
        {"title":"锂价小幅反弹引发市场关注，宁德时代成本压力或有所上升","source":"上海证券报","time":"2026-04-21 11:20","url":"","content":""},
        {"title":"宁德时代麒麟电池获多家车企采购，订单能见度提升","source":"界面新闻","time":"2026-04-18 15:40","url":"","content":""},
    ],
    "002594": [
        {"title":"比亚迪4月销量同比大增38%再创历史新高，单月超42万辆","source":"每日经济新闻","time":"2026-04-29 08:30","url":"","content":""},
        {"title":"仰望U8月销量突破3000辆，高端化战略成效显著","source":"财联社","time":"2026-04-27 16:15","url":"","content":""},
        {"title":"比亚迪泰国工厂首批汽车下线，东南亚市场战略加速落地","source":"证券时报","time":"2026-04-25 10:20","url":"","content":""},
        {"title":"比亚迪发布第五代DM技术，综合油耗2.9L/百公里创纪录","source":"汽车之家","time":"2026-04-22 14:30","url":"","content":""},
        {"title":"一季度新能源汽车渗透率超46%，比亚迪份额稳步提升","source":"中国证券报","time":"2026-04-20 09:00","url":"","content":""},
    ],
    "600036": [
        {"title":"招商银行一季报：营收同比微降，净利润增长3.1%，资产质量稳健","source":"证券日报","time":"2026-04-26 18:30","url":"","content":""},
        {"title":"招行私人银行AUM突破4.3万亿，领跑股份制银行","source":"财联社","time":"2026-04-24 11:15","url":"","content":""},
        {"title":"净息差收窄压力下，招商银行手续费收入同比增长5.2%","source":"上海证券报","time":"2026-04-22 09:45","url":"","content":""},
        {"title":"招商银行不良贷款率0.95%，继续保持股份制银行最优水平","source":"证券时报","time":"2026-04-20 16:00","url":"","content":""},
        {"title":"招行宣布年度分红方案，每股派现1.972元，股息率约5.1%","source":"界面新闻","time":"2026-04-18 10:30","url":"","content":""},
    ],
    "688981": [
        {"title":"中芯国际一季度收入环比增长7%，28nm产能利用率回升至85%","source":"财联社","time":"2026-04-25 20:15","url":"","content":""},
        {"title":"美国再度收紧对华芯片出口，中芯国际相关业务或受波及","source":"路透中文","time":"2026-04-23 08:30","url":"","content":""},
        {"title":"国内消费电子复苏带动MCU需求回暖，中芯国际受益","source":"电子工程专辑","time":"2026-04-21 14:00","url":"","content":""},
        {"title":"中芯国际北京厂二期建设进度符合预期，预计年底投产","source":"中国证券报","time":"2026-04-19 11:30","url":"","content":""},
        {"title":"国产替代加速推进，汽车芯片国内厂商份额显著提升","source":"证券时报","time":"2026-04-17 09:15","url":"","content":""},
    ],
    "default": [
        {"title":"A股市场今日震荡走强，沪指站稳3200点","source":"东方财富","time":"2026-04-28 15:30","url":"","content":""},
        {"title":"外资本月累计净买入A股超百亿，关注优质蓝筹","source":"财联社","time":"2026-04-27 16:00","url":"","content":""},
        {"title":"政策面持续发力，提振市场信心","source":"证券时报","time":"2026-04-26 10:00","url":"","content":""},
        {"title":"机构密集调研上市公司，看好中长期配置价值","source":"中国证券报","time":"2026-04-25 09:30","url":"","content":""},
    ],
}


def _generate_history(code: str, days: int) -> list[dict]:
    """生成合成历史价格数据（用于 Vercel / AKShare 不可用时）。"""
    base_price = DEMO_PRICES.get(code, {}).get("price", 100.0)
    rng = random.Random(f"{code}-{days}")   # 固定种子，让同一股票每次结果一致

    # 从 base_price * 0.88 开始，随机游走到 base_price
    start = base_price * 0.88
    result = []
    today = datetime.date.today()
    price = start
    trading_days = []

    # 向前回溯足够多的日历日，收集 days 个交易日（跳过周末）
    offset = 1
    while len(trading_days) < days:
        d = today - datetime.timedelta(days=offset)
        if d.weekday() < 5:
            trading_days.append(d)
        offset += 1
    trading_days.reverse()

    # 让价格平滑上升/下降到 base_price
    prices_arr = []
    for i in range(days):
        pct = rng.uniform(-0.022, 0.025)
        # 轻微向目标价格漂移
        drift = (base_price - price) / max(days - i, 1) * 0.15
        price = price * (1 + pct) + drift
        prices_arr.append(price)

    # 最后一价强制对齐 base_price
    if prices_arr:
        scale = base_price / prices_arr[-1]
        prices_arr = [p * scale for p in prices_arr]

    for i, (d, close) in enumerate(zip(trading_days, prices_arr)):
        open_p  = close * (1 + rng.uniform(-0.008, 0.008))
        high    = max(close, open_p) * (1 + rng.uniform(0, 0.012))
        low     = min(close, open_p) * (1 - rng.uniform(0, 0.012))
        prev    = prices_arr[i - 1] if i > 0 else close
        chg_pct = (close - prev) / prev * 100 if prev else 0
        result.append({
            "date":       d.strftime("%Y-%m-%d"),
            "open":       round(open_p, 2),
            "close":      round(close, 2),
            "high":       round(high, 2),
            "low":        round(low, 2),
            "volume":     rng.randint(100_000, 2_000_000),
            "turnover":   rng.randint(1_000_000, 80_000_000),
            "change_pct": round(chg_pct, 2),
        })
    return result


# ── 公共 API ──────────────────────────────────────────────────────────────────

async def search_stocks(query: str) -> list[dict]:
    if IS_VERCEL or not HAS_AKSHARE:
        return _search_demo(query)
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _search_stocks_sync, query)


def _search_demo(query: str) -> list[dict]:
    query = query.strip()
    qu = query.upper()
    results = []
    for code, stock in DEMO_PRICES.items():
        if (qu in code or
                query in stock["name"] or
                query in stock.get("industry", "")):
            results.append(dict(stock))
        if len(results) >= 20:
            break
    return results


def _search_stocks_sync(query: str) -> list[dict]:
    query = query.strip().upper()
    snapshot = _get_market_snapshot()
    results = []
    for code, stock in snapshot.items():
        name = stock["name"]
        if query in code or query in name or query.lower() in name.lower():
            results.append(stock)
        if len(results) >= 20:
            break
    if len(results) < 5:
        try:
            import akshare as ak
            industry_df = ak.stock_board_industry_name_em()
            matching = [r["板块名称"] for _, r in industry_df.iterrows() if query in str(r["板块名称"])]
            for industry in matching[:3]:
                try:
                    cons_df = ak.stock_board_industry_cons_em(symbol=industry)
                    for _, row in cons_df.iterrows():
                        code = str(row.get("代码", "")).zfill(6)
                        if code in snapshot:
                            s = dict(snapshot[code])
                            s["industry"] = industry
                            if not any(r["code"] == code for r in results):
                                results.append(s)
                        if len(results) >= 20:
                            break
                except Exception:
                    pass
        except Exception:
            pass
    return results[:20]


async def get_realtime_quote(code: str) -> dict | None:
    with _cache_lock:
        if code in _realtime_cache:
            return _realtime_cache[code]
    if IS_VERCEL or not HAS_AKSHARE:
        return DEMO_PRICES.get(code)
    snapshot = _get_market_snapshot()
    result = snapshot.get(code) or DEMO_PRICES.get(code)
    if result:
        with _cache_lock:
            _realtime_cache[code] = result
    return result


async def get_realtime_quotes(codes: list[str]) -> dict[str, dict]:
    if IS_VERCEL or not HAS_AKSHARE:
        return {c: DEMO_PRICES[c] for c in codes if c in DEMO_PRICES}
    snapshot = _get_market_snapshot()
    result = {}
    for c in codes:
        if c in snapshot:
            result[c] = snapshot[c]
        elif c in DEMO_PRICES:
            result[c] = DEMO_PRICES[c]
    return result


async def get_stock_info(code: str) -> dict | None:
    with _cache_lock:
        if code in _info_cache:
            return _info_cache[code]
    if IS_VERCEL or not HAS_AKSHARE:
        result = _build_demo_info(code)
    else:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _get_stock_info_sync, code)
    if result:
        with _cache_lock:
            _info_cache[code] = result
    return result


def _build_demo_info(code: str) -> dict | None:
    base = DEMO_PRICES.get(code)
    if not base:
        return None
    extra = DEMO_INFO.get(code, {})
    return {**base, **extra}


def _get_stock_info_sync(code: str) -> dict | None:
    try:
        import akshare as ak
        df = ak.stock_individual_info_em(symbol=code)
        info = {}
        for _, row in df.iterrows():
            info[row.iloc[0]] = row.iloc[1]
        snapshot = _get_market_snapshot()
        base = snapshot.get(code) or DEMO_PRICES.get(code) or {}
        result = {
            "code": code,
            "name": info.get("股票简称", base.get("name", "")),
            "industry": info.get("行业", base.get("industry", "")),
            "listing_date": str(info.get("上市时间", "")),
            "total_shares": float(str(info.get("总股本", "0")).replace(",", "") or 0),
            "float_shares": float(str(info.get("流通股", "0")).replace(",", "") or 0),
            "description": str(info.get("公司简介", "")),
            **base,
        }
        if not result.get("description") and code in DEMO_INFO:
            result["description"] = DEMO_INFO[code].get("description", "")
        return result
    except Exception as e:
        print(f"Stock info error {code}: {e}")
        return _build_demo_info(code)


async def get_stock_history(code: str, days: int = 30) -> list[dict]:
    key = f"{code}_{days}"
    with _cache_lock:
        if key in _history_cache:
            return _history_cache[key]
    if IS_VERCEL or not HAS_AKSHARE:
        result = _generate_history(code, days)
    else:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _get_history_sync, code, days)
    with _cache_lock:
        _history_cache[key] = result
    return result


def _get_history_sync(code: str, days: int) -> list[dict]:
    try:
        import akshare as ak
        df = ak.stock_zh_a_hist(symbol=code, period="daily", adjust="qfq")
        df = df.tail(days)
        result = []
        for _, row in df.iterrows():
            result.append({
                "date":       str(row.get("日期", "")),
                "open":       float(row.get("开盘", 0) or 0),
                "close":      float(row.get("收盘", 0) or 0),
                "high":       float(row.get("最高", 0) or 0),
                "low":        float(row.get("最低", 0) or 0),
                "volume":     float(row.get("成交量", 0) or 0),
                "turnover":   float(row.get("成交额", 0) or 0),
                "change_pct": float(row.get("涨跌幅", 0) or 0),
            })
        return result
    except Exception as e:
        print(f"History error {code}: {e}")
        return _generate_history(code, days)


async def get_stock_news(code: str) -> list[dict]:
    with _cache_lock:
        if code in _news_cache:
            return _news_cache[code]
    if IS_VERCEL or not HAS_AKSHARE:
        result = DEMO_NEWS.get(code, DEMO_NEWS["default"])
    else:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _get_news_sync, code)
    with _cache_lock:
        _news_cache[code] = result
    return result


def _get_news_sync(code: str) -> list[dict]:
    try:
        import akshare as ak
        df = ak.stock_news_em(symbol=code)
        result = []
        for _, row in df.head(20).iterrows():
            result.append({
                "title":   str(row.get("新闻标题", "")),
                "source":  str(row.get("新闻来源", "")),
                "time":    str(row.get("发布时间", "")),
                "url":     str(row.get("新闻链接", "")),
                "content": str(row.get("新闻内容", ""))[:300],
            })
        return result or DEMO_NEWS.get(code, DEMO_NEWS["default"])
    except Exception as e:
        print(f"News error {code}: {e}")
        return DEMO_NEWS.get(code, DEMO_NEWS["default"])


async def get_industries() -> list[str]:
    if IS_VERCEL or not HAS_AKSHARE:
        industries = sorted({v.get("industry", "") for v in DEMO_PRICES.values() if v.get("industry")})
        return industries
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _get_industries_sync)


def _get_industries_sync() -> list[str]:
    try:
        import akshare as ak
        df = ak.stock_board_industry_name_em()
        return [str(row["板块名称"]) for _, row in df.iterrows()]
    except Exception as e:
        print(f"Industries error: {e}")
        return []


# ── AKShare 市场快照（仅本地模式使用） ────────────────────────────────────────
def _get_market_snapshot() -> dict:
    global _market_snapshot, _snapshot_time
    if IS_VERCEL or not HAS_AKSHARE:
        return DEMO_PRICES
    now = datetime.datetime.now()
    with _snapshot_lock:
        if _snapshot_time is None or (now - _snapshot_time).seconds > 60:
            try:
                import akshare as ak
                df = ak.stock_zh_a_spot_em()
                snapshot = {}
                for _, row in df.iterrows():
                    code = str(row.get("代码", "")).zfill(6)
                    snapshot[code] = {
                        "code": code,
                        "name": str(row.get("名称", "")),
                        "price": float(row.get("最新价", 0) or 0),
                        "change_pct": float(row.get("涨跌幅", 0) or 0),
                        "change_amount": float(row.get("涨跌额", 0) or 0),
                        "volume": float(row.get("成交量", 0) or 0),
                        "turnover": float(row.get("成交额", 0) or 0),
                        "high": float(row.get("最高", 0) or 0),
                        "low": float(row.get("最低", 0) or 0),
                        "open": float(row.get("今开", 0) or 0),
                        "prev_close": float(row.get("昨收", 0) or 0),
                        "total_value": float(row.get("总市值", 0) or 0),
                        "pe_ratio": float(row.get("市盈率-动态", 0) or 0),
                        "pb_ratio": float(row.get("市净率", 0) or 0),
                        "turnover_rate": float(row.get("换手率", 0) or 0),
                    }
                _market_snapshot = snapshot
                _snapshot_time = now
            except Exception as e:
                print(f"Market snapshot error: {e}")
                if not _market_snapshot:
                    _market_snapshot = dict(DEMO_PRICES)
                    _snapshot_time = now
        return _market_snapshot
