@echo off
echo.
echo ═══════════════════════════════════════════
echo   SMART TUTORS — Capacitor APK Builder
echo ═══════════════════════════════════════════
echo.

echo [1/7] Cleaning previous build artifacts...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
if exist "android\app\build" rmdir /s /q "android\app\build"
if exist "android\app\src\main\assets\public" rmdir /s /q "android\app\src\main\assets\public"
echo Clean complete.

echo.
echo [2/7] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo [3/7] Running TypeScript check...
call npx tsc --noEmit 2>nul
echo TypeScript check complete.

echo.
echo [4/7] Building Next.js for production (static export)...
set CAPACITOR_BUILD=true
set NEXT_PUBLIC_API_BASE=https://smart-tutor-android.vercel.app/api
if exist "src\app\api" ren "src\app\api" "_api_backup"
call npx next build
if %errorlevel% neq 0 (
    if exist "src\app\_api_backup" ren "src\app\_api_backup" "api"
    echo ERROR: Next.js build failed
    exit /b 1
)
if exist "src\app\_api_backup" ren "src\app\_api_backup" "api"

echo.
echo [5/7] Syncing web assets to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)

echo.
echo [6/7] Building Android APK (debug)...
cd android
call gradlew.bat clean
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo [7/7] Copying APK to output folder...
if not exist "output" mkdir output
copy "android\app\build\outputs\apk\debug\app-debug.apk" "output\SmartTutors-debug.apk"

echo.
echo ═══════════════════════════════════════════
echo   BUILD COMPLETE
echo   APK: output\SmartTutors-debug.apk
echo ═══════════════════════════════════════════
echo.
