import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
  const adminEmail = __ENV.PLATFORM_ADMIN_EMAIL || 'a.fayaaz@gmail.com';
  const adminPassword = __ENV.PLATFORM_ADMIN_PASSWORD || 'Password123!';

  // Login
  const loginPayload = JSON.stringify({ email: adminEmail, password: adminPassword });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  let res = http.post(`${baseUrl}/api/auth/login`, loginPayload, params);
  
  const loginSuccess = check(res, {
    'login status is 200': (r) => r.status === 200,
  });

  if (loginSuccess) {
    // 1. Get performance summary
    res = http.get(`${baseUrl}/api/platform-admin/performance/summary`);
    check(res, {
      'performance summary is 200': (r) => r.status === 200,
    });

    // 2. Get top endpoints
    res = http.get(`${baseUrl}/api/platform-admin/performance/top-endpoints`);
    check(res, {
      'top endpoints status is 200': (r) => r.status === 200,
    });

    // 3. Get recent errors
    res = http.get(`${baseUrl}/api/platform-admin/performance/recent-errors`);
    check(res, {
      'recent errors status is 200': (r) => r.status === 200,
    });

    // 4. Get slow requests
    res = http.get(`${baseUrl}/api/platform-admin/performance/slow-requests`);
    check(res, {
      'slow requests status is 200': (r) => r.status === 200,
    });

    // 5. Get pending studios list
    res = http.get(`${baseUrl}/api/platform-admin/studios/pending`);
    check(res, {
      'pending studios status is 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
