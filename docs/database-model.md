# Relational Database Model: StudioOps

StudioOps stores persistent application data in PostgreSQL. This document defines the database entities and relationships for the multi-tenant SaaS model.

All primary keys use **UUID** types. Auditing fields (`createdAt`, `updatedAt`) are automatically populated. No media file blobs (photos, videos) are stored in the database; only text reference URLs/S3 keys are recorded.

---

## Entity Relationship Overview

```mermaid
erDiagram
    Studio ||--o{ User : "owns"
    Studio ||--o{ Client : "scopes"
    Studio ||--o{ Employee : "scopes"
    Studio ||--o{ Project : "scopes"
    Studio ||--o{ Event : "scopes"
    Studio ||--o{ EventAssignment : "scopes"
    Studio ||--o{ Deliverable : "scopes"
    Studio ||--o{ BackupRecord : "scopes"
    User ||--o| Employee : "has profile"
    User ||--o{ Project : "manages"
    User ||--o{ ActivityLog : "triggers"
    Client ||--o{ Project : "orders"
    Project ||--o{ Event : "contains"
    Project ||--o{ Deliverable : "requires"
    Project ||--o{ BackupRecord : "secures"
    Deliverable ||--o{ BackupRecord : "backed up in"
    Event ||--o{ EventAssignment : "assigns"
    Employee ||--o{ EventAssignment : "allocated to"
```

---

## Strict Multi-Tenant Scoping Rule
> [!IMPORTANT]
> **Data Isolation Boundary**: Every business entity (Client, Employee, Project, Event, EventAssignment, Deliverable, BackupRecord) must include a required `studioId` column. 
> Every database query, join, count, search, or mutate action executed by the application must filter by the authenticated user's `studioId` to guarantee absolute data segregation between creative agencies.

---

## 1. Studio (Tenant)
* **Purpose**: Represents an independent photography company subscription tenant workspace.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `name`: `VARCHAR(255)` | Required | Name of the studio (e.g. "Nordic Light Studios")
  * `slug`: `VARCHAR(255)` | Required | Unique | URL slug identifier (e.g. "nordic-light")
  * `businessEmail`: `VARCHAR(255)` | Optional
  * `phone`: `VARCHAR(50)` | Optional
  * `country`: `VARCHAR(100)` | Optional
  * `timezone`: `VARCHAR(100)` | Required | Default: `Europe/Stockholm`
  * `status`: `Enum(StudioStatus)` | Required
  * `subscriptionPlan`: `Enum(SubscriptionPlan)` | Required
  * `subscriptionStatus`: `Enum(SubscriptionStatus)` | Required
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * One-to-Many with `User`
  * One-to-Many with `Client`, `Employee`, `Project`, `Event`, `EventAssignment`, `Deliverable`, `BackupRecord`
* **Enums**:
  * `StudioStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`
  * `SubscriptionPlan`: `STARTER`, `STUDIO`, `PRO`, `ENTERPRISE`
  * `SubscriptionStatus`: `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELLED`, `SUSPENDED`

---

## 2. User
* **Purpose**: Stores system authentication credentials, role permissions, and tenant associations.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `email`: `VARCHAR(255)` | Required | Unique
  * `passwordHash`: `VARCHAR(255)` | Required
  * `fullName`: `VARCHAR(250)` | Required
  * `role`: `Enum(UserRole)` | Required
  * `status`: `Enum(UserStatus)` | Required
  * `lastLoginAt`: `TIMESTAMP WITH TIME ZONE` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * One-to-One with `Employee` (Optional)
  * One-to-Many with `Project` (Assigned Project Manager)
  * One-to-Many with `ActivityLog` (Author of action)
* **Enums**:
  * `UserRole`: `OWNER`, `ADMIN`, `PROJECT_MANAGER`, `PHOTOGRAPHER`, `VIDEOGRAPHER`, `EDITOR`, `FREELANCER`, `CLIENT`
  * `UserStatus`: `ACTIVE`, `INACTIVE`, `SUSPENDED`

