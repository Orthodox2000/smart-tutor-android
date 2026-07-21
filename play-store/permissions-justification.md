# Smart Tutors — Android Permissions Justification

This document provides justification for each permission declared in the app's `AndroidManifest.xml`. This is required for Google Play's permission declaration form and review process.

---

## Declared Permissions

### 1. `android.permission.INTERNET`

**Status:** Required

**Justification:**

The `INTERNET` permission is essential for the core functionality of Smart Tutors. The app is an online education platform that communicates with remote servers for virtually all features:

- **API Communication:** All app data (courses, tests, attendance, grades, fees, user profiles) is fetched from and synced to cloud servers via REST API calls.
- **Live Sessions:** Joining Google Meet-based live classes requires internet connectivity.
- **AI Chatbot (SmartTutors AI):** The AI-powered doubt resolution system sends queries to a remote AI service and streams responses back.
- **Digital Library:** Loading textbooks, notes, and mock papers from the content delivery network.
- **Real-time Chat:** The 1-to-1 messaging feature requires a persistent network connection for message delivery.
- **Notifications:** Receiving push notifications for session reminders, fee alerts, and updates.
- **Crash Reporting:** Submitting anonymized crash logs to help improve app stability.

**Without this permission, the app cannot function.** Smart Tutors is not an offline-only application; it is designed as an online learning platform that relies on server communication for its core value proposition.

---

### 2. `android.permission.ACCESS_NETWORK_STATE`

**Status:** Required

**Justification:**

The `ACCESS_NETWORK_STATE` permission allows the app to check the current state of the device's network connection (Wi-Fi, mobile data, or no connection). This is used for:

- **Connectivity Awareness:** Displaying appropriate UI states (offline banners, retry prompts) when the device has no internet connection, preventing confusing error states.
- **Smart Content Loading:** Deferring non-critical data sync when on mobile data to conserve bandwidth, and loading full content when on Wi-Fi.
- **Error Prevention:** Gracefully handling network interruptions during live sessions, quiz submissions, and payment transactions instead of crashing.
- **Offline Mode Indicators:** Showing users which features are available offline (cached content) vs. which require connectivity.

This permission does not transmit any data. It only reads the local device's network state to improve user experience.

---

## Permissions NOT Included (Removed)

The following permissions are **not** declared in the app manifest and are not used by Smart Tutors:

| Permission | Status | Reason for Exclusion |
|---|---|---|
| `ACCESS_FINE_LOCATION` | **NOT USED** | The app does not track or use GPS location. Approximate location is derived from IP addresses server-side and does not require device location permissions. |
| `ACCESS_COARSE_LOCATION` | **NOT USED** | Same as above. No device-level location access is needed. |
| `CAMERA` | **NOT USED** | Live sessions use Google Meet which manages its own camera access. The Smart Tutors app itself does not directly access the camera. |
| `RECORD_AUDIO` | **NOT USED** | Same as above. Audio is managed by the Google Meet SDK during live sessions. |
| `READ_EXTERNAL_STORAGE` | **NOT USED** | The app does not read device files. Content is loaded from the app's private storage. |
| `WRITE_EXTERNAL_STORAGE` | **NOT USED** | The app uses scoped storage APIs and does not write to shared device storage. |
| `READ_CONTACTS` | **NOT USED** | The app does not access the device's contact list. |
| `READ_PHONE_STATE` | **NOT USED** | The app does not need to read phone state or device identifiers beyond what is provided by Android's standard app APIs. |

---

## Summary

Smart Tutors requests only **2 permissions** — both are standard, low-sensitivity Android permissions that are essential for an online education platform:

| Permission | Sensitivity | Essential |
|---|---|---|
| `INTERNET` | Low | Yes — core functionality |
| `ACCESS_NETWORK_STATE` | Low | Yes — user experience |

This minimal permission set reflects our commitment to user privacy and data protection. The app does not access location, camera, microphone, contacts, storage, or any other sensitive device resources.
