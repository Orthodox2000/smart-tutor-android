## API Route Specifications — Input, Output, Example

All routes use Next.js App Router under `src/app/api/`. Auth uses `smart_tutor_session` cookie (JWT, 8h expiry).

---

### 1. POST /api/auth/login

**Input:**
```ts
{ login: string; password: string; role?: string; }
```

**Output (Success 200):**
```ts
{ success: true; user: UserProfile }
// + Set-Cookie: smart_tutor_session=<token>
```

**Output (Bad Credentials 401):**
```ts
{ error: "Invalid credentials" }
```

**Output (Role Mismatch 403):**
```ts
{ error: "This account is registered as {role}, not {requestedRole}" }
```

---

### 2. POST /api/auth/signup

**Input:**
```ts
{ username: string; email?: string; password: string; displayName?: string; role?: string; mobile?: string; dob?: string; educationLevel?: string; program?: string; }
```

**Output (201):**
```ts
{ success: true; user: { id, uid, username, email, displayName, role } }
// + Set-Cookie: smart_tutor_session=<token>
```

---

### 3. POST /api/auth/logout

**Input:** None

**Output:**
```ts
{ success: true }
// + Clears smart_tutor_session cookie
```

---

### 4. GET /api/auth/session

**Input:** None

**Output:**
```ts
{ user: UserProfile | null }
```

---

### 5. GET /api/auth/me

**Input:** None (reads `auth_token` cookie)

**Output:** Flat user object (not wrapped in `{ user }`)

---

### 6. POST /api/forgot-password (alias: POST /api/auth/forgot-password)

**Input:**
```ts
{ name: string; email: string; phone?: string; lastPassword?: string; role: string; }
```

**Output:**
```ts
{ message: "Your request has been submitted. Our team will review it shortly." }
```

---

### 7. GET /api/users

**Input:** None

**Output:**
```ts
{ users: ManagedUser[]; students: StudentDirectoryEntry[]; }
```

Soft-deleted users (with `deletedAt`) are excluded.

---

### 8. POST /api/users (Admin — Create)

**Input:**
```ts
{ name: string; email: string; password: string; role?: string; program?: string; confirm: true; mobile?: string; assignedFacultyIds?: string[]; counsellorId?: string; }
```

`confirm: true` is **mandatory**.

**Output (201):**
```ts
{ user: ManagedUser }
```

---

### 9. PATCH /api/users (Admin — Update)

**Input:**
```ts
{ id: string; name?: string; email?: string; role?: string; password?: string; program?: string; status?: string; verified?: boolean; assignedFacultyIds?: string[]; ... }
```

**Output:**
```ts
{ user: ManagedUser }
```

---

### 10. DELETE /api/users (Admin — Soft-Delete)

**Input:** Body `{ id: string }` or Query `?id=<string>`

**Output:**
```ts
{ ok: true; message: "User deleted."; }
```

Sets `deletedAt` timestamp (soft-delete). User goes to Account Bin.

---

### 11. POST /api/users/verify (Admin)

**Input:**
```ts
{ userId: string; verified?: boolean; }
```

**Output:**
```ts
{ ok: true; message: string; }
```

---

### 12. POST /api/profile (All Roles)

**Input:**
```ts
{ name?: string; profilePhoto?: string | null; mobile?: string; dob?: string; gender?: string; addressLine1?: string; addressLine2?: string; city?: string; state?: string; pincode?: string; guardianPhone?: string; qualification?: string; experience?: string; subjects?: string; }
```

**Output:**
```ts
{ user: ManagedUser; }
```

---

### 13. POST /api/profile/change-password (All Roles)

**Input:**
```ts
{ currentPassword: string; newPassword: string; }  // min 8 chars
```

**Output:**
```ts
{ success: true; }
```

**Output (Wrong Password 403):**
```ts
{ error: "Current password is incorrect."; }
```

---

### 14. POST /api/profile/delete-account (Admin Only)

**Input:**
```ts
{ password: string; }
```

**Output:**
```ts
{ ok: true; }
// + Clears session cookie
```

---

### 15. GET /api/admin/user-requests (Admin)

**Output:**
```ts
{ ok: true; requests: ManagedUser[]; }
```

---

### 16. POST /api/admin/user-requests/approve (Admin)

**Input:** `{ userId: string; }`

