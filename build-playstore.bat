@echo off
echo.
echo ═══════════════════════════════════════════════
echo   SMART TUTORS — Play Store Build (AAB)
echo ═══════════════════════════════════════════════
echo.

:: Generate keystore if not exists
if not exist "android\app\smarttutors.keystore" (
    echo [0] Generating release keystore...
    call generate-keystore.bat
)

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
echo [3/7] Building Next.js for production (static export)...
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
echo [4/7] Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)

echo.
echo [5/7] Building release AAB (Android App Bundle)...
cd android
call gradlew.bat clean
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ERROR: AAB build failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo [6/7] Copying AAB to output folder...
if not exist "output" mkdir output
copy "android\app\build\outputs\bundle\release\app-release.aab" "output\SmartTutors-v1.6.0.aab"

echo.
echo [7/7] Building debug APK for testing...
cd android
call gradlew.bat assembleDebug
cd ..
copy "android\app\build\outputs\apk\debug\app-debug.apk" "output\SmartTutors-debug.apk"

echo.
echo ═══════════════════════════════════════════════
echo   BUILD COMPLETE
echo.
echo   Play Store AAB: output\SmartTutors-v1.6.0.aab
echo   Debug APK:      output\SmartTutors-debug.apk
echo.
echo   Upload the AAB to Google Play Console
echo   at https://play.google.com/console
echo ═══════════════════════════════════════════════
echo.
