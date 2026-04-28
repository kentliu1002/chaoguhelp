#!/bin/bash
# 炒股助手 - 一键启动脚本

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 启动炒股助手..."

# --- 检查 .env ---
if [ ! -f "$ROOT/backend/.env" ]; then
  echo "⚠️  未找到 backend/.env，正在从模板创建..."
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  echo "⚠️  请编辑 backend/.env 填入你的 ANTHROPIC_API_KEY，AI 功能才能正常工作"
fi

# --- 后端 ---
echo "📦 启动后端 (FastAPI :8000)..."
cd "$ROOT/backend"
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

# --- 前端 ---
echo "🎨 启动前端 (Vite :5173)..."
cd "$ROOT/frontend"
npm run dev -- --port 5173 &
FRONTEND_PID=$!

echo ""
echo "✅ 启动完成！"
echo "   前端地址：http://localhost:5173"
echo "   后端地址：http://localhost:8000"
echo "   手机访问：http://$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}'):5173"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待并清理
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '已停止所有服务'" EXIT
wait
