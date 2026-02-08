@echo off
REM HarrisWildlands AI Package Creator - PowerShell Version
REM No Node.js required!

echo.
echo ========================================================
echo  HarrisWildlands AI Collaboration Package Creator
echo  (PowerShell Version - No Node.js Required)
echo ========================================================
echo.

REM Run PowerShell script
PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Create-AI-Package.ps1"

echo.
echo ========================================================
pause