---

## 3. Employee
* **Purpose**: Records employee profile details, scheduling availability, and primary professional capacities, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `userId`: `UUID` | Optional | Foreign Key -> `User(id)`
  * `fullName`: `VARCHAR(200)` | Required
  * `email`: `VARCHAR(255)` | Required
  * `phone`: `VARCHAR(50)` | Optional
  * `primaryRole`: `VARCHAR(100)` | Required (e.g. "Candid Photographer")
  * `skills`: `TEXT` | Optional
  * `status`: `Enum(EmployeeStatus)` | Required
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * One-to-One with `User` (Optional)
  * One-to-Many with `EventAssignment`
* **Enums**:
  * `EmployeeStatus`: `ACTIVE`, `INACTIVE`, `ON_LEAVE`

---

## 4. Client
* **Purpose**: Represents the hiring client entity and contact information, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `fullName`: `VARCHAR(200)` | Required
  * `phone`: `VARCHAR(50)` | Required
  * `email`: `VARCHAR(255)` | Optional
  * `notes`: `TEXT` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * One-to-Many with `Project`

---

## 5. Project
* **Purpose**: Tracks a customer contract encompassing multiple deliverables, events, and a dedicated project manager, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `clientId`: `UUID` | Required | Foreign Key -> `Client(id)`
  * `assignedProjectManagerId`: `UUID` | Optional | Foreign Key -> `User(id)`
  * `projectCode`: `VARCHAR(50)` | Required
  * `title`: `VARCHAR(255)` | Required
  * `projectType`: `VARCHAR(100)` | Required
  * `bookingStatus`: `Enum(BookingStatus)` | Required
  * `paymentStatus`: `Enum(PaymentStatus)` | Required
  * `status`: `Enum(ProjectStatus)` | Required
  * `startDate`: `DATE` | Optional
  * `endDate`: `DATE` | Optional
  * `notes`: `TEXT` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `Client`
  * Many-to-One with `User` (Assigned Project Manager)
  * One-to-Many with `Event`
  * One-to-Many with `Deliverable`
  * One-to-Many with `BackupRecord`
* **Enums**:
  * `ProjectStatus`: `LEAD`, `CONFIRMED`, `SCHEDULED`, `SHOOT_COMPLETED`, `POST_PRODUCTION`, `DELIVERED`, `ARCHIVED`, `CANCELLED`
  * `BookingStatus`: `INQUIRY`, `QUOTED`, `CONTRACT_SIGNED`, `DEPOSIT_PAID`, `FULLY_BOOKED`
  * `PaymentStatus`: `UNPAID`, `PARTIALLY_PAID`, `FULLY_PAID`, `REFUNDED`

---

## 6. Event
* **Purpose**: Records specific scheduling logs, locations, and timings of actions within a Project, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `projectId`: `UUID` | Required | Foreign Key -> `Project(id)`
  * `title`: `VARCHAR(255)` | Required
  * `type`: `Enum(EventType)` | Required
  * `eventDate`: `DATE` | Required
  * `startTime`: `TIME` | Required
  * `endTime`: `TIME` | Required
  * `venueName`: `VARCHAR(255)` | Required
  * `city`: `VARCHAR(100)` | Required
  * `address`: `VARCHAR(500)` | Required
  * `status`: `Enum(EventStatus)` | Required
  * `notes`: `TEXT` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `Project`
  * One-to-Many with `EventAssignment`
* **Enums**:
  * `EventType`: `WEDDING`, `ENGAGEMENT`, `RECEPTION`, `HALDI`, `MEHENDI`, `SANGEET`, `BIRTHDAY`, `HOUSEWARMING`, `PRE_WEDDING`, `CORPORATE`, `OTHER`
  * `EventStatus`: `SCHEDULED`, `COMPLETED`, `CANCELLED`

---

