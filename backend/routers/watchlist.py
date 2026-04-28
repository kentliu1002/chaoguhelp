from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from database import get_db
from models import Watchlist

router = APIRouter(prefix="/api/watchlist", tags=["watchlist"])


class WatchlistAdd(BaseModel):
    code: str
    name: str
    industry: str | None = None


@router.get("")
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Watchlist).order_by(Watchlist.added_at.desc()))
    items = result.scalars().all()
    return [
        {
            "id": item.id,
            "code": item.code,
            "name": item.name,
            "industry": item.industry,
            "added_at": item.added_at.isoformat(),
        }
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
