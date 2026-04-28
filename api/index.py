"""
Vercel Serverless entry-point.
Adds the sibling `backend/` directory to sys.path so all existing
backend modules can be imported without modification.
"""
import sys
import os

# /api/index.py  →  project_root/backend
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(_root, "backend"))

# Expose the FastAPI ASGI app — Vercel's Python runtime picks it up
from main import app  # noqa: F401, E402
