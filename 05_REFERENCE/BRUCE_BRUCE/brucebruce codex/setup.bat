@echo off
REM BruceOps MCP Server - Windows Setup Script

echo.
echo ========================================
echo BruceOps MCP Server Setup
echo ========================================
echo.

REM Check if UV is installed
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: UV not found!
    echo Please install UV first: https://docs.astral.sh/uv/
    pause
    exit /b 1
)

echo [1/4] Creating virtual environment...
uv venv
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo [2/4] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [3/4] Installing dependencies...
uv pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [4/4] Testing server...
echo.
echo Starting test run (press Ctrl+C to stop)...
python bruceops_mcp_server.py
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Server test failed
    echo This might be normal if BruceOps isn't running yet
    echo.
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure BruceOps is running at localhost:5000
echo 2. Configure Claude Desktop (see SETUP_INSTRUCTIONS.md)
echo 3. Restart Claude Desktop
echo.
echo Current directory: %CD%
echo Use this path in your Claude Desktop config!
echo.
pause
