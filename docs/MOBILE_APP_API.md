# Smart Tutors Mobile App — API Reference

Base URL: `https://smarttutors.in/api` (or your deployed domain)

Authentication: HTTP-only cookie (`smart_tutor_session`) set on login. All authenticated requests include credentials (`credentials: "include"` in fetch / `withCredentials: true` in axios).

---

## 1. Auth

### POST /api/auth/login
**Body:** `{ login: string, password: string, role?: "student" | "educator" | "admin" | "parent" }`
**Response:** Sets session cookie. Returns `{ success: true, user: UserProfile }` or `{ error: string }`.

### POST /api/auth/signup
**Body:** `{ username, email?, password, displayName?, role?, mobile?, dob?, educationLevel?, program? }`
**Response:** Sets session cookie. Returns `{ success: true, user: { id, uid, username, email, displayName, role } }`.

### POST /api/auth/logout
**Body:** (none)
**Response:** Clears session cookie. Returns `{ success: true }`.

### GET /api/auth/session
**Response:** `{ user: UserProfile | null }`

### POST /api/forgot-password
**Body:** `{ name, email, phone?, lastPassword?, role }`
**Response:** `{ message: "Your request has been submitted..." }`

---

## 2. Profile

### PATCH /api/profile
**Body:** `{ name?, profilePhoto?, mobile?, dob?, gender?, addressLine1?, addressLine2?, city?, state?, pincode?, guardianPhone?, qualification?, experience?, subjects? }`
**Response:** `{ user: ManagedUser }`

### POST /api/profile/change-password
**Body:** `{ currentPassword, newPassword }` (min 8 chars)
**Response:** `{ success: true }` or 403 `{ error: "Current password is incorrect." }`

### POST /api/profile/delete-account (Admin only)
**Body:** `{ password }`
**Response:** `{ ok: true }` + clears cookie

---

## 3. Users (Admin)

### GET /api/users
**Response:** `{ users: ManagedUser[], students: StudentDirectoryEntry[] }`

### POST /api/users
**Body:** `{ name, email, password, role?, program?, confirm: true, mobile?, assignedFacultyIds? }`
**Response (201):** `{ user: ManagedUser }`

### PATCH /api/users
**Body:** `{ id, name?, email?, role?, password?, program?, status?, verified?, assignedFacultyIds? }`
**Response:** `{ user: ManagedUser }`

### DELETE /api/users
**Body:** `{ id }` or Query `?id=<id>`
**Response:** `{ ok: true, message: "User deleted." }` (soft-delete)

### POST /api/users/verify
**Body:** `{ userId, verified? }`
**Response:** `{ ok: true, message }`

---

## 4. Admin Requests

### GET /api/admin/user-requests
**Response:** `{ ok: true, requests: ManagedUser[] }` (pending students, excludes soft-deleted)

### POST /api/admin/user-requests/approve
**Body:** `{ userId }` — Sets status "active", verified true.
**Response:** `{ ok: true, message, user }`

### POST /api/admin/user-requests/reject
**Body:** `{ userId }` — Soft-deletes (sets deletedAt).
**Response:** `{ ok: true, message }`

### GET /api/admin/educator-requests
**Response:** `{ ok: true, requests: ManagedUser[] }` (pending educators)

### POST /api/admin/educator-requests/approve
**Body:** `{ userId }` — Sets status "active", verified true.

### POST /api/admin/educator-requests/reject
**Body:** `{ userId }` — Sets status "rejected" + deletedAt.

### Account Bin (Soft-Delete Management)
- **GET /api/admin/account-bin** — `{ users: ManagedUser[] }`
- **PATCH /api/admin/account-bin** — `{ id }` — Restore
- **DELETE /api/admin/account-bin** — `{ id }` — Permanent delete

---

## 5. Courses

### GET /api/courses
**Response:** `{ role: string, courses: CourseItem[], courseOptions: CourseOption[] }`

### POST /api/courses (Educator/Admin)
**Body:** Full course object.
**Response (201):** `{ course: CourseItem }`

### PATCH /api/courses (Admin)
**Body:** `{ id, ...fields }`
**Response:** `{ course: CourseItem }`

### DELETE /api/courses?courseId=<id> (Admin)

### GET /api/courses/details
**Response:** `{ courses: CourseItem[], timestamp: string }`

---

## 6. Tests & Submissions

### GET /api/tests
**Response:** `{ tests: TestItem[] }`

### POST /api/tests (Educator/Admin)
**Body:** `{ title, status, summary, assignedUserIds?, questions }`
**Response (201):** `{ test: TestItem }`

