@echo off
title Tiny Tale Launcher
echo ==============================================
echo   Starting Tiny Tale Backend & Frontend
echo ==============================================
echo.
start "Tiny Tale Backend (Port 5000)" cmd /k "npm run server"
start "Tiny Tale Frontend (Vite)" cmd /k "npm run dev"
echo Backend dan Frontend sedang berjalan!
echo Buka browser di http://localhost:5173
pause
