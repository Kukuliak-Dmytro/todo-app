# Todo API App

A simple, well-structured REST API for managing todos and tasks, with user authentication, global sharing/invites, and JWT-based security. Built with Node.js, Express, Prisma, and Supabase.

---

## Table of Contents
- [Setup](#setup)
- [Authentication](#authentication)
- [Todos](#todos)
- [Tasks](#tasks)
- [Invites & Sharing](#invites--sharing)
- [Health Check](#health-check)

---

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Configure environment variables:**
   - `.env` file:
     ```env
     DATABASE_URL=postgresql://...
     JWT_SECRET=your_jwt_secret
     JWT_REFRESH_SECRET=your_jwt_refresh_secret
     ```
3. **Run migrations:**
   ```sh
   npx prisma migrate dev
   ```
4. **Start the server:**
   ```sh
   npm start
   ```

---

## Authentication

All protected endpoints require an `Authorization: Bearer <accessToken>` header.

### Register
- `POST /auth/register`
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Response: `{ "accessToken": "...", "refreshToken": "..." }`

### Login
- `POST /auth/login`
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Response: `{ "accessToken": "...", "refreshToken": "..." }`

### Refresh Token
- `POST /auth/refresh`
- Body: `{ "refreshToken": "..." }`
- Response: `{ "accessToken": "...", "refreshToken": "..." }`

---

## Todos

### List Todos (with tasks)
- `GET /todos`
- Response: `[{ id, title, description, createdAt, tasks: [...] }, ...]`

### Get Single Todo (with tasks)
- `GET /todos/:id`
- Response: `{ id, title, description, createdAt, tasks: [...] }`

### Create Todo
- `POST /todos`
- Body: `{ "title": "My Todo", "description": "Optional" }`
- Response: `{ id, title, description, createdAt, tasks: [] }`

### Update Todo
- `PUT /todos/:id`
- Body: `{ "title": "New Title", "description": "Updated desc" }`
- Response: `{ id, title, description, createdAt, tasks: [...] }`

### Delete Todo
- `DELETE /todos/:id`
- Response: `{ "success": true, "message": "Todo deleted" }`

---

## Tasks

### List Tasks for a Todo
- `GET /todos/:todoId/tasks`
- Response: `[{ id, content, completed, createdAt }, ...]`

### Create Task
- `POST /todos/:todoId/tasks`
- Body: `{ "content": "Task content", "completed": false }`
- Response: `{ id, content, completed, createdAt }`

### Update Task
- `PATCH /tasks/:id`
- Body: `{ "content": "Updated content", "completed": true }`
- Response: `{ id, content, completed, createdAt }`

### Delete Task
- `DELETE /tasks/:id`
- Response: `{ "success": true, "message": "Task deleted" }`

---

## Invites & Sharing

**Invites now always share all todos of the inviter (global share).**

### Invite User to All Your Todos
- `POST /invite`
- Body: `{ "invitedUserEmail": "friend@example.com" }`
- Response: Invite object
- Only the owner can invite. The invited user must already exist.
- Duplicate invites (pending/accepted) are not allowed.

### List My Invites
- `GET /invites`
- Response: `[Invite, ...]` (includes inviter info)

### Respond to Invite
- `POST /invites/:id/respond`
- Body: `{ "status": "ACCEPTED" }` or `{ "status": "REJECTED" }`
- Response: Updated invite object
- Only the invited user can respond.

### List Todos Shared With Me
- `GET /shared-todos`
- Response: `[{ id, title, description, createdAt, tasks: [...] }, ...]`
- Returns all todos (with tasks) of users who have shared with you and whose invite you have accepted.

---

## Health Check

### Public
- `GET /health`
- Response: `{ "status": "ok" }`

### Protected
- `GET /health/protected`
- Header: `Authorization: Bearer <accessToken>`
- Response: `{ "status": "ok", "userId": 1 }`

---

## Notes
- All endpoints return validation errors in the format:
  ```json
  {
    "errors": [
      { "code": "invalid_type", "field": "title", "message": "Title is required" }
    ]
  }
  ```
- All protected endpoints require a valid JWT access token.
- Only owners can invite others to all their todos (global share).
- Shared todos are read-only for invited users. 