### PUT /api/tests/[testId] (Educator/Admin)
**Body:** Partial test fields.
**Response:** `{ test: TestItem }`

### DELETE /api/tests/[testId] (Educator/Admin)
**Response:** `{ deleted: true }`

### GET /api/test-submissions
**Response:** `{ submissions: TestSubmission[] }`

### POST /api/test-submissions (Student)
**Body:** `{ testId, answers: number[] }`
**Response (201):** `{ submission: TestSubmission }`

### PATCH /api/test-submissions (Educator/Admin)
**Body:** `{ submissionId, score?, feedback? }`
**Response:** `{ submission: TestSubmission }`

---

## 7. Weekly Tests

### GET /api/weekly-tests
**Response:** `{ weeklyTests: WeeklyTest[] }`

### POST /api/weekly-tests (Educator/Admin)
**Body:** `{ title, batchId, subject, testDate, totalMarks, results }`

---

## 8. Messages (Notice Board)

### GET /api/messages
**Response:** `{ messages: MessageItem[] }`

### POST /api/messages (Educator/Admin)
**Body:** `{ title, body, channel?, audience?, userIds?, authorName?, expiresAt? }`
**Response (201):** `{ message: MessageItem }`

### PATCH /api/messages/[id] (Educator/Admin)
**Body:** `{ title?, body?, channel?, expiresAt? }`
**Response:** `{ message: MessageItem }`

### DELETE /api/messages?id=<id>

---

## 9. Notifications

### GET /api/notifications
**Response:** `{ notifications: AppNotification[] }` (each has `read: boolean`)

### POST /api/notifications (Educator/Admin)
**Body:** `{ title, message, type?, link?, audience?: "everyone" | "selected-users", userIds? }`
**Response (201):** `{ id, success: true }`

### PATCH /api/notifications
**Body:** `{ id, read?: boolean }`
**Response:** `{ success: true }`

### DELETE /api/notifications?id=<id>

---

## 10. Direct Messages (Chat)

### GET /api/direct-messages
**No query:** `{ conversations: Conversation[] }`
**With ?userId=:** `{ messages: DirectMessage[] }`

### POST /api/direct-messages
**Body:** `{ receiverId, content, contentType?, fileUrl? }`
**Response (201):** `{ message: DirectMessage }`

### PATCH /api/direct-messages
**Body:** `{ userId }` — marks messages as read.

---

## 11. Student Feedback & Behaviour

### GET /api/student-feedback
**Response:** `{ feedback: TeacherFeedback[], behaviourNotes: TeacherFeedback[] }`

### POST /api/student-feedback (Educator/Admin)
**Body (feedback):** `{ type: "feedback", studentId, batchId, subject?, category, strengths?, areasToImprove?, feedback, visibleToParent }`
**Body (behaviour):** `{ type: "behaviour", studentId, batchId?, rating, note, actionTaken?, visibleToParent }`

### PATCH /api/student-feedback/[feedbackId]
**Body:** Fields to update.

### DELETE /api/student-feedback/[feedbackId]

---

## 12. Daily Activities

### GET /api/daily-activities
**Response:** `{ activities: StudentDailyActivity[] }`

### POST /api/daily-activities (Educator/Admin)
**Body:** `{ studentId, batchId, subject?, date, topicStudied?, homeworkCompleted, ... }`

### PATCH /api/daily-activities/[activityId]
### DELETE /api/daily-activities/[activityId]

---

## 13. Performance Reports

### GET /api/student-performance/reports (Educator/Admin)
**Response:** `{ reports: PerformanceReport[] }`

### GET /api/student-performance/reports/mine (All Roles)
**Response:** `{ reports: PerformanceReport[] }` (own reports)

### GET /api/student-performance/reports/[reportId]
**Response:** Single `PerformanceReport`

### POST /api/student-performance/reports (Educator/Admin)
**Body:** Full report object.

### DELETE /api/student-performance/reports?id=<id>

### POST /api/student-performance/upload-photo
**FormData:** `photo` (PNG/JPG/WEBP, max 2 MB)

---

## 14. Certificates

### GET /api/certificates
**Response:** `{ certificates: Certificate[] }` (students see own, admin sees all)

### POST /api/certificates (Admin)
**Body:** `{ templateId, recipientId, recipientName, recipientType?, title, description, courseName?, issuedDate? }`
**Response (201):** `Certificate` with auto-generated `certificateNo: "CERT-{timestamp}"`

### PATCH /api/certificates/[id] (Admin)
**Body:** `{ status?: "issued" | "revoked", revokeReason? }`

