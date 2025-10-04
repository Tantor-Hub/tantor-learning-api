@echo off
echo Event UUID Array Fix Script
echo =============================

REM Check if psql is available
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo psql is not found in PATH. Please install PostgreSQL client or run the SQL script manually.
    echo You can run the SQL script 'fix-event-uuid-issue-simple.sql' directly in your PostgreSQL client (pgAdmin, DBeaver, etc.)
    pause
    exit /b 1
)

echo Found psql in PATH
echo.

REM Set database connection parameters
set /p HOST="Enter database host (default: localhost): "
if "%HOST%"=="" set HOST=localhost

set /p PORT="Enter database port (default: 5432): "
if "%PORT%"=="" set PORT=5432

set /p DATABASE="Enter database name: "
if "%DATABASE%"=="" (
    echo Database name is required!
    pause
    exit /b 1
)

set /p USERNAME="Enter username (default: postgres): "
if "%USERNAME%"=="" set USERNAME=postgres

echo.
echo Running SQL fix script...
echo.

REM Run the SQL script
psql -h %HOST% -p %PORT% -U %USERNAME% -d %DATABASE% -f "fix-event-uuid-issue-simple.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SQL fix completed successfully!
) else (
    echo.
    echo SQL fix failed with exit code: %ERRORLEVEL%
)

echo.
pause
