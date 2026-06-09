import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 8 },  // ramp up to 8 virtual users
    { duration: '1m', target: 8 },   // run at 8 users for 1 minute
    { duration: '30s', target: 0 },  // ramp down to 0
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],    // errors should be less than 2%
    http_req_duration: ['p(95)<1000'], // 95% of requests should complete below 1000ms
  },
};

// Global variables in k6 script are initialized once per VU.
// This allows caching the session credentials across iterations.
let isLoggedIn = false;

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
  const ownerEmail = __ENV.OWNER_EMAIL || 'owner@studioops.local';
  const ownerPassword = __ENV.OWNER_PASSWORD || 'Password123!';

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  if (!isLoggedIn) {
    const loginPayload = JSON.stringify({ email: ownerEmail, password: ownerPassword });
    const res = http.post(`${baseUrl}/api/auth/login`, loginPayload, params);
    if (check(res, { 'VU login successful': (r) => r.status === 200 })) {
      isLoggedIn = true;
    } else {
      sleep(2);
      return;
    }
  }

  // 1. Dashboard summary read
  let res = http.get(`${baseUrl}/api/dashboard/summary`);
  check(res, { 'dashboard read status is 200': (r) => r.status === 200 });

  // 2. Leads read
  res = http.get(`${baseUrl}/api/leads`);
  check(res, { 'leads read status is 200': (r) => r.status === 200 });

  // 3. Due tasks read
  res = http.get(`${baseUrl}/api/follow-up-tasks/due`);
  check(res, { 'due tasks read status is 200': (r) => r.status === 200 });

  // 4. Employees read
  res = http.get(`${baseUrl}/api/employees`);
  check(res, { 'employees read status is 200': (r) => r.status === 200 });

  // 5. Projects read
  res = http.get(`${baseUrl}/api/projects`);
  check(res, { 'projects read status is 200': (r) => r.status === 200 });

  sleep(1);
}
