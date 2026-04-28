"""演示数据种子接口 — 仅用于 demo / 测试"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete
from database import get_db
from models import Watchlist, Portfolio

router = APIRouter(prefix="/api/seed", tags=["seed"])

WATCHLIST_DEMO = [
    {"code": "600519", "name": "贵州茅台", "industry": "食品饮料"},
    {"code": "300750", "name": "宁德时代", "industry": "新能源"},
    {"code": "002594", "name": "比亚迪",   "industry": "汽车"},
    {"code": "600036", "name": "招商银行", "industry": "银行"},
    {"code": "688981", "name": "中芯国际", "industry": "半导体"},
    {"code": "601318", "name": "中国平安", "industry": "保险"},
    {"code": "000858", "name": "五粮液",   "industry": "食品饮料"},
    {"code": "600900", "name": "长江电力", "industry": "电力"},
]

PORTFOLIO_DEMO = [
    {"code": "600519", "name": "贵州茅台", "buy_price": 1488.00, "quantity": 100,
     "buy_date": "2024-03-15", "note": "白酒龙头，长期持有"},
    {"code": "300750", "name": "宁德时代", "buy_price": 198.50, "quantity": 300,
     "buy_date": "2024-06-20", "note": "新能源赛道，看好未来"},
    {"code": "002594", "name": "比亚迪",   "buy_price": 242.00, "quantity": 200,
     "buy_date": "2024-08-10", "note": "新能源汽车高增长"},
    {"code": "600036", "name": "招商银行", "buy_price": 32.80,  "quantity": 1000,
     "buy_date": "2024-10-05", "note": "股息稳定，防御配置"},
    {"code": "688981", "name": "中芯国际", "buy_price": 58.20,  "quantity": 500,
     "buy_date": "2025-01-08", "note": "国产芯片替代逻辑"},
]


@router.post("")
async def seed(db: AsyncSession = Depends(get_db)):
    # 清空旧数据
    await db.execute(delete(Watchlist))
    await db.execute(delete(Portfolio))

    # 写入自选股
    for item in WATCHLIST_DEMO:
        db.add(Watchlist(**item))

    # 写入持仓
    for item in PORTFOLIO_DEMO:
        db.add(Portfolio(**item))

    await db.commit()
    return {
        "success": True,
        "watchlist": len(WATCHLIST_DEMO),
        "portfolio": len(PORTFOLIO_DEMO),
    }


@router.delete("")
async def clear(db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Watchlist))
    await db.execute(delete(Portfolio))
    await db.commit()
    return {"success": True, "message": "已清空所有演示数据"}
