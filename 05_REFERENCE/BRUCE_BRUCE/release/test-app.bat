@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: THOUGHT WEAVER - Quick Test Script
:: Run this anytime to verify the app is working
:: ============================================================

title Thought Weaver - Quick Test

echo.
echo  ====================================================
echo   THOUGHT WEAVER - Quick Health Check
echo  ====================================================
echo.

set "PORT=5000"
set "PASSED=0"
set "TOTAL=6"

:: Detect curl or use PowerShell
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    set "USE_PS=1"
    echo Using PowerShell for HTTP requests...
) else (
    set "USE_PS=0"
)

:: Test 1: Health endpoint
echo [1/6] Health endpoint...
if "%USE_PS%"=="1" (
    powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5).StatusCode" >nul 2>&1
) else (
    curl -s http://localhost:%PORT%/api/health >nul 2>&1
)
if %errorlevel%==0 (
    echo       [OK] Server responding
    set /a PASSED+=1
) else (
    echo       [FAIL] Server not responding
)

:: Test 2: Check health details
echo [2/6] Health details...
if "%USE_PS%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing).Content" 2^>nul') do set "HEALTH_JSON=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s http://localhost:%PORT%/api/health 2^>nul') do set "HEALTH_JSON=%%i"
)
echo %HEALTH_JSON% | findstr /C:"ok" >nul
if %errorlevel%==0 (
    echo       [OK] Status is OK
    set /a PASSED+=1
) else (
    echo       [WARN] Status may be degraded
)

:: Test 3: Database check
echo [3/6] Database connectivity...
echo %HEALTH_JSON% | findstr /C:"connected" >nul
if %errorlevel%==0 (
    echo       [OK] Database connected
    set /a PASSED+=1
) else (
    echo       [FAIL] Database issue
)

:: Test 4: Frontend
echo [4/6] Frontend loading...
if "%USE_PS%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/' -UseBasicParsing -TimeoutSec 5).StatusCode" 2^>nul') do set "FE_STATUS=%%i"
    if "!FE_STATUS!"=="200" (
        echo       [OK] Frontend accessible
        set /a PASSED+=1
    ) else (
        echo       [FAIL] Frontend not loading
    )
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/ 2^>nul') do set "FE_STATUS=%%i"
    if "!FE_STATUS!"=="200" (
        echo       [OK] Frontend accessible
        set /a PASSED+=1
    ) else (
        echo       [FAIL] Frontend not loading
    )
)

:: Test 5: Auth endpoint
echo [5/6] Auth system...
if "%USE_PS%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/auth/user' -UseBasicParsing -TimeoutSec 5).StatusCode" 2^>nul') do set "AUTH_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/api/auth/user 2^>nul') do set "AUTH_STATUS=%%i"
)
if "!AUTH_STATUS!"=="401" (
    echo       [OK] Auth working (401 expected)
    set /a PASSED+=1
) else (
    echo       [WARN] Auth endpoint issue
)

:: Test 6: Demo mode
echo [6/6] Demo mode access...
if "%USE_PS%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/?demo=true' -UseBasicParsing).Content" 2^>nul') do set "DEMO_CONTENT=%%i"
    echo !DEMO_CONTENT! | findstr /C:"html" >nul
) else (
    curl -s http://localhost:%PORT%/?demo=true 2>nul | findstr /C:"html" >nul
)
if %errorlevel%==0 (
    echo       [OK] Demo mode accessible
    set /a PASSED+=1
) else (
    echo       [WARN] Demo mode may have issues
)

echo.
echo  ====================================================
echo   Results: %PASSED%/%TOTAL% tests passed
echo  ====================================================
echo.

if %PASSED% geq 5 (
    echo   Status: HEALTHY
) else if %PASSED% geq 3 (
    echo   Status: DEGRADED - Some issues detected
) else (
    echo   Status: UNHEALTHY - Check logs with: docker compose logs
)

echo.
echo   App URL: http://localhost:%PORT%
echo   Demo:    http://localhost:%PORT%/?demo=true
echo.

pause
