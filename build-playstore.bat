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

echo [1/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo [2/6] Building Next.js for production...
call npx next build
if %errorlevel% neq 0 (
    echo ERROR: Next.js build failed
    exit /b 1
)

echo.
echo [3/6] Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed
    exit /b 1
)

echo.
echo [4/6] Building release AAB (Android App Bundle)...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ERROR: AAB build failed
    cd ..
    exit /b 1
)
cd ..

echo.
echo [5/6] Copying AAB to output folder...
if not exist "output" mkdir output
copy "android\app\build\outputs\bundle\release\app-release.aab" "output\SmartTutors-v1.1.0.aab"

echo.
echo [6/6] Building debug APK for testing...
cd android
call gradlew.bat assembleDebug
cd ..
copy "android\app\build\outputs\apk\debug\app-debug.apk" "output\SmartTutors-debug.apk"

echo.
echo ═══════════════════════════════════════════════
echo   BUILD COMPLETE
echo.
echo   Play Store AAB: output\SmartTutors-v1.1.0.aab
echo   Debug APK:      output\SmartTutors-debug.apk
echo.
echo   Upload the AAB to Google Play Console
echo   at https://play.google.com/console
echo ═══════════════════════════════════════════════
echo.
