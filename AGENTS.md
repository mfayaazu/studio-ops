# AGENTS.md

## Project
StudioOps is a photography operations management system for managing clients, projects, event schedules, team allocation, post-production, delivery, backup tracking, and future client lifetime access.

## Development Rules
- Build phase by phase.
- Do not generate unrelated features.
- Do not add new dependencies without explaining why.
- Keep backend as a modular monolith.
- Keep business logic in service classes.
- Keep controllers thin.
- Use DTOs for API requests and responses.
- Use validation annotations.
- Use Flyway for database migrations.
- Use PostgreSQL.
- Use Java 21 and Spring Boot.
- Use React, TypeScript, Vite, Tailwind CSS, and shadcn/ui.
- Do not store photo/video files in the database.
- Store only file metadata and external storage references.
- Write tests for business rules.
- Do not implement payments, WhatsApp, or client portal unless explicitly requested.

## Backend Standards
- Package by feature/module.
- Use UUID primary keys.
- Use audit fields where useful.
- Use enums for status fields.
- Use database migrations.
- Use global exception handling.
- Do not expose internal entity models directly from controllers.

## Frontend Standards
- Use React TypeScript.
- Use reusable components.
- Use forms with validation.
- Keep API calls in a separate client layer.
- Keep screens simple and practical.

## Security Rules
- Role-based access control is required.
- Owner/Admin can access all records.
- Employees can only see their own assignments.
- Clients can only see their own projects when the client portal phase starts.
- Never expose private file URLs directly.
- Use signed URLs for private file access in later phases.

## Current Phase
Phase 1: Internal MVP only.

## Phase 1 Scope
Build:
- Authentication skeleton
- Client management
- Project management
- Event scheduling
- Employee management
- Team allocation
- Basic dashboard
- Delivery status
- Backup status

Do not build:
- Client portal
- Online gallery
- Payment gateway
- WhatsApp automation
- Advanced analytics
- Mobile app