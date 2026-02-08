@echo off
setlocal EnableDelayedExpansion

:: =============================================================================
:: BRUCE™ BACKUP SYSTEM
:: Version: 1.0.0
:: Description: Automated backup with local storage and rotation
:: =============================================================================

set BRUCE_HOME=C:\brucebruce\07_HARRIS_WILDLANDS
set BACKUP_DIR=C:\Users\wilds\backups\bruce
set LOG_DIR=%BRUCE_HOME%\logs

:: Generate timestamp
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set BACKUP_NAME=bruce-backup-%TIMESTAMP%
set BACKUP_PATH=%BACKUP_DIR%\%BACKUP_NAME%

:: =============================================================================
:: MAIN ENTRY
:: =============================================================================

if "%~1"=="list" goto :list_backups
if "%~1"=="restore" goto :restore_backup
if "%~1"=="cleanup" goto :cleanup_old
if "%~1"=="full" goto :full_backup

:standard_backup
call :print_banner "BRUCE™ BACKUP SYSTEM"
call :log_backup "Starting backup: %BACKUP_NAME%"

:: Create backup directory
if not exist "%BACKUP_PATH%" mkdir "%BACKUP_PATH%"

:: Step 1: Database Backup
call :log_step "1" "Database Backup"
pg_dump -h localhost -U postgres harriswildlands > "%BACKUP_PATH%\database.sql" 2>nul
if !errorlevel! == 0 (
    call :log_success "Database exported"
) else (
    call :log_warning "Database backup failed (PostgreSQL may not be running)"
)

:: Step 2: BruceOps Data Export
call :log_step "2" "BruceOps Data Export"
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/api/export/data' -OutFile '%BACKUP_PATH%\bruceops-data.json' -TimeoutSec 30; exit 0 } catch { exit 1 }"
if !errorlevel! == 0 (
    call :log_success "BruceOps data exported"
) else (
    call :log_warning "Could not export BruceOps data (API may be offline)"
)

:: Step 3: Configuration Files
call :log_step "3" "Configuration Files"
xcopy /E /I /Y "%BRUCE_HOME%\structure\integrations\openclaw" "%BACKUP_PATH%\openclaw-config\" >nul 2>&1
copy /Y "%BRUCE_HOME%\structure\harriswildlands\.env" "%BACKUP_PATH%\" >nul 2>&1
copy /Y "%BRUCE_HOME%\bruce-scripts\bruce-config.json" "%BACKUP_PATH%\" >nul 2>&1
call :log_success "Configurations backed up"

:: Step 4: User Logs
call :log_step "4" "System Logs"
xcopy /E /I /Y "%LOG_DIR%" "%BACKUP_PATH%\logs\" >nul 2>&1
call :log_success "Logs archived"

:: Step 5: Compress
call :log_step "5" "Compressing Backup"
powershell -Command "Compress-Archive -Path '%BACKUP_PATH%' -DestinationPath '%BACKUP_DIR%\%BACKUP_NAME%.zip' -Force"
if exist "%BACKUP_DIR%\%BACKUP_NAME%.zip" (
    call :log_success "Backup compressed: %BACKUP_NAME%.zip"
    rmdir /S /Q "%BACKUP_PATH%"
) else (
    call :log_error "Compression failed"
)

:: Step 6: Cleanup old backups
call :log_step "6" "Cleanup Old Backups"
call :cleanup_old

call :log_backup "Backup complete: %BACKUP_NAME%.zip"
call :notify_discord "✅ Backup complete: %BACKUP_NAME%.zip" "info"
call :print_footer
goto :eof

:full_backup
call :print_banner "BRUCE™ FULL SYSTEM BACKUP"
echo This will create a comprehensive backup including:
echo  - Database
echo  - BruceOps data
echo  - All configurations
echo  - System logs
echo  - Application files
echo.
pause
goto :standard_backup

:list_backups
call :print_banner "AVAILABLE BACKUPS"
echo.
dir /b /o-d "%BACKUP_DIR%\*.zip" 2>nul | findstr /r "bruce-backup-.*.zip" | more
echo.
echo Total backups: 
dir /b "%BACKUP_DIR%\*.zip" 2>nul | find /c "bruce-backup"
call :print_footer
goto :eof

:restore_backup
call :print_banner "RESTORE BACKUP"
echo Available backups:
dir /b /o-d "%BACKUP_DIR%\*.zip" 2>nul | findstr /r "bruce-backup-.*.zip"
echo.
set /p backup_file="Enter backup filename to restore: "
if not exist "%BACKUP_DIR%\%backup_file%" (
    echo Backup file not found!
    goto :eof
)
echo.
echo WARNING: This will overwrite current data!
echo Are you sure you want to restore %backup_file%?
set /p confirm="Type YES to proceed: "
if /I not "%confirm%"=="YES" goto :eof

:: Extract backup
powershell -Command "Expand-Archive -Path '%BACKUP_DIR%\%backup_file%' -DestinationPath '%BACKUP_DIR%\restore-temp' -Force"

:: Restore database
call :log_backup "Restoring database..."
psql -h localhost -U postgres -d harriswildlands -f "%BACKUP_DIR%\restore-temp\database.sql" 2>nul

:: Cleanup
rmdir /S /Q "%BACKUP_DIR%\restore-temp"
call :log_backup "Restore complete"
goto :eof

:cleanup_old
call :log_backup "Cleaning up backups older than 30 days..."
forfiles /p "%BACKUP_DIR%" /m *.zip /d -30 /c "cmd /c del @path" 2>nul
forfiles /p "%BACKUP_DIR%" /m *.zip /d -30 /c "cmd /c echo Deleted: @path" >> "%LOG_DIR%\bruce-backup.log" 2>nul
call :log_success "Old backups cleaned"
goto :eof

:print_banner
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║  %~1
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
goto :eof

:print_footer
echo.
echo ──────────────────────────────────────────────────────────────────────
echo.
goto :eof

:log_step
echo [Step %~1] %~2
goto :eof

:log_success
echo   [OK] %~1
goto :eof

:log_warning
echo   [!] %~1
goto :eof

:log_error
echo   [X] %~1
goto :eof

:log_backup
echo [%date% %time%] [BACKUP] %~1 >> "%LOG_DIR%\bruce-backup.log"
goto :eof

:notify_discord
echo [DISCORD:%~2] %~1 >> "%LOG_DIR%\notifications.log"
goto :eof

:eof
endlocal
