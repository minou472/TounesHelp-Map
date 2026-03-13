@echo off
echo Cleaning .next cache...
if exist ".next" (rmdir /s /q .next)

echo Starting development server...
npm run dev
pause
