@echo off
setlocal
call "%~dp0bruce-master.bat" status
echo.
echo === BruceOps log (last 50) ===
powershell -Command "Get-Content 'C:\brucebruce\07_HARRIS_WILDLANDS\logs\\bruceops.log' -Tail 50 -ErrorAction SilentlyContinue"
echo.
echo === MUD log (last 50) ===
powershell -Command "Get-Content 'C:\brucebruce\07_HARRIS_WILDLANDS\logs\\mud.log' -Tail 50 -ErrorAction SilentlyContinue"
endlocal