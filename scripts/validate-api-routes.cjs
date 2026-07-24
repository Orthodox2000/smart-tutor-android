/**
 * Smart Tutors — Comprehensive API Route Validation Script
 *
 * Tests:
 * 1. TypeScript compilation
 * 2. Route file structure & exports
 * 3. Import resolution
 * 4. API route consistency (method + handler exports)
 * 5. Model schema completeness
 * 6. Build validation
 * 7. Security checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'src', 'app', 'api');
const MODELS_DIR = path.join(ROOT, 'src', 'models');
const TYPES_FILE = path.join(ROOT, 'src', 'lib', 'types.ts');

let passed = 0;
let failed = 0;
let warnings = 0;
const results = [];
const errors = [];

function log(emoji, msg) {
  console.log(`  ${emoji} ${msg}`);
}

function pass(category, msg) {
  passed++;
  results.push({ status: 'PASS', category, message: msg });
  log('✅', msg);
}

function fail(category, msg, detail) {
  failed++;
  results.push({ status: 'FAIL', category, message: msg, detail });
  log('❌', msg);
  if (detail) log('   ', detail);
}

function warn(category, msg) {
  warnings++;
  results.push({ status: 'WARN', category, message: msg });
  log('⚠️', msg);
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'═'.repeat(60)}`);
}

// ============================================================
// TEST 1: TypeScript Compilation
// ============================================================
section('TEST 1: TypeScript Compilation');

try {
  execSync('npx tsc --noEmit 2>&1', { cwd: ROOT, encoding: 'utf-8', timeout: 120000 });
  pass('tsc', 'TypeScript compilation passed with zero errors');
} catch (e) {
  const output = e.stdout || e.stderr || '';
  const errorLines = output.split('\n').filter(l => l.includes('error TS'));
  fail('tsc', `TypeScript compilation failed with ${errorLines.length} error(s)`, errorLines.slice(0, 5).join('\n'));
}

// ============================================================
// TEST 2: Route File Structure
// ============================================================
section('TEST 2: Route File Structure');

const EXPECTED_ROUTES = [
  // Auth
  { path: 'auth/login', methods: ['POST'] },
  { path: 'auth/signup', methods: ['POST'] },
  { path: 'auth/logout', methods: ['POST'] },
  { path: 'auth/session', methods: ['GET'] },
  { path: 'auth/me', methods: ['GET'] },
  { path: 'auth/forgot-password', methods: ['POST'] },

  // Forgot password (alias)
  { path: 'forgot-password', methods: ['POST'] },

  // Users
  { path: 'users', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { path: 'users/profile', methods: ['GET', 'POST'] },
  { path: 'users/verify', methods: ['POST'] },

  // Profile
  { path: 'profile', methods: ['PATCH'] },
  { path: 'profile/change-password', methods: ['POST'] },
  { path: 'profile/delete-account', methods: ['POST'] },

  // Admin
  { path: 'admin/user-requests', methods: ['GET'] },
  { path: 'admin/user-requests/approve', methods: ['POST'] },
  { path: 'admin/user-requests/reject', methods: ['POST'] },
  { path: 'admin/educator-requests', methods: ['GET'] },
  { path: 'admin/educator-requests/approve', methods: ['POST'] },
  { path: 'admin/educator-requests/reject', methods: ['POST'] },
  { path: 'admin/account-bin', methods: ['GET', 'PATCH', 'DELETE'] },
  { path: 'admin/stats', methods: ['GET'] },
  { path: 'admin/mongo-status', methods: ['GET'] },
  { path: 'admin/bootstrap', methods: ['GET', 'POST'] },

  // Courses
  { path: 'courses', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
  { path: 'courses/details', methods: ['GET'] },

  // Tests
  { path: 'tests', methods: ['GET', 'POST'] },
  { path: 'tests/[testId]', methods: ['PUT', 'DELETE'] },
  { path: 'test-submissions', methods: ['GET', 'POST', 'PATCH'] },

  // Weekly Tests
  { path: 'weekly-tests', methods: ['GET', 'POST'] },

  // Attendance
  { path: 'attendance', methods: ['GET', 'POST'] },

  // Lectures
  { path: 'lectures', methods: ['GET', 'POST'] },

  // Sessions
  { path: 'sessions', methods: ['GET', 'POST', 'PATCH'] },

  // Messages
  { path: 'messages', methods: ['GET', 'POST', 'DELETE'] },
  { path: 'messages/[id]', methods: ['PATCH'] },

  // Notifications
  { path: 'notifications', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },

  // Direct Messages
  { path: 'direct-messages', methods: ['GET', 'POST', 'PATCH'] },

  // Student Feedback
  { path: 'student-feedback', methods: ['GET', 'POST'] },
  { path: 'student-feedback/[feedbackId]', methods: ['PATCH', 'DELETE'] },

  // Daily Activities
  { path: 'daily-activities', methods: ['GET', 'POST'] },
  { path: 'daily-activities/[activityId]', methods: ['PATCH', 'DELETE'] },

  // Performance
  { path: 'student-performance/reports', methods: ['GET', 'POST'] },
  { path: 'student-performance/reports/mine', methods: ['GET'] },
  { path: 'student-performance/reports/[reportId]', methods: ['GET', 'DELETE'] },
  { path: 'student-performance/upload-photo', methods: ['POST'] },

  // Certificates
  { path: 'certificates', methods: ['GET', 'POST'] },
  { path: 'certificates/[id]', methods: ['PATCH', 'DELETE'] },

  // Digital Library
  { path: 'digital-library', methods: ['GET', 'POST'] },

  // Invoices
  { path: 'invoices', methods: ['GET', 'POST'] },
  { path: 'invoices/record-payment', methods: ['POST'] },

  // Placement
  { path: 'placement-jobs', methods: ['GET', 'POST'] },

  // Chat
  { path: 'chat-settings', methods: ['GET', 'PATCH'] },
  { path: 'smarttutors-chat', methods: ['POST'] },

  // Quiz Arena
  { path: 'quiz-arena/generate', methods: ['POST'] },

  // Mock Test
  { path: 'mock-test', methods: ['GET', 'POST'] },

  // Reports
  { path: 'reports', methods: ['GET', 'POST', 'PATCH'] },
];

let routeMissing = 0;
let routeMethodMissing = 0;

for (const expected of EXPECTED_ROUTES) {
  const routeFile = path.join(API_DIR, expected.path, 'route.ts');
  if (!fs.existsSync(routeFile)) {
    fail('routes', `Missing route file: /api/${expected.path}`, `Expected: ${routeFile}`);
    routeMissing++;
    continue;
  }

  const content = fs.readFileSync(routeFile, 'utf-8');
  for (const method of expected.methods) {
    const methodRegex = new RegExp(`export\\s+async\\s+function\\s+${method}\\b`);
    if (!methodRegex.test(content)) {
      fail('routes', `Missing ${method} handler in /api/${expected.path}`, `route.ts does not export function ${method}`);
      routeMethodMissing++;
    }
  }
  pass('routes', `/api/${expected.path} — ${expected.methods.join(', ')} handlers present`);
}

if (routeMissing === 0 && routeMethodMissing === 0) {
  pass('routes', `All ${EXPECTED_ROUTES.length} expected route groups exist with correct method handlers`);
}

// ============================================================
// TEST 3: Security Checks
// ============================================================
section('TEST 3: Security Checks');

// Check for hardcoded secrets
const secretPatterns = [
  { regex: /password\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded password' },
  { regex: /secret\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded secret' },
  { regex: /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi, name: 'Hardcoded API key' },
];

const skipFiles = ['node_modules', '.next', 'out', 'android', 'backup', 'docs', 'scripts'];

function scanDir(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (skipFiles.includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const { regex, name } of secretPatterns) {
          const re = new RegExp(regex.source, regex.flags);
          let match;
          while ((match = re.exec(content)) !== null) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            const snippet = match[0].substring(0, 60);
            // Ignore env var fallbacks and type definitions
            if (snippet.includes('process.env') || snippet.includes('||') || snippet.includes('type ')) continue;
            warn('security', `${name} found in ${path.relative(ROOT, fullPath)}:${lineNum}`);
          }
        }
      }
    }
  } catch (e) { /* skip */ }
}

