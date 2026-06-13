#!/bin/bash
# Core deployment script executed on the EC2 instance via SSM Run Command.
set -e

echo "=== 1. Fetching Environment Variables from SSM Parameter Store ==="
chmod +x scripts/deploy/fetch-ssm-env.sh
./scripts/deploy/fetch-ssm-env.sh

echo "=== 2. Restarting Docker Containers ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml down --remove-orphans
docker compose --env-file .env.beta -f docker-compose.beta.yml up -d --build

echo "=== 3. Container Status ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml ps

echo "=== 4. Backend Logs (first 100 lines) ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=100 backend

echo "=== 5. Frontend Logs (first 100 lines) ==="
docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=100 frontend

echo "=== 6. Running Smoke Test Health Checks ==="
echo "Waiting for backend to start up via Nginx proxy..."
for i in {1..24}; do
  if curl -s -f http://localhost/api/health > /dev/null; then
    echo "Smoke Test PASSED: Backend is healthy and responding via Nginx proxy."
    break
  fi

  echo "Health check attempt $i failed. Waiting 5 seconds..."
  sleep 5

  if [ "$i" -eq 24 ]; then
    echo "Smoke Test FAILED after 120 seconds."
    echo "=== Direct Backend Health Status ==="
    curl -i http://localhost:8080/api/health || true
    curl -i http://localhost/api/health || true
    echo "=== Container Status ==="
    docker compose --env-file .env.beta -f docker-compose.beta.yml ps
    echo "=== Backend Logs (Detailed) ==="
    docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=200 backend
    echo "=== Frontend Logs (Detailed) ==="
    docker compose --env-file .env.beta -f docker-compose.beta.yml logs --tail=200 frontend
    exit 1
  fi
done