**Output:**
```ts
{ ok: true; message: "Account approved successfully."; user: ManagedUser; }
```

---

### 17. POST /api/admin/user-requests/reject (Admin — Soft-Delete)

**Input:** `{ userId: string; }`

**Output:**
```ts
{ ok: true; message: "Account rejected and deleted."; }
```

---

### 18. GET /api/admin/educator-requests (Admin)

**Output:**
```ts
{ ok: true; requests: ManagedUser[]; }
```

---

### 19. POST /api/admin/educator-requests/approve (Admin)

**Input:** `{ userId: string; }`

**Output:**
```ts
{ ok: true; message: "Faculty account approved successfully."; user: ManagedUser; }
```

---

### 20. POST /api/admin/educator-requests/reject (Admin — Soft-Delete)

**Input:** `{ userId: string; }`

**Output:**
```ts
{ ok: true; message: "Faculty account rejected."; }
```

Sets `status: "rejected"` AND `deletedAt`.

---

### 21. GET /api/admin/account-bin (Admin)

**Output:**
```ts
{ users: ManagedUser[]; }
```

---

### 22. PATCH /api/admin/account-bin (Admin — Restore)

**Input:** `{ id: string; }`

**Output:**
```ts
{ ok: true; message: "Account restored."; }
```

---

### 23. DELETE /api/admin/account-bin (Admin — Permanent Delete)

**Input:** `{ id: string; }`

**Output:**
```ts
{ ok: true; message: "Account permanently deleted."; }
```

---

### 24. GET /api/courses

**Output:**
```ts
{ role: string; courses: CourseItem[]; courseOptions: CourseOption[]; }
```

---

### 25. POST /api/courses (Educator/Admin)

**Input:** Full course object.

**Output (201):**
```ts
{ course: CourseItem; }
```

---

### 26. PATCH /api/courses (Admin)

**Input:** `{ id: string; ...fields }`

**Output:**
```ts
{ course: CourseItem; }
```

---

### 27. DELETE /api/courses

**Input:** Query `?courseId=<id>`

**Output:** `{ ok: true; }`

---

### 28. GET /api/courses/details

**Output:**
```ts
{ courses: CourseItem[]; timestamp: string; }
```

---

### 29. GET /api/tests

**Output:**
```ts
{ tests: TestItem[]; }
```

---

### 30. POST /api/tests (Educator/Admin)

**Input:** Full test object.

**Output (201):**
```ts
{ test: TestItem; }
```

---

### 31. PUT /api/tests/[testId] (Educator/Admin)

**Input:** Partial test fields.

**Output:** `{ test: TestItem; }`

---

### 32. DELETE /api/tests/[testId] (Educator/Admin)

**Output:** `{ deleted: true; }`

---

### 33. GET /api/test-submissions

**Output:**
```ts
{ submissions: TestSubmission[]; }
```

---

### 34. POST /api/test-submissions (Student)

**Input:**
```ts
{ testId: string; answers: number[]; }
```

**Output (201):**
```ts
{ submission: TestSubmission; }
```

---

### 35. PATCH /api/test-submissions (Educator/Admin)

**Input:**
```ts
{ submissionId: string; score?: number; feedback?: string; }
```

**Output:**
```ts
{ submission: TestSubmission; }
```

---

### 36. GET /api/messages

**Output:**
```ts
{ messages: MessageItem[]; }
```

---

### 37. POST /api/messages (Admin/Educator)

**Input:**
```ts
{ title: string; body: string; channel?: string; audience?: string[]; userIds?: string[]; authorName?: string; expiresAt?: string; }
```

**Output (201):**
```ts
{ message: MessageItem; }
```

---

### 38. PATCH /api/messages/[id] (Educator/Admin)

**Input:**
```ts
{ title?: string; body?: string; channel?: string; expiresAt?: string | null; }
```

**Output:** `{ message: MessageItem; }`

---

### 39. DELETE /api/messages

**Input:** Query `?id=<id>`

**Output:** `{ success: true; deleted: boolean; }`

---

### 40. GET /api/notifications

**Output:**
```ts
{ notifications: AppNotification[]; }
```

Each notification includes `read: boolean` (computed from `readBy` array).

---

### 41. POST /api/notifications (Admin/Educator)

**Input:**
```ts
{ title: string; message: string; type?: string; link?: string; audience?: "everyone" | "selected-users"; userIds?: string[]; }
```

