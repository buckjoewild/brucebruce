@echo off
setlocal enabledelayedexpansion

REM ==========================
REM Harris Wildlands MUD Runner
REM Repo root assumed: this file's folder
REM ==========================

cd /d "%~dp0"

REM ---- Config (edit as desired) ----
set "VENV_DIR=.venv"
set "HOST=0.0.0.0"
set "PORT=5000"

REM Safety defaults:
REM IDLE_MODE=1 => blocks /build on + /consent yes (safe unattended)
set "IDLE_MODE=1"

REM Bruce autopilot NPC
set "MUD_BRUCE_AUTOPILOT=true"

REM Codex integration defaults (safe)
set "USE_CODEX=0"
set "CODEX_DRYRUN=1"
set "CODEX_CLI=codex"

REM Optional: run tests before starting (1=yes, 0=no)
set "RUN_TESTS=1"

echo.
echo [HW] Starting Harris Wildlands from: %CD%
echo [HW] HOST=%HOST% PORT=%PORT% IDLE_MODE=%IDLE_MODE% AUTOPILOT=%MUD_BRUCE_AUTOPILOT%
echo.

REM ---- Check Python ----
py -3 --version >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Python launcher "py" not found. Install Python 3.12+ and ensure "py" works.
  pause
  exit /b 1
)

REM ---- Create venv if missing ----
if not exist "%VENV_DIR%\Scripts\python.exe" (
  echo [HW] Creating venv: %VENV_DIR%
  py -3 -m venv "%VENV_DIR%"
  if errorlevel 1 (
    echo [ERROR] Failed to create venv.
    pause
    exit /b 1
  )
)

REM ---- Activate venv ----
call "%VENV_DIR%\Scripts\activate.bat"
if errorlevel 1 (
  echo [ERROR] Failed to activate venv.
  pause
  exit /b 1
)

REM ---- Upgrade pip quietly ----
python -m pip install --upgrade pip >nul 2>&1

REM ---- Install deps (prefer requirements.txt if present) ----
if exist "requirements.txt" (
  echo [HW] Installing deps from requirements.txt
  python -m pip install -r requirements.txt
) else (
  REM Minimal deps based on your current stack
  echo [HW] Installing minimal deps (websockets, pytest)
  python -m pip install websockets pytest
)

if errorlevel 1 (
  echo [ERROR] Dependency install failed.
  pause
  exit /b 1
)

REM ---- Optional tests ----
if "%RUN_TESTS%"=="1" (
  echo.
  echo [HW] Running tests...
  python -m pytest 07_HARRIS_WILDLANDS\orchestrator\tests -q
  if errorlevel 1 (
    echo [ERROR] Tests failed. Fix before running server.
    pause
    exit /b 1
  )
  echo [HW] Tests OK.
)

REM ---- Export env vars to this process ----
set "HOST=%HOST%"
set "PORT=%PORT%"
set "IDLE_MODE=%IDLE_MODE%"
set "MUD_BRUCE_AUTOPILOT=%MUD_BRUCE_AUTOPILOT%"
set "USE_CODEX=%USE_CODEX%"
set "CODEX_DRYRUN=%CODEX_DRYRUN%"
set "CODEX_CLI=%CODEX_CLI%"

echo.
echo [HW] Launching server.py ...
echo [HW] Open browser to: http://localhost:%PORT%  (or your LAN IP)
echo.

python server.py

echo.
echo [HW] Server exited.
pause
endlocal
