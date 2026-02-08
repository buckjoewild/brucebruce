@echo off
REM gravity_hash_verify.bat
REM Verify hash integrity against INTEGRITY_HASHES_2026-01-29.txt
REM Format: C:\GRAVITY\path\file.md|SHA256HEX64
REM Exit: 0 = all valid, 1 = mismatches found

setlocal EnableExtensions EnableDelayedExpansion

set "HASHFILE=C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt"

echo.
echo ========== GRAVITY HASH VERIFY V1 ==========
echo Timestamp: %date% %time%
echo Hash Reference: %HASHFILE%
echo.

if not exist "%HASHFILE%" (
  echo [ERROR] Hash file missing: %HASHFILE%
  exit /b 1
)

set /a VERIFIED=0
set /a MISMATCH=0
set /a MISSING=0

echo Verification Results:
echo =====================
echo.

REM Parse hash file: path|SHA256
REM Use tokens=1,2 delims=| to split on pipe
for /f "tokens=1,2 delims=|" %%A in ("%HASHFILE%") do (
  set "FILE=%%A"
  set "EXPECTED=%%B"
  
  if not exist "!FILE!" (
    echo [FAIL] MISSING: "!FILE!"
    set /a MISSING+=1
    set /a MISMATCH+=1
  ) else (
    REM Compute actual hash
    set "ACTUAL="
    for /f "tokens=1" %%H in ('certutil -hashfile "!FILE!" SHA256 2^>nul ^| findstr /r /i "^[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]"') do (
      if not defined ACTUAL set "ACTUAL=%%H"
    )
    if not defined ACTUAL (
      echo [FAIL] HASH_ERROR: "!FILE!"
      set /a MISMATCH+=1
    ) else if /i "!ACTUAL!"=="!EXPECTED!" (
      echo [OK] "!FILE!"
      set /a VERIFIED+=1
    ) else (
      echo [FAIL] MISMATCH: "!FILE!"
      echo        Expected: !EXPECTED!
      echo        Actual:   !ACTUAL!
      set /a MISMATCH+=1
    )
  )
)

echo.
echo ========== VERIFICATION SUMMARY ==========
echo Files Verified: %VERIFIED%
echo Mismatches Found: %MISMATCH%
echo Missing Files: %MISSING%
echo.

if %MISMATCH% gtr 0 (
  echo [FAIL] Integrity compromised
  exit /b 1
)

echo [PASS] All files verified - system clean
exit /b 0
