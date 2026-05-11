# Stage 4: Dealing with High Traffic

## The problem
The database is getting hammered because every time someone opens the app, it runs a big query to get all their notifications. When thousands of students check their results at once, the system crashes.

## How to fix it

### 1. Redis Caching
Instead of asking the main database for the "unread count" every single time, we can keep that number in **Redis** (an in-memory store).
- **Plan**: Store the count and the latest few alerts in Redis.
- **Why**: Redis is much faster than a standard DB. It'll take the load off the main server.

### 2. Proper Pagination
We should never let the client ask for "all" notifications. 
- **Plan**: Always limit it to something like 10 or 20 items per page. 
- **Why**: It's faster to load and uses less data for the user.

### 3. Stop the Polling
If the app asks "any new alerts?" every 30 seconds (polling), it creates a lot of useless traffic.
- **Plan**: Use **WebSockets**. The server just tells the app when something actually happens.
- **Why**: Way more efficient and feels more "instant" to the student.

### 4. Cache Strategy: Cache-Aside
I'd use the **Cache-Aside** method. 
- The app checks Redis first.
- If it's not there (Cache Miss), it gets it from the DB and saves it in Redis for next time.
- If it is there (Cache Hit), we return it immediately.
- This is simple to build and works great for most apps.
