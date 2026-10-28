@echo off
cd /d "%~dp0"

if not exist "FNAF-Wiki.html" (
  echo FNAF-Wiki.html was not found.
  echo Build it first with:  npm run build
  pause
  exit /b 1
)

start "" "FNAF-Wiki.html"
