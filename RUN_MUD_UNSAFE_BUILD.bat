@echo off
setlocal
cd /d "%~dp0"

REM WARNING: allows builds if you also arm/consent in-game
set "IDLE_MODE=0"

call RUN_MUD.bat
endlocal
