@echo off
setlocal enabledelayedexpansion

:: ============================================================
:: THOUGHT WEAVER - Management Script
:: Quick commands for managing your deployment
:: ============================================================

title Thought Weaver Manager

:: Detect compose command
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Docker Compose is not available
        pause
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
) else (
    set "COMPOSE_CMD=docker compose"
)

:menu
cls
echo.
echo  ====================================================
echo   THOUGHT WEAVER - App Manager
echo  ====================================================
echo.
echo   1. Start Application
echo   2. Stop Application
echo   3. Restart Application
echo   4. View Logs (live)
echo   5. Run Health Check
echo   6. Rebuild and Deploy
echo   7. Open in Browser
echo   8. Backup Database
echo   9. Show Container Status
echo   0. Exit
echo.
set /p choice="Select option: "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto logs
if "%choice%"=="5" goto health
if "%choice%"=="6" goto rebuild
if "%choice%"=="7" goto browser
if "%choice%"=="8" goto backup
if "%choice%"=="9" goto status
if "%choice%"=="0" goto exit
goto menu

:start
echo.
echo Starting application...
%COMPOSE_CMD% up -d
echo.
echo Started! Access at http://localhost:5000
timeout /t 3 >nul
goto menu

:stop
echo.
echo Stopping application...
%COMPOSE_CMD% down
echo.
echo Stopped.
timeout /t 3 >nul
goto menu

:restart
echo.
echo Restarting application...
%COMPOSE_CMD% restart
echo.
echo Restarted!
timeout /t 3 >nul
goto menu

:logs
echo.
echo Showing live logs (Ctrl+C to stop)...
echo.
%COMPOSE_CMD% logs -f
goto menu

:health
echo.
call test-app.bat
goto menu

:rebuild
echo.
echo Rebuilding and redeploying...
%COMPOSE_CMD% down
%COMPOSE_CMD% up -d --build
echo.
echo Rebuild complete!
timeout /t 5 >nul
goto menu

:browser
start http://localhost:5000/?demo=true
goto menu

:backup
echo.
echo Creating database backup...
for /f "tokens=2 delims==" %%i in ('wmic os get localdatetime /value') do set "dt=%%i"
set "BACKUP_FILE=bruceops-backup-%dt:~0,8%.sql"
%COMPOSE_CMD% exec db pg_dump -U postgres bruceops > "%BACKUP_FILE%"
echo.
echo Backup saved to: %BACKUP_FILE%
timeout /t 3 >nul
goto menu

:status
echo.
%COMPOSE_CMD% ps
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0
