# STAGE 3: Query Optimization

## Problem Analysis
The query:
```sql
SELECT * FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt DESC;
```
### Why it's slow:
1. **Full Table Scan:** Without an index, the DB scans every row to find student 1042.
2. **Sorting Cost:** `ORDER BY createdAt DESC` requires the DB to sort all matching results in memory (or disk if too large).
3. **Cardinality:** If a student has thousands of notifications, filtering by `isRead` might still be slow if `isRead` is not part of the index.

### Indexing Strategy:
Create a **Composite Index**:
```sql
CREATE INDEX idx_student_unread_latest ON notifications (student_id, is_read, created_at DESC);
```
- **Why this works:** The DB can jump directly to the student, then to unread ones, and they are already stored in the requested sort order.

### Why indexing every column is bad:
1. **Write Overhead:** Every `INSERT`/`UPDATE` must update all relevant indexes.
2. **Storage Space:** Indexes take up disk and memory (RAM).
3. **Query Optimizer Confusion:** Too many indexes can sometimes lead the optimizer to pick a sub-optimal plan.

## Optimized Query Task
**Requirement:** Find all students who got placement notifications in last 7 days.
**Type Enum:** `Event`, `Result`, `Placement`.

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
AND createdAt >= NOW() - INTERVAL '7 days';
```
*(Assuming `createdAt` is a timestamp and `notificationType` is an ENUM or VARCHAR)*
