from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from database import get_db
from models import Portfolio
from services.stock_service import get_realtime_quotes

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


class PortfolioAdd(BaseModel):
    code: str
    name: str
    buy_price: float
    quantity: int
    buy_date: str | None = None
    note: str | None = None


class PortfolioUpdate(BaseModel):
    buy_price: float | None = None
    quantity: int | None = None
    buy_date: str | None = None
    note: str | None = None


@router.get("")
async def get_portfolio(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Portfolio).order_by(Portfolio.created_at.desc()))
    items = result.scalars().all()

    if not items:
        return {"positions": [], "summary": {"total_cost": 0, "total_value": 0, "total_profit": 0, "total_profit_pct": 0}}

    codes = [item.code for item in items]
    quotes = await get_realtime_quotes(codes)

    positions = []
    total_cost = 0
    total_value = 0

    for item in items:
        quote = quotes.get(item.code, {})
        current_price = quote.get("price", item.buy_price)
        cost = item.buy_price * item.quantity
        value = current_price * item.quantity
        profit = value - cost
        profit_pct = (profit / cost * 100) if cost else 0

        total_cost += cost
        total_value += value

        positions.append({
            "id": item.id,
            "code": item.code,
            "name": item.name,
            "buy_price": item.buy_price,
            "quantity": item.quantity,
            "buy_date": item.buy_date,
            "note": item.note,
            "current_price": current_price,
            "cost": cost,
            "value": value,
            "profit": profit,
            "profit_pct": profit_pct,
            "change_pct": quote.get("change_pct", 0),
            "created_at": item.created_at.isoformat(),
        })

    total_profit = total_value - total_cost
    total_profit_pct = (total_profit / total_cost * 100) if total_cost else 0

    return {
        "positions": positions,
        "summary": {
            "total_cost": total_cost,
            "total_value": total_value,
            "total_profit": total_profit,
            "total_profit_pct": total_profit_pct,
        },
    }


@router.post("")
async def add_position(data: PortfolioAdd, db: AsyncSession = Depends(get_db)):
    item = Portfolio(
        code=data.code.zfill(6),
        name=data.name,
        buy_price=data.buy_price,
        quantity=data.quantity,
        buy_date=data.buy_date,
        note=data.note,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": item.id, "code": item.code, "name": item.name}


@router.put("/{item_id}")
async def update_position(item_id: int, data: PortfolioUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Portfolio).where(Portfolio.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(404, "Position not found")

    if data.buy_price is not None:
        item.buy_price = data.buy_price
    if data.quantity is not None:
        item.quantity = data.quantity
    if data.buy_date is not None:
        item.buy_date = data.buy_date
    if data.note is not None:
        item.note = data.note

    await db.commit()
    return {"success": True}


@router.delete("/{item_id}")
async def delete_position(item_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(Portfolio).where(Portfolio.id == item_id))
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(404, "Position not found")
    return {"success": True}
