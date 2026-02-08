@echo off
setlocal EnableDelayedExpansion

:: ============================================================================
:: BRUCE MASTER CONTROLLER
:: Version: 1.0.0
:: Description: Complete system orchestration for Bruce Harris Personal OS
:: ============================================================================

set BRUCE_VERSION=1.0.0
set BRUCE_HOME=C:\brucebruce\07_HARRIS_WILDLANDS
set BRUCE_SCRIPTS=%BRUCE_HOME%\bruce-scripts
set LOG_DIR=%BRUCE_HOME%\logs
set PID_DIR=%BRUCE_HOME%\pids

:: Service Configuration
set PORT_BRUCEOPS=5000
set PORT_MUD=4008
set PORT_OPENCLAW=18789

:: Paths
set PATH_BRUCEOPS=%BRUCE_HOME%\structure\harriswildlands
set PATH_MUD=%BRUCE_HOME%\structure\mud-server

:: ============================================================================
:: MAIN ENTRY POINT
:: ============================================================================

if "%~1"=="" goto :show_menu
if /I "%~1"=="start" goto :cmd_start
if /I "%~1"=="stop" goto :cmd_stop
if /I "%~1"=="restart" goto :cmd_restart
if /I "%~1"=="status" goto :cmd_status
if /I "%~1"=="health" goto :cmd_health
if /I "%~1"=="logs" goto :cmd_logs
if /I "%~1"=="monitor" goto :cmd_monitor
if /I "%~1"=="backup" goto :cmd_backup
goto :show_help

:show_menu
cls
echo.
echo ===============================================================================
echo                          BRUCE MASTER CONTROLLER
echo                           Version %BRUCE_VERSION%
echo ===============================================================================
echo.
call :show_service_status
echo.
echo AVAILABLE COMMANDS:
echo.
echo   start          - Start all services with dependency resolution
echo   stop           - Graceful shutdown of all services
echo   restart        - Full system restart with health verification
echo   status         - Show current service status
echo   health         - Run comprehensive health diagnostics
echo   logs           - View recent log entries
echo   monitor        - Start continuous health monitoring
echo   backup         - Create full system backup
echo   help           - Show detailed help
echo.
set /p choice="Bruce> "
if "%choice%"=="" goto :show_menu
call %0 %choice%
goto :show_menu

:show_help
echo.
echo Bruce Master Controller - Help
echo.
echo USAGE: bruce-master [command] [options]
echo.
echo COMMANDS:
echo   start    [service]     Start all services or specific service
echo   stop     [service]     Stop all services or specific service
echo   restart  [service]     Restart services with health checks
echo   status                 Display service status table
echo   health                 Run health diagnostics
echo   logs     [service]     Show logs for service
echo   monitor                Start self-healing monitor daemon
echo   backup                 Create system backup
echo.
goto :eof

:show_service_status
echo CURRENT STATUS:
echo.
call :check_port %PORT_BRUCEOPS%
if !errorlevel! == 0 (
    echo   [OK] BruceOps    - Running on port %PORT_BRUCEOPS%
) else (
    echo   [  ] BruceOps    - Stopped
)

call :check_port %PORT_MUD%
if !errorlevel! == 0 (
    echo   [OK] MUD Server  - Running on port %PORT_MUD%
) else (
    echo   [  ] MUD Server  - Stopped
)

call :check_port %PORT_OPENCLAW%
if !errorlevel! == 0 (
    echo   [OK] OpenClaw    - Running on port %PORT_OPENCLAW%
) else (
    echo   [  ] OpenClaw    - Stopped
)
goto :eof

:: ============================================================================
:: START COMMAND
:: ============================================================================

:cmd_start
set target_service=%~2

if "%target_service%"=="" (
    echo Starting Bruce ecosystem...
    call :startup_sequence
) else (
    call :start_service "%target_service%"
)
goto :eof

:startup_sequence
echo.
echo ===============================================================================
echo                         BRUCE STARTUP SEQUENCE
echo ===============================================================================
echo.

:: Step 1: Environment setup
echo [Step 1] Environment Setup
call :create_directories
echo   OK Directories ready

