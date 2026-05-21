# StudioOps Monorepo

StudioOps is a modern operations management system designed for creative studios. This repository is structured as a monorepo containing a Java/Spring Boot backend, a React/TypeScript/Vite frontend, local dockerized infrastructure, and technical design documents.

## Repository Structure

```
studio-ops/
├── backend/            # Spring Boot REST API (Java 21, Maven)
├── frontend/           # React + TypeScript + Vite + Tailwind CSS v4
├── docs/               # Technical and Product Documentation
├── infra/              # Local Docker Compose setup (PostgreSQL)
├── AGENTS.md           # Developer profile
└── README.md           # Getting started guide (this file)
```

---

## Prerequisites

Ensure you have the following installed on your machine:
- **Java**: OpenJDK 21 (Amazon Corretto 21 or equivalent)
- **Maven**: Apache Maven 3.9+ (or use the included `./mvnw` wrapper)
- **Node.js**: v24.1.0+ (and standard `npm`)
- **Docker & Docker Compose**: Docker Desktop / Daemon running

---

## Getting Started

Follow these steps in order to start the development environment:

### Step 1: Start PostgreSQL

Spin up the local PostgreSQL 16 database using Docker Compose:

```bash
# From the repository root
docker-compose -f infra/docker-compose.yml up -d
```

This runs a PostgreSQL instance mapping the internal port 5432 to **5433** on the host to prevent conflicts with native services.
- **Database Name**: `studioops`
- **Username**: `studioops`
- **Password**: `studioops_dev`
- **Host Port**: `5433`

---

### Step 2: Build & Start Backend

Initialize and run the Spring Boot API:

```bash
# Navigate to backend directory
cd backend

# Compile and start the application
./mvnw spring-boot:run
```

Upon starting, Flyway automatically runs migrations against the database. The API will listen on port **8080**.

---

### Step 3: Start Frontend

Install dependencies and start the Vite dev server:

```bash
# Navigate to frontend directory
cd frontend

# Install package dependencies
npm install

# Start development server
npm run dev
```

The Vite dev server will run on port **5173**. Open [http://localhost:5173](http://localhost:5173) in your browser.
Vite is pre-configured to proxy `/api` routes to the backend on `http://localhost:8080/api`.

---

## Verifying Services

### 1. Direct Backend Health Check

Query the Spring Boot backend REST endpoint directly:

```bash
curl -i http://localhost:8080/api/health
```

**Expected JSON Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-05-21T11:49:00Z",
  "services": {
    "database": "UP"
  }
}
```

### 2. Frontend Sandbox Integration
When you load the frontend dashboard at `http://localhost:5173`, the **Heartbeat Widget** in the top navigation bar will automatically query the backend `/api/health` endpoint and display the real-time status:
- **Green glow**: Gateway and Database cluster are online and connected.
- **Red/Amber glow**: Connection to the backend or database is offline.