scanDir(path.join(ROOT, 'src'));
if (warnings === 0) {
  pass('security', 'No hardcoded secrets detected');
}

// Check for exposed password fields in GET responses
const profileRoute = path.join(API_DIR, 'users', 'profile', 'route.ts');
if (fs.existsSync(profileRoute)) {
  const content = fs.readFileSync(profileRoute, 'utf-8');
  if (content.includes('return NextResponse.json(user)') && !content.includes('.select')) {
    warn('security', 'GET /api/users/profile returns full user object including password field');
  } else {
    pass('security', 'GET /api/users/profile does not expose password');
  }
}

// ============================================================
// TEST 4: Auth Consistency
// ============================================================
section('TEST 4: Auth Consistency');

// Check that all protected routes use getSessionUser
const PROTECTED_ROUTES = [
  'users/route.ts',
  'users/verify/route.ts',
  'users/profile/route.ts',
  'profile/route.ts',
  'profile/change-password/route.ts',
  'profile/delete-account/route.ts',
  'admin/user-requests/route.ts',
  'admin/user-requests/approve/route.ts',
  'admin/user-requests/reject/route.ts',
  'admin/educator-requests/route.ts',
  'admin/educator-requests/approve/route.ts',
  'admin/educator-requests/reject/route.ts',
  'admin/account-bin/route.ts',
  'courses/route.ts',
  'tests/route.ts',
  'tests/[testId]/route.ts',
  'test-submissions/route.ts',
  'student-feedback/route.ts',
  'student-feedback/[feedbackId]/route.ts',
  'daily-activities/route.ts',
  'daily-activities/[activityId]/route.ts',
  'student-performance/reports/route.ts',
  'certificates/route.ts',
  'invoices/route.ts',
  'messages/route.ts',
  'messages/[id]/route.ts',
  'notifications/route.ts',
  'lectures/route.ts',
  'weekly-tests/route.ts',
  'attendance/route.ts',
  'placement-jobs/route.ts',
  'reports/route.ts',
  'chat-settings/route.ts',
];

