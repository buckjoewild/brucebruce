@echo off
REM gravity_prove.bat
REM Proof gate driver: Run hash verify + gate, capture all outputs + exit codes
REM Single command = complete verification with immutable proof

setlocal EnableDelayedExpansion

set TS=%date:~-4%-%date:~4,2%-%date:~7,2%
set LOGDIR=C:\GRAVITY\04_LOGS

echo.
echo ========== GRAVITY PROOF GATE ==========
echo Timestamp: %date% %time%
echo Log directory: %LOGDIR%
echo.

REM === RUN HASH VERIFY ===
echo [RUNNING] Hash Verify...
cmd /v:on /c "C:\GRAVITY\03_WORK\TOOLS\gravity_hash_verify.bat > %LOGDIR%\PROVE_HASHVERIFY_OUTPUT_%TS%.txt 2>&1 & echo !errorlevel! > %LOGDIR%\PROVE_HASHVERIFY_EXIT_%TS%.txt"

REM === RUN GATE ===
echo [RUNNING] Gatekeeper...
cmd /v:on /c "C:\GRAVITY\03_WORK\TOOLS\gravity_gate.bat > %LOGDIR%\PROVE_GATE_OUTPUT_%TS%.txt 2>&1 & echo !errorlevel! > %LOGDIR%\PROVE_GATE_EXIT_%TS%.txt"

REM === DISPLAY PROOF ===
echo.
echo ========== PROOF RESULTS ==========
echo Hash Verify Exit Code:
type %LOGDIR%\PROVE_HASHVERIFY_EXIT_%TS%.txt
echo.
echo Gatekeeper Exit Code:
type %LOGDIR%\PROVE_GATE_EXIT_%TS%.txt
echo.

REM === VERDICT ===
set /a HASHVERIFY_EXIT=0
set /a GATE_EXIT=0

for /f %%X in (%LOGDIR%\PROVE_HASHVERIFY_EXIT_%TS%.txt) do set /a HASHVERIFY_EXIT=%%X
for /f %%X in (%LOGDIR%\PROVE_GATE_EXIT_%TS%.txt) do set /a GATE_EXIT=%%X

if !HASHVERIFY_EXIT! equ 0 if !GATE_EXIT! equ 0 (
  echo [PASS] All proof gates passed - system verified
  exit /b 0
) else (
  echo [FAIL] One or more proof gates failed
  exit /b 1
)