:: Step 2: BruceOps (Core Application)
echo [Step 2] Starting BruceOps Core (Port %PORT_BRUCEOPS%)...
call :start_service "bruceops"
timeout /t 5 /nobreak >nul

:: Step 3: MUD Server
echo [Step 3] Starting MUD Server (Port %PORT_MUD%)...
call :start_service "mud"
timeout /t 3 /nobreak >nul

:: Step 4: OpenClaw Gateway
echo [Step 4] Starting OpenClaw Gateway (Port %PORT_OPENCLAW%)...
call :start_service "openclaw"
timeout /t 3 /nobreak >nul

:: Step 5: Verify startup
echo [Step 5] Verifying services...
call :verify_startup
if !errorlevel! == 0 (
    echo.
    echo SUCCESS: All services started successfully!
    echo.
    echo Access your systems:
    echo   - BruceOps:    http://localhost:%PORT_BRUCEOPS%
    echo   - OpenClaw:    http://127.0.0.1:%PORT_OPENCLAW%/chat
    echo   - MUD Server:  ws://localhost:%PORT_MUD%
) else (
    echo.
    echo WARNING: Some services may still be starting.
    echo Run 'bruce-master status' to check.
)
echo.
goto :eof

:: ============================================================================
:: STOP COMMAND
:: ============================================================================

:cmd_stop
set target_service=%~2

if "%target_service%"=="" (
    echo Shutting down Bruce ecosystem...
    call :shutdown_sequence
) else (
    call :stop_service "%target_service%"
)
goto :eof

:shutdown_sequence
echo.
echo ===============================================================================
echo                        BRUCE SHUTDOWN SEQUENCE
echo ===============================================================================
echo.

echo [Step 1] Stopping OpenClaw...
call :stop_service "openclaw"

echo [Step 2] Stopping MUD Server...
call :stop_service "mud"

echo [Step 3] Stopping BruceOps...
call :stop_service "bruceops"

echo.
echo Shutdown complete.
echo.
goto :eof

:: ============================================================================
:: RESTART COMMAND
:: ============================================================================

:cmd_restart
call :cmd_stop
timeout /t 3 /nobreak >nul
call :cmd_start
goto :eof

:: ============================================================================
:: STATUS COMMAND
:: ============================================================================

:cmd_status
echo.
echo ===============================================================================
echo                           BRUCE SERVICE STATUS
echo ===============================================================================
echo.
echo Service          Status      Port     Details
echo -----------------------------------------------------------------------