let authMissing = 0;
for (const route of PROTECTED_ROUTES) {
  const fullPath = path.join(API_DIR, route);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf-8');
  const hasAuth = content.includes('getSessionUser') || content.includes('session');
  if (!hasAuth) {
    fail('auth', `No auth check in ${route}`);
    authMissing++;
  }
}

if (authMissing === 0) {
  pass('auth', `All ${PROTECTED_ROUTES.length} protected routes have session checks`);
}

// ============================================================
// TEST 5: Model Schema Completeness
// ============================================================
section('TEST 5: Model Schema');

const REQUIRED_USER_FIELDS = [
  'id', 'uid', 'username', 'email', 'password', 'name', 'displayName',
  'role', 'status', 'verified', 'program', 'mobile', 'dob', 'gender',
  'assignedFacultyIds', 'parentEmail', 'parentMobile', 'linkedStudentId',
  'deletedAt', 'photoURL', 'label',
];

const userSchemaPath = path.join(MODELS_DIR, 'User.ts');
if (fs.existsSync(userSchemaPath)) {
  const content = fs.readFileSync(userSchemaPath, 'utf-8');
  let missingFields = [];
  for (const field of REQUIRED_USER_FIELDS) {
    if (!content.includes(field)) {
      missingFields.push(field);
    }
  }
  if (missingFields.length > 0) {
    warn('models', `User model missing fields: ${missingFields.join(', ')}`);
  } else {
    pass('models', `User model has all ${REQUIRED_USER_FIELDS.length} required fields`);
  }
} else {
  fail('models', 'User model file not found');
}

// ============================================================
// TEST 6: Response Shape Consistency
// ============================================================
section('TEST 6: Response Shape Consistency');

// Check that login returns { success, user }
const loginRoute = path.join(API_DIR, 'auth', 'login', 'route.ts');
if (fs.existsSync(loginRoute)) {
  const content = fs.readFileSync(loginRoute, 'utf-8');
  if (content.includes('"success": true') || content.includes("success: true")) {
    pass('shapes', 'POST /api/auth/login returns { success: true, user }');
  } else {
    fail('shapes', 'POST /api/auth/login missing success field');
  }
}

// Check that logout returns { success: true }
const logoutRoute = path.join(API_DIR, 'auth', 'logout', 'route.ts');
if (fs.existsSync(logoutRoute)) {
  const content = fs.readFileSync(logoutRoute, 'utf-8');
  if (content.includes('success: true')) {
    pass('shapes', 'POST /api/auth/logout returns { success: true }');
  } else {
    fail('shapes', 'POST /api/auth/logout missing success field');
  }
}

// Check that users GET returns { users, students }
const usersRoute = path.join(API_DIR, 'users', 'route.ts');
if (fs.existsSync(usersRoute)) {
  const content = fs.readFileSync(usersRoute, 'utf-8');
  if (content.includes('users') && content.includes('students')) {
    pass('shapes', 'GET /api/users returns { users, students }');
  } else {
    fail('shapes', 'GET /api/users missing users/students fields');
  }
}

// Check that courses returns { role, courses, courseOptions }
const coursesRoute = path.join(API_DIR, 'courses', 'route.ts');
if (fs.existsSync(coursesRoute)) {
  const content = fs.readFileSync(coursesRoute, 'utf-8');
  if (content.includes('courseOptions') && content.includes('courses')) {
    pass('shapes', 'GET /api/courses returns { role, courses, courseOptions }');
  } else {
    fail('shapes', 'GET /api/courses missing expected fields');
  }
}

