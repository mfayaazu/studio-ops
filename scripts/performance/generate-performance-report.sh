#!/bin/bash

# Ensure directory structure exists
mkdir -p reports

echo "=== Running StudioOps Performance Smoke Test ==="

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "k6 command not found. Please install k6 locally before running."
    echo "MacOS: brew install k6"
    exit 1
fi

# Run k6 smoke test exporting summary JSON
export BASE_URL=${BASE_URL:-"http://localhost:8080"}
export OWNER_EMAIL=${OWNER_EMAIL:-"owner@studioops.local"}
export OWNER_PASSWORD=${OWNER_PASSWORD:-"Password123!"}

k6 run --summary-export reports/k6-summary.json tests/performance/smoke-beta-flow.js

if [ ! -f reports/k6-summary.json ]; then
    echo "Error: k6 summary export failed."
    exit 1
fi

# Determine filename
TIMESTAMP=$(date +"%Y%m%d-%H%M")
REPORT_FILE="reports/performance-report-${TIMESTAMP}.md"

echo "=== Generating Performance Report ==="

# Parse k6 summary and format markdown using node
node -e '
const fs = require("fs");
try {
  const summary = JSON.parse(fs.readFileSync("reports/k6-summary.json", "utf8"));
  
  const totalRequests = summary.metrics.http_reqs.count;
  const failedRequests = summary.metrics.http_req_failed.passes;
  const failRate = (summary.metrics.http_req_failed.value * 100).toFixed(2);
  const avgDuration = summary.metrics.http_req_duration.avg.toFixed(2);
  const p95Duration = summary.metrics.http_req_duration["p(95)"].toFixed(2);
  
  const pass = failedRequests === 0 && p95Duration < 1000;
  const recommendation = pass ? "PASS - System is performing within go-live latency thresholds." : "FAIL - Metrics exceed thresholds. Check database loads.";
  
  const mdContent = `# StudioOps Performance Report - ${new Date().toISOString().split("T")[0]}

## Test Metadata
* **Timestamp**: ${new Date().toLocaleString()}
* **Target Base URL**: ${process.env.BASE_URL}
* **Test Flow**: smoke-beta-flow.js
* **Virtual Users**: 1

## Performance Metrics
| Metric | Value | Threshold Target | Status |
| :--- | :--- | :--- | :--- |
| **Total Requests** | ${totalRequests} | - | Info |
| **Failed Requests** | ${failedRequests} (${failRate}%) | < 1.00% | ${failedRequests === 0 ? "✅ OK" : "❌ FAIL"} |
| **Average Response Time** | ${avgDuration} ms | - | Info |
| **p95 Response Time** | ${p95Duration} ms | < 1000.00 ms | ${p95Duration < 1000 ? "✅ OK" : "❌ FAIL"} |

## Recommendation
### Status: **${pass ? "PASS" : "FAIL"}**
${recommendation}
`;
  
  fs.writeFileSync(process.argv[1], mdContent);
  console.log("Markdown report written successfully.");
} catch (e) {
  console.error("Failed to parse k6-summary.json:", e);
  process.exit(1);
}
' "${REPORT_FILE}"

echo "Report generated successfully at ${REPORT_FILE}"
