from fastapi import APIRouter, Query, HTTPException
from services.stock_service import (
    search_stocks, get_realtime_quote, get_stock_info,
    get_stock_history, get_stock_news, get_industries
)

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    results = await search_stocks(q)
    return {"results": results}


@router.get("/industries")
async def industries():
    data = await get_industries()
    return {"industries": data}


@router.get("/{code}/quote")
async def quote(code: str):
    data = await get_realtime_quote(code.zfill(6))
    if not data:
        raise HTTPException(404, "Stock not found")
    return data


@router.get("/{code}/quotes-batch")
async def quotes_batch(codes: str = Query(...)):
    from services.stock_service import get_realtime_quotes
    code_list = [c.strip().zfill(6) for c in codes.split(",") if c.strip()]
    data = await get_realtime_quotes(code_list)
    return data


@router.get("/{code}/info")
async def info(code: str):
    data = await get_stock_info(code.zfill(6))
    if not data:
        raise HTTPException(404, "Stock not found")
    return data


@router.get("/{code}/history")
async def history(code: str, days: int = Query(30, ge=5, le=365)):
    data = await get_stock_history(code.zfill(6), days)
    return {"history": data}


@router.get("/{code}/news")
async def news(code: str):
    data = await get_stock_news(code.zfill(6))
    return {"news": data}
