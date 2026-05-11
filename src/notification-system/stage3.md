# Stage 3: Making Queries Faster

## What's wrong with the current query?
The original query looks something like this:
```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;
```

**The issues:**
- **No Index**: If we don't have an index, the database has to look at every single notification just to find the ones for student 1042. This is called a "Full Table Scan" and it's super slow once the data grows.
- **Sorting is heavy**: Sorting by `createdAt` takes extra CPU and memory.
- **Filtering**: Checking `isRead` for every row is also inefficient without help.

## My Fix: Composite Index
I'd create one index that covers everything we're searching for:
```sql
CREATE INDEX idx_student_unread_latest 
ON notifications (student_id, is_read, created_at DESC);
```
**Why this is better:** It puts the data in the exact order we need. The DB finds the student, skips straight to the unread ones, and they're already sorted by date. It's basically a direct shortcut.

## Why not just index everything?
You might think "why not just add indexes to every column?" But that's a bad idea because:
1. **Slower Writes**: Every time you add a notification, the DB has to update all those indexes. It makes saving data much slower.
2. **Space**: Indexes take up a lot of room on the disk and in the RAM.
3. **Clutter**: Having too many indexes can actually confuse the database's query planner.

## Solving the "Last 7 Days" Problem
To find students who got placement alerts in the last week, I'd use this:
```sql
SELECT DISTINCT studentID
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```
*(I used `DISTINCT` because one student might have gotten multiple alerts, and we just need the IDs once.)*
