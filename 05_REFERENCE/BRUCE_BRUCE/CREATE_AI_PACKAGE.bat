@echo off
REM HarrisWildlands AI Collaboration Package Creator
REM Double-click this file to create a complete package for sharing with AI systems

echo.
echo ========================================================
echo  HarrisWildlands AI Collaboration Package Creator
echo ========================================================
echo.

cd /d "C:\Users\wilds\harriswildlands.com"

echo [1/3] Creating package directory...
if exist "C:\Users\wilds\Desktop\harriswildlands-ai-package" (
    rmdir /s /q "C:\Users\wilds\Desktop\harriswildlands-ai-package"
)

echo [2/3] Running package creator script...
node "%~dp0create-ai-package.js"

echo.
echo [3/3] Package created successfully!
echo.
echo Location: C:\Users\wilds\Desktop\harriswildlands-ai-package
echo.
echo Next steps:
echo   1. Compress folder to ZIP for easier sharing
echo   2. Share with ChatGPT, Claude, or Replit
echo   3. See AI_COLLABORATION_PACKAGE.md for usage guide
echo.
echo ========================================================
pause
