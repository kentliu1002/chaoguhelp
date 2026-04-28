import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase

# Vercel 文件系统只有 /tmp 可写；本地使用当前目录
if os.environ.get("VERCEL"):
    DATABASE_URL = "sqlite+aiosqlite:////tmp/chaoguhelp.db"
else:
    DATABASE_URL = "sqlite+aiosqlite:///./chaoguhelp.db"

engine = create_async_engine(DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
