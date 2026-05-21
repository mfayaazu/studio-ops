# API Contract Specification: StudioOps Phase 1

This document specifies the REST API endpoints, routing schema, and request/response structures.

All REST endpoints return payloads in `application/json` format.

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
    "fullName": "Alice Smith",
    "email": "alice@example.com",
    "phone": "+46701234567",
    "notes": "Prefers email contact."
  }
]
```

### POST `/api/clients`
Creates a client.
**Request:**
```json
{
  "fullName": "Alice Smith",
  "email": "alice@example.com",
  "phone": "+46701234567"
}
```
**Response (201 Created):**
```json
{
  "id": "e30cf82a-bc91-4d37-88ea-d43806fbce11",
  "fullName": "Alice Smith",
  "email": "alice@example.com"
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
    "fullName": "John Doe",
    "email": "john.doe@studioops.se",
    "phone": "+46701112233",
    "primaryRole": "Lead Photographer",
    "skills": "Colorist, Lighting",
    "status": "ACTIVE"
  }
]
```

### POST `/api/employees`
Creates a new profile.
**Request:**
```json
{
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
  "fullName": "John Doe",
  "email": "john.doe@studioops.se"
}
```

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
    "endDate": "2026-06-15"
  }
]
```

### POST `/api/projects`
Creates a project.
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
  "endDate": "2026-06-15"
}
```
**Response (201 Created):**
```json
{
  "id": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "projectCode": "RSA-2026-0001",
  "title": "Corporate Portrait Shoot 2026"
}
```

---

## 5. Events

### GET `/api/events`
Retrieves all events.
**Response (200 OK):**
```json
[
  {
    "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
    "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
    "title": "Studio Portraits Day 1",
    "type": "CORPORATE",
    "eventDate": "2026-06-05",
    "startTime": "09:00:00",
    "endTime": "17:00:00",
    "venueName": "Main Studio Room A",
    "city": "Gothenburg",
    "address": "Vasagatan 16",
    "status": "SCHEDULED"
  }
]
```

### POST `/api/events`
Creates a new calendar event.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "title": "Studio Portraits Day 1",
  "type": "CORPORATE",
  "eventDate": "2026-06-05",
  "startTime": "09:00:00",
  "endTime": "17:00:00",
  "venueName": "Main Studio Room A",
  "city": "Gothenburg",
  "address": "Vasagatan 16",
  "status": "SCHEDULED"
}
```
**Response (201 Created):**
```json
{
  "id": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "title": "Studio Portraits Day 1"
}
```

---

## 6. Event Assignments

### GET `/api/assignments`
Retrieves all assignments.
**Response (200 OK):**
```json
[
  {
    "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
    "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
    "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
    "assignmentRole": "CANDID_PHOTOGRAPHER",
    "assignmentStatus": "ACCEPTED",
    "callTime": "2026-06-05T08:30:00Z",
    "notes": "Bring secondary backup camera body."
  }
]
```

### POST `/api/assignments`
Assigns an employee to an event. If an overlapping conflict is detected, the API successfully processes the assign, but flags a conflict warning.
**Request:**
```json
{
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "assignmentRole": "CANDID_PHOTOGRAPHER",
  "assignmentStatus": "PROPOSED",
  "callTime": "2026-06-05T08:30:00Z",
  "notes": "Bring secondary backup camera body."
}
```
**Response (201 Created):**
```json
{
  "id": "11d87cfc-20f5-4ad9-a78b-d5a23fbf71a1",
  "eventId": "cb1e5bda-4f4d-45bf-9f0e-e55d648ccff9",
  "employeeId": "7488f2bc-f725-4b13-90d5-6b58849bf0cc",
  "conflictWarning": true,
  "conflictReason": "Employee John Doe is already assigned to 'Product Promo' from 08:00 to 12:00 on 2026-06-05."
}
```

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
    "dueDate": "2026-06-20"
  }
]
```

### POST `/api/deliverables`
Creates a deliverable entity.
**Request:**
```json
{
  "projectId": "99351e3d-0d6c-4f7f-8ff3-1f19d2ff9033",
  "name": "Edited Retouched Photos",
  "deliverableType": "PHOTOS",
  "status": "NOT_STARTED",
  "dueDate": "2026-06-20"
}
```
**Response (201 Created):**
```json
{
  "id": "d05f32a8-0e31-4cb5-88aa-12dfcebce999",
  "name": "Edited Retouched Photos"
}
```

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
    "verifiedAt": "2026-06-06T12:00:00Z"
  }
]
```

### POST `/api/backups`
Logs a backup action.
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
  "status": "COMPLETED"
}
```

---

## 9. Dashboard Summary

### GET `/api/dashboard/summary`
Retrieves system overview statistics, warning flags, and recent logs.

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