## 7. EventAssignment
* **Purpose**: Maps employees to events within a tenant space, enforcing double-booking conflict warning states.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `eventId`: `UUID` | Required | Foreign Key -> `Event(id)`
  * `employeeId`: `UUID` | Required | Foreign Key -> `Employee(id)`
  * `assignmentRole`: `Enum(AssignmentRole)` | Required
  * `assignmentStatus`: `Enum(AssignmentStatus)` | Required
  * `callTime`: `TIME` | Optional
  * `notes`: `TEXT` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `Event`
  * Many-to-One with `Employee`
* **Enums**:
  * `AssignmentStatus`: `PROPOSED`, `ACCEPTED`, `REJECTED`, `COMPLETED`, `CANCELLED`
  * `AssignmentRole`: `TRADITIONAL_PHOTOGRAPHER`, `TRADITIONAL_VIDEOGRAPHER`, `CANDID_PHOTOGRAPHER`, `CINEMATOGRAPHER`, `DRONE_OPERATOR`, `LIGHTING_ASSISTANT`, `ASSISTANT`, `EDITOR`, `OTHER`

---

## 8. Deliverable
* **Purpose**: Represents deliverables expected by a client, tracking review states, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `projectId`: `UUID` | Required | Foreign Key -> `Project(id)`
  * `name`: `VARCHAR(255)` | Required
  * `deliverableType`: `Enum(DeliverableType)` | Required
  * `status`: `Enum(DeliverableStatus)` | Required
  * `referenceUrl`: `VARCHAR(1000)` | Optional
  * `dueDate`: `DATE` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `Project`
  * One-to-Many with `BackupRecord`
* **Enums**:
  * `DeliverableStatus`: `NOT_STARTED`, `IN_PROGRESS`, `WAITING_FOR_CLIENT`, `READY_FOR_REVIEW`, `REVISION_REQUIRED`, `DELIVERED`, `COMPLETED`
  * `DeliverableType`: `PHOTOS`, `TEASER`, `FULL_VIDEO`, `ALBUM_SELECTION`, `ALBUM_DESIGN`, `HARD_DISK`, `OTHER`

---

## 9. BackupRecord
* **Purpose**: Records redundant storage location audits for digital assets, scoped by tenant.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `projectId`: `UUID` | Required | Foreign Key -> `Project(id)`
  * `deliverableId`: `UUID` | Optional | Foreign Key -> `Deliverable(id)`
  * `backupType`: `Enum(BackupType)` | Required
  * `locationType`: `Enum(BackupLocationType)` | Required
  * `destinationPath`: `VARCHAR(500)` | Required
  * `status`: `Enum(BackupStatus)` | Required
  * `notes`: `TEXT` | Optional
  * `verifiedAt`: `TIMESTAMP WITH TIME ZONE` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
  * `updatedAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `Project`
  * Many-to-One with `Deliverable`
* **Enums**:
  * `BackupType`: `RAW_PHOTOS`, `RAW_VIDEOS`, `EDITED_PHOTOS`, `FINAL_VIDEO`, `ALBUM_FILES`, `FINAL_DELIVERY`, `PROJECT_ARCHIVE`
  * `BackupLocationType`: `LOCAL_NAS`, `CLOUD_S3`, `EXTERNAL_HARD_DRIVE`
  * `BackupStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `NEEDS_ATTENTION`

---

## 10. ActivityLog
* **Purpose**: Tracks platform audit trails for database changes.
* **Attributes**:
  * `id`: `UUID` | Required | Primary Key
  * `studioId`: `UUID` | Required | Foreign Key -> `Studio(id)`
  * `userId`: `UUID` | Optional | Foreign Key -> `User(id)` (Null indicates system-generated action)
  * `action`: `VARCHAR(255)` | Required
  * `details`: `TEXT` | Optional
  * `createdAt`: `TIMESTAMP WITH TIME ZONE` | Required
* **Relationships**:
  * Many-to-One with `Studio`
  * Many-to-One with `User`
