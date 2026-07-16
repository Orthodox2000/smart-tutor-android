@echo off
echo.
echo ═══════════════════════════════════════════════
echo   SMART TUTORS — Generate Release Keystore
echo ═══════════════════════════════════════════════
echo.

set KEYSTORE_PATH=android\app\smarttutors.keystore
set KEY_ALIAS=smarttutors
set STORE_PASS=SmartTutors2025!
set KEY_PASS=SmartTutors2025!

if exist "%KEYSTORE_PATH%" (
    echo Keystore already exists at %KEYSTORE_PATH%
    echo Delete it first if you want to regenerate.
    exit /b 0
)

echo Generating release keystore...
keytool -genkeypair -v -keystore "%KEYSTORE_PATH%" -alias %KEY_ALIAS% -keyalg RSA -keysize 2048 -validity 10000 -storepass %STORE_PASS% -keypass %KEY_PASS% -dname "CN=Smart Tutors, OU=Development, O=Smart Tutors, L=Pune, ST=Maharashtra, C=IN"

if %errorlevel% neq 0 (
    echo ERROR: Keystore generation failed
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════
echo   KEYSTORE GENERATED SUCCESSFULLY
echo   Path: %KEYSTORE_PATH%
echo   Alias: %KEY_ALIAS%
echo   Store Password: %STORE_PASS%
echo   Key Password: %KEY_PASS%
echo.
echo   IMPORTANT: Keep this keystore safe!
echo   You need it for every Play Store update.
echo ═══════════════════════════════════════════════
echo.
