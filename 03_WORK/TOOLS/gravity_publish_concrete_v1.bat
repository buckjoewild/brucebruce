@echo off
REM gravity_publish_concrete_v1.bat
REM Publish GRAVITY concrete v1 bundle
REM Creates: C:\GRAVITY\06_PUBLISH\bundle_2026-01-29__gravity_concrete_v1
REM Copies required files and verifies bundle integrity

setlocal enabledelayedexpansion

echo.
echo ========== GRAVITY PUBLISH CONCRETE V1 ==========
echo.
echo Timestamp: %date% %time%
echo.

set BUNDLE_PATH=C:\GRAVITY\06_PUBLISH\bundle_2026-01-29__gravity_concrete_v1

REM Create bundle directory
echo Creating bundle directory...
if exist "%BUNDLE_PATH%" (
    echo [WARNING] Bundle directory already exists
    echo Removing old bundle...
    rmdir /s /q "%BUNDLE_PATH%" 2>nul
)

mkdir "%BUNDLE_PATH%"
if not exist "%BUNDLE_PATH%" (
    echo [ERROR] Failed to create bundle directory
    exit /b 1
)
echo [OK] Bundle directory created

echo.
echo Copying files to bundle...

REM Copy 00_INDEX files
echo Copying 00_INDEX...
for %%F in (C:\GRAVITY\00_INDEX\*.md) do (
    copy "%%F" "%BUNDLE_PATH%\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] %%~nF
    ) else (
        echo   [ERROR] Failed to copy %%~nF
        exit /b 1
    )
)

REM Copy 01_RUNBOOKS files
echo Copying 01_RUNBOOKS...
for %%F in (C:\GRAVITY\01_RUNBOOKS\*.md) do (
    copy "%%F" "%BUNDLE_PATH%\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] %%~nF
    ) else (
        echo   [ERROR] Failed to copy %%~nF
        exit /b 1
    )
)

REM Copy 02_STATE\STATE_SCHEMA.md
echo Copying 02_STATE...
if exist "C:\GRAVITY\02_STATE\STATE_SCHEMA.md" (
    copy "C:\GRAVITY\02_STATE\STATE_SCHEMA.md" "%BUNDLE_PATH%\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] STATE_SCHEMA.md
    ) else (
        echo   [ERROR] Failed to copy STATE_SCHEMA.md
        exit /b 1
    )
)

REM Copy 03_WORK files
echo Copying 03_WORK...
if exist "C:\GRAVITY\03_WORK\GRAVITY_OPERATIONS_README.md" (
    copy "C:\GRAVITY\03_WORK\GRAVITY_OPERATIONS_README.md" "%BUNDLE_PATH%\" >nul 2>&1
    echo   [OK] GRAVITY_OPERATIONS_README.md
)
if exist "C:\GRAVITY\03_WORK\GRAVITY_OPERATOR_README.md" (
    copy "C:\GRAVITY\03_WORK\GRAVITY_OPERATOR_README.md" "%BUNDLE_PATH%\" >nul 2>&1
    echo   [OK] GRAVITY_OPERATOR_README.md
) else (
    echo   [NOTE] GRAVITY_OPERATOR_README.md not found (optional)
)

REM Copy session log
echo Copying 04_LOGS...
if exist "C:\GRAVITY\04_LOGS\SESSION_LOG_2026-01-29.md" (
    copy "C:\GRAVITY\04_LOGS\SESSION_LOG_2026-01-29.md" "%BUNDLE_PATH%\" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] SESSION_LOG_2026-01-29.md
    ) else (
        echo   [WARNING] Failed to copy session log
    )
)

REM Verify bundle contents
echo.
echo Verifying bundle contents...
dir "%BUNDLE_PATH%" /b

set FILE_COUNT=0
for %%F in ("%BUNDLE_PATH%\*") do (
    set /a FILE_COUNT+=1
)

echo.
if !FILE_COUNT! geq 10 (
    echo [OK] Bundle contains !FILE_COUNT! files
    echo [SUCCESS] Bundle created: %BUNDLE_PATH%
    exit /b 0
) else (
    echo [ERROR] Bundle incomplete (!FILE_COUNT! files, expected 10+)
    exit /b 1
)
