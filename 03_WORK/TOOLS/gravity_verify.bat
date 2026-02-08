@echo off
REM gravity_verify.bat
REM GRAVITY system verification script
REM Prints: timestamp, scope, directory tree, logs/publish directories
REM Exit: always 0 (verification only)

setlocal

echo.
echo ========== GRAVITY SYSTEM VERIFICATION ==========
echo.
echo Timestamp: %date% %time%
echo.

echo --- SCOPE REMINDER ---
echo WRITE:   C:\GRAVITY
echo READ:    C:\Users\wilds\harriswildlands.com
echo SUPPORT: C:\Users\wilds\Desktop\UV (execute only)
echo.

echo --- DIRECTORY TREE ---
echo C:\GRAVITY folder structure:
tree C:\GRAVITY /f
echo.

echo --- LOGS AND PUBLISH DIRECTORIES ---
echo.
echo Log Files:
dir C:\GRAVITY\04_LOGS\*.md /b 2>nul || echo (no logs found)
echo.
echo Publish Bundles:
dir C:\GRAVITY\06_PUBLISH\ /ad /b 2>nul || echo (no bundles found)
echo.

echo --- VERIFICATION COMPLETE ---
echo GRAVITY system is ready for operations.
echo.

exit /b 0
