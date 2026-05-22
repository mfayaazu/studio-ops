# Phase 1 Checklist: StudioOps Multi-Tenant SaaS

This document tracks the implementation status of Phase 1 requirements for the StudioOps SaaS backend and frontend.

---

## 1. Single-Studio Modules (Implemented)
These modules are fully operational but currently function in a single-studio scope. They must be migrated to the multi-tenant scoping schema in subsequent phases.

- **[x] Client Management**: CRUD, DTO mappings, custom mapper, unit/integration tests.
- **[x] Employee Management**: CRUD, email uniqueness checks, status validations, integration tests.
- **[x] Project Management**: CRUD, project code generation, status transitions, integration tests.
- **[x] Event Scheduling**: CRUD, date/time boundaries, project linkages, integration tests.
- **[x] Team Allocation**: Crew assignments, native pointer drag-and-drop availability planner (frontend), double-booking warnings.
- **[x] Delivery Status**: Deliverable CRUD, status transitions (`PENDING` -> `DELIVERED`).
- **[x] Backup Status**: Backup record audits, 3-2-1 backup verification checks (warnings for < 2 backup types).
- **[x] Basic Dashboard**: Operations metrics cards, backup warnings panel, conflict listings.
- **[x] Authentication Skeleton**: Session-based login/logout backend APIs and frontend context provider.

---

## 2. Multi-Tenant SaaS Foundation (Pending)
These tasks establish the multi-tenant SaaS capabilities of the platform.

### [ ] Studio Tenant Module
- **Status**: PENDING
- **Tasks**:
  - [ ] Add `studios` table Flyway migration.
  - [ ] Implement `Studio` JPA entity, repository, service, and controller.
  - [ ] Add studio status and subscription tier enums.

### [ ] User Module Upgrades
- **Status**: PENDING
- **Tasks**:
  - [ ] Add `studio_id` FK column to the `users` table via migration.
  - [ ] Update `User` entity to reference `Studio`.
  - [ ] Refactor user authentication and login DTOs to support tenant resolution.

### [ ] studioId Entity Scoping
- **Status**: PENDING
- **Tasks**:
  - [ ] Add `studio_id` columns to `clients` and `employees`.
  - [ ] Add `studio_id` columns to `projects` and `events`.
  - [ ] Add `studio_id` columns to `event_assignments`, `deliverables`, and `backup_records`.
  - [ ] Refactor all service business logic and JPA repository queries to filter strictly by the authenticated tenant's `studioId`.

### [ ] Subscription Billing
- **Status**: PENDING
- **Tasks**:
  - [ ] Map out billing status transition logic.
  - [ ] Design future checkout integration plan for Stripe/Paddle/Razorpay.

### [ ] Security & Auth Enforcement
- **Status**: PENDING
- **Tasks**:
  - [ ] Restrict access to tenant-specific resources, returning `403 Forbidden` if a user attempts to retrieve/modify records belonging to another tenant (`studio_id` mismatch check).

---

## 3. Frontend Views (In Progress)
- **[x] Layout & Routing**: sidebar, navigation links, and providers setup.
- **[x] Authentication Screens**: Dark-themed login screen with seed-user autofill.
- **[x] Availability Planner**: Drag-and-drop crew assignment panel on the calendar.
- **[ ] Multi-Tenant Studio Workspace Setup**: PENDING.
- **[ ] Scoped Console Screens**: Client, Project, Deliverables lists.
