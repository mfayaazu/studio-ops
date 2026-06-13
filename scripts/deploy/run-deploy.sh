#!/bin/bash
# run-deploy.sh: Orchestrate container build, startup, and health check on EC2.
set -e

echo "Starting deployment execution..."

# 1. Fetch environment variables from Parameter Store
chmod +x scripts/deploy/fetch-ssm-env.sh
./scripts/deploy/fetch-ssm-env.sh

# 2. Restart containers
docker compose --env-file .env.beta -f docker-compose.beta.yml down --remove-orphans
docker compose --env-file .env.beta -f docker-compose.beta.yml up -d --build

# 3. Print diagnostics
echo "=== Container Status ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml ps
echo "=== Backend Logs ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=100 backend
echo "=== Frontend Logs ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=100 frontend

# 4. Wait for backend initialization and run Smoke test
echo "Waiting for backend to start up via Nginx proxy..."
for i in {1..24}; do
  if curl -s -f http://localhost/api/health > /dev/null; then
    echo "Smoke Test PASSED: Backend is healthy and responding via Nginx proxy."
    
    # External verification
    echo "Verifying external domain health check..."
    if curl -s -f http://beta.infinotiveitkonsult.se/api/health > /dev/null; then
      echo "External Health Check PASSED: http://beta.infinotiveitkonsult.se/api/health is UP."
    else
      echo "External Health Check WARNING: Could not access health check externally."
    fi
    exit 0
  fi

  echo "Health check attempt $i failed. Waiting 5 seconds..."
  sleep 5
done

# If health check fails after 120 seconds
echo "Smoke Test FAILED after 120 seconds."
echo "=== Direct Backend Health Status ==="
curl -i http://localhost:8080/api/health || true
curl -i http://localhost/api/health || true
echo "=== Container Status ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml ps
echo "=== Backend Logs ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=200 backend
echo "=== Frontend Logs ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=200 frontend
exit 1
