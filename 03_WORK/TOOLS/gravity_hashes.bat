@echo off
REM gravity_hashes.bat
REM Deterministic hash file generator
REM Format: C:\GRAVITY\path\file.md|SHA256HEX64
REM Exit: 0 = success, nonzero = failure

setlocal EnableExtensions EnableDelayedExpansion

set "HASHFILE=C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt"
set "TMPFILE=%HASHFILE%.tmp"

echo.
echo ========== GRAVITY HASH GENERATOR ==========
echo Timestamp: %date% %time%
echo Output: %HASHFILE%
echo.

del /q "%TMPFILE%" 2>nul

echo Generating hashes for 00_INDEX...
for %%F in (C:\GRAVITY\00_INDEX\*.md) do call :ADDHASH "%%~fF"

echo Generating hashes for 01_RUNBOOKS...
for %%F in (C:\GRAVITY\01_RUNBOOKS\*.md) do call :ADDHASH "%%~fF"

if not exist "%TMPFILE%" (
  echo [FAIL] Unable to create hash file
  exit /b 1
)

move /y "%TMPFILE%" "%HASHFILE%" >nul
if errorlevel 1 (
  echo [FAIL] Unable to write hash file: "%HASHFILE%"
  exit /b 1
)

echo.
for /f %%C in ('find /c /v "" ^< "%HASHFILE%"') do (
  echo [OK] Hash file written with %%C entries
)
exit /b 0

REM ADDHASH subroutine
:ADDHASH
set "FILE=%~1"

if not exist "%FILE%" (
  echo   [WARN] Skipping missing file: "%FILE%"
  exit /b 0
)

REM Extract hash from certutil output (64-char hex line)
set "HASH="
for /f "tokens=1" %%H in ('certutil -hashfile "%FILE%" SHA256 2^>nul ^| findstr /r /i "^[0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f][0-9A-Fa-f]"') do (
  set "HASH=%%H"
)

if not defined HASH (
  echo   [FAIL] Cannot compute hash: "%FILE%"
  exit /b 1
)

echo   [OK] %FILE%
>> "%TMPFILE%" echo %FILE%^|%HASH%
exit /b 0
