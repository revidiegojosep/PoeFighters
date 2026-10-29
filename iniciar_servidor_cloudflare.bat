@echo off
title PoeFighters - Servidor Online (Cloudflare Tunnel)
cd /d "%~dp0"
cls
echo ==============================================================================
echo                 POEFIGHTERS - SERVIDOR ONLINE (CLOUDFLARE)
echo ==============================================================================
echo.
echo  Conectando con la red global de Cloudflare...
echo.
echo  INSTRUCCIONES:
echo  1. Espera unos segundos a que aparezca abajo la caja con tu enlace.
echo  2. Copia la direccion que termina en .trycloudflare.com
echo  3. Anadele /PoeFighters/ al final para entrar al juego:
echo.
echo       Ejemplo: https://tu-enlace.trycloudflare.com/PoeFighters/
echo.
echo ==============================================================================
echo.
if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
    "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:80
) else (
    cloudflared tunnel --url http://localhost:80
)
pause
