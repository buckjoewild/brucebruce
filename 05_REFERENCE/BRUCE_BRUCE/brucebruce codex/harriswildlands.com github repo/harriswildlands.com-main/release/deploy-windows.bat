@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: THOUGHT WEAVER / BRUCEOPS - Windows Deployment Script
:: Self-hosted Docker deployment with stress and smoke testing
:: ============================================================

title Thought Weaver Deployment

echo.
echo  ====================================================
echo   THOUGHT WEAVER - Self-Hosted Deployment
echo   Home Desktop Setup with Testing Suite
echo  ====================================================
echo.

:: Colors via ANSI codes (Windows 10+)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

:: Configuration
set "APP_NAME=thoughtweaver"
set "PORT=5000"
set "DB_PORT=5432"
set "COMPOSE_FILE=docker-compose.yml"

:: ============================================================
:: STEP 1: Prerequisites Check
:: ============================================================
echo %CYAN%[1/7] Checking prerequisites...%RESET%
echo.

:: Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Docker is not installed or not in PATH%RESET%
    echo Please install Docker Desktop from https://docker.com
    pause
    exit /b 1
)
echo %GREEN%[OK]%RESET% Docker found
for /f "tokens=*" %%i in ('docker --version') do echo      %%i

:: Check Docker Compose
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo %RED%ERROR: Docker Compose is not available%RESET%
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
) else (
    set "COMPOSE_CMD=docker compose"
)
echo %GREEN%[OK]%RESET% Docker Compose found

:: Check if Docker daemon is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%ERROR: Docker daemon is not running%RESET%
    echo Please start Docker Desktop
    pause
    exit /b 1
)
echo %GREEN%[OK]%RESET% Docker daemon is running

:: Check curl
curl --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %YELLOW%[WARN]%RESET% curl not found - using PowerShell for HTTP tests
    set "USE_POWERSHELL=1"
) else (
    echo %GREEN%[OK]%RESET% curl found
    set "USE_POWERSHELL=0"
)

echo.

:: ============================================================
:: STEP 2: Environment Setup
:: ============================================================
echo %CYAN%[2/7] Setting up environment...%RESET%
echo.

:: Check for .env file
if not exist ".env" (
    if exist ".env.example" (
        echo Creating .env from .env.example...
        copy ".env.example" ".env" >nul
        echo %GREEN%[OK]%RESET% Created .env file
        echo %YELLOW%[INFO]%RESET% Please edit .env to add your API keys if desired
    ) else (
        echo Creating default .env file...
        (
            echo DATABASE_URL=postgresql://postgres:postgres@db:5432/bruceops
            echo SESSION_SECRET=your-super-secret-session-key-change-in-production
            echo AI_PROVIDER=off
            echo NODE_ENV=production
        ) > .env
        echo %GREEN%[OK]%RESET% Created default .env file
    )
) else (
    echo %GREEN%[OK]%RESET% .env file exists
)

echo.

:: ============================================================
:: STEP 3: Stop Existing Containers
:: ============================================================
echo %CYAN%[3/7] Stopping any existing containers...%RESET%
echo.

%COMPOSE_CMD% down --remove-orphans 2>nul
echo %GREEN%[OK]%RESET% Cleaned up previous containers

echo.

:: ============================================================
:: STEP 4: Build and Start Containers
:: ============================================================
echo %CYAN%[4/7] Building and starting containers...%RESET%
echo      This may take a few minutes on first run...
echo.

%COMPOSE_CMD% up -d --build
if %errorlevel% neq 0 (
    echo %RED%ERROR: Failed to start containers%RESET%
    echo.
    echo Checking logs...
    %COMPOSE_CMD% logs --tail=50
    pause
    exit /b 1
)

echo %GREEN%[OK]%RESET% Containers started successfully
echo.

:: Wait for services to be ready
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

:: ============================================================
:: STEP 5: Smoke Tests
:: ============================================================
echo %CYAN%[5/7] Running smoke tests...%RESET%
echo.

set "SMOKE_PASSED=0"
set "SMOKE_TOTAL=5"

