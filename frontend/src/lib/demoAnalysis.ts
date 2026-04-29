// 股票分析演示数据 — 五维度分析（行业/经营/行情/舆情/环境）
// 评级：极佳(95) / 佳(80) / 良好(65) / 一般(50) / 差(35) / 极差(20)

export type Rating = '极佳' | '佳' | '良好' | '一般' | '差' | '极差'

export const RATING_SCORE: Record<Rating, number> = {
  '极佳': 95, '佳': 80, '良好': 65, '一般': 50, '差': 35, '极差': 20
}

export const RATING_COLOR: Record<Rating, string> = {
  '极佳': '#10B981',
  '佳':   '#22C55E',
  '良好': '#84CC16',
  '一般': '#F59E0B',
  '差':   '#F97316',
  '极差': '#EF4444',
}

export interface DimensionAnalysis {
  rating: Rating
  summary: string
  highlights: string[]
}

export interface StockAnalysis {
  code: string
  name: string
  current_price: number
  industry: DimensionAnalysis
  business: DimensionAnalysis
  market: DimensionAnalysis
  sentiment: DimensionAnalysis
  environment: DimensionAnalysis
  overall: { rating: Rating; suggestion: string }
}

export const STOCK_NAME_TO_CODE: Record<string, string> = {
  '贵州茅台': '600519', '茅台': '600519',
  '宁德时代': '300750', '宁德': '300750',
  '比亚迪':   '002594', 'BYD': '002594',
  '招商银行': '600036', '招行': '600036',
  '中芯国际': '688981', '中芯': '688981',
  '中国平安': '601318', '平安': '601318',
  '五粮液':   '000858',
  '长江电力': '600900', '长电': '600900',
}

export const STOCK_PRICES: Record<string, { name: string; price: number }> = {
  '600519': { name: '贵州茅台', price: 1628.00 },
  '300750': { name: '宁德时代', price:  212.80 },
  '002594': { name: '比亚迪',   price:  368.50 },
  '600036': { name: '招商银行', price:   38.62 },
  '688981': { name: '中芯国际', price:   51.30 },
  '601318': { name: '中国平安', price:   46.82 },
  '000858': { name: '五粮液',   price:  102.50 },
  '600900': { name: '长江电力', price:   29.85 },
}

