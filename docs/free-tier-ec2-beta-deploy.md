# StudioOps Free-Tier EC2 Beta Deployment Guide

This document describes the configuration, prerequisites, infrastructure provisioning, secrets management, deployment automation, backups, and security practices for running the StudioOps Beta environment on a free-tier AWS EC2 instance.

---

## 1. Known Architecture & Free-Tier Limitations
This infrastructure is designed exclusively for low-cost/free-tier beta testing. It contains the following non-production concessions:
*   **Single-Instance Architecture**: Both the PostgreSQL database and the Spring Boot application share the same `t2.micro` EC2 node.
*   **No High Availability**: If the EC2 instance goes down, the entire workspace goes down.
*   **Local Storage**: Database files reside in a Docker volume (`postgres_beta_data`) mapped to the host's EBS disk.
*   **Manual Backups**: Since RDS automated snapshots are bypassed, data backups must be run via cron jobs using `pg_dump`.
*   **Resource Boundaries**: Running Maven compilation or Node builds on `t2.micro` (1GB RAM) will crash the instance. Compilation is delegated to GitHub Actions.

---

## 2. AWS Parameter Store (SSM) Configuration

To keep secrets secure without incurring monthly fees (unlike AWS Secrets Manager which charges per secret), we use Standard **SSM Parameter Store** parameters with type `SecureString`.

Create these parameters in your AWS Systems Manager Parameter Store Console (or via CLI):

| Parameter Name | Type | Recommended Value / Purpose |
|---|---|---|
| `/studio-ops/beta/db-password` | `SecureString` | Random 32-character master DB password |
| `/studio-ops/beta/spring-mail-username` | `SecureString` | Amazon SES SMTP Username |
| `/studio-ops/beta/spring-mail-password` | `SecureString` | Amazon SES SMTP Password |
| `/studio-ops/beta/email-from` | `SecureString` | Verified SES sender email (e.g. `noreply@infinitoshutters.se`) |
| `/studio-ops/beta/email-enabled` | `SecureString` | `true` (Enables SMTP dispatch) |
| `/studio-ops/beta/frontend-url` | `SecureString` | `https://beta.infinitoshutters.se` |
| `/studio-ops/beta/cors-allowed-origins` | `SecureString` | `https://beta.infinitoshutters.se` |
| `/studio-ops/beta/platform-admin-emails` | `SecureString` | Comma-separated admin emails (e.g. `a.fayaaz@gmail.com`) |
| `/studio-ops/beta/platform-admin-notifications-enabled` | `SecureString` | `true` (Enables new signup notifications) |
| `/studio-ops/beta/beta-whatsapp-only` | `SecureString` | `true` (Forces WhatsApp communication sandbox) |

---

## 3. EC2 Target & Security Setup

### A. Instance Profile & IAM Role
Create an IAM Role (e.g., `StudioOpsBetaEC2Role`) with trust relationships matching `ec2.amazonaws.com`. Attach the following policy allowing read-only access to our application configuration namespace:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ssm:GetParameter",
                "ssm:GetParameters"
            ],
            "Resource": "arn:aws:ssm:*:*:parameter/studio-ops/beta/*"
        }
    ]
}
```

*Attach this IAM Role as the **IAM Instance Profile** on your EC2 instance.*

### B. EC2 Operating System Prerequisites
Launch an **Ubuntu Server 24.04 LTS (t2.micro)** instance. Log in and configure dependencies:

```bash
# Update repositories
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io

# Install Docker Compose plugin
sudo apt-get install -y docker-compose-v2

# Grant permissions to user
sudo usermod -aG docker ubuntu

# Install AWS CLI (needed by the env extraction script)
sudo apt-get install -y awscli

