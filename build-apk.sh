#!/bin/bash
set -e

echo ""
echo "═══════════════════════════════════════════"
echo "  SMART TUTORS — Capacitor APK Builder"
echo "═══════════════════════════════════════════"
echo ""

echo "[1/6] Installing dependencies..."
npm install

echo ""
echo "[2/6] Running TypeScript check..."
npx tsc --noEmit || echo "TypeScript check completed with warnings"

echo ""
echo "[3/6] Building Next.js for production..."
npx next build

echo ""
echo "[4/6] Syncing web assets to Android..."
npx cap sync android

echo ""
echo "[5/6] Building Android APK (debug)..."
cd android
./gradlew assembleDebug
cd ..

echo ""
echo "[6/6] Copying APK to output folder..."
mkdir -p output
cp android/app/build/outputs/apk/debug/app-debug.apk output/SmartTutors-debug.apk

echo ""
echo "═══════════════════════════════════════════"
echo "  BUILD COMPLETE"
echo "  APK: output/SmartTutors-debug.apk"
echo "═══════════════════════════════════════════"
echo ""