export const ANALYSIS_DATA: Record<string, StockAnalysis> = {
  '600519': {
    code: '600519', name: '贵州茅台', current_price: 1628.00,
    industry: { rating: '佳', summary: '白酒行业整体进入存量竞争，但高端市场依然稳健。',
      highlights: ['高端白酒消费基本盘扎实，节假日动销良好','行业集中度提升，头部品牌优势放大','年轻人喝白酒少，长期需求有隐忧'] },
    business: { rating: '极佳', summary: '业绩稳如老狗，赚钱能力国内股市天花板。',
      highlights: ['净利润率超过 50%，每卖 100 元赚 50 多','现金多到花不完，没有负债压力','品牌护城河极深，几十年都难被超越'] },
    market: { rating: '良好', summary: '股价从高点回调后已进入合理区间，波动较小。',
      highlights: ['股价相对平稳，不会大涨大跌','机构持仓比例高，散户跟着喝汤','当前估值在历史中等偏低水平'] },
    sentiment: { rating: '佳', summary: '市场对茅台普遍认可，是公认的"硬通货"。',
      highlights: ['财经媒体长期看好，被誉为"股王"','社交平台上也是高曝光的明星股','偶尔会因白酒价格波动产生短期争议'] },
    environment: { rating: '佳', summary: '贵州省政策稳定，茅台是当地名片。',
      highlights: ['总部贵州遵义，地方政府全力支持','中国政治社会环境稳定，无战争风险','消费税政策变化是潜在风险点'] },
    overall: { rating: '佳', suggestion: '茅台是 A 股的"压舱石"，适合长期持有不折腾。如果你预算够（一手 16 万多），可以买一点放着不管。但记住：贵不一定就稳赚，重仓单一股票是大忌。' },
  },
  '300750': {
    code: '300750', name: '宁德时代', current_price: 212.80,
    industry: { rating: '佳', summary: '新能源电池是未来 10 年的大方向，市场还在扩大。',
      highlights: ['全球电动车渗透率持续提升','储能市场刚刚起步，前景广阔','行业内卷严重，价格战压低利润'] },
    business: { rating: '佳', summary: '全球电池销量第一，技术领先但在被追赶。',
      highlights: ['全球市占率超过 35%，断层式领先','研发投入每年超 200 亿，技术储备深','受锂价波动和价格战影响，毛利率承压'] },
    market: { rating: '良好', summary: '股价从 2021 年高点跌了一半多，现在估值合理。',
      highlights: ['当前股价处于近 3 年中等位置','机构在分批加仓，但散户情绪偏谨慎','日内波动较大，不适合短期追涨'] },
    sentiment: { rating: '良好', summary: '市场看好长期前景，但短期争议不少。',
      highlights: ['主流财经媒体长期看多','"产能过剩"和"内卷"是常见负面声音','海外扩张进展是市场情绪主要驱动'] },
    environment: { rating: '良好', summary: '总部福建宁德，国家把新能源当作战略产业。',
      highlights: ['国家政策大力扶持新能源','中欧贸易摩擦是潜在风险','社会环境稳定，营商环境良好'] },
    overall: { rating: '佳', suggestion: '宁德时代是新能源行业的"老大"，长期看好但短期波动大。建议分批买入，不要一次性梭哈。如果新能源车继续普及，未来几年大概率有不错收益，但要做好持有 2-3 年的准备。' },
  },
  '002594': {
    code: '002594', name: '比亚迪', current_price: 368.50,
    industry: { rating: '极佳', summary: '中国新能源汽车正在改变全球格局，比亚迪是头号选手。',
      highlights: ['中国新能源车销量全球第一','出海正在加速，欧洲东南亚都在卖','行业竞争激烈，毛利空间被压缩'] },
    business: { rating: '极佳', summary: '从电池到整车全产业链自己做，盈利能力越来越强。',
      highlights: ['月销量频频破纪录，已超百万辆','高端品牌"仰望"打开新市场','研发团队超过 10 万人，技术创新活跃'] },
    market: { rating: '佳', summary: '股价从底部反弹明显，市场关注度极高。',
      highlights: ['近半年股价表现强势，跑赢大盘','成交活跃，日均换手率高','估值已不算便宜，需警惕回调'] },
    sentiment: { rating: '极佳', summary: '舆论几乎一边倒看好，被誉为"国货之光"。',
      highlights: ['销量数据屡超预期，媒体争相报道','社交平台上口碑极佳','偶有"价格战"质疑声'] },
    environment: { rating: '佳', summary: '总部深圳，是国家重点扶持的新能源企业。',
      highlights: ['深圳营商环境全国领先','出口面临部分国家关税壁垒','中国制造业整体环境稳定'] },
    overall: { rating: '极佳', suggestion: '比亚迪现在势头正猛，是新能源车的中国名片。但股价已经涨了不少，建议不要追高，可以等回调时买入。一手 3.6 万多，预算合适的话可以配一些，但同样不要重仓。' },
  },
  '600036': {
    code: '600036', name: '招商银行', current_price: 38.62,
    industry: { rating: '一般', summary: '银行业整体增长放缓，但仍是经济的重要基石。',
      highlights: ['利率下行让银行赚钱变难','房地产风险还没完全出清','银行股股息高，是稳健投资者最爱'] },
    business: { rating: '佳', summary: '国内零售银行的"优等生"，资产质量是同行最好。',
      highlights: ['坏账率行业最低，风控做得好','零售客户超 1.9 亿，财富管理是王牌','净息差略有下降，但仍是同行领先'] },
    market: { rating: '良好', summary: '股价波动小，分红稳定，适合不折腾的投资者。',
      highlights: ['股息率约 5%，相当于"稳定收益"','股价波动小，不会大起大落','机构和保险资金长期持有'] },
    sentiment: { rating: '良好', summary: '市场公认的"招行不会暴雷"，口碑稳定。',
      highlights: ['"零售之王"地位深入人心','分红稳定吸引长线资金','偶尔有房贷风险讨论'] },
    environment: { rating: '佳', summary: '总部深圳，受国家金融监管严格保护。',
      highlights: ['深圳金融监管完善','银行业是国家重点保护行业','国内政治社会稳定'] },
    overall: { rating: '良好', suggestion: '招商银行就像一只"会下蛋的母鸡"——每年稳定给你分红。一手只要 3800 多，门槛低。适合不想折腾、追求稳定收益的新手。但银行股涨幅一般不大，别期待暴富。' },
  },
  '688981': {
    code: '688981', name: '中芯国际', current_price: 51.30,
    industry: { rating: '良好', summary: '芯片是国家战略，长期机会大但短期挑战多。',
      highlights: ['国产芯片替代是大方向','受美国出口管制影响明显','全球半导体周期波动较大'] },
    business: { rating: '一般', summary: '国内最大的芯片代工厂，但赚钱能力一般。',
      highlights: ['产能利用率受外部因素影响','研发投入大，但短期利润压力','设备进口受限制约先进制程'] },
    market: { rating: '一般', summary: '股价波动大，受政策和国际事件影响明显。',
      highlights: ['一有美国制裁消息就大跌','机构持仓不算稳定','估值偏高，对业绩预期消化不充分'] },
    sentiment: { rating: '一般', summary: '关注度高，但负面新闻也多。',
      highlights: ['"国产替代"概念被反复炒作','美国制裁消息频频造成情绪波动','科技博主讨论较多但分歧大'] },
    environment: { rating: '一般', summary: '受地缘政治影响最大的股票之一。',
      highlights: ['中美关系紧张是最大不确定性','上海总部环境稳定','国家政策大力支持但收效需时间'] },
    overall: { rating: '一般', suggestion: '中芯国际是"政策敏感型"股票，涨跌都很猛。新手不建议碰，因为风险不可控——一条新闻就可能让股价暴跌 10%。如果你坚信"国产替代"且能承受波动，可以小仓位玩玩。' },
  },
  '601318': {
    code: '601318', name: '中国平安', current_price: 46.82,
    industry: { rating: '良好', summary: '保险行业有压力但长期需求会增长。',
      highlights: ['中国老龄化推动保险需求','利率下行影响保险公司投资收益','互联网保险冲击传统模式'] },
    business: { rating: '良好', summary: '国内保险业的"巨无霸"，业务多元。',
      highlights: ['寿险、产险、银行、医疗都做','寿险改革见效，新业务在恢复','地产投资带来一定包袱'] },
    market: { rating: '良好', summary: '估值低、股息高，但股价多年没大涨过。',
      highlights: ['当前估值在历史最低区间','股息率约 6%，比存款利息高','股价已经"躺平"很久，缺乏催化'] },
    sentiment: { rating: '一般', summary: '舆情比较平淡，市场关注度不高。',
      highlights: ['财经媒体认为"低估值有安全边际"','社交平台讨论度不高','偶有地产投资敞口的担忧'] },
    environment: { rating: '佳', summary: '深圳总部，金融牌照齐全，监管严格。',
      highlights: ['保险业是国家重点监管行业','深圳金融环境完善','中国国内政治稳定'] },
    overall: { rating: '良好', suggestion: '平安就像一个"高股息的存钱罐"——便宜、稳定、分红多。一手才 4600 多。适合追求稳定的保守型投资者，但别指望它快速翻倍——它已经横盘好几年了。' },
  },
  '000858': {
    code: '000858', name: '五粮液', current_price: 102.50,
    industry: { rating: '佳', summary: '高端白酒整体稳健，五粮液是行业第二把交椅。',
      highlights: ['高端白酒消费基本盘稳定','商务宴请场景持续恢复','与茅台的差距是长期挑战'] },
    business: { rating: '佳', summary: '业绩稳定增长，渠道改革见效明显。',
      highlights: ['净利润率超过 30%，盈利能力强','渠道库存已基本消化','高端化战略稳步推进'] },
    market: { rating: '良好', summary: '股价从高位回调后，估值修复机会显现。',
      highlights: ['当前估值低于历史平均','相对茅台有一定折价','机构调研频次明显增加'] },
    sentiment: { rating: '佳', summary: '市场对五粮液重新关注，舆情转向积极。',
      highlights: ['渠道改善被广泛报道','机构观点偏正面','偶有"老二难超越老大"的讨论'] },
    environment: { rating: '佳', summary: '总部四川宜宾，地方支持力度大。',
      highlights: ['四川是白酒主产区','地方政府对国企支持','消费税政策是潜在风险'] },
    overall: { rating: '佳', suggestion: '五粮液是"低配版茅台"——同样优秀但便宜不少。一手 1 万出头，门槛比茅台低多了。适合喜欢白酒板块但买不起茅台的投资者。长期持有大概率不会亏。' },
  },
  '600900': {
    code: '600900', name: '长江电力', current_price: 29.85,
    industry: { rating: '佳', summary: '水电是清洁能源中最稳定的，"印钞机"行业。',
      highlights: ['碳中和政策长期利好水电','水电成本最低，盈利稳定','受来水量影响，年际有波动'] },
    business: { rating: '极佳', summary: '业绩稳得离谱，每年现金流像自来水。',
      highlights: ['净利润率超过 40%','现金流强劲，分红极其慷慨','运营模式简单稳定，几乎没风险'] },
    market: { rating: '佳', summary: '股价稳步上涨多年，近期表现强势。',
      highlights: ['近 3 年股价稳步上涨','波动小，险资和长线资金持有','估值有所提升但不算贵'] },
    sentiment: { rating: '良好', summary: '市场口碑稳定，被称为"债券型股票"。',
      highlights: ['财经媒体长期看好','险资保险资金重点配置','关注度不高但口碑极好'] },
    environment: { rating: '佳', summary: '湖北总部，三峡工程是国家级工程。',
      highlights: ['国家重点保护的能源资产','中国西部水电资源丰富','极端气候是潜在风险'] },
    overall: { rating: '佳', suggestion: '长江电力是"睡得着觉"的股票——业绩稳定、分红丰厚、几乎不会暴雷。一手不到 3000 块，新手友好。适合不想看盘、追求长期稳定收益的投资者。买了基本可以躺平。' },
  },
}