### DELETE /api/certificates/[id] (Admin)

---

## 15. Fees & Invoices

### GET /api/invoices
**Response:** `{ feeInvoices: FeeInvoice[] }`

### POST /api/invoices (Admin)
**Body:** `{ studentId, title, amount, dueDate, ... }`
**Response (201):** `{ feeInvoice: FeeInvoice }` with auto-generated `receiptNo`

### POST /api/invoices/record-payment (Admin)
**Body:** `{ invoiceId, paidAmount, paymentMode?, paidDate?, transactionId? }`

---

## 16. Digital Library

### GET /api/digital-library
**Response:** `{ success: true, books: LibraryBook[], canManage: boolean, isLoggedIn: boolean, role }`

### POST /api/digital-library (Educator/Admin)
**Body:** Full library item object.

---

## 17. Lectures

### GET /api/lectures
**Response:** `{ lectures: LectureItem[] }`

### POST /api/lectures (Educator/Admin)
**Body:** `{ title, subject?, meetingLink?, timing?, target?, teacherId?, teacherName? }`

---

## 18. Attendance

### GET /api/attendance
**Response:** `{ sheets: AttendanceSheet[] }`

### POST /api/attendance (Educator/Admin)
**Body:** `{ title, date, subject?, records?, createdBy? }`

---

## 19. Placements

### GET /api/placement-jobs
**Response:** `{ jobs: PlacementJob[] }`

### POST /api/placement-jobs (Admin)

---

## 20. Quiz Arena

### POST /api/quiz-arena/generate
**Body:** `{ level?, exam?, subject?, difficulty?, count? }`
**Response:** `{ questions: QuizQuestion[] }`

---

## 21. AI Chat

### POST /api/smarttutors-chat
**Body:** `{ message, memory?, history? }`
**Response:** `{ reply: string }`

---

## 22. Misc

### GET /api/chat-settings
**Response:** `{ chatEnabled: boolean }`

### PATCH /api/chat-settings (Admin)
**Body:** `{ chatEnabled: boolean }`

### POST /api/mock-test
**Body:** `{ testId, studentUid?, studentName?, answers: number[] }`
**Response:** `{ message, resultId, score, correctAnswers, totalQuestions }`

### POST /api/reports (Flag/Abuse)
**Body:** `{ targetType, targetId, targetName, reason, description, messageContent? }`

### GET /api/admin/stats
**Response:** `{ students, courses, faculty, sessions }`

---

## Key Data Types

### UserProfile (returned by session/login)
```json
{ "id": "string", "uid": "string", "username": "string", "email": "string", "name": "string", "displayName": "string", "role": "student|educator|admin|parent|counsellor", "photoURL": "string", "label": "string", "status": "active|pending|rejected", "verified": "boolean", "mobile": "string", "program": "string", "assignedFacultyIds": ["string"] }
```

### ManagedUser
```json
{ "id": "string", "name": "string", "email": "string", "mobile": "string", "role": "Role", "label": "string", "status": "active|pending|rejected", "verified": "boolean", "program": "string", "assignedFacultyIds": ["string"], "assignedFacultyNames": ["string"], "parentEmail": "string", "parentMobile": "string", "linkedStudentId": "string", "profilePhoto": "string", "createdAt": "ISO 8601", "updatedAt": "ISO 8601" }
```

### CourseItem
```json
{ "id": "string", "category": "string", "sections": ["string"], "stream": "string", "statusLabel": "string", "standardKey": "string", "title": "string", "tagline": "string", "schedule": "string", "summary": "string", "description": "string", "duration": "string", "mode": "string", "audienceLabel": "string", "courseNamesIncluded": ["string"], "branchesIncluded": ["string"], "subjectsCovered": ["string"], "points": ["string"], "audience": ["string"] }
```

---

## Auth Flow

1. App opens → hit `GET /api/auth/session`
2. If `user` is null → show login screen
3. Login → `POST /api/auth/login` with credentials
4. On success, cookie is set → redirect to dashboard
5. All subsequent API calls include the cookie automatically

---

## Notes for Mobile Dev

- All date/time fields are ISO 8601 strings
- IDs are human-readable (e.g., `student-001`, `course-9-regular-academic`)
- File uploads use Vercel Blob (signed URLs) or base64 data URLs
- Notifications are pushed via API polling (no WebSocket yet)
- Cookie-based auth means no token management needed on mobile — just use cookie storage
- Pagination is not implemented yet — all list endpoints return full datasets
- Soft-delete system: rejected users go to Account Bin, admins can restore or permanently delete
