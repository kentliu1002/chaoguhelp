from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.stock_service import get_stock_info, get_stock_history, get_stock_news
from services.ai_service import get_recommendation, get_sentiment

router = APIRouter(prefix="/api/ai", tags=["ai"])


class RecommendRequest(BaseModel):
    code: str
    portfolio_item: dict | None = None


@router.post("/recommend")
async def recommend(req: RecommendRequest):
    code = req.code.zfill(6)
    info, history, news = await _fetch_stock_data(code)
    if not info:
        raise HTTPException(404, "Stock not found")
    result = await get_recommendation(info, history, news, req.portfolio_item)
    return result


@router.get("/recommend/{code}")
async def recommend_get(code: str):
    code = code.zfill(6)
    info, history, news = await _fetch_stock_data(code)
    if not info:
        raise HTTPException(404, "Stock not found")
    result = await get_recommendation(info, history, news)
    return result


@router.get("/sentiment/{code}")
async def sentiment(code: str):
    code = code.zfill(6)
    info, history, news = await _fetch_stock_data(code)
    if not info:
        raise HTTPException(404, "Stock not found")
    result = await get_sentiment(info, news)
    return result


async def _fetch_stock_data(code: str):
    import asyncio
    info, history, news = await asyncio.gather(
        get_stock_info(code),
        get_stock_history(code, 30),
        get_stock_news(code),
        return_exceptions=True,
    )
    if isinstance(info, Exception):
        info = None
    if isinstance(history, Exception):
        history = []
    if isinstance(news, Exception):
        news = []
    return info, history, news
