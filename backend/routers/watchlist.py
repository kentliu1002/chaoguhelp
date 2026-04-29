import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from database import get_db
from models import Watchlist

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])

IS_VERCEL = bool(os.environ.get("VERCEL"))

DEMO_WATCHLIST = [
    {"id": 1, "code": "600519", "name": "贵州茅台", "industry": "食品饮料", "added_at": "2024-03-01T10:00:00"},
    {"id": 2, "code": "300750", "name": "宁德时代", "industry": "新能源",   "added_at": "2024-03-02T10:00:00"},
    {"id": 3, "code": "002594", "name": "比亚迪",   "industry": "汽车",     "added_at": "2024-03-03T10:00:00"},
    {"id": 4, "code": "600036", "name": "招商银行", "industry": "银行",     "added_at": "2024-03-04T10:00:00"},
    {"id": 5, "code": "688981", "name": "中芯国际", "industry": "半导体",   "added_at": "2024-03-05T10:00:00"},
    {"id": 6, "code": "601318", "name": "中国平安", "industry": "保险",     "added_at": "2024-03-06T10:00:00"},
    {"id": 7, "code": "000858", "name": "五粮液",   "industry": "食品饮料", "added_at": "2024-03-07T10:00:00"},
    {"id": 8, "code": "600900", "name": "长江电力", "industry": "电力",     "added_at": "2024-03-08T10:00:00"},
]


class WatchlistAdd(BaseModel):
    code: str
    name: str
    industry: str | None = None


@router.get("")
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    if IS_VERCEL:
        return DEMO_WATCHLIST
    result = await db.execute(select(Watchlist).order_by(Watchlist.added_at.desc()))
    items = result.scalars().all()
    return [
        {"id": item.id, "code": item.code, "name": item.name,
         "industry": item.industry, "added_at": item.added_at.isoformat()}
        for item in items
    ]


@router.post("")
async def add_to_watchlist(data: WatchlistAdd, db: AsyncSession = Depends(get_db)):
    code = data.code.zfill(6)
    existing = await db.execute(select(Watchlist).where(Watchlist.code == code))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Stock already in watchlist")
    item = Watchlist(code=code, name=data.name, industry=data.industry)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "code": item.code, "name": item.name}


@router.delete("/{code}")
async def remove_from_watchlist(code: str, db: AsyncSession = Depends(get_db)):
    code = code.zfill(6)
    result = await db.execute(delete(Watchlist).where(Watchlist.code == code))
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(404, "Not in watchlist")
    return {"success": True}


@router.get("/check/{code}")
async def check_watchlist(code: str, db: AsyncSession = Depends(get_db)):
    code = code.zfill(6)
    result = await db.execute(select(Watchlist).where(Watchlist.code == code))
    item = result.scalar_one_or_none()
    return {"in_watchlist": item is not None}
