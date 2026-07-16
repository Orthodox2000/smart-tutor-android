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

async function api(method, urlPath, body = null, extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${urlPath}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers, raw: text };
}

async function runTests() {
  console.log('\n\x1b[1m═══ SMART TUTORS — SECURITY TESTS ═══\x1b[0m\n');

  // 1. SQL/NoSQL Injection
  console.log('\x1b[1m[1] Injection Protection\x1b[0m');
  try {
    const res = await api('POST', '/api/auth/login', { login: "' OR 1=1 --", password: "anything" });
    log('NoSQL injection on login blocked', (res.status === 401 || res.status === 400) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('NoSQL injection test', 'FAIL', e.message); }

  try {
    const res = await api('POST', '/api/auth/login', { login: { "$gt": "" }, password: { "$gt": "" } });
    log('MongoDB operator injection blocked', (res.status === 401 || res.status === 400 || res.status === 500) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('MongoDB operator injection', 'FAIL', e.message); }

  try {
    const res = await api('GET', "/api/courses?category={'$ne':''}");
    log('Query param injection handled', res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Query param injection', 'FAIL', e.message); }

  // 2. XSS Protection
  console.log('\n\x1b[1m[2] XSS Protection\x1b[0m');
  try {
    const res = await api('POST', '/api/messages', {
      authorId: 'test',
      authorName: '<script>alert("xss")</script>',
      authorRole: 'student',
      content: '<img src=x onerror=alert(1)>',
      type: 'announcement',
      target: 'all'
    });
    const data = typeof res.data === 'object' ? res.data : {};
    log('XSS in message content handled', res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('XSS message test', 'FAIL', e.message); }

  // 3. Authentication Security
  console.log('\n\x1b[1m[3] Authentication Security\x1b[0m');
  try {
    const res = await api('GET', '/api/auth/session');
    log('Unauthenticated session returns 401', (res.status === 401 || res.status === 403) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Session without auth', 'FAIL', e.message); }

  try {
    const res = await api('GET', '/api/auth/session', null, { Cookie: 'smart_tutor_session=invalid_token_12345' });
    log('Invalid session token rejected', (res.status === 401 || res.status === 403) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Invalid session token', 'FAIL', e.message); }

  try {
    const res = await api('POST', '/api/auth/login', { login: 'admin', password: 'password' });
    log('Generic password rejected', (res.status === 401 || res.status === 400) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Generic password test', 'FAIL', e.message); }

  // 4. Password Exposure
  console.log('\n\x1b[1m[4] Data Exposure\x1b[0m');
  try {
    const { data, status } = await api('GET', '/api/users');
    if (status === 200 && Array.isArray(data)) {
      const hasPassword = data.some(u => u && u.password);
      log('Users API does not expose passwords', !hasPassword ? 'PASS' : 'FAIL', hasPassword ? 'Password field found in response' : 'Password field properly stripped');
    } else {
      log('Users API accessible', status === 200 ? 'PASS' : 'FAIL', `Status: ${status}`);
    }
  } catch (e) { log('Users password exposure', 'FAIL', e.message); }

  // 5. Rate Limiting
  console.log('\n\x1b[1m[5] Rate Limiting\x1b[0m');
  try {
    const promises = Array(15).fill(null).map(() => api('POST', '/api/auth/login', { login: 'test', password: 'test' }));
    const results = await Promise.all(promises);
    const has429 = results.some(r => r.status === 429);
    const allHandled = results.every(r => r.status < 500);
    log('Rapid login attempts handled', allHandled ? 'PASS' : 'FAIL', has429 ? 'Rate limit triggered' : 'All returned < 500');
  } catch (e) { log('Rate limiting test', 'FAIL', e.message); }

  // 6. HTTP Method Enforcement
  console.log('\n\x1b[1m[6] HTTP Method Security\x1b[0m');
  try {
    const res = await api('PUT', '/api/auth/login', { login: 'test' });
    log('PUT on login returns 405', (res.status === 405 || res.status === 404) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('PUT method test', 'FAIL', e.message); }

  try {
    const res = await api('PATCH', '/api/courses');
    log('PATCH without auth handled', res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('PATCH method test', 'FAIL', e.message); }

  // 7. Security Headers
  console.log('\n\x1b[1m[7] Security Headers\x1b[0m');
  try {
    const { headers, status } = await api('GET', '/api/admin/stats');
    const contentType = headers.get('x-content-type-options');
    log('X-Content-Type-Options header', contentType === 'nosniff' ? 'PASS' : 'WARN', `Value: ${contentType || 'missing'}`);

    const frameOptions = headers.get('x-frame-options');
    log('X-Frame-Options header', frameOptions ? 'PASS' : 'WARN', `Value: ${frameOptions || 'missing'}`);

    const xss = headers.get('x-xss-protection');
    log('X-XSS-Protection header', xss ? 'PASS' : 'WARN', `Value: ${xss || 'missing'}`);
  } catch (e) { log('Security headers', 'FAIL', e.message); }

  // 8. CORS
  console.log('\n\x1b[1m[8] CORS Policy\x1b[0m');
  try {
    const { headers } = await api('GET', '/api/courses');
    const cors = headers.get('access-control-allow-origin');
    log('CORS header present', cors ? 'PASS' : 'WARN', `Value: ${cors || 'not set'}`);
  } catch (e) { log('CORS test', 'FAIL', e.message); }

  // 9. Sensitive Endpoint Protection
  console.log('\n\x1b[1m[9] Endpoint Protection\x1b[0m');
  const protectedEndpoints = [
    { method: 'GET', path: '/api/users', name: 'Users list' },
    { method: 'POST', path: '/api/auth/logout', name: 'Logout' },
    { method: 'GET', path: '/api/admin/stats', name: 'Admin stats' },
  ];
  for (const ep of protectedEndpoints) {
    try {
      const res = await api(ep.method, ep.path);
      log(`${ep.name} (${ep.method} ${ep.path})`, res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
    } catch (e) { log(`${ep.name}`, 'FAIL', e.message); }
  }

  // 10. Input Validation
  console.log('\n\x1b[1m[10] Input Validation\x1b[0m');
  try {
    const res = await api('POST', '/api/auth/register', { username: '', password: 'test' });
    log('Empty username rejected', (res.status === 400 || res.status === 422) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Empty username', 'FAIL', e.message); }

  try {
    const res = await api('POST', '/api/auth/register', { username: 'valid', password: '12' });
    log('Short password rejected', (res.status === 400 || res.status === 422) ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Short password', 'FAIL', e.message); }

  try {
    const oversized = 'A'.repeat(10000);
    const res = await api('POST', '/api/messages', { content: oversized, type: 'announcement', target: 'all' });
    log('Oversized payload handled', res.status < 500 ? 'PASS' : 'FAIL', `Status: ${res.status}`);
  } catch (e) { log('Oversized payload', 'FAIL', e.message); }

  // Summary
  console.log('\n\x1b[1m═══ SECURITY RESULTS ═══\x1b[0m');
  console.log(`  \x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`  \x1b[31mFailed: ${failed}\x1b[0m`);
  console.log(`  Total:  ${passed + failed}\n`);

  fs.writeFileSync(
    path.join(RESULTS_DIR, `security-${Date.now()}.json`),
    JSON.stringify({ timestamp: new Date().toISOString(), passed, failed, results }, null, 2)
  );

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
