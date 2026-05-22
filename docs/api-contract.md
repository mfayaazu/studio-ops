# API Contract Specification: StudioOps Phase 1

This document specifies the REST API endpoints, routing schema, and request/response structures.

All REST endpoints return payloads in `application/json` format.

---

## Multi-Tenant SaaS API Scoping Guidelines

> [!IMPORTANT]
> **Implicit Scoping via Session**: Every business endpoint (Clients, Employees, Projects, Events, Assignments, Deliverables, Backups, and Dashboard Summary) is strictly partitioned by the authenticated user's `studioId`.
> 
> - Clients do **not** supply a `studioId` parameter in request headers, query strings, or JSON bodies.
> - The backend resolves the user's `studioId` directly from the authenticated session context (Spring Security authentication principal).
> - **Data Access Boundaries**:
>   - `GET` requests only return records matching the active tenant's `studioId`.
>   - `POST` requests automatically link newly created entities to the active tenant's `studioId`.
>   - `PUT`/`DELETE` operations on resource IDs must verify the resource belongs to the user's `studioId`, failing with `403 Forbidden` if there is a tenant mismatch.

---

## 1. System Gateway

### GET `/api/health`
Checks backend service availability and connectivity to database nodes.

**Request:** `GET /api/health`

**Response (Success - 200 OK):**
```json
{
  "status": "UP",
  "timestamp": "2026-05-21T09:51:00Z",
  "services": {
    "database": "UP"
  }
}
```

---

## 2. Clients

### GET `/api/clients`
Retrieves all client records.
**Response (200 OK):**
```json
[
  {
    "id": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
    "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+46701234567",
    "notes": "Prefers email contact.",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/clients/{id}`
