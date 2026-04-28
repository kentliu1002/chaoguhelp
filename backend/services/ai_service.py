import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()

_client: anthropic.Anthropic | None = None

# ── Demo / mock 数据（无需 API Key 也能展示） ─────────────────────────────────
DEMO_RECOMMENDATIONS: dict[str, dict] = {
    "600519": {"action": "继续持有", "reason": "贵州茅台作为白酒行业绝对龙头，品牌护城河深厚，高端消费虽短期承压但长期逻辑不变。目前估值处于历史中枢偏低区间，适合长期持有。", "risk": "消费复苏节奏不及预期可能导致短期业绩波动，建议不要重仓单一标的。", "confidence": "高"},
    "300750": {"action": "适量买入", "reason": "宁德时代在动力电池领域市占率持续提升，固态电池研发进展顺利。股价已从高点大幅回调，估值趋于合理，可分批逢低布局。", "risk": "锂价波动、海外竞争加剧及补贴退坡仍是主要风险，建议控制仓位在15%以内。", "confidence": "中"},
    "002594": {"action": "适量买入", "reason": "比亚迪新能源汽车月销量持续创新高，出海战略加速推进。当前PE估值约20倍，处于历史低位，具备较好的安全边际。", "risk": "价格战加剧可能压缩毛利率，新兴市场关税风险需关注，建议分批建仓。", "confidence": "高"},
    "600036": {"action": "继续持有", "reason": "招商银行零售业务护城河坚固，资产质量在股份制银行中表现最优，股息率约5%提供良好的安全垫，适合稳健型投资者持有。", "risk": "房地产敞口及经济下行可能带来不良贷款压力，注意分散配置。", "confidence": "高"},
    "688981": {"action": "适量减持", "reason": "中芯国际受出口限制影响成熟制程产能利用率承压，短期业绩增长不确定性较大。可逢高减持部分仓位，等待更明确的政策信号。", "risk": "地缘政治风险持续，设备进口受限可能影响先进制程进度，风险偏好较低者建议减持。", "confidence": "中"},
    "601318": {"action": "继续持有", "reason": "中国平安综合金融生态持续发展，寿险改革成效逐步显现。低估值高股息特性使其具备良好防御价值，适合作为底仓配置。", "risk": "利率下行周期对险资投资收益有压力，地产信用风险敞口需持续关注。", "confidence": "中"},
    "000858": {"action": "适量买入", "reason": "五粮液作为高端白酒第二梯队龙头，品牌价值持续提升，渠道库存已基本消化。当前估值相较茅台有一定折价，存在补涨空间。", "risk": "消费信心恢复需要时间，渠道价格倒挂问题尚未完全解决。", "confidence": "中"},
    "600900": {"action": "继续持有", "reason": "长江电力是优质水电资产，业绩高度稳定，股息率约4%，具有典型的类债券特征。在利率下行环境中防御价值突出，适合长期持有。", "risk": "来水量不足可能影响年度发电量，但长期业绩波动极小，风险极低。", "confidence": "高"},
}

DEMO_SENTIMENTS: dict[str, dict] = {
    "600519": {"score": 78, "label": "积极", "positive": ["茅台飞天批价企稳回升", "免税渠道扩容预期升温", "机构持仓比例创近年新高"], "negative": ["高端消费整体复苏偏慢", "部分渠道库存仍有积压"], "summary": "贵州茅台近期市场情绪偏积极，批价企稳和机构加仓是主要正面驱动。消费复苏节奏仍是核心观察指标，整体舆情向好。"},
    "300750": {"score": 62, "label": "积极", "positive": ["固态电池专利申请数量领先", "欧洲市场份额持续扩大", "一季度出货量超预期"], "negative": ["锂价反弹增加成本压力", "国内价格战尚未结束"], "summary": "宁德时代舆情整体偏正面，技术领先优势和海外扩张是市场关注焦点。短期锂价波动带来一定噪音，但不影响长期逻辑。"},
    "002594": {"score": 82, "label": "非常积极", "positive": ["4月销量同比增长38%创历史新高", "仰望品牌高端化战略获认可", "出海泰国墨西哥工厂顺利推进"], "negative": ["A股竞争格局加剧", "海外关税政策仍有不确定性"], "summary": "比亚迪舆情非常积极，销量数据的持续超预期是最大正面催化剂。全球化布局进展顺利，市场对其长期成长性预期高涨。"},
    "600036": {"score": 65, "label": "积极", "positive": ["零售客户资产规模再创新高", "股息率吸引长线资金", "不良率保持行业最优"], "negative": ["净息差收窄压力持续", "房贷提前还款仍较活跃"], "summary": "招商银行整体舆情稳健偏积极，高质量零售资产和稳定分红是市场认可的核心价值。利率下行周期的负面影响已基本被市场定价。"},
    "688981": {"score": 44, "label": "中性", "positive": ["成熟制程国产替代需求旺盛", "28nm产能利用率有所回升"], "negative": ["先进制程设备受限进展缓慢", "美国出口管制升级风险犹存", "部分客户订单有所推迟"], "summary": "中芯国际舆情偏中性，短期受制于地缘政治压力，出口管制是悬在头上的达摩克利斯之剑。国产替代长期逻辑依然成立，但需要更多政策明朗化信号。"},
    "601318": {"score": 60, "label": "积极", "positive": ["寿险新业务价值增速转正", "综合金融协同效应显现"], "negative": ["投资收益率承压", "地产风险敞口仍受关注"], "summary": "中国平安舆情趋于平稳，寿险改革成果逐步兑现带来正面预期。低估值和高股息是当前市场最主要的持有理由。"},
    "000858": {"score": 70, "label": "积极", "positive": ["渠道库存去化明显", "普五出厂价维稳信号明确", "机构调研频次明显增加"], "negative": ["与茅台品牌差距短期难以弥合"], "summary": "五粮液舆情改善明显，渠道端的积极变化是近期行情的核心驱动力，市场预期其估值折价有望逐步收窄。"},
    "600900": {"score": 73, "label": "积极", "positive": ["来水好于去年同期", "股息率吸引力凸显", "碳中和政策长期利好水电"], "negative": ["极端气候导致来水不确定性"], "summary": "长江电力舆情稳定积极，作为优质水电资产在低利率环境中的防御价值被市场广泛认可。稳健的股息政策持续吸引险资等长线资金。"},
}

