@echo off
title Mandi Bhav
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup-and-run.ps1"
echo.
pause
