# StudioOps Performance and Load Testing Guide

Observability and performance testing are built into the StudioOps platform using `k6` load scripts, a backend telemetry API console, and a metrics generator.

---

## 1. Local Prerequisites
To execute the load scripts, install `k6` on your local development machine:
*   **macOS**: `brew install k6`
*   **Windows**: `choco install k6` or download binary from official site.
*   **Linux**: `sudo apt-get install k6` or equivalent.

---

## 2. Test Scripts

All performance scripts are located in `tests/performance/`:
*   `smoke-beta-flow.js`: Single virtual user execution verification. Hits `/api/health`, logs in, and loads core list endpoints (leads, projects, employees).
*   `beta-user-flow.js`: Simulates active owner usage by creating a new lead, moving it through pipeline stages, and querying dashboards.
*   `platform-admin-flow.js`: Simulates platform admin logins, checking active studios and querying system performance charts.
*   `read-only-load.js`: Simulates concurrent read pressure of 5-8 virtual users querying dashboards and directories under load.

---

## 3. Running Load Tests Safely

> [!WARNING]
> - **Do NOT run load tests directly inside the free-tier EC2 instance host.** Executing CPU/Memory-heavy k6 processes alongside the PostgreSQL database and Java backend will lead to Out Of Memory (OOM) crashing.
> - **Execute scripts from your local developer machine** targeting the remote EC2 beta URL.
> - **Concurrency Limit**: Keep the virtual users (VUs) count between **5 to 10** for short durations (1-2 minutes). Single free-tier EC2 deployments cannot sustain high stress testing.

### Run smoke test locally:
```bash
export BASE_URL="http://localhost:8080"
export OWNER_EMAIL="owner@studioops.local"
export OWNER_PASSWORD="Password123!"
k6 run tests/performance/smoke-beta-flow.js
```

### Run stress read-only test against Beta:
```bash
export BASE_URL="http://<your-ec2-ip-or-domain>"
export OWNER_EMAIL="owner@studioops.local"
export OWNER_PASSWORD="YourPasswordSecured"
k6 run tests/performance/read-only-load.js
```

---

## 4. Performance Reports

We provide an automated reporting tool that runs k6 smoke flows and parses statistics into formatted markdown report logs under `reports/`.

Execute the runner script:
```bash
./scripts/performance/generate-performance-report.sh
```

This will run the test suite and save a report structured as `reports/performance-report-YYYYMMDD-HHMM.md`.
