# Stage 2: Database and Schema Design

## Choosing the Database: PostgreSQL
I'm going with **PostgreSQL** for this because it's reliable, handles structured data well, and has great indexing for fast queries. Since notifications need to be consistent (you don't want a "read" notification showing up as "unread"), a relational DB makes the most sense.

## My Schema
### `notifications` table
- `id` (UUID): Primary key.
- `student_id` (Integer): Foreign key to the student table.
- `title` (Varchar): Brief heading.
- `message` (Text): The actual content.
- `type` (Enum): Can be `Event`, `Result`, or `Placement`.
- `is_read` (Boolean): Tracking if the student opened it.
- `created_at` (Timestamp): When it was sent.

## Indexing for Speed
I'll add an index on `student_id` since we'll always be looking for a specific student's alerts. I'd also add a composite index on `(student_id, is_read, created_at)` to make fetching the "latest unread" notifications super fast.

## SQL vs NoSQL - Why SQL?
- **SQL (Postgres):** Better for data integrity and complex queries. It's a bit harder to scale horizontally but for a campus system, it's perfect.
- **NoSQL (like MongoDB):** Great for massive writes and flexible schemas, but you lose some of the strict relational features that help keep the data clean.

## Potential Bottlenecks
If we hit millions of rows:
1. **Slow Queries**: Indexes might get too big for RAM.
2. **Write Stress**: A single database might get overwhelmed during peak times (like result announcements).
3. **Fix**: We could use **Database Partitioning** (splitting the table by date) or **Sharding** (splitting by student ID range) to keep things fast.
