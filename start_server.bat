@echo off
title PokeFighters Server (Port 8080)
echo ===================================================
echo   Iniciando PokeFighters para Ngrok en puerto 8080
echo ===================================================
echo Servidor escuchando en: http://localhost:8080
echo Compatible con ngrok: https://effortful-nonderisive-silvana.ngrok-free.dev/
echo.
c:\xampp\php\php.exe -S [::]:8080 router.php
pause
