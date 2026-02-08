@echo off
setlocal EnableDelayedExpansion

:: ============================================================================
:: BRUCE HEALTH MONITOR
:: Version: 1.0.0
:: Description: Self-healing monitoring with circuit breaker
:: ============================================================================

set BRUCE_HOME=C:\brucebruce\07_HARRIS_WILDLANDS
set LOG_DIR=%BRUCE_HOME%\logs

:: Monitoring settings
set MONITOR_INTERVAL=30
set MAX_RESTARTS=3

:: Service ports
set PORT_BRUCEOPS=5000
set PORT_MUD=4008
set PORT_OPENCLAW=18789

:: Restart counters
set RESTART_BRUCEOPS=0
set RESTART_MUD=0
set RESTART_OPENCLAW=0

:: ============================================================================
:: MAIN
:: ============================================================================

if "%~1"=="daemon" goto :daemon_mode
goto :show_help

:show_help
echo Bruce Health Monitor
echo.
echo USAGE: bruce-monitor [command]
echo.
echo COMMANDS:
echo   daemon  Run continuous monitoring with auto-heal
echo   check   Run single check and exit
echo.
goto :eof

:daemon_mode
echo [%date% %time%] Bruce Monitor starting... >> "%LOG_DIR%\bruce-monitor.log"
echo Monitor interval: %MONITOR_INTERVAL% seconds
echo Press Ctrl+C to stop
echo.

:monitor_loop
:: Check BruceOps
call :check_service "bruceops" %PORT_BRUCEOPS%
if !errorlevel! neq 0 (
    call :handle_failure "bruceops"
) else (
    set RESTART_BRUCEOPS=0
)

:: Check MUD
call :check_service "mud" %PORT_MUD%
if !errorlevel! neq 0 (
    call :handle_failure "mud"
) else (
    set RESTART_MUD=0
)

:: Check OpenClaw
call :check_service "openclaw" %PORT_OPENCLAW%
if !errorlevel! neq 0 (
    call :handle_failure "openclaw"
) else (
    set RESTART_OPENCLAW=0
)

:: Run maintenance every 5 minutes
set /a maint_check=!random! %% 10
if !maint_check! == 0 call :maintenance

timeout /t %MONITOR_INTERVAL% /nobreak >nul
goto :monitor_loop

:: ============================================================================
:: CHECK FUNCTIONS
:: ============================================================================

:check_service
set service=%~1
set port=%~2

if "%service%"=="bruceops" (
    powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:%port%/api/health' -TimeoutSec 10; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
    exit /b !errorlevel!
) else (
    powershell -Command "$tcp = New-Object System.Net.Sockets.TcpClient; try { $tcp.Connect('localhost', %port%); $tcp.Close(); exit 0 } catch { exit 1 }"
    exit /b !errorlevel!
)

:: ============================================================================
:: FAILURE HANDLING
:: ============================================================================

:handle_failure
set service=%~1

echo [%date% %time%] ALERT: %service% is down >> "%LOG_DIR%\bruce-monitor.log"

if "%service%"=="bruceops" (
    if !RESTART_BRUCEOPS! lss %MAX_RESTARTS% (
        set /a RESTART_BRUCEOPS+=1
        echo [%date% %time%] Restarting %service% (attempt !RESTART_BRUCEOPS!/%MAX_RESTARTS%) >> "%LOG_DIR%\bruce-monitor.log"
        taskkill /F /IM node.exe /FI "COMMANDLINE eq *harriswildlands*" >nul 2>&1
        timeout /t 2 /nobreak >nul
        start /B cmd /c "cd /d \"%BRUCE_HOME%\structure\harriswildlands\" && npm run dev ^>^>\"%LOG_DIR%\bruceops.log\" 2^>^&1"
    ) else (
        echo [%date% %time%] CRITICAL: %service% failed %MAX_RESTARTS% times! >> "%LOG_DIR%\bruce-monitor.log"
    )
)

if "%service%"=="mud" (
    if !RESTART_MUD! lss %MAX_RESTARTS% (
        set /a RESTART_MUD+=1
        echo [%date% %time%] Restarting %service% (attempt !RESTART_MUD!/%MAX_RESTARTS%) >> "%LOG_DIR%\bruce-monitor.log"
        taskkill /F /IM python.exe /FI "COMMANDLINE eq *mud-server*" >nul 2>&1
        timeout /t 2 /nobreak >nul
        start /B cmd /c "cd /d \"%BRUCE_HOME%\structure\mud-server\" && python src\server.py ^>^>\"%LOG_DIR%\mud.log\" 2^>^&1"
    )
)

if "%service%"=="openclaw" (
    if !RESTART_OPENCLAW! lss %MAX_RESTARTS% (
        set /a RESTART_OPENCLAW+=1
        echo [%date% %time%] Restarting %service% (attempt !RESTART_OPENCLAW!/%MAX_RESTARTS%) >> "%LOG_DIR%\bruce-monitor.log"
        taskkill /F /IM node.exe /FI "COMMANDLINE eq *openclaw*" >nul 2>&1
        timeout /t 2 /nobreak >nul
        start /B cmd /c "openclaw gateway ^>^>\"%LOG_DIR%\openclaw.log\" 2^>^&1"
    )
)

goto :eof

:: ============================================================================
:: MAINTENANCE
:: ============================================================================

:maintenance
echo [%date% %time%] Running maintenance... >> "%LOG_DIR%\bruce-monitor.log"

:: Check disk space
for /f "usebackq delims=" %%a in (`powershell -Command "[math]::Round(((Get-PSDrive C).Used / ((Get-PSDrive C).Used + (Get-PSDrive C).Free)) * 100, 1)"`) do set disk_used=%%a
if !disk_used! gtr 90 (
    echo [%date% %time%] WARNING: Disk usage at !disk_used!%% >> "%LOG_DIR%\bruce-monitor.log"
)

:: Rotate large logs
for %%f in ("%LOG_DIR%\*.log") do (
    for %%A in ("%%f") do if %%~zA gtr 52428800 (
        echo [%date% %time%] Rotating large log: %%f >> "%LOG_DIR%\bruce-monitor.log"
        move "%%f" "%%f.old" >nul 2>&1
    )
)

goto :eof

:eof
endlocal
