@echo off
echo Starting ProjectBorworntat...
echo.

echo [1/2] Starting backend (FastAPI)...
start "Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 2 >nul

echo [2/2] Starting frontend (Vite)...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
pause