**Output (201):**
```ts
{ id: string; success: true; }
```

---

### 42. PATCH /api/notifications

**Input:**
```ts
{ id: string; read?: boolean; }
```

**Output:** `{ success: true; }`

---

### 43. DELETE /api/notifications

**Input:** Query `?id=<id>`

**Output:** `{ success: true; }`

---

### 44. GET /api/student-feedback

**Output:**
```ts
{ feedback: TeacherFeedback[]; behaviourNotes: TeacherFeedback[]; }
```

---

### 45. POST /api/student-feedback (Educator/Admin)

**Input:**
```ts
// Feedback: { type: "feedback", studentId, batchId, subject?, category, strengths?, areasToImprove?, feedback, visibleToParent }
// Behaviour: { type: "behaviour", studentId, batchId?, rating, note, actionTaken?, visibleToParent }
```

**Output (201):**
```ts
{ feedback: TeacherFeedback; }
```

---

### 46. PATCH /api/student-feedback/[feedbackId] (Educator/Admin)

**Input:** Partial feedback fields.

**Output:** `{ feedback: TeacherFeedback; }`

---

### 47. DELETE /api/student-feedback/[feedbackId] (Educator/Admin)

**Output:** `{ success: true; }`

---

### 48. GET /api/daily-activities

**Output:**
```ts
{ activities: StudentDailyActivity[]; }
```

---

### 49. POST /api/daily-activities (Educator/Admin)

**Input:** Full activity object.

**Output (201):**
```ts
{ activity: StudentDailyActivity; }
```

---

### 50. PATCH /api/daily-activities/[activityId] (Educator/Admin)

**Input:** Partial activity fields.

**Output:** `{ activity: StudentDailyActivity; }`

---

### 51. DELETE /api/daily-activities/[activityId] (Educator/Admin)

**Output:** `{ success: true; }`

---

### 52. GET /api/student-performance/reports (Educator/Admin)

**Output:** `{ reports: PerformanceReport[]; }`

### 53. GET /api/student-performance/reports/mine (All Roles)

**Output:** `{ reports: PerformanceReport[]; }` (filtered to own)

### 54. GET /api/student-performance/reports/[reportId]

**Output:** `PerformanceReport`

### 55. POST /api/student-performance/reports (Educator/Admin)

**Input:** Full report object.

**Output (201):** `{ report: PerformanceReport; }`

### 56. DELETE /api/student-performance/reports?id=<id> (Educator/Admin)

**Output:** `{ success: true; }`

### 57. POST /api/student-performance/upload-photo

**Input:** FormData with `photo` (PNG/JPG/WEBP, max 2 MB)

**Output:** `{ url: string; }` (base64 data URL)

---

### 58. GET /api/certificates

**Output:** `{ certificates: Certificate[]; }`

Students see only their own. Admin/educator see all.

---

### 59. POST /api/certificates (Admin)

**Input:**
```ts
{ templateId: string; recipientId: string; recipientName: string; recipientType?: string; title: string; description: string; courseName?: string; issuedDate?: string; issuedBy?: string; issuedByName?: string; }
```

**Output (201):** `Certificate` object with auto-generated `certificateNo: "CERT-{timestamp}"`

---

### 60. PATCH /api/certificates/[id] (Admin)

**Input:** `{ status?: string; revokeReason?: string; }`

**Output:** `{ success: true; }`

---

### 61. DELETE /api/certificates/[id] (Admin)

**Output:** `{ success: true; }`

---

### 62. GET /api/digital-library

**Output:**
```ts
{ success: true; books: LibraryBook[]; canManage: boolean; isLoggedIn: boolean; role: string | null; }
```

---

### 63. POST /api/digital-library (Educator/Admin)

**Input:** Full library item object.

**Output:** Created document (status 201).

---

### 64. GET /api/invoices

**Output:** `{ feeInvoices: FeeInvoice[]; }`

---

### 65. POST /api/invoices (Admin)

**Input:** Full invoice object.

**Output (201):** `{ feeInvoice: FeeInvoice; }`

---

### 66. POST /api/invoices/record-payment (Admin)

**Input:**
```ts
{ invoiceId: string; paidAmount: number; paymentMode?: string; paidDate?: string; transactionId?: string; }
```

