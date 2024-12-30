@echo off
cls

:: Change to the script's directory
cd /d "%~dp0"

:: Print a nice header
echo ================================
echo    Starting Local Web Server    
echo ================================
echo.
echo Server will start at: http://localhost:8000
echo To stop the server: Press Ctrl+C
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed!
    echo Please install Python from python.org
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Start the server in background and open browser
echo Starting server...
start "" python -m http.server 8000
timeout /t 2 >nul
start http://localhost:8000/app/app.html
echo.
echo Server is running. Press Ctrl+C to stop.
echo.
pause >nul 