_FALLBACK_REC = {
    "action": "继续持有",
    "reason": "当前市场数据分析服务暂时不可用，建议保持观望，等待更明朗的市场信号。",
    "risk": "股市有风险，投资需谨慎，请勿重仓单一股票。",
    "confidence": "低",
}
_FALLBACK_SENT = {
    "score": 50, "label": "中性",
    "positive": [], "negative": [],
    "summary": "舆情分析服务暂时不可用，请稍后再试。",
}
# ─────────────────────────────────────────────────────────────────────────────


def get_client() -> anthropic.Anthropic | None:
    global _client
    key = os.getenv("ANTHROPIC_API_KEY", "")
    if not key:
        return None
    if _client is None:
        _client = anthropic.Anthropic(api_key=key)
    return _client


async def get_recommendation(
    stock_info: dict,
    history: list[dict],
    news: list[dict],
    portfolio_item: dict | None = None,
) -> dict:
    code = stock_info.get("code", "")

    # Demo 模式：直接返回预设数据
    client = get_client()
    if client is None:
        return DEMO_RECOMMENDATIONS.get(code, _FALLBACK_REC)

    name = stock_info.get("name", "")
    price = stock_info.get("price", 0)
    change_pct = stock_info.get("change_pct", 0)
    pe_ratio = stock_info.get("pe_ratio", 0)
    pb_ratio = stock_info.get("pb_ratio", 0)
    industry = stock_info.get("industry", "")
    total_value = stock_info.get("total_value", 0)

    if history:
        recent = history[-5:]
        closes = [h["close"] for h in recent]
        trend = "上涨" if closes[-1] > closes[0] else "下跌"
        price_5d_change = ((closes[-1] - closes[0]) / closes[0] * 100) if closes[0] else 0
    else:
        trend = "未知"
        price_5d_change = 0

    news_titles = "\n".join([f"- {n['title']}" for n in news[:10]]) if news else "暂无新闻"

    portfolio_context = ""
    if portfolio_item:
        buy_price = portfolio_item.get("buy_price", 0)
        quantity = portfolio_item.get("quantity", 0)
        profit_pct = ((price - buy_price) / buy_price * 100) if buy_price else 0
        portfolio_context = f"\n用户持仓信息：\n- 买入价格：{buy_price:.2f} 元\n- 持有数量：{quantity} 股\n- 当前盈亏：{profit_pct:.2f}%\n"

    prompt = f"""你是一位专业的A股分析师，正在为一位刚入门的新手投资者（以女性用户为主）提供投资建议。
请用简单易懂的语言，给出以下股票的操作建议。

股票信息：
- 名称：{name}（{code}）
- 所属行业：{industry}
- 当前价格：{price:.2f} 元
- 今日涨跌：{change_pct:+.2f}%
- 市盈率（PE）：{pe_ratio:.2f}
- 市净率（PB）：{pb_ratio:.2f}
- 总市值：{total_value/1e8:.2f} 亿元
- 近5日走势：{trend}，变化 {price_5d_change:+.2f}%
{portfolio_context}
近期相关新闻：
{news_titles}

请给出：
1. 操作建议（从以下选择一个：强烈买入 / 适量买入 / 继续持有 / 适量减持 / 及时卖出）
2. 建议理由（2-3句话，用新手能理解的语言）
3. 风险提示（1-2句话）
4. 置信度（高/中/低）

请用JSON格式回复，字段：action、reason、risk、confidence。只返回JSON。"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"AI recommendation error: {e}")
        return DEMO_RECOMMENDATIONS.get(code, _FALLBACK_REC)


async def get_sentiment(stock_info: dict, news: list[dict]) -> dict:
    code = stock_info.get("code", "")
    name = stock_info.get("name", "")
    industry = stock_info.get("industry", "")

    client = get_client()
    if client is None:
        return DEMO_SENTIMENTS.get(code, _FALLBACK_SENT)

    if not news:
        return DEMO_SENTIMENTS.get(code, {
            "score": 50, "label": "中性", "positive": [], "negative": [],
            "summary": f"{name}近期暂无相关新闻，市场舆情数据不足，建议关注后续消息。",
        })

    news_text = "\n".join([
        f"[{n.get('time', '')}] {n.get('source', '')}：{n['title']}"
        for n in news[:15]
    ])

    prompt = f"""分析以下关于{name}（{code}，{industry}行业）的新闻舆情。

新闻列表：
{news_text}

请分析并返回JSON格式：
- score：舆情评分（0-100，50为中性，越高越积极）
- label：评价标签（非常积极/积极/中性/消极/非常消极）
- positive：正面信息列表（最多3条，每条10-20字）
- negative：负面信息列表（最多3条，每条10-20字）
- summary：综合评价（2句话，通俗易懂）

只返回JSON，不要其他内容。"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=400,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"Sentiment error: {e}")
        return DEMO_SENTIMENTS.get(code, _FALLBACK_SENT)
