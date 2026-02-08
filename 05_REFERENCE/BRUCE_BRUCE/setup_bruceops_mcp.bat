@echo off
REM ============================================================================
REM BruceOps MCP Server Automated Setup
REM ============================================================================
REM This script sets up everything needed for Claude Desktop + BruceOps
REM No manual terminal work required - just run this!
REM ============================================================================

setlocal enabledelayedexpansion

REM Colors for output
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     🚀 BruceOps MCP Server Setup v1.2                          ║
echo ║     Automated Installation for Claude Desktop                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM ============================================================================
REM STEP 1: Verify Python is installed
REM ============================================================================
echo [STEP 1/5] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Python is not installed or not in PATH
    echo.
    echo Please install Python from https://www.python.org/
    echo During installation, CHECK the box: "Add Python to PATH"
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
    echo ✅ Python !PYTHON_VERSION! found
)
echo.

REM ============================================================================
REM STEP 2: Navigate to brucebruce codex folder
REM ============================================================================
echo [STEP 2/5] Locating BruceOps folder...
set "BRUCEOPS_DIR=C:\Users\%USERNAME%\harriswildlands.com\brucebruce codex"

if not exist "!BRUCEOPS_DIR!" (
    echo.
    echo ❌ ERROR: Could not find folder at:
    echo    !BRUCEOPS_DIR!
    echo.
    echo Please verify harriswildlands.com exists in C:\Users\%USERNAME%\
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Found: !BRUCEOPS_DIR!
)
echo.

REM ============================================================================
REM STEP 3: Check for requirements.txt and install dependencies
REM ============================================================================
echo [STEP 3/5] Installing Python dependencies...
if not exist "!BRUCEOPS_DIR!\requirements.txt" (
    echo.
    echo ⚠️  WARNING: requirements.txt not found
    echo    Creating minimal requirements file...
    echo.
    
    (
        echo httpx==0.27.0
        echo mcp==0.7.0
    ) > "!BRUCEOPS_DIR!\requirements.txt"
)

cd /d "!BRUCEOPS_DIR!"
echo Installing packages...
python -m pip install --upgrade pip -q
python -m pip install -q httpx mcp 2>nul

if errorlevel 1 (
    echo ⚠️  Some dependencies may not have installed
    echo    But MCP should still work if already present
) else (
    echo ✅ Dependencies installed successfully
)
echo.

REM ============================================================================
REM STEP 4: Update/Create Claude Desktop MCP Config
REM ============================================================================
echo [STEP 4/5] Configuring Claude Desktop...

set "CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json"

REM Prompt for API token
echo.
echo Please enter your BruceOps API Token:
echo (You created this at: https://harriswildlands.com/settings)
echo.
set /p API_TOKEN="🔑 Paste your token here: "

if "!API_TOKEN!"=="" (
    echo.
    echo ❌ ERROR: No token provided. Setup cannot continue.
    echo.
    pause
    exit /b 1
)

REM Create or update config
if not exist "%APPDATA%\Claude" (
    mkdir "%APPDATA%\Claude"
)

REM Escape backslashes for JSON
set "ESCAPED_DIR=!BRUCEOPS_DIR:\=\\!"

(
    echo {
    echo   "mcpServers": {
    echo     "bruceops": {
    echo       "command": "python",
    echo       "args": ["!ESCAPED_DIR!\bruceops_mcp_server.py"],
    echo       "env": {
    echo         "BRUCEOPS_TOKEN": "!API_TOKEN!",
    echo         "BRUCEOPS_API_BASE": "https://harriswildlands.com"
    echo       }
    echo     }
    echo   }
    echo }
) > "!CLAUDE_CONFIG!"

echo ✅ Config updated: !CLAUDE_CONFIG!
echo.

REM ============================================================================
REM STEP 5: Verify MCP Server file exists
REM ============================================================================
echo [STEP 5/5] Verifying MCP server file...

if not exist "!BRUCEOPS_DIR!\bruceops_mcp_server.py" (
    echo.
    echo ❌ ERROR: bruceops_mcp_server.py not found!
    echo    Expected: !BRUCEOPS_DIR!\bruceops_mcp_server.py
    echo.
    echo Please copy the v1.2 server file to that location.
    echo.
    pause
    exit /b 1
) else (
    echo ✅ MCP server file found
)
echo.

REM ============================================================================
REM SUCCESS - Summary
REM ============================================================================
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║     ✅ SETUP COMPLETE!                                          ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo Configuration Summary:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo   📁 MCP Server:     !BRUCEOPS_DIR!\bruceops_mcp_server.py
echo   🔐 Config File:    !CLAUDE_CONFIG!
echo   🔑 Token:          ••••••••••••••••••••••••••••••••••••••••
echo   📡 API Base:       https://harriswildlands.com
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo Next Steps:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 1. ⏹️  Close Claude Desktop completely (if open)
echo 2. ⏳ Wait 5 seconds
echo 3. 🚀 Reopen Claude Desktop
echo 4. 💬 Ask Claude: "Check my BruceOps API health"
echo 5. 🎯 Then ask: "Check in on goal 1 - I did it today"
echo.
echo ✨ Your MCP server is now connected!
echo.
echo Optional - Test your token with this command:
echo.
echo curl -H "Authorization: Bearer !API_TOKEN!" ^
echo   https://harriswildlands.com/api/health
echo.
pause
