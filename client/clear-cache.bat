@echo off
echo ========================================
echo Clearing Next.js cache and rebuilding...
echo ========================================

echo.
echo [1/4] Removing .next directory...
if exist .next (
    rmdir /s /q .next
    echo .next directory removed successfully
) else (
    echo .next directory not found
)

echo.
echo [2/4] Removing node_modules cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo node_modules\.cache removed successfully
) else (
    echo node_modules\.cache not found
)

echo.
echo [3/4] Clearing npm cache...
call npm cache clean --force

echo.
echo [4/4] Rebuilding project...
call npm run build

echo.
echo ========================================
echo Cache cleared and rebuild complete!
echo ========================================
pause