**Output:** `{ feeInvoice: FeeInvoice; message: string; }`

---

### 67. GET /api/weekly-tests

**Output:** `{ weeklyTests: WeeklyTest[]; }`

---

### 68. POST /api/weekly-tests (Educator/Admin)

**Input:** `{ title, batchId, subject, testDate, totalMarks, results }`

**Output (201):** `WeeklyTest` object.

---

### 69. GET /api/lectures

**Output:** `{ lectures: LectureItem[]; }`

---

### 70. POST /api/lectures (Educator/Admin)

**Input:** `{ title, subject?, meetingLink?, timing?, target?, teacherId?, teacherName? }`

**Output (201):** `{ lecture: LectureItem; }`

---

### 71. GET /api/attendance

**Output:** `{ sheets: AttendanceSheet[]; }`

---

### 72. POST /api/attendance (Educator/Admin)

**Input:** `{ title, date, subject?, records?, createdBy? }`

**Output (201):** `{ sheet: AttendanceSheet; }`

---

### 73. GET /api/direct-messages

**No query:** `{ conversations: Conversation[]; }`
**With ?userId=:** `{ messages: DirectMessage[]; }`

---

### 74. POST /api/direct-messages

**Input:** `{ receiverId, content, contentType?, fileUrl? }`

**Output (201):** `{ message: DirectMessage; }`

---

### 75. PATCH /api/direct-messages

**Input:** `{ userId: string; }` — marks messages from this user as read.

**Output:** `{ success: true; }`

---

### 76. POST /api/quiz-arena/generate

**Input:** `{ level?, exam?, subject?, difficulty?, count? }`

**Output:** `{ questions: QuizQuestion[]; }`

---

### 77. POST /api/smarttutors-chat

**Input:** `{ message: string; memory?: object; history?: Message[]; }`

**Output:** `{ reply: string; }`

---

### 78. GET /api/chat-settings

**Output:** `{ chatEnabled: boolean; }`

### 79. PATCH /api/chat-settings (Admin)

**Input:** `{ chatEnabled: boolean; }`

**Output:** `{ chatEnabled: boolean; }`

---

### 80. GET /api/placement-jobs

**Output:** `{ jobs: PlacementJob[]; }`

---

### 81. POST /api/placement-jobs (Admin)

**Input:** Full placement job object.

**Output (201):** `{ job: PlacementJob; }`

---

### 82. GET /api/sessions

**Output:** `Session[]`

---

### 83. POST /api/sessions (Educator/Admin)

**Input:** Full session object.

**Output (201):** Created session document.

---

### 84. PATCH /api/sessions (Educator/Admin)

**Input:** Query `?id=<id>`, Body: partial update fields.

**Output:** Updated session document.

---

### 85. POST /api/mock-test

**Input:** `{ testId, studentUid?, studentName?, answers: number[] }`

**Output:**
```ts
{ message: string; resultId: string; score: number; correctAnswers: number; totalQuestions: number; }
```

---

### 86. GET /api/mock-test

**Output:** Array of TestResult documents.

---

### 87. POST /api/reports (All Roles — Flag/Abuse)

**Input:** `{ targetType, targetId, targetName, reason, description, messageContent? }`

**Output (201):** `{ success: true; reportId: string; }`

---

### 88. GET /api/reports (Admin)

**Output:** `{ reports: Report[]; total: number; page: number; pages: number; }`

---

### 89. PATCH /api/reports (Admin)

**Input:** `{ reportId, status, resolution? }`

**Output:** `{ success: true; report: Report; }`

---

### 90. GET /api/admin/stats

**Output:** `{ students: number; courses: number; faculty: number; sessions: number; }`

---

### 91. GET /api/admin/mongo-status

**Output:** `{ status: string; database: string; collectionsCount: number; readyState: number; timestamp: string; }`

---

### 92. POST /api/admin/bootstrap

**Input:** `{ key: string; }`

**Output:** `{ message: "System bootstrapped successfully!" }`

---

## Authorization Summary

