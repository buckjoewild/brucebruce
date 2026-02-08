@echo off
setlocal EnableExtensions

echo ========== BRUCE MIRROR V1 ==========
echo Timestamp: %date% %time%

set "SRC=C:\Users\wilds\harriswildlands.com\BRUCE_BRUCE"
set "DST=C:\GRAVITY\05_REFERENCE\BRUCE_BRUCE"

echo [INFO] SRC: "%SRC%"
echo [INFO] DST: "%DST%"

if not exist "%SRC%" (
  echo [FAIL] Source missing: "%SRC%"
  exit /b 2
)

if not exist "%DST%" (
  mkdir "%DST%" >nul 2>&1
)

echo [INFO] Mirroring BRUCE_BRUCE to GRAVITY reference...
robocopy "%SRC%" "%DST%" /MIR /R:1 /W:1 /NFL /NDL /NP
set "RC=%errorlevel%"

rem Robocopy success codes: 0-7; failure: 8+
if %RC% GEQ 8 (
  echo [FAIL] robocopy failed with code %RC%
  exit /b %RC%
)

echo [OK] Mirror complete (robocopy code %RC%)
exit /b 0
