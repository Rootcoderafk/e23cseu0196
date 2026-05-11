# STAGE 1: API Design for Notification System

## 1. Fetch Notifications
- **Endpoint:** `GET /api/v1/notifications`
- **Request Headers:**
  - `Authorization: Bearer <access_token>`
- **Query Parameters:**
  - `page`: Page number for pagination.
  - `limit`: Number of items per page.
- **Response:**
  ```json
  {
    "notifications": [
      {
        "id": "uuid",
        "title": "Placement Drive",
        "message": "Company X is visiting tomorrow.",
        "type": "Placement",
        "isRead": false,
        "createdAt": "2023-10-27T10:00:00Z"
      }
    ],
    "pagination": { "total": 100, "page": 1, "limit": 10 }
  }
  ```

## 2. Unread Notifications Count
- **Endpoint:** `GET /api/v1/notifications/unread/count`
- **Request Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  { "count": 5 }
  ```

## 3. Mark as Read
- **Endpoint:** `PATCH /api/v1/notifications/:id/read`
- **Request Headers:**
  - `Authorization: Bearer <access_token>`
- **Response:**
  ```json
  { "success": true, "message": "Notification marked as read." }
  ```

## 4. Real-time Notifications (WebSocket)
- **URL:** `ws://api.campus.edu/notifications`
- **Protocol:** WebSocket
- **Connection Handshake:**
  - Client sends `token` during handshake or as the first message.
- **Events:**
  - `new_notification`: Sent by server when a new notification is generated.
  ```json
  {
    "event": "new_notification",
    "data": { "id": "...", "title": "...", "type": "..." }
  }
  ```

## Naming Conventions
- **Endpoints:** Kebab-case (`/unread-notifications` - though I used `unread/count` for grouping).
- **JSON Fields:** CamelCase (`isRead`, `createdAt`).
- **RESTful Principles:** Use standard HTTP verbs (`GET`, `POST`, `PATCH`, `DELETE`).
