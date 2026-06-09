import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
  const ownerEmail = __ENV.OWNER_EMAIL || 'owner@studioops.local';
  const ownerPassword = __ENV.OWNER_PASSWORD || 'Password123!';

  // Login
  const loginPayload = JSON.stringify({ email: ownerEmail, password: ownerPassword });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  let res = http.post(`${baseUrl}/api/auth/login`, loginPayload, params);
  
  const loginSuccess = check(res, {
    'login status is 200': (r) => r.status === 200,
  });

  if (loginSuccess) {
    // 1. Create a lead inquiry
    const leadPayload = JSON.stringify({
      clientName: 'Performance Bot Client',
      phone: '+919999999999',
      email: 'perf.bot@example.com',
      city: 'Mumbai',
      eventType: 'Wedding Photography',
      estimatedValue: 120000,
      notes: 'Created by k6 load test script',
      leadSource: 'REFERRAL'
    });
    res = http.post(`${baseUrl}/api/leads`, leadPayload, params);
    const leadCreated = check(res, {
      'lead created status is 200': (r) => r.status === 200 || r.status === 201,
    });

    if (leadCreated) {
      const createdLead = res.json();
      const leadId = createdLead.id;

      // 2. Move lead stage to QUOTED
      const movePayload = JSON.stringify({
        pipelineStage: 'QUOTED',
        notes: 'Moved by performance bot'
      });
      res = http.post(`${baseUrl}/api/leads/${leadId}/move-stage`, movePayload, params);
      check(res, {
        'lead moved stage status is 200': (r) => r.status === 200,
      });
    }

    // 3. Load dashboard
    res = http.get(`${baseUrl}/api/dashboard/summary`);
    check(res, {
      'dashboard summary is 200': (r) => r.status === 200,
    });

    // 4. Load follow-ups
    res = http.get(`${baseUrl}/api/follow-up-tasks/due`);
    check(res, {
      'due follow-ups list is 200': (r) => r.status === 200,
    });
  }

  sleep(1.5);
}
