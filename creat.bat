@echo off
chcp 65001 >nul
cls
echo ========================================
echo   教会聚会播放器一键部署脚本
echo ========================================
echo.

REM 检查是否在正确目录
if not exist "app.js" (
   echo [错误] 请将此脚本放在项目根目录（与app.js同一层）
   pause
   exit /b 1
)

echo [步骤1] 初始化Git仓库...
if exist ".git" (
   echo   Git仓库已存在，跳过
) else (
   git init
)

echo [步骤2] 关联到GitHub仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/konbinox/church-platform.git

echo [步骤3] 添加所有文件...
git add .
echo [步骤4] 提交更改...
git commit -m "自动部署 %date% %time%"

echo [步骤5] 推送到GitHub（这需要几秒）...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo           🎉 部署完成！
echo ========================================
echo.
echo 访问地址：https://konbinox.github.io/church-platform/
echo.
echo [提示] 等待1-2分钟让GitHub Pages生效
echo.
pause