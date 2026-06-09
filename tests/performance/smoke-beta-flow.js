import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'], // less than 1% errors
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete below 1000ms
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
  const ownerEmail = __ENV.OWNER_EMAIL || 'owner@studioops.local';
  const ownerPassword = __ENV.OWNER_PASSWORD || 'Password123!';

  // 1. Health check
  let res = http.get(`${baseUrl}/api/health`);
  check(res, {
    'health check status is 200': (r) => r.status === 200,
  });

  // 2. Login
  const loginPayload = JSON.stringify({ email: ownerEmail, password: ownerPassword });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  res = http.post(`${baseUrl}/api/auth/login`, loginPayload, params);
  
  const loginSuccess = check(res, {
    'login status is 200': (r) => r.status === 200,
    'session cookie is set': (r) => r.cookies['JSESSIONID'] !== undefined || r.headers['Set-Cookie'] !== undefined,
  });

  if (loginSuccess) {
    // 3. Get current session info
    res = http.get(`${baseUrl}/api/auth/me`);
    check(res, { 'auth me status is 200': (r) => r.status === 200 });

    // 4. Load dashboard summary
    res = http.get(`${baseUrl}/api/dashboard/summary`);
    check(res, { 'dashboard summary status is 200': (r) => r.status === 200 });

    // 5. Load leads list
    res = http.get(`${baseUrl}/api/leads`);
    check(res, { 'leads status is 200': (r) => r.status === 200 });

    // 6. Load employees list
    res = http.get(`${baseUrl}/api/employees`);
    check(res, { 'employees status is 200': (r) => r.status === 200 });

    // 7. Load projects list
    res = http.get(`${baseUrl}/api/projects`);
    check(res, { 'projects status is 200': (r) => r.status === 200 });

    // 8. Load follow-up tasks due
    res = http.get(`${baseUrl}/api/follow-up-tasks/due`);
    check(res, { 'due tasks status is 200': (r) => r.status === 200 });
  }

  sleep(1);
}
