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

for /f "usebackq delims=" %%L in ("%HASHFILE%") do (
  call :PROCESS_HASH_LINE "%%L"
)
goto :SUMMARY

goto :SUMMARY

:PROCESS_HASH_LINE
set "LINE=%~1"

rem skip blank lines
if "%LINE%"=="" exit /b 0

rem parse as FILE|HASH first, fall back to FILE:HASH
set "FILE="
set "EXPECTED="

for /f "tokens=1* delims=|" %%A in ("%LINE%") do (
  set "FILE=%%~A"
  set "EXPECTED=%%~B"
)

if not defined EXPECTED (
  for /f "tokens=1* delims=:" %%A in ("%LINE%") do (
    set "FILE=%%~A"
    set "EXPECTED=%%~B"
  )
)

rem if still no EXPECTED, malformed line -> ignore
if not defined EXPECTED exit /b 0

rem trim accidental leading spaces in EXPECTED
for /f "tokens=* delims= " %%Z in ("%EXPECTED%") do set "EXPECTED=%%Z"

rem skip self-hash line (hash file verifying itself)
if /i "%FILE%"=="%HASHFILE%" exit /b 0

rem verify file exists
if not exist "%FILE%" (
  echo [FAIL] MISSING: "%FILE%"
  set /a MISSING+=1
  exit /b 0
)

rem compute actual SHA256 and extract first hex line
set "ACTUAL="
for /f "tokens=1" %%H in ('
  certutil -hashfile "%FILE%" SHA256 2^>nul ^| findstr /r /i "^[0-9a-f][0-9a-f]"
') do (
  if not defined ACTUAL set "ACTUAL=%%H"
)

rem if hashing failed, treat as mismatch
if not defined ACTUAL (
  echo [FAIL] HASH_FAIL: "%FILE%"
  set /a MISMATCH+=1
  exit /b 0
)

rem compare
if /i not "%ACTUAL%"=="%EXPECTED%" (
  echo [FAIL] MISMATCH: "%FILE%"
  echo        Expected: %EXPECTED%
  echo        Actual:   %ACTUAL%
  set /a MISMATCH+=1
) else (
  echo [OK]   "%FILE%"
  set /a VERIFIED+=1
)

exit /b 0

:SUMMARY
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