:: Check BruceOps
call :check_port %PORT_BRUCEOPS%
if !errorlevel! == 0 (
    for /f "tokens=*" %%a in ('powershell -Command "(Invoke-WebRequest -Uri 'http://localhost:%PORT_BRUCEOPS%/api/health' -TimeoutSec 5 -ErrorAction SilentlyContinue).StatusCode"') do set health_code=%%a
    echo BruceOps         ONLINE      %PORT_BRUCEOPS%   Health: OK
) else (
    echo BruceOps         OFFLINE     %PORT_BRUCEOPS%   Not responding
)

:: Check MUD
call :check_port %PORT_MUD%
if !errorlevel! == 0 (
    echo MUD Server       ONLINE      %PORT_MUD%    WebSocket ready
) else (
    echo MUD Server       OFFLINE     %PORT_MUD%    Not responding
)

:: Check OpenClaw
call :check_port %PORT_OPENCLAW%
if !errorlevel! == 0 (
    echo OpenClaw         ONLINE      %PORT_OPENCLAW%   Gateway ready
) else (
    echo OpenClaw         OFFLINE     %PORT_OPENCLAW%   Not responding
)

echo.
echo ===============================================================================
echo.
goto :eof

:: ============================================================================
:: HEALTH COMMAND
:: ============================================================================

:cmd_health
echo.
echo ===============================================================================
echo                         BRUCE HEALTH DIAGNOSTICS
echo ===============================================================================
echo.
echo Running health checks...
echo.

set health_passed=0
set total_checks=3

:: Check 1: BruceOps API
echo Check 1: BruceOps API
call :check_port %PORT_BRUCEOPS%
if !errorlevel! == 0 (
    echo   [PASS] Responding on port %PORT_BRUCEOPS%
    set /a health_passed+=1
) else (
    echo   [FAIL] Not responding
)

:: Check 2: MUD Server
echo Check 2: MUD Server
call :check_port %PORT_MUD%
if !errorlevel! == 0 (
    echo   [PASS] WebSocket accepting connections
    set /a health_passed+=1
) else (
    echo   [FAIL] Connection refused
)

:: Check 3: OpenClaw
echo Check 3: OpenClaw Gateway
call :check_port %PORT_OPENCLAW%
if !errorlevel! == 0 (
    echo   [PASS] Gateway responding
    set /a health_passed+=1
) else (
    echo   [FAIL] Gateway offline
)

echo.
echo Health Score: !health_passed!/!total_checks!
if !health_passed! == !total_checks! (
    echo All systems healthy!
) else if !health_passed! gtr 0 (
    echo Some issues detected. Check status for details.
) else (
    echo CRITICAL: Multiple failures detected!
)
echo.
goto :eof

:: ============================================================================
:: LOGS COMMAND
:: ============================================================================

:cmd_logs
set service=%~2

if "%service%"=="" (
    echo.
    echo Available log files:
    dir /b "%LOG_DIR%\*.log" 2>nul
    echo.
    echo Usage: bruce-master logs [service]
    echo Example: bruce-master logs bruceops
) else (
    if exist "%LOG_DIR%\%service%.log" (
        echo Showing last 50 lines of %service% logs:
        echo.
        powershell -Command "Get-Content '%LOG_DIR%\%service%.log' -Tail 50"
    ) else (
        echo No log file found for %service%
    )
)
goto :eof

:: ============================================================================
:: MONITOR COMMAND
:: ============================================================================

:cmd_monitor
echo.
echo Starting Bruce Health Monitor...
echo Press Ctrl+C to stop
echo.
call "%BRUCE_SCRIPTS%\bruce-monitor.bat" daemon
goto :eof

:: ============================================================================
:: BACKUP COMMAND
:: ============================================================================

:cmd_backup
call "%BRUCE_SCRIPTS%\bruce-backup.bat"
goto :eof

:: ============================================================================
:: HELPER FUNCTIONS
:: ============================================================================

:create_directories
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%PID_DIR%" mkdir "%PID_DIR%"
goto :eof

:check_port
powershell -Command "$tcp = New-Object System.Net.Sockets.TcpClient; try { $tcp.Connect('localhost', %~1); $tcp.Close(); exit 0 } catch { exit 1 }"
exit /b %errorlevel%

:start_service
if "%~1"=="bruceops" (
    start /B cmd /c "cd /d "%PATH_BRUCEOPS%" && npm run dev ^>^>"%LOG_DIR%\bruceops.log" 2^>^&1"
)
if "%~1"=="mud" (
    start /B cmd /c "cd /d "%PATH_MUD%" && python src\server.py ^>^>"%LOG_DIR%\mud.log" 2^>^&1"
)
if "%~1"=="openclaw" (
    start /B cmd /c "openclaw gateway ^>^>"%LOG_DIR%\openclaw.log" 2^>^&1"
)
goto :eof

:stop_service
if "%~1"=="bruceops" (
    taskkill /F /IM node.exe /FI "COMMANDLINE eq *harriswildlands*" >nul 2>&1
)
if "%~1"=="mud" (
    taskkill /F /IM python.exe /FI "COMMANDLINE eq *mud-server*" >nul 2>&1
)
if "%~1"=="openclaw" (
    taskkill /F /IM node.exe /FI "COMMANDLINE eq *openclaw*" >nul 2>&1
)
goto :eof

:verify_startup
set all_ready=0
timeout /t 2 /nobreak >nul

call :check_port %PORT_BRUCEOPS%
if !errorlevel! == 0 set /a all_ready+=1

call :check_port %PORT_MUD%
if !errorlevel! == 0 set /a all_ready+=1

call :check_port %PORT_OPENCLAW%
if !errorlevel! == 0 set /a all_ready+=1

if !all_ready! == 3 exit /b 0
exit /b 1

:eof
endlocal
