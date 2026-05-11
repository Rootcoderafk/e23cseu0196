# STAGE 4: Handling System Load

## Problem
DB overwhelmed due to notifications fetched on every page load.

## Suggested Improvements

### 1. Redis Caching
- **Strategy:** Cache the "unread count" or the "latest 5 notifications" in Redis for each student.
- **TTL:** Set a short TTL (e.g., 5 minutes) or invalidate the cache on new notification events.
- **Tradeoff:** Increases architectural complexity but significantly reduces DB read load.

### 2. Pagination
- **Strategy:** Never fetch all notifications at once. Limit to 10-20 per request.
- **Tradeoff:** Better performance for the client and server, but requires UI support.

### 3. WebSockets instead of Polling
- **Strategy:** Instead of clients asking "Do I have news?" every 30 seconds, push notifications only when they occur.
- **Tradeoff:** Keeps a persistent connection open (higher memory usage on server) but eliminates redundant DB queries.

### 4. Caching Strategy: Write-Through vs. Cache-Aside
- **Cache-Aside (Recommended):** App checks Redis. If miss, fetch from DB and store in Redis.
- **Write-Through:** App writes to Redis and DB simultaneously.
- **Tradeoff:** Cache-Aside is easier to implement; Write-Through ensures the cache is never stale but adds latency to writes.
