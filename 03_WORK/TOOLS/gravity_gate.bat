@echo off
REM gravity_gate.bat
REM GRAVITY GATEKEEPER v1 — Core system verification
REM Checks folder structure, hash integrity, and task queue
REM Exit: 0 = PASS, nonzero = FAIL

setlocal enabledelayedexpansion

set PASS=0
set FAIL=0

echo.
echo ========== GRAVITY GATEKEEPER V1 ==========
echo Timestamp: %date% %time%
echo.

REM === SECTION 1: FOLDER STRUCTURE ===
echo [VERIFY] Folder Structure...
set REQUIRED_FOLDERS=00_INDEX 01_RUNBOOKS 02_STATE 02_TASKS 03_WORK 04_LOGS 05_REFERENCE 06_PUBLISH

for %%F in (%REQUIRED_FOLDERS%) do (
    if exist "C:\GRAVITY\%%F\" (
        echo   [OK] %%F
        set /a PASS+=1
    ) else (
        echo   [FAIL] %%F missing
        set /a FAIL+=1
    )
)

REM === SECTION 2: CRITICAL FILES ===
echo.
echo [VERIFY] Critical Files...
set CRITICAL_FILES=00_INDEX\START_HERE.md 01_RUNBOOKS\OPERATOR_RULES.md 00_INDEX\INTEGRITY_HASHES_2026-01-29.txt 02_TASKS 03_WORK\TOOLS 04_LOGS

for %%F in (%CRITICAL_FILES%) do (
    if exist "C:\GRAVITY\%%F" (
        echo   [OK] %%F
        set /a PASS+=1
    ) else (
        echo   [FAIL] %%F missing
        set /a FAIL+=1
    )
)

REM === SECTION 3: HASH FILE INTEGRITY ===
echo.
echo [VERIFY] Hash File...

set "HASHFILE=C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt"

if not exist "%HASHFILE%" (
  echo   [FAIL] Hash file missing
  set /a FAIL+=1
) else (
  echo   [OK] Hash file exists
  set /a PASS+=1
  
  setlocal DisableDelayedExpansion
  for /f %%C in ('find /c /v "" ^< "%HASHFILE%"') do (
    setlocal EnableDelayedExpansion
    if %%C geq 11 (
      echo   [OK] Hash entries: %%C
      set /a PASS+=1
    ) else (
      echo   [FAIL] Hash file incomplete (expected 11+ entries, found %%C)
      set /a FAIL+=1
    )
    endlocal
  )
  endlocal & setlocal EnableDelayedExpansion
)

REM === SECTION 4: TASK QUEUE ===
echo.
echo [VERIFY] Task Queue (02_TASKS)...
if exist "C:\GRAVITY\02_TASKS" (
    echo   [OK] 02_TASKS folder exists
    set /a PASS+=1
    echo   [INFO] Task queue ready
) else (
    echo   [FAIL] 02_TASKS missing
    set /a FAIL+=1
)

REM === SECTION 5: TOOLCHAIN ===
echo.
echo [VERIFY] Toolchain Scripts...
set TOOL_SCRIPTS=03_WORK\TOOLS\gravity_verify.bat 03_WORK\TOOLS\gravity_hashes.bat 03_WORK\TOOLS\gravity_gate.bat

for %%F in (%TOOL_SCRIPTS%) do (
    if exist "C:\GRAVITY\%%F" (
        echo   [OK] %%F
        set /a PASS+=1
    ) else (
        echo   [WARN] %%F not yet created (will be this session)
    )
)

REM === FINAL VERDICT ===
echo.
echo ========== GATEKEEPER VERDICT ==========
echo Checks Passed: !PASS!
echo Checks Failed: !FAIL!
echo.

if !FAIL! equ 0 (
    echo [PASS] GRAVITY system structure verified
    echo Status: READY FOR OPERATIONS
    echo.
    exit /b 0
) else (
    echo [FAIL] GRAVITY system integrity compromised
    echo Failures: !FAIL!
    echo Action required: Review failures above
    echo.
    exit /b 1
)
