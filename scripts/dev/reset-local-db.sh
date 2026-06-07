#!/bin/bash
set -e

# Extend PATH to include standard macOS Homebrew locations
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"


# Configuration
DB_HOST="localhost"
DB_PORT="5433"
DB_NAME="studioops"
DB_USER="studioops"
DB_PASS="studioops_dev"

# Safety Check 1: Refuse if host is not localhost or 127.0.0.1
if [ "$DB_HOST" != "localhost" ] && [ "$DB_HOST" != "127.0.0.1" ]; then
    echo "ERROR: Database host is set to '$DB_HOST'."
    echo "This script is strictly restricted to local development database reset."
    exit 1
fi

echo "============================================================"
echo "               STUDIOOPS LOCAL DATABASE RESET               "
echo "============================================================"
echo "WARNING: This will permanently delete all local StudioOps data."
echo "============================================================"
echo

# Safety Check 2: Require typing exact verification string
read -p "Please type exactly 'RESET LOCAL DB' to proceed: " CONFIRMATION

if [ "$CONFIRMATION" != "RESET LOCAL DB" ]; then
    echo "Aborted. Confirmation did not match."
    exit 1
fi

echo "Checking PostgreSQL connection using pg_isready..."
if ! command -v pg_isready &> /dev/null; then
    echo "pg_isready command not found. Proceeding directly with psql..."
else
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT"; then
        echo "ERROR: PostgreSQL is not running on $DB_HOST:$DB_PORT."
        exit 1
    fi
fi

echo "Wiping and recreating public schema in local DB '$DB_NAME'..."

# Execute drop and recreate schema
export PGPASSWORD="$DB_PASS"

if ! command -v psql &> /dev/null; then
    echo "ERROR: psql client utility is not installed or not in PATH."
    echo "Please ensure postgresql client packages are installed."
    exit 1
fi

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  GRANT ALL ON SCHEMA public TO $DB_USER;
  GRANT ALL ON SCHEMA public TO public;
"

echo "============================================================"
echo "SUCCESS: Local database schema reset completed successfully!"
echo "============================================================"
echo "Next Steps to Rebuild and Verify:"
echo "1. Stop the backend if running."
echo "2. Restart backend to re-run Flyway migrations:"
echo "   cd backend"
echo "   ./mvnw spring-boot:run"
echo "3. Confirm the application started and database migrations completed:"
echo "   curl http://localhost:8080/api/health"
echo "============================================================"