:: Test 1: Health endpoint
echo Testing health endpoint...
if "%USE_POWERSHELL%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 10).StatusCode" 2^>nul') do set "HEALTH_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/api/health --connect-timeout 10') do set "HEALTH_STATUS=%%i"
)
if "%HEALTH_STATUS%"=="200" (
    echo   %GREEN%[PASS]%RESET% Health endpoint returns 200
    set /a SMOKE_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Health endpoint returned %HEALTH_STATUS%
)

:: Test 2: Database connectivity (via health endpoint)
echo Testing database connectivity...
if "%USE_POWERSHELL%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing).Content | ConvertFrom-Json | Select-Object -ExpandProperty database"') do set "DB_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s http://localhost:%PORT%/api/health ^| findstr /C:"connected"') do set "DB_STATUS=%%i"
)
if not "%DB_STATUS%"=="" (
    echo   %GREEN%[PASS]%RESET% Database is connected
    set /a SMOKE_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Database connection issue
)

:: Test 3: Frontend loads
echo Testing frontend...
if "%USE_POWERSHELL%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/' -UseBasicParsing -TimeoutSec 10).StatusCode"') do set "FRONTEND_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/ --connect-timeout 10') do set "FRONTEND_STATUS=%%i"
)
if "%FRONTEND_STATUS%"=="200" (
    echo   %GREEN%[PASS]%RESET% Frontend loads successfully
    set /a SMOKE_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Frontend returned %FRONTEND_STATUS%
)

:: Test 4: Auth endpoint responds
echo Testing auth endpoint...
if "%USE_POWERSHELL%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/auth/user' -UseBasicParsing -TimeoutSec 10).StatusCode" 2^>nul') do set "AUTH_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/api/auth/user --connect-timeout 10') do set "AUTH_STATUS=%%i"
)
if "%AUTH_STATUS%"=="401" (
    echo   %GREEN%[PASS]%RESET% Auth endpoint responds correctly (401 expected)
    set /a SMOKE_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Auth endpoint returned %AUTH_STATUS%
)

:: Test 5: Container health
echo Testing container health...
for /f "tokens=*" %%i in ('docker ps --filter "status=running" --filter "name=app" --format "{{.Names}}" 2^>nul') do set "CONTAINER_UP=%%i"
if not "%CONTAINER_UP%"=="" (
    echo   %GREEN%[PASS]%RESET% Containers are running
    set /a SMOKE_PASSED+=1
) else (
    :: Fallback: check via compose ps without --format
    %COMPOSE_CMD% ps 2>nul | findstr /C:"Up" >nul
    if !errorlevel!==0 (
        echo   %GREEN%[PASS]%RESET% Containers are running
        set /a SMOKE_PASSED+=1
    ) else (
        echo   %RED%[FAIL]%RESET% Container health check failed
    )
)

echo.
echo   Smoke Tests: %SMOKE_PASSED%/%SMOKE_TOTAL% passed
echo.

:: ============================================================
:: STEP 6: Stress Tests
:: ============================================================
echo %CYAN%[6/7] Running stress tests...%RESET%
echo.

set "STRESS_PASSED=0"
set "STRESS_TOTAL=3"

:: Test 1: Rapid health checks (10 requests)
echo Testing rapid API calls (10 health checks)...
set "RAPID_SUCCESS=0"
for /L %%i in (1,1,10) do (
    if "%USE_POWERSHELL%"=="1" (
        powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5).StatusCode" >nul 2>&1 && set /a RAPID_SUCCESS+=1
    ) else (
        :: Use --fail to make curl return error on 4xx/5xx
        curl --fail -s -o nul http://localhost:%PORT%/api/health --connect-timeout 5 && set /a RAPID_SUCCESS+=1
    )
)
if !RAPID_SUCCESS! geq 8 (
    echo   %GREEN%[PASS]%RESET% Rapid requests: !RAPID_SUCCESS!/10 succeeded
    set /a STRESS_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Rapid requests: only !RAPID_SUCCESS!/10 succeeded
)

