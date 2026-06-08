@echo off
chcp 65001 >nul
echo ================================
echo  农庄预约 - 本地服务器
echo ================================
echo.
ipconfig | findstr /R "IPv4.*192\.168\. 169\.254\. 10\."
echo.
echo 把上面的 IP 地址告诉朋友，格式：
echo http://你的IP:8080
echo.
echo 按 Ctrl+C 停止服务器
echo ================================
echo.
cd /d "%~dp0"
python -m http.server 8080
pause
