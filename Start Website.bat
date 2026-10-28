@echo off
setlocal
title FNAF Wiki - Dev Server
cd /d "%~dp0"

if not exist "node_modules" (
  echo First run: installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

echo.
echo Starting the wiki at http://localhost:5173
echo Press Ctrl+C in this window to stop the server.
echo.
start "" "http://localhost:5173"
call npm run dev
goto :end

:fail
echo.
echo Could not install dependencies. Opening the offline build instead...
if exist "FNAF-Wiki.html" start "" "FNAF-Wiki.html"
pause

:end
endlocal