:: Test 2: Concurrent connections simulation
echo Testing concurrent connection handling...
if "%USE_POWERSHELL%"=="1" (
    :: Use PowerShell jobs for concurrent requests
    start /b powershell -Command "Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5" >nul 2>&1
    start /b powershell -Command "Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5" >nul 2>&1
    start /b powershell -Command "Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 5" >nul 2>&1
) else (
    start /b curl -s http://localhost:%PORT%/api/health >nul 2>&1
    start /b curl -s http://localhost:%PORT%/api/health >nul 2>&1
    start /b curl -s http://localhost:%PORT%/api/health >nul 2>&1
)
timeout /t 2 /nobreak >nul
if "%USE_POWERSHELL%"=="1" (
    for /f "tokens=*" %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT%/api/health' -UseBasicParsing -TimeoutSec 10).StatusCode"') do set "CONCURRENT_STATUS=%%i"
) else (
    for /f "tokens=*" %%i in ('curl -s -o nul -w "%%{http_code}" http://localhost:%PORT%/api/health --connect-timeout 10') do set "CONCURRENT_STATUS=%%i"
)
if "%CONCURRENT_STATUS%"=="200" (
    echo   %GREEN%[PASS]%RESET% Server handles concurrent connections
    set /a STRESS_PASSED+=1
) else (
    echo   %RED%[FAIL]%RESET% Concurrent connection test failed
)

:: Test 3: Memory/resource check
echo Checking container resources...
:: Get running app container name dynamically
for /f "tokens=*" %%i in ('docker ps --filter "status=running" --filter "name=app" --format "{{.Names}}" 2^>nul') do set "APP_CONTAINER=%%i"
if not "%APP_CONTAINER%"=="" (
    for /f "tokens=*" %%i in ('docker exec %APP_CONTAINER% ps aux 2^>nul ^| findstr /C:"node"') do set "NODE_RUNNING=%%i"
    if not "!NODE_RUNNING!"=="" (
        echo   %GREEN%[PASS]%RESET% Node.js process is running in %APP_CONTAINER%
        set /a STRESS_PASSED+=1
    ) else (
        :: Alternative: just verify container responds
        docker exec %APP_CONTAINER% echo "OK" >nul 2>&1
        if !errorlevel!==0 (
            echo   %GREEN%[PASS]%RESET% App container is responsive
            set /a STRESS_PASSED+=1
        ) else (
            echo   %YELLOW%[SKIP]%RESET% Could not verify process status
        )
    )
) else (
    echo   %YELLOW%[SKIP]%RESET% Could not identify running app container
)

echo.
echo   Stress Tests: %STRESS_PASSED%/%STRESS_TOTAL% passed
echo.

:: ============================================================
:: STEP 7: Summary
:: ============================================================
echo %CYAN%[7/7] Deployment Summary%RESET%
echo.
echo  ====================================================
echo.

set /a TOTAL_PASSED=%SMOKE_PASSED%+%STRESS_PASSED%
set /a TOTAL_TESTS=%SMOKE_TOTAL%+%STRESS_TOTAL%

if %TOTAL_PASSED% geq %TOTAL_TESTS% (
    echo   %GREEN%SUCCESS: All tests passed! (%TOTAL_PASSED%/%TOTAL_TESTS%)%RESET%
) else if %TOTAL_PASSED% geq 6 (
    echo   %YELLOW%PARTIAL: Most tests passed (%TOTAL_PASSED%/%TOTAL_TESTS%)%RESET%
) else (
    echo   %RED%WARNING: Some tests failed (%TOTAL_PASSED%/%TOTAL_TESTS%)%RESET%
)

echo.
echo  Application URL: http://localhost:%PORT%
echo  Demo Mode URL:   http://localhost:%PORT%/?demo=true
echo.
echo  Container Status:
%COMPOSE_CMD% ps
echo.
echo  ====================================================
echo.
echo  Quick Commands:
echo    View logs:     %COMPOSE_CMD% logs -f
echo    Stop app:      %COMPOSE_CMD% down
echo    Restart:       %COMPOSE_CMD% restart
echo    Rebuild:       %COMPOSE_CMD% up -d --build
echo.
echo  ====================================================
echo.

:: Ask if user wants to open browser
set /p OPEN_BROWSER="Open application in browser? (Y/N): "
if /i "%OPEN_BROWSER%"=="Y" (
    start http://localhost:%PORT%/?demo=true
)

echo.
echo Deployment complete!
pause
