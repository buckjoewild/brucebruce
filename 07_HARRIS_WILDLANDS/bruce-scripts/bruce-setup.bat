@echo off

:: ============================================================================
:: BRUCE SETUP - Add to PATH
:: ============================================================================

echo Adding Bruce to your system PATH...
echo.

set BRUCE_SCRIPTS=C:\brucebruce\07_HARRIS_WILDLANDS\bruce-scripts

:: Check if already in PATH
echo %PATH% | find /i "%BRUCE_SCRIPTS%" >nul
if %errorlevel% == 0 (
    echo Bruce is already in your PATH.
    goto :done
)

:: Add to system PATH (requires admin)
echo Attempting to add to system PATH...
setx /M PATH "%PATH%;%BRUCE_SCRIPTS%" 2>nul

if %errorlevel% == 0 (
    echo SUCCESS: Bruce added to system PATH
    echo.
    echo You can now use 'bruce-master' from anywhere!
    echo.
    echo Available commands:
    echo   bruce-master start    - Start all services
    echo   bruce-master stop     - Stop all services
    echo   bruce-master status   - Check status
    echo   bruce-master health   - Health check
    echo   bruce-master monitor  - Start monitoring
) else (
    echo WARNING: Could not add to system PATH (need admin rights)
    echo.
    echo You can still use Bruce by navigating to:
    echo   %BRUCE_SCRIPTS%
    echo.
    echo Or run this script as Administrator.
)

:done
echo.
pause
