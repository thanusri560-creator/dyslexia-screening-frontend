@echo off
echo Starting Dyslexia Detection Services...
echo.

REM Start Python ML Service in a new window
echo Starting Python ML Service on port 5000...
start "Python ML Service" cmd /k "cd server && python audio_prediction.py"

REM Wait a moment for Python to start
timeout /t 3 /nobreak > nul

REM Start Node.js Server in a new window
echo Starting Node.js Server on port 3000...
start "Node.js Server" cmd /k "npm run dev"

echo.
echo Both services are starting...
echo - Python ML Service: http://localhost:5000
echo - Vite Dev Server: http://localhost:3000
echo - Express API Server: http://localhost:3001
echo.
echo IMPORTANT: You may need to restart the Node.js server if it's already running on port 3000
echo.
echo Press any key to exit this window...
pause > nul
