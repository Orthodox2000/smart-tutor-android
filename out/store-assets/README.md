# Smart Tutors — Store Assets

All Play Store and website assets stored here. Served at:
`https://smart-tutor-android.vercel.app/store-assets/...`

---

## Directory Structure

```
store-assets/
├── icon/
│   ├── icon-512x512.png          ✅ Play Store high-res icon
│   ├── icon-192x192.png          ✅ Web manifest icon
│   ├── favicon-96x96.png         ✅ Favicon
│   ├── apple-touch-icon.png      ✅ Apple touch icon
│   └── logo.png                  ✅ Logo (transparent bg)
├── feature-graphic/
│   ├── README.md                 ← Design specs
│   └── feature-graphic-1024x500.png  ⬜ YOU NEED TO ADD THIS
└── screenshots/
    ├── phone/
    │   ├── README.md             ← Screenshot guide
    │   ├── 01-dashboard.png      ⬜ YOU NEED TO ADD THIS
    │   ├── 02-quiz-arena.png     ⬜ YOU NEED TO ADD THIS
    │   ├── 03-ai-chat.png        ⬜ YOU NEED TO ADD THIS
    │   ├── 04-library.png        ⬜ YOU NEED TO ADD THIS
    │   ├── 05-chat.png           ⬜ YOU NEED TO ADD THIS
    │   └── 06-attendance.png     ⬜ YOU NEED TO ADD THIS
    └── tablet/
        └── README.md             ← Tablet specs
```

---

## What's Ready ✅

| Asset | File | Size | Status |
|---|---|---|---|
| App Icon (512×512) | `icon/icon-512x512.png` | 405KB | ✅ Ready |
| App Icon (192×192) | `icon/icon-192x192.png` | 77KB | ✅ Ready |
| Favicon (96×96) | `icon/favicon-96x96.png` | 22KB | ✅ Ready |
| Apple Touch Icon | `icon/apple-touch-icon.png` | 69KB | ✅ Ready |
| Logo | `icon/logo.png` | 10KB | ✅ Ready |

## What You Need to Add ⬜

| Asset | Dimensions | Where |
|---|---|---|
| Feature Graphic | 1024 × 500 px | `feature-graphic/` |
| Phone Screenshots (2-8) | 1080 × 1920 px | `screenshots/phone/` |
| Tablet Screenshots (optional) | 1200 × 1920 px | `screenshots/tablet/` |

---

## Play Store URLs

| Asset | URL |
|---|---|
| Privacy Policy | `https://smart-tutor-android.vercel.app/privacy-policy` |
| Terms & Conditions | `https://smarttutors.co.in/terms-and-conditions` |
| EULA | `https://smarttutors.co.in/eula` |
| Website | `https://smarttutors.co.in` |

---

## How to Add Screenshots

1. Run app on Android device
2. Go to Dashboard → take screenshot (1080×1920)
3. Go to Quiz Arena → take screenshot
4. Go to AI Chat → take screenshot
5. Go to Library → take screenshot
6. Go to 1-to-1 Chat → take screenshot
7. Go to Attendance → take screenshot
8. Drop all files in `screenshots/phone/` with names above

**Quick capture:** `adb shell screencap -p /sdcard/screenshot.png`
