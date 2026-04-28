import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from routers import stocks, watchlist, portfolio, ai, seed


async def _auto_seed():
    """在 Vercel 冷启动时自动写入演示数据（若表为空则写入）。"""
    from database import SessionLocal
    from models import Watchlist, Portfolio
    from sqlalchemy import select, func
    from routers.seed import WATCHLIST_DEMO, PORTFOLIO_DEMO

    async with SessionLocal() as db:
        wl_count = (await db.execute(select(func.count()).select_from(Watchlist))).scalar()
        if wl_count == 0:
            for item in WATCHLIST_DEMO:
                db.add(Watchlist(**item))
            for item in PORTFOLIO_DEMO:
                db.add(Portfolio(**item))
            await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    if os.environ.get("VERCEL"):
        await _auto_seed()
    yield


app = FastAPI(title="炒股助手 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router)
app.include_router(watchlist.router)
app.include_router(portfolio.router)
app.include_router(ai.router)
app.include_router(seed.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "炒股助手", "demo": bool(os.environ.get("VERCEL"))}
