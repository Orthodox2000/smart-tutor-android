@echo off
echo.
echo ═══════════════════════════════════════════
echo   SMART TUTORS — Capacitor APK Builder
echo ═══════════════════════════════════════════
echo.

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo [2/6] Running TypeScript check...
call npx tsc --noEmit 2>nul
echo TypeScript check complete.

echo.
echo [3/6] Building Next.js for production...
call npx next build
if %errorlevel% neq 0 (
    echo ERROR: Next.js build failed
    exit /b 1
)

echo.
echo [4/6] Syncing web assets to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)

echo.
echo [5/6] Building Android APK (debug)...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo [6/6] Copying APK to output folder...
if not exist "output" mkdir output
copy "android\app\build\outputs\apk\debug\app-debug.apk" "output\SmartTutors-debug.apk"

echo.
echo ═══════════════════════════════════════════
echo   BUILD COMPLETE
echo   APK: output\SmartTutors-debug.apk
echo ═══════════════════════════════════════════
echo.
