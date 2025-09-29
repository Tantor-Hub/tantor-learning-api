@echo off
REM Start the application with increased memory limit
REM This script sets Node.js memory limit to 4GB to prevent heap out of memory errors

echo Starting Tantor Learning API with increased memory limit...

REM Set Node.js memory limit to 4GB (4096MB)
set NODE_OPTIONS=--max-old-space-size=4096

REM Start the application
npm run start:dev

REM Alternative commands for different environments:
REM For production: npm run start:prod
REM For build: npm run build
