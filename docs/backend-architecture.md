# Backend Architecture Specification: StudioOps

This document defines the architectural patterns, multi-tenancy implementation strategies, and backend standards for the StudioOps SaaS platform.

---

## 1. Multi-Tenancy Strategy: Shared Database, Shared Schema
StudioOps uses a **Shared Database, Shared Schema** architectural pattern (logical tenant partitioning).

```
                    ┌─────────────────────────┐
                    │     HTTP Request        │
                    └────────────┬────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │  Spring Security Context  │ (Resolves authenticated User & Tenant)
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │     Spring Controllers    │ (Thin controllers, delegate to Service)
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │      Service Layer        │ (Enforces Business Rules & Scopes Queries)
                   └─────────────┬─────────────┘
                                 │
                   ┌─────────────▼─────────────┐
                   │     JPA/Repositories      │ (Filters data strictly on `studio_id`)
                   └─────────────┬─────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
   │ Studio A Records │ │ Studio B Records │ │ Studio C Records │
   │ (studio_id = A)  │ │ (studio_id = B)  │ │ (studio_id = C)  │
   └──────────────────┘ └──────────────────┘ └──────────────────┘
```

### Rationale
- **Resource Efficiency**: Lowers infrastructure overhead by hosting multiple tenants in a single PostgreSQL database instance.
- **Simplified Migrations**: Schema alterations are applied once globally using Flyway database migration scripts.
- **Tenant Scalability**: Fast, automated studio onboarding by inserting a new `Studio` record without provisioning separate databases.

---

## 2. Multi-Tenant Data Isolation Strategy

### A. Column Partitioning
Every tenant-scoped table contains a required `studio_id` column referencing the `Studio` table:
```sql
ALTER TABLE clients ADD COLUMN studio_id UUID NOT NULL REFERENCES studios(id);
```

### B. Logical Partitioning in Repository Layer
All repository queries must filter by the current `studioId`.
```java
public interface ClientRepository extends JpaRepository<Client, UUID> {
    List<Client> findAllByStudioId(UUID studioId);
    Optional<Client> findByIdAndStudioId(UUID id, UUID studioId);
    boolean existsByEmailAndStudioId(String email, UUID studioId);
}
```

### C. Security Context & Session Resolution
Spring Security extracts the user profile from the HTTP Session and makes it available via the security context:
1. When a request is authenticated, the custom `UserDetails` or principal object holds the active user's `studioId`.
2. Services retrieve the current `studioId` via a session helper:
   ```java
   public UUID getActiveStudioId() {
       Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
       StudioOpsUserPrincipal principal = (StudioOpsUserPrincipal) authentication.getPrincipal();
       return principal.getStudioId();
   }
   ```
3. Business operations use this resolved `studioId` for queries, completely eliminating the need to pass `studioId` from the frontend client.

---

## 3. Package Structure Guidelines
Features are structured **package-by-feature** in a modular monolith design:
- `com.studioops.studio`: Tenant setup, plan checking, timezone management.
- `com.studioops.user`: Account administration, login authentication, user creation.
- `com.studioops.client`, `com.studioops.project`, etc.: Scoped business modules.

---

## 4. Operational Guidelines

> [!WARNING]
> **Cross-Tenant Leakage Risks**: 
> - Writing custom JPQL or native SQL queries without a `where studio_id = :studioId` clause is strictly prohibited.
> - Always perform check operations (e.g. `existsByIdAndStudioId`) before completing updates (`PUT`) or deletions (`DELETE`) to prevent horizontal privilege escalation.
