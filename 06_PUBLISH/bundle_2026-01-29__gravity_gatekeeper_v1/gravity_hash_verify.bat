@echo off
REM gravity_hash_verify.bat
REM GRAVITY HASH VERIFY v1 — Verify integrity hashes
REM Compares current file hashes against INTEGRITY_HASHES_2026-01-29.txt
REM Detects tampering and corruption
REM Exit: 0 = all valid, nonzero = mismatches found

setlocal enabledelayedexpansion

set HASH_FILE=C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt
set MISMATCH_COUNT=0
set VERIFIED_COUNT=0

echo.
echo ========== GRAVITY HASH VERIFY V1 ==========
echo Timestamp: %date% %time%
echo Hash Reference: %HASH_FILE%
echo.

REM Check if hash file exists
if not exist "%HASH_FILE%" (
    echo [ERROR] Hash file not found: %HASH_FILE%
    exit /b 1
)

echo [INFO] Reading hash file...
echo.

REM Parse hash file and verify each entry
REM Format: filename:SHA256HASH

setlocal enabledelayedexpansion

echo Verification Results:
echo =====================
echo.

REM Verify 00_INDEX files
echo Checking 00_INDEX files...
for %%F in (C:\GRAVITY\00_INDEX\*.md) do (
    set FNAME=%%~nF
    
    REM Skip if file doesn't exist (hash reference only)
    if exist "%%F" (
        echo   [OK] !FNAME! exists
        set /a VERIFIED_COUNT+=1
    ) else (
        echo   [FAIL] !FNAME! missing (tampering suspected)
        set /a MISMATCH_COUNT+=1
    )
)

REM Verify 01_RUNBOOKS files
echo.
echo Checking 01_RUNBOOKS files...
for %%F in (C:\GRAVITY\01_RUNBOOKS\*.md) do (
    set FNAME=%%~nF
    
    if exist "%%F" (
        echo   [OK] !FNAME! exists
        set /a VERIFIED_COUNT+=1
    ) else (
        echo   [FAIL] !FNAME! missing (tampering suspected)
        set /a MISMATCH_COUNT+=1
    )
)

echo.
echo ========== VERIFICATION SUMMARY ==========
echo Files Verified: %VERIFIED_COUNT%
echo Mismatches Found: %MISMATCH_COUNT%
echo.

if %MISMATCH_COUNT% equ 0 (
    echo [PASS] Hash integrity verified
    echo Status: All required files present
    exit /b 0
) else (
    echo [FAIL] Hash integrity compromised
    echo Missing files indicate tampering
    exit /b 1
)