Retrieves a specific client record by its ID.
**Response (200 OK):**
```json
{
  "id": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+46701234567",
  "notes": "Prefers email contact.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### POST `/api/clients`
Creates a client. Returns the full created resource representation.
**Request:**
```json
{
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+46701234567",
  "notes": "Prefers email contact.",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
}
```
**Response (201 Created):**
```json
{
  "id": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+46701234567",
  "notes": "Prefers email contact.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/clients/{id}`
Updates an existing client. Returns the updated resource representation.
**Request:**
```json
{
  "fullName": "Alice Smith Updated",
  "email": "alice.updated@example.com",
  "phone": "+46701234567",
  "notes": "Updated notes."
}
```
**Response (200 OK):**
```json
{
  "id": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "Alice Smith Updated",
  "email": "alice.updated@example.com",
  "phone": "+46701234567",
  "notes": "Updated notes.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/clients/{id}`
Removes a client.
**Response (204 No Content)**

---

## 3. Employees (Staff)

### GET `/api/employees`
Retrieves all employee profiles.
**Response (200 OK):**
```json
[
  {
    "id": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
    "userId": null,
    "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
    "fullName": "John Doe",
    "email": "john.doe@studioops.se",
    "phone": "+46701112233",
    "primaryRole": "Lead Photographer",
    "skills": "Colorist, Lighting",
    "status": "ACTIVE",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/employees/{id}`
Retrieves a specific employee profile by its ID.
**Response (200 OK):**
```json
{
  "id": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "userId": null,
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "John Doe",
  "email": "john.doe@studioops.se",
  "phone": "+46701112233",
  "primaryRole": "Lead Photographer",
  "skills": "Colorist, Lighting",
  "status": "ACTIVE",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### POST `/api/employees`
Creates a new profile. Returns the full profile.
**Request:**
```json
{
  "userId": null,
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "John Doe",
  "email": "john.doe@studioops.se",
  "phone": "+46701112233",
  "primaryRole": "Lead Photographer",
  "skills": "Colorist, Lighting",
  "status": "ACTIVE"
}
```
**Response (201 Created):**
```json
{
  "id": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "userId": null,
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "John Doe",
  "email": "john.doe@studioops.se",
  "phone": "+46701112233",
  "primaryRole": "Lead Photographer",
  "skills": "Colorist, Lighting",
  "status": "ACTIVE",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/employees/{id}`
Updates an employee's profile. Returns the updated profile.
**Request:**
```json
{
  "userId": null,
  "fullName": "John Doe Updated",
  "email": "john.doe@studioops.se",
  "phone": "+46701112233",
  "primaryRole": "Lead Photographer",
  "skills": "Colorist, Lighting, Editing",
  "status": "ON_LEAVE"
}
```
**Response (200 OK):**
```json
{
  "id": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "userId": null,
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "fullName": "John Doe Updated",
  "email": "john.doe@studioops.se",
  "phone": "+46701112233",
  "primaryRole": "Lead Photographer",
  "skills": "Colorist, Lighting, Editing",
  "status": "ON_LEAVE",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/employees/{id}`
Removes an employee profile.
**Response (204 No Content)**

---

## 4. Projects

### GET `/api/projects`
Retrieves all projects.
**Response (200 OK):**
```json
[
  {
    "id": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
    "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "projectCode": "RSA-2026-0001",
    "title": "Corporate Portrait Shoot 2026",
    "projectType": "Corporate",
    "bookingStatus": "CONTRACT_SIGNED",
    "paymentStatus": "PARTIALLY_PAID",
    "status": "SCHEDULED",
    "startDate": "2026-06-01",
    "endDate": "2026-06-15",
    "notes": "Bring special backdrops.",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z",
    "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
  }
]
```

### GET `/api/projects/{id}`
Retrieves a project by its ID.
**Response (200 OK):**
```json
{
  "id": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Portrait Shoot 2026",
  "projectType": "Corporate",
  "bookingStatus": "CONTRACT_SIGNED",
  "paymentStatus": "PARTIALLY_PAID",
  "status": "SCHEDULED",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "notes": "Bring special backdrops.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
}
```

### POST `/api/projects`
Creates a project. Returns the full created project object.
**Request:**
```json
{
  "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Portrait Shoot 2026",
  "projectType": "Corporate",
  "bookingStatus": "INQUIRY",
  "paymentStatus": "UNPAID",
  "status": "LEAD",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "notes": "Bring special backdrops.",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
}
```
**Response (201 Created):**
```json
{
  "id": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Portrait Shoot 2026",
  "projectType": "Corporate",
  "bookingStatus": "INQUIRY",
  "paymentStatus": "UNPAID",
  "status": "LEAD",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "notes": "Bring special backdrops.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
}
```

### PUT `/api/projects/{id}`
Updates a project. Returns the full updated project.
**Request:**
```json
{
  "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Shoot 2026 - CONFIRMED",
  "projectType": "Corporate",
  "bookingStatus": "CONTRACT_SIGNED",
  "paymentStatus": "PAID",
  "status": "COMPLETED",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "notes": "Updated notes."
}
```
**Response (200 OK):**
```json
{
  "id": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "clientId": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "assignedProjectManagerId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Shoot 2026 - CONFIRMED",
  "projectType": "Corporate",
  "bookingStatus": "CONTRACT_SIGNED",
  "paymentStatus": "PAID",
  "status": "COMPLETED",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "notes": "Updated notes.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e"
}
```

### DELETE `/api/projects/{id}`
Removes a project.
**Response (204 No Content)**

---

## 5. Events

### GET `/api/events`
Retrieves all events.
**Response (200 OK):**
```json
[
  {
    "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
    "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
    "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "title": "Studio Portraits Day 1",
    "type": "CORPORATE",
    "eventDate": "2026-06-05",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "venueName": "Main Studio Room A",
    "city": "Gothenburg",
    "address": "Vasagatan 16",
    "status": "SCHEDULED",
    "notes": "Notes on events.",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/events/{id}`
Retrieves a specific calendar event by ID.
**Response (200 OK):**
```json
{
  "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "title": "Studio Portraits Day 1",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "venueName": "Main Studio Room A",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED",
  "notes": "Notes on events.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### GET `/api/projects/{projectId}/events`
Retrieves all events assigned to a project.
**Response (200 OK):**
```json
[
  {
    "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
    "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
    "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "title": "Studio Portraits Day 1",
    "type": "CORPORATE",
    "eventDate": "2026-06-05",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "venueName": "Main Studio Room A",
    "city": "Gothenburg",
    "address": "Vasagatan 16",
    "status": "SCHEDULED",
    "notes": "Notes on events.",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### POST `/api/events`
Creates a new calendar event. Returns the full created event object.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e", // Optional
  "title": "Studio Portraits Day 1",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "venueName": "Main Studio Room A",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED",
  "notes": "Notes on events."
}
```
**Response (201 Created):**
```json
{
  "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "title": "Studio Portraits Day 1",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "venueName": "Main Studio Room A",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED",
  "notes": "Notes on events.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/events/{id}`
Updates an event. Returns the updated event representation.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "title": "Studio Portraits Day 1 - Updated",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "10:00:00",
  "endTime": "18:00:00",
  "venueName": "Main Studio Room B",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED",
  "notes": "Updated event notes."
}
```
**Response (200 OK):**
```json
{
  "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "studioId": "d3b07384-d113-4952-b1cf-9a993710787e",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "title": "Studio Portraits Day 1 - Updated",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "10:00:00",
  "endTime": "18:00:00",
  "venueName": "Main Studio Room B",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED",
  "notes": "Updated event notes.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/events/{id}`
Removes a calendar event.
**Response (204 No Content)**

---

## 6. Event Assignments

### GET `/api/assignments`
Retrieves all assignments, optionally filtered by `eventId` or `employeeId`.
**Request:** `GET /api/assignments?eventId=cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9`
**Response (200 OK):**
```json
[
  {
    "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
    "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
    "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
    "assignmentRole": "CANDID_PHOTOGRAPHER",
    "assignmentStatus": "ACCEPTED",
    "callTime": "08:30:00",
    "notes": "Bring secondary backup camera body.",
    "conflictWarning": false,
    "conflictReason": null,
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/assignments/{id}`
Retrieves a specific assignment by ID.
**Response (200 OK):**
```json
{
  "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "CANDID_PHOTOGRAPHER",
  "assignmentStatus": "ACCEPTED",
  "callTime": "08:30:00",
  "notes": "Bring secondary backup camera body.",
  "conflictWarning": false,
  "conflictReason": null,
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### POST `/api/assignments`
Assigns an employee to an event. If an overlapping conflict is detected, the API processes the assignment successfully but flags a conflict warning.
Returns the full created assignment.
**Request:**
```json
{
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "CANDID_PHOTOGRAPHER",
  "assignmentStatus": "PROPOSED",
  "callTime": "08:30:00",
  "notes": "Bring secondary backup camera body."
}
```
**Response (201 Created):**
```json
{
  "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "CANDID_PHOTOGRAPHER",
  "assignmentStatus": "PROPOSED",
  "callTime": "08:30:00",
  "notes": "Bring secondary backup camera body.",
  "conflictWarning": true,
  "conflictReason": "Employee John Doe is already assigned to 'Product Promo' from 08:00 to 12:00 on 2026-06-05.",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/assignments/{id}`
Updates an assignment. Returns the full updated assignment.
**Request:**
```json
{
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "LEAD_PHOTOGRAPHER",
  "assignmentStatus": "ACCEPTED",
  "callTime": "08:30:00",
  "notes": "Updated assignment notes."
}
```
**Response (200 OK):**
```json
{
  "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "LEAD_PHOTOGRAPHER",
  "assignmentStatus": "ACCEPTED",
  "callTime": "08:30:00",
  "notes": "Updated assignment notes.",
  "conflictWarning": false,
  "conflictReason": null,
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/assignments/{id}`
Removes an assignment.
**Response (204 No Content)**

---

## 7. Deliverables

### GET `/api/deliverables`
Retrieves all deliverables.
**Response (200 OK):**
```json
[
  {
    "id": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
    "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "name": "Edited Retouched Photos",
    "deliverableType": "PHOTOS",
    "status": "READY_FOR_REVIEW",
    "referenceUrl": "s3://studioops-bucket/raw/retouched_jpg.zip",
    "dueDate": "2026-06-20",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/deliverables/{id}`
Retrieves a specific deliverable by ID.
**Response (200 OK):**
```json
{
  "id": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos",
  "deliverableType": "PHOTOS",
  "status": "READY_FOR_REVIEW",
  "referenceUrl": "s3://studioops-bucket/raw/retouched_jpg.zip",
  "dueDate": "2026-06-20",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### POST `/api/deliverables`
Creates a deliverable entity. Returns the full created deliverable.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos",
  "deliverableType": "PHOTOS",
  "status": "NOT_STARTED",
  "referenceUrl": null,
  "dueDate": "2026-06-20"
}
```
**Response (201 Created):**
```json
{
  "id": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos",
  "deliverableType": "PHOTOS",
  "status": "NOT_STARTED",
  "referenceUrl": null,
  "dueDate": "2026-06-20",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/deliverables/{id}`
Updates an existing deliverable. Returns the updated deliverable representation.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos - Final Selection",
  "deliverableType": "PHOTOS",
  "status": "READY_FOR_REVIEW",
  "referenceUrl": "s3://studioops-bucket/raw/retouched_jpg.zip",
  "dueDate": "2026-06-22"
}
```
**Response (200 OK):**
```json
{
  "id": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos - Final Selection",
  "deliverableType": "PHOTOS",
  "status": "READY_FOR_REVIEW",
  "referenceUrl": "s3://studioops-bucket/raw/retouched_jpg.zip",
  "dueDate": "2026-06-22",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/deliverables/{id}`
Removes a deliverable entity.
**Response (204 No Content)**

---

## 8. Backup Records

### GET `/api/backups`
Retrieves backups log.
**Response (200 OK):**
```json
[
  {
    "id": "02fdfbc0-c20e-4501-9a7b-dcfcb9f0ee41",
    "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
    "backupType": "RAW_PHOTOS",
    "locationType": "LOCAL_NAS",
    "destinationPath": "NAS_Volume_2/backups/photos.zip",
    "status": "COMPLETED",
    "notes": "Initial backup of RAW photos post-event.",
    "verifiedAt": "2026-06-06T12:00:00Z",
    "createdAt": "2026-05-21T09:51:00Z",
    "updatedAt": "2026-05-21T09:51:00Z"
  }
]
```

### GET `/api/backups/{id}`
Retrieves a specific backup log record by ID.
**Response (200 OK):**
```json
{
  "id": "02fdfbc0-c20e-4501-9a7b-dcfcb9f0ee41",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "backupType": "RAW_PHOTOS",
  "locationType": "LOCAL_NAS",
  "destinationPath": "NAS_Volume_2/backups/photos.zip",
  "status": "COMPLETED",
  "notes": "Initial backup of RAW photos post-event.",
  "verifiedAt": "2026-06-06T12:00:00Z",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### POST `/api/backups`
Logs a backup action. Returns the full created backup record.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "backupType": "RAW_PHOTOS",
  "locationType": "LOCAL_NAS",
  "destinationPath": "NAS_Volume_2/backups/photos.zip",
  "status": "COMPLETED",
  "notes": "Initial backup of RAW photos post-event."
}
```
**Response (201 Created):**
```json
{
  "id": "02fdfbc0-c20e-4501-9a7b-dcfcb9f0ee41",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "backupType": "RAW_PHOTOS",
  "locationType": "LOCAL_NAS",
  "destinationPath": "NAS_Volume_2/backups/photos.zip",
  "status": "COMPLETED",
  "notes": "Initial backup of RAW photos post-event.",
  "verifiedAt": null,
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T09:51:00Z"
}
```

### PUT `/api/backups/{id}`
Updates an existing backup log record. Returns the updated representation.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "backupType": "RAW_PHOTOS",
  "locationType": "CLOUD_S3",
  "destinationPath": "s3://studioops-bucket/backups/photos.zip",
  "status": "COMPLETED",
  "notes": "Backup moved to S3.",
  "verifiedAt": "2026-06-07T12:00:00Z"
}
```
**Response (200 OK):**
```json
{
  "id": "02fdfbc0-c20e-4501-9a7b-dcfcb9f0ee41",
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "backupType": "RAW_PHOTOS",
  "locationType": "CLOUD_S3",
  "destinationPath": "s3://studioops-bucket/backups/photos.zip",
  "status": "COMPLETED",
  "notes": "Backup moved to S3.",
  "verifiedAt": "2026-06-07T12:00:00Z",
  "createdAt": "2026-05-21T09:51:00Z",
  "updatedAt": "2026-05-21T10:00:00Z"
}
```

### DELETE `/api/backups/{id}`
Removes a backup record log entry.
**Response (204 No Content)**

---

## 9. Dashboard Summary

### GET `/api/dashboard/summary`
Retrieves system overview statistics, warning flags, and recent checklists.

**Request:** `GET /api/dashboard/summary`

**Response (200 OK):**
```json
{
  "stats": {
    "totalClients": 24,
    "activeProjects": 8,
    "upcomingEventsCount": 3,
    "successfulBackupsCount": 12
  },
  "warnings": [
    {
      "type": "DOUBLE_BOOKING",
      "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
      "employeeName": "John Doe",
      "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
      "eventTitle": "Studio Portraits Day 1",
      "overlappingEventTitle": "Product Promo",
      "conflictTime": "2026-06-05T09:00:00Z to 2026-06-05T12:00:00Z"
    }
  ],
  "backupChecklists": [
    {
      "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
      "projectName": "Corporate Portrait Shoot 2026",
      "deliverableId": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
      "deliverableName": "Edited Retouched Photos",
      "redundantBackupCount": 1,
      "status": "WARNING_LOW_REDUNDANCY",
      "details": "Requires at least 2 distinct backup locations (current: LOCAL_NAS)."
    }
  ]
}
```
