@echo off
setlocal
cd /d "%~dp0"
where powershell.exe >nul 2>nul
if errorlevel 1 (
  echo No se encuentra Windows PowerShell 5.1.
  pause
  exit /b 1
)
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0launchers\server-windows.ps1"
if errorlevel 1 (
  echo.
  echo El lanzador ha finalizado con error.
  pause
)
