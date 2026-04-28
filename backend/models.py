from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from database import Base


class Watchlist(Base):
    __tablename__ = "watchlist"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    industry: Mapped[str] = mapped_column(String(50), nullable=True)
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


class Portfolio(Base):
    __tablename__ = "portfolio"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(10), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    buy_price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    buy_date: Mapped[str] = mapped_column(String(20), nullable=True)
    note: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
