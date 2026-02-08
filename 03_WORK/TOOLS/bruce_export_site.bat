@echo off
setlocal EnableExtensions

echo ========== BRUCE EXPORT SITE V1 ==========
echo Timestamp: %date% %time%

set "REL_SITE=brucebruce codex"
set "SRC=C:\GRAVITY\05_REFERENCE\BRUCE_BRUCE\%REL_SITE%"
set "DST=C:\GRAVITY\05_EXPORT\BRUCE_BRUCE__CODEX"

echo [INFO] REL_SITE: "%REL_SITE%"
echo [INFO] SRC:      "%SRC%"
echo [INFO] DST:      "%DST%"

if not exist "%SRC%" (
  echo [FAIL] Source codex missing: "%SRC%"
  echo        (Run bruce_mirror.bat first.)
  exit /b 2
)

if not exist "%DST%" (
  mkdir "%DST%" >nul 2>&1
)

echo [INFO] Exporting codex payload to GRAVITY export...
robocopy "%SRC%" "%DST%" /MIR /R:1 /W:1 /NFL /NDL /NP
set "RC=%errorlevel%"

rem Robocopy success codes: 0-7; failure: 8+
if %RC% GEQ 8 (
  echo [FAIL] robocopy failed with code %RC%
  exit /b %RC%
)

echo [OK] Export complete (robocopy code %RC%)
exit /b 0
