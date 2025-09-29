@echo off
REM Pre-commit check script for Windows
REM This script runs before commits to ensure code quality and security

echo 🚀 Running pre-commit checks...

REM Check if we're in a git repository
if not exist ".git" (
    echo ❌ Not in a git repository
    exit /b 1
)

REM 1. Security Audit
echo 🔍 Running security audit...
call npm audit --audit-level=moderate
if %errorlevel% neq 0 (
    echo ❌ Security audit failed!
    exit /b 1
)
echo ✅ Security audit passed

REM 2. Install dependencies
echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    exit /b 1
)
echo ✅ Dependencies installed

REM 3. Linting
echo 🔍 Running ESLint...
call npm run lint
if %errorlevel% neq 0 (
    echo ❌ Linting failed!
    exit /b 1
)
echo ✅ Linting passed

REM 4. Type Check
echo 🔍 Running TypeScript type check...
call npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript type check failed!
    exit /b 1
)
echo ✅ TypeScript type check passed

REM 5. Build
echo 🔨 Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)
echo ✅ Build successful

REM 6. Tests
echo 🧪 Running tests...
call npm run test
if %errorlevel% neq 0 (
    echo ❌ Tests failed!
    exit /b 1
)
echo ✅ All tests passed

echo 🎉 All pre-commit checks passed! Ready to commit.