| Endpoint | Public | Student | Educator | Admin |
|---|---|---|---|---|
| POST /api/auth/login | YES | - | - | - |
| POST /api/auth/signup | YES | - | - | - |
| POST /api/auth/logout | YES | - | - | - |
| GET /api/auth/session | YES | - | - | - |
| POST /api/forgot-password | YES | - | - | - |
| GET /api/courses | YES | - | - | - |
| GET /api/courses/details | YES | - | - | - |
| GET /api/digital-library | YES | - | - | - |
| POST /api/smarttutors-chat | YES | - | - | - |
| GET /api/chat-settings | YES | - | - | - |
| POST /api/quiz-arena/generate | YES | - | - | - |
| GET /api/dashboard | - | YES | YES | YES |
| GET /api/users | - | - | - | YES |
| POST /api/users | - | - | - | YES |
| PATCH /api/users | - | - | - | YES |
| DELETE /api/users | - | - | - | YES |
| POST /api/users/verify | - | - | - | YES |
| GET /api/admin/user-requests | - | - | - | YES |
| POST /api/admin/user-requests/approve | - | - | - | YES |
| POST /api/admin/user-requests/reject | - | - | - | YES |
| GET /api/admin/educator-requests | - | - | - | YES |
| POST /api/admin/educator-requests/approve | - | - | - | YES |
| POST /api/admin/educator-requests/reject | - | - | - | YES |
| GET /api/admin/account-bin | - | - | - | YES |
| PATCH /api/admin/account-bin | - | - | - | YES |
| DELETE /api/admin/account-bin | - | - | - | YES |
| GET /api/tests | YES | YES | YES | YES |
| POST /api/tests | - | - | YES | YES |
| PUT /api/tests/[testId] | - | - | YES | YES |
| DELETE /api/tests/[testId] | - | - | YES | YES |
| GET /api/test-submissions | - | YES | YES | YES |
| POST /api/test-submissions | - | YES | - | - |
| PATCH /api/test-submissions | - | - | YES | YES |
| GET /api/messages | YES | YES | YES | YES |
| POST /api/messages | - | - | YES | YES |
| PATCH /api/messages/[id] | - | - | YES | YES |
| DELETE /api/messages | - | - | YES | YES |
| GET /api/notifications | YES | YES | YES | YES |
| POST /api/notifications | - | - | YES | YES |
| PATCH /api/notifications | - | YES | YES | YES |
| DELETE /api/notifications | - | YES | YES | YES |
| PATCH /api/profile | - | YES | YES | YES |
| POST /api/profile/change-password | - | YES | YES | YES |
| POST /api/profile/delete-account | - | - | - | YES |
| GET /api/student-feedback | - | YES | YES | YES |
| POST /api/student-feedback | - | - | YES | YES |
| PATCH /api/student-feedback/[id] | - | - | YES | YES |
| DELETE /api/student-feedback/[id] | - | - | YES | YES |
| GET /api/daily-activities | - | YES | YES | YES |
| POST /api/daily-activities | - | - | YES | YES |
| PATCH /api/daily-activities/[id] | - | - | YES | YES |
| DELETE /api/daily-activities/[id] | - | - | YES | YES |
| GET /api/student-performance/reports | - | - | YES | YES |
| GET /api/student-performance/reports/mine | - | YES | YES | YES |
| POST /api/student-performance/reports | - | - | YES | YES |
| GET /api/certificates | - | YES | YES | YES |
| POST /api/certificates | - | - | - | YES |
| PATCH /api/certificates/[id] | - | - | - | YES |
| DELETE /api/certificates/[id] | - | - | - | YES |
| GET /api/invoices | - | YES | YES | YES |
| POST /api/invoices | - | - | - | YES |
| POST /api/invoices/record-payment | - | - | - | YES |
| GET /api/weekly-tests | - | YES | YES | YES |
| POST /api/weekly-tests | - | - | YES | YES |
| GET /api/lectures | - | YES | YES | YES |
| POST /api/lectures | - | - | YES | YES |
| GET /api/attendance | - | YES | YES | YES |
| POST /api/attendance | - | - | YES | YES |
| GET /api/direct-messages | - | YES | YES | YES |
| POST /api/direct-messages | - | YES | YES | YES |
| GET /api/placement-jobs | - | YES | YES | YES |
| POST /api/placement-jobs | - | - | - | YES |
| POST /api/mock-test | - | YES | YES | YES |
| POST /api/reports | - | YES | YES | YES |
| GET /api/reports | - | - | - | YES |
| PATCH /api/reports | - | - | - | YES |
| POST /api/admin/bootstrap | KEY | - | - | - |
