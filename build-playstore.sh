#!/bin/bash
set -e

echo ""
echo "═══════════════════════════════════════════════"
echo "  SMART TUTORS — Play Store Build (AAB)"
echo "═══════════════════════════════════════════════"
echo ""

# Generate keystore if not exists
if [ ! -f "android/app/smarttutors.keystore" ]; then
    echo "[0] Generating release keystore..."
    keytool -genkeypair -v \
        -keystore android/app/smarttutors.keystore \
        -alias smarttutors \
        -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass SmartTutors2025! \
        -keypass SmartTutors2025! \
        -dname "CN=Smart Tutors, OU=Development, O=Smart Tutors, L=Pune, ST=Maharashtra, C=IN"
fi

echo "[1/6] Installing dependencies..."
npm install

echo ""
echo "[2/6] Building Next.js for production..."
npx next build

echo ""
echo "[3/6] Syncing to Android..."
npx cap sync android

echo ""
echo "[4/6] Building release AAB (Android App Bundle)..."
cd android
./gradlew bundleRelease
cd ..

echo ""
echo "[5/6] Copying AAB to output folder..."
mkdir -p output
cp android/app/build/outputs/bundle/release/app-release.aab output/SmartTutors-v1.1.0.aab

echo ""
echo "[6/6] Building debug APK for testing..."
cd android
./gradlew assembleDebug
cd ..
cp android/app/build/outputs/apk/debug/app-debug.apk output/SmartTutors-debug.apk

echo ""
echo "═══════════════════════════════════════════════"
echo "  BUILD COMPLETE"
echo ""
echo "  Play Store AAB: output/SmartTutors-v1.1.0.aab"
echo "  Debug APK:      output/SmartTutors-debug.apk"
echo ""
echo "  Upload the AAB to Google Play Console"
echo "  at https://play.google.com/console"
echo "═══════════════════════════════════════════════"
echo ""