# Restart session
exit
```

### C. Security Group Configuration
Establish strict inbound rules on the EC2 security group:
*   **Port 22 (SSH)**: Restrict access strictly to your specific development/admin office IP.
*   **Port 80 (HTTP)**: Public access (`0.0.0.0/0`) for Let's Encrypt Certbot challenge and redirects.
*   **Port 443 (HTTPS)**: Public access (`0.0.0.0/0`) for secure application traffic.
*   *Note: Port 5432 (PostgreSQL) is NOT open to the public.*

---

## 4. DNS Routing & SSL (cPanel & Certbot)

### A. cPanel DNS Update
Add an **A Record** in your cPanel Zone Editor:
```text
beta.infinitoshutters.se   IN   A   <EC2-PUBLIC-IP-ADDRESS>
```

### B. Let's Encrypt Certificate Generation on EC2
Once the DNS record resolves to the EC2 IP, install Certbot and retrieve a certificate:

```bash
sudo apt-get install -y certbot

# Run certbot standalone to acquire certificate
sudo certbot certonly --standalone -d beta.infinitoshutters.se
```
This stores your certificates under `/etc/letsencrypt/live/beta.infinitoshutters.se/`.

### C. Share Certificates with Nginx Container
Update your `docker-compose.beta.yml` on the EC2 instance to map the SSL certificates inside the Nginx container, or configure Certbot to auto-renew.
*(See Section 7 for SSL-enabled Nginx configurations)*

---

## 5. GitHub Secrets
Ensure the following settings are added to your repository's **Settings > Secrets and variables > Actions**:

| Secret Name | Purpose | Example Value |
|---|---|---|
| `EC2_HOST` | Public IP or DNS of the EC2 Instance | `54.210.xx.xx` |
| `EC2_USERNAME` | Default login shell username | `ubuntu` |
| `EC2_SSH_KEY` | Raw PEM private key for SSH access | `-----BEGIN RSA PRIVATE KEY-----...` |

---

## 6. Local Manual Verification & Build Check

Verify that all local codes are clean and compile correctly before committing or deploying:

### Backend Tests
```bash
cd backend
./mvnw clean test
```

### Frontend Build
```bash
cd frontend
PATH=$PATH:/opt/homebrew/bin npm run build
```

---

## 7. Deployment Run & Smoke Testing

1.  **Git Push**: Merge your code into the `main` branch. This triggers the GitHub Actions workflow.
2.  **Pipeline Progress**: The pipeline compiles backend and frontend code, bundles deployment files (`deploy-package.tar.gz`), copies them to `/home/ubuntu/studio-ops-temp` on EC2, and runs SSH commands.
3.  **Host Execution**:
    *   Unpacks the bundle.
    *   Runs `./scripts/deploy/fetch-ssm-env.sh` (which queries AWS SSM Parameter Store and writes `.env.beta`).
    *   Builds the Docker images and starts services in the background.

### Smoke Test Checklist
- [ ] **Health Endpoint**: `https://beta.infinitoshutters.se/api/health` yields:
  ```json
  {"status":"UP","services":{"database":"UP"}}
  ```
- [ ] **Database Scopes**: Sign in using `owner@studioops.local`. Navigate to clients and confirm list renders.
- [ ] **Email Dispatch**: Create a new user invite or request a password reset, check `system_email_log` table to confirm status is `SENT`.

---

## 8. Database Backups and Restore

Because this is a single-node setup, you must run regular backups manually or via cron.

### A. Backup Command
Run a dump from the running postgres container:
```bash
docker exec -t studioops-postgres-beta pg_dump -U studioops studioops > backup_$(date +%F).sql
```

### B. Restore Command
To restore a sql dump into the database:
```bash
# Drop & recreate DB
docker exec -it studioops-postgres-beta psql -U studioops -d postgres -c "DROP DATABASE studioops;"
docker exec -it studioops-postgres-beta psql -U studioops -d postgres -c "CREATE DATABASE studioops;"

# Apply dump
cat backup_YYYY-MM-DD.sql | docker exec -i studioops-postgres-beta psql -U studioops -d studioops
```
