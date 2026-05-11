# Stage 1: API Design

Here’s my plan for the APIs we'll need for the campus notification system. I'm trying to keep it standard RESTful but also adding WebSockets for real-time alerts.

## 1. Getting the list of notifications
- **URL:** `GET /api/v1/notifications`
- **Auth:** Needs a Bearer Token in the header.
- **Params:** We can use `page` and `limit` to handle pagination so the app doesn't lag if someone has 500 notifications.
- **Example Response:**
  ```json
  {
    "notifications": [
      {
        "id": "abc-123",
        "title": "New Placement Alert",
        "message": "Google is coming to campus!",
        "type": "Placement",
        "isRead": false,
        "createdAt": "2024-05-11T10:00:00Z"
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 10 }
  }
  ```

## 2. Checking how many unread ones are there
- **URL:** `GET /api/v1/notifications/unread-count`
- **Why?** This is just to show that little red badge on the app icon or bell icon.
- **Response:** `{ "count": 12 }`

## 3. Marking something as read
- **URL:** `PATCH /api/v1/notifications/:id/read`
- **Method:** `PATCH` because we're just updating one field (`isRead`).
- **Response:** `{ "status": "ok" }`

## 4. Real-time updates (WebSockets)
For stuff like results or emergency alerts, we can't wait for the user to refresh.
- **URL:** `ws://campus-api.edu/notifications`
- **How it works:** Once the student logs in, the app opens a socket. Whenever a new alert hits the database, the server pushes a `new_notification` event to the client immediately.

## Naming & Rules
- I'm using **camelCase** for the JSON keys because it's standard in JS/TS.
- Endpoints use **kebab-case** (lowercase with dashes).
- Standard HTTP status codes (200 for success, 401 for auth issues, etc.) will be used.
