# Bloggr API Reference

This document describes the REST API endpoints provided by Bloggr.

## Base URL

Local development:

```text
http://localhost:5000/api
```

All request and response bodies use JSON unless otherwise specified. Authentication is session-based, using HTTP-only cookies.

## Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new account |
| `POST` | `/auth/login` | Public | Log in to an account |
| `POST` | `/auth/logout` | Authenticated | Log out |
| `GET` | `/auth/me` | Authenticated | Get the current user |

### Register

`POST /auth/register`

Request body:

```json
{
  "name": "Alex",
  "email": "alex@example.com",
  "password": "SecurePass123"
}
```

### Login

`POST /auth/login`

Request body:

```json
{
  "email": "alex@example.com",
  "password": "SecurePass123"
}
```

### Logout

`POST /auth/logout`

Destroys the current session.

### Current User

`GET /auth/me`

Returns information about the authenticated user.

## Blogs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/blogs` | Public | List published blogs |
| `GET` | `/blogs/:id` | Public* | Retrieve a blog |
| `GET` | `/blogs/me/blogs` | Authenticated | List the current user's blogs |
| `POST` | `/blogs` | Authenticated | Create a blog |
| `PUT` | `/blogs/:id` | Owner | Update a blog |
| `DELETE` | `/blogs/:id` | Owner | Delete a blog |

\*Authors and administrators may access drafts, subject to authorization rules.

### List Blogs

`GET /blogs`

Optional query parameters:

| Parameter | Description |
|---|---|
| `page` | Page number |
| `search` | Search blog titles, excerpts, or tags |
| `tag` | Filter by tag |

Example:

```text
GET /blogs?page=1&search=technology&tag=programming
```

### Create a Blog

`POST /blogs`

Request body:

```json
{
  "title": "Getting Started with Programming",
  "content": "Your article content goes here.",
  "tags": ["programming", "beginners"],
  "status": "published"
}
```

Supported statuses: `draft`, `published`.

### Update a Blog

`PUT /blogs/:id`

Accepts the fields to update, such as `title`, `content`, `tags`, and `status`. Only the blog owner may edit the post.

### Delete a Blog

`DELETE /blogs/:id`

Deletes the blog and its associated comments, votes, and reports.

## Comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/comments/:blogId` | Public | List comments and replies |
| `POST` | `/comments/:blogId` | Authenticated | Add a comment or reply |
| `DELETE` | `/comments/:blogId/:commentId` | Owner | Delete a comment |

### Add a Comment

`POST /comments/:blogId`

Request body:

```json
{
  "content": "Great article!",
  "parentCommentId": null
}
```

Set `parentCommentId` to a top-level comment's ID to create a reply. Replies to replies are not supported.

## Votes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/votes/:blogId` | Authenticated | Cast or toggle a vote |

### Cast a Vote

`POST /votes/:blogId`

Request body:

```json
{
  "value": 1
}
```

- `1` — Upvote
- `-1` — Downvote

Each user can have one vote per blog. Submitting the same vote again removes it; submitting the opposite vote changes it. Authors cannot vote on their own blogs.

## Reports

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/reports` | Authenticated | Report a blog or comment |
| `GET` | `/reports` | Admin | List reports |
| `PATCH` | `/reports/:id/status` | Admin | Update report status |

### Submit a Report

`POST /reports`

Request body:

```json
{
  "targetType": "Blog",
  "targetId": "BLOG_ID",
  "reason": "Inappropriate content"
}
```

`targetType` must be `Blog` or `Comment`.

### Update Report Status

`PATCH /reports/:id/status`

Request body:

```json
{
  "status": "resolved"
}
```

Supported statuses: `reviewed`, `resolved`, `rejected`.

## Users

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Admin | List users |
| `GET` | `/users/:id` | Public | Retrieve a public profile |
| `PATCH` | `/users/:id` | Self | Update a profile |
| `DELETE` | `/users/:id` | Self/Admin | Delete an account |

### Update a Profile

`PATCH /users/:id`

Request body:

```json
{
  "name": "Alex Johnson",
  "bio": "A developer who enjoys writing."
}
```

### Delete an Account

`DELETE /users/:id`

Deletes the account and associated content according to the application's deletion policy.

## Health Check

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Check server availability |

Example response:

```json
{
  "status": "ok",
  "message": "Bloggr server is running!"
}
```

## Common HTTP Status Codes

| Status | Meaning |
|---|---|
| `200 OK` | Request successful |
| `201 Created` | Resource created |
| `400 Bad Request` | Invalid request data |
| `401 Unauthorized` | Authentication required or invalid credentials |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Duplicate or conflicting resource |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Unexpected server error |

## Notes

- Protected endpoints require a valid session cookie.
- Send the session cookie with subsequent requests after login or registration.
- The API uses server-side authorization; hiding a frontend page does not grant or enforce permissions.
- Public registration creates regular user accounts. Administrator access is provisioned separately.
- This reference describes the intended API. Check the route handlers and controllers for the exact request validation and response formats.