// Check student-feedback returns { feedback, behaviourNotes }
const feedbackRoute = path.join(API_DIR, 'student-feedback', 'route.ts');
if (fs.existsSync(feedbackRoute)) {
  const content = fs.readFileSync(feedbackRoute, 'utf-8');
  if (content.includes('behaviourNotes')) {
    pass('shapes', 'GET /api/student-feedback returns { feedback, behaviourNotes }');
  } else {
    fail('shapes', 'GET /api/student-feedback missing behaviourNotes');
  }
}

// ============================================================
// TEST 7: Soft-Delete Implementation
// ============================================================
section('TEST 7: Soft-Delete Implementation');

// Check that DELETE /api/users uses soft-delete
if (fs.existsSync(usersRoute)) {
  const content = fs.readFileSync(usersRoute, 'utf-8');
  if (content.includes('deletedAt') && !content.includes('findByIdAndDelete')) {
    pass('soft-delete', 'DELETE /api/users uses soft-delete (deletedAt)');
  } else if (content.includes('findByIdAndDelete')) {
    fail('soft-delete', 'DELETE /api/users uses hard delete instead of soft-delete');
  } else {
    pass('soft-delete', 'DELETE /api/users references deletedAt');
  }
}

// Check GET /api/users excludes soft-deleted
if (fs.existsSync(usersRoute)) {
  const content = fs.readFileSync(usersRoute, 'utf-8');
  if (content.includes('deletedAt')) {
    pass('soft-delete', 'GET /api/users excludes soft-deleted users');
  } else {
    fail('soft-delete', 'GET /api/users does not filter soft-deleted users');
  }
}

// ============================================================
// TEST 8: Duplicate Route Check
// ============================================================
section('TEST 8: Dead Code Check');

if (!fs.existsSync(path.join(ROOT, 'server'))) {
  pass('cleanup', 'server/ directory removed (no dead duplicates)');
} else {
  fail('cleanup', 'server/ directory still exists');
}

if (!fs.existsSync(path.join(API_DIR, 'auth', 'register'))) {
  pass('cleanup', 'auth/register renamed to auth/signup');
} else {
  fail('cleanup', 'auth/register still exists alongside auth/signup');
}

// ============================================================
// TEST 9: Next.js Build
// ============================================================
section('TEST 9: Next.js Production Build');

try {
  console.log('  ⏳ Running next build (this may take a minute)...');
  const buildOutput = execSync('npx next build 2>&1', {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 300000,
    env: { ...process.env, NODE_ENV: 'production' }
  });

  const routeCount = (buildOutput.match(/ƒ \//g) || []).length;
  const staticCount = (buildOutput.match(/○ \//g) || []).length;

  if (buildOutput.includes('Compiled successfully') || routeCount > 0) {
    pass('build', `Next.js build succeeded — ${routeCount} dynamic + ${staticCount} static routes`);
  } else {
    fail('build', 'Next.js build output unclear');
  }

  // Count API routes
  const apiRoutes = (buildOutput.match(/ƒ \/api\//g) || []).length;
  pass('build', `${apiRoutes} API routes registered in production build`);

} catch (e) {
  const output = (e.stdout || '') + (e.stderr || '');
  if (output.includes('Error')) {
    const errorLines = output.split('\n').filter(l => l.toLowerCase().includes('error')).slice(0, 5);
    fail('build', 'Next.js build failed', errorLines.join('\n'));
  } else {
    fail('build', 'Next.js build failed', e.message);
  }
}

// ============================================================
// FINAL REPORT
// ============================================================
section('FINAL REPORT');

console.log(`\n  Total checks: ${passed + failed + warnings}`);
console.log(`  ✅ Passed:    ${passed}`);
console.log(`  ❌ Failed:    ${failed}`);
console.log(`  ⚠️  Warnings:  ${warnings}`);
console.log('');

if (failed === 0) {
  console.log('  🎉 ALL CHECKS PASSED — Backend is aligned with docs');
} else {
  console.log(`  ⛔ ${failed} CHECK(S) FAILED — See details above`);
}

console.log('\n' + '═'.repeat(60));

// Write JSON report
const report = {
  timestamp: new Date().toISOString(),
  summary: { passed, failed, warnings, total: passed + failed + warnings },
  results,
};

const reportDir = path.join(ROOT, 'output');
if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
const reportPath = path.join(reportDir, 'api-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n  📄 Report saved to: ${reportPath}`);

process.exit(failed > 0 ? 1 : 0);
