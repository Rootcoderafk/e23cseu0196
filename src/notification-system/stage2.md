# STAGE 2: Database Selection and Schema

## Recommended DB: PostgreSQL
PostgreSQL is chosen for its strong consistency, support for relational data, and mature indexing capabilities.

## Schema Design (Relational)
### Table: `notifications`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` (PK) | Unique identifier |
| `student_id` | `INT` (FK) | Reference to student |
| `title` | `VARCHAR(255)`| Notification title |
| `message` | `TEXT` | Detailed message |
| `type` | `ENUM` | `Event`, `Result`, `Placement` |
| `is_read` | `BOOLEAN` | Read status (default: false) |
| `created_at` | `TIMESTAMP` | ISO 8601 timestamp |

## Indexing Strategy
- Index on `student_id` for fast user-specific lookups.
- Composite index on `(student_id, is_read, created_at DESC)` to optimize the common "latest unread" query.

## SQL vs NoSQL Tradeoffs
- **SQL (PostgreSQL):**
  - **Pros:** ACID compliance, structured data, complex joins.
  - **Cons:** Horizontal scaling is harder than NoSQL (though possible with sharding).
- **NoSQL (MongoDB):**
  - **Pros:** High write throughput, flexible schema, easy horizontal scaling.
  - **Cons:** Eventual consistency (usually), lacks rigid relationships.

## Scaling Issues
As notifications grow into millions:
- **Table Bloat:** VACUUMing becomes slow.
- **Index Size:** Indexes might no longer fit in RAM, slowing down reads.
- **Write Saturation:** Single node might struggle with 50,000+ writes/sec.
- **Solution:** Use **Database Sharding** (by `student_id`) or **Partitioning** (by `created_at`).
