@echo off
REM gravity_freeze.bat
REM Apply read-only attributes to frozen files
REM Run with administrator privileges

echo Applying read-only attributes to frozen GRAVITY files...
echo.

REM 01_RUNBOOKS freeze
echo Freezing 01_RUNBOOKS...
attrib +R "C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md"
attrib +R "C:\GRAVITY\01_RUNBOOKS\SESSION_START.md"
attrib +R "C:\GRAVITY\01_RUNBOOKS\SESSION_END.md"
attrib +R "C:\GRAVITY\01_RUNBOOKS\PUBLISH_PROCESS.md"
attrib +R "C:\GRAVITY\01_RUNBOOKS\EMERGENCY_RESET.md"
attrib +R "C:\GRAVITY\01_RUNBOOKS\ALLOWED_PATHS.md"

REM 00_INDEX selective freeze
echo Freezing 00_INDEX critical files...
attrib +R "C:\GRAVITY\00_INDEX\START_HERE.md"
attrib +R "C:\GRAVITY\00_INDEX\SYSTEM_MAP.md"
attrib +R "C:\GRAVITY\00_INDEX\FOREMAN_TASK_ORDER_TEMPLATE.md"
attrib +R "C:\GRAVITY\00_INDEX\OPERATOR_SESSION_PROMPT.md"

REM Hash file freeze
echo Freezing integrity hashes...
attrib +R "C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt"

echo.
echo Verification: Checking read-only status...
attrib "C:\GRAVITY\01_RUNBOOKS\OPERATOR_RULES.md"
attrib "C:\GRAVITY\00_INDEX\START_HERE.md"
attrib "C:\GRAVITY\00_INDEX\INTEGRITY_HASHES_2026-01-29.txt"

echo.
echo Read-only attributes applied.
echo Run with administrator privileges for full effect.
