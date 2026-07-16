const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const RESULTS_DIR = path.join(__dirname, '..', 'test-results');

if (!fs.existsSync(RESULTS_DIR)) fs.mkdirSync(RESULTS_DIR, { recursive: true });

const results = [];
let passed = 0;
let failed = 0;

function log(test, status, detail = '') {
  const icon = status === 'PASS' ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${icon} ${test}${detail ? ' — ' + detail : ''}`);
  results.push({ test, status, detail, time: new Date().toISOString() });
  if (status === 'PASS') passed++;
  else failed++;
}

async function api(method, path, body = null, cookie = '') {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;

  const opts = { method, headers, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: res.headers };
}

// ===== API STABILITY TESTS =====
async function runTests() {
  console.log('\n\x1b[1m═══ SMART TUTORS — STABILITY TESTS ═══\x1b[0m\n');

  // 1. Health check
  console.log('\x1b[1m[1] Health & Connectivity\x1b[0m');
  try {
    const { status } = await api('GET', '/api/admin/stats');
    log('GET /api/admin/stats returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/admin/stats reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/courses');
    log('GET /api/courses returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/courses reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/sessions');
    log('GET /api/sessions returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/sessions reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/messages');
    log('GET /api/messages returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/messages reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/notifications');
    log('GET /api/notifications returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/notifications reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/tests');
    log('GET /api/tests returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/tests reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/digital-library');
    log('GET /api/digital-library returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/digital-library reachable', 'FAIL', e.message); }

  try {
    const { status } = await api('GET', '/api/users');
    log('GET /api/users returns 200', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
  } catch (e) { log('GET /api/users reachable', 'FAIL', e.message); }

  // 2. Auth flow stability
  console.log('\n\x1b[1m[2] Authentication Flow\x1b[0m');
  let sessionCookie = '';
  try {
    const res = await api('POST', '/api/auth/login', { login: 'demo_student', password: 'Student@123', role: 'student' });
    log('POST /api/auth/login succeeds', res.status === 200 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) sessionCookie = setCookie.split(';')[0];
  } catch (e) { log('POST /api/auth/login', 'FAIL', e.message); }

  try {
    const res = await api('GET', '/api/auth/session', null, sessionCookie);
    log('GET /api/auth/session returns user', res.status === 200 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('GET /api/auth/session', 'FAIL', e.message); }

  try {
    const res = await api('POST', '/api/auth/logout');
    log('POST /api/auth/logout succeeds', res.status === 200 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('POST /api/auth/logout', 'FAIL', e.message); }

  // 3. Invalid auth attempts
  console.log('\n\x1b[1m[3] Auth Edge Cases\x1b[0m');
  try {
    const res = await api('POST', '/api/auth/login', { login: 'nonexistent', password: 'wrong' });
    log('Invalid login returns 401', (res.status === 401 || res.status === 400) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Invalid login handling', 'FAIL', e.message); }

  try {
    const res = await api('POST', '/api/auth/login', {});
    log('Empty login body handled', (res.status >= 400) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Empty login body', 'FAIL', e.message); }

  // 4. Response format consistency
  console.log('\n\x1b[1m[4] Response Formats\x1b[0m');
  try {
    const { data } = await api('GET', '/api/courses');
    const isArray = Array.isArray(data);
    log('/api/courses returns array', isArray ? 'PASS' : 'FAIL', isArray ? `Length: ${data.length}` : `Type: ${typeof data}`);
  } catch (e) { log('/api/courses format', 'FAIL', e.message); }

  try {
    const { data } = await api('GET', '/api/notifications');
    const hasKey = data && (Array.isArray(data) || data.notifications);
    log('/api/notifications returns expected shape', hasKey ? 'PASS' : 'FAIL');
  } catch (e) { log('/api/notifications format', 'FAIL', e.message); }

  // 5. Error handling
  console.log('\n\x1b[1m[5] Error Handling\x1b[0m');
  try {
    const res = await api('DELETE', '/api/messages?id=nonexistent123');
    log('DELETE non-existent returns ok or 404', (res.status === 200 || res.status === 404) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('DELETE error handling', 'FAIL', e.message); }

  try {
    const res = await api('GET', '/api/messages?role=invalid');
    log('Invalid query param handled', res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Invalid query param', 'FAIL', e.message); }

  // 6. Concurrency
  console.log('\n\x1b[1m[6] Concurrent Requests\x1b[0m');
  try {
    const promises = Array(5).fill(null).map(() => api('GET', '/api/admin/stats'));
    const results = await Promise.all(promises);
    const allOk = results.every(r => r.status === 200);
    log('5 concurrent requests all succeed', allOk ? 'PASS' : 'FAIL', `Statuses: ${results.map(r => r.status).join(', ')}`);
  } catch (e) { log('Concurrent requests', 'FAIL', e.message); }

  // 7. Page routes
  console.log('\n\x1b[1m[7] Page Routes\x1b[0m');
  const pages = ['/', '/courses', '/messages', '/notifications', '/settings', '/profile', '/attendance'];
  for (const p of pages) {
    try {
      const res = await fetch(`${BASE_URL}${p}`, { redirect: 'manual' });
      log(`Page ${p}`, (res.status === 200 || res.status === 307) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
    } catch (e) { log(`Page ${p}`, 'FAIL', e.message); }
  }

  // Summary
  console.log('\n\x1b[1m═══ RESULTS ═══\x1b[0m');
  console.log(`  \x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`  \x1b[31mFailed: ${failed}\x1b[0m`);
  console.log(`  Total:  ${passed + failed}\n`);

  fs.writeFileSync(
    path.join(RESULTS_DIR, `stability-${Date.now()}.json`),
    JSON.stringify({ timestamp: new Date().toISOString(), passed, failed, results }, null, 2)
  );

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
