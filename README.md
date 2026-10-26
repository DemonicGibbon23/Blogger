# Bloggr

A full-stack community blogging platform built with **Node.js, Express, MongoDB and vanilla JavaScript**.

## Features

- User registration and login with secure bcrypt password hashing
- Session-based authentication (HTTP-only cookies, 7-day TTL)
- Browse and search published blog posts with pagination and tag filtering
- Write, edit, save drafts and publish blog posts
- Upvote / downvote posts (one vote per user; toggle to remove; authors cannot vote on their own)
- Comment and reply (one level of nesting) on published posts
- Report blogs or comments for admin review
- User profiles with bio editing and account deletion
- Single administrator account (created via CLI seed script; never via public registration)
- Admin panel: review and action reports, browse all users

## Tech stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Runtime   | Node.js                                 |
| Server    | Express.js v5                           |
| Database  | MongoDB + Mongoose                      |
| Auth      | express-session + bcrypt                |
| Frontend  | HTML, CSS, vanilla JavaScript           |

## Project structure

```
server.js               Entry point – mounts routes, sessions, static files
.env                    Environment variables (never commit)
scripts/
  seedAdmin.js          CLI script to create the single admin account
src/
  config/
    database.js         MongoDB connection helper
  models/
    userModel.js        User schema (name, email, password, role, bio)
    blogModel.js        Blog schema (title, content, excerpt, author, tags, status)
    commentModel.js     Comment schema (blog, author, content, parentComment)
    voteModel.js        Vote schema (unique per blog+user)
    reportModel.js      Report schema (targetType polymorphic ref)
  services/             Business logic (auth, blog, comment, vote, report, user)
  controllers/          HTTP request handlers (thin wrappers around services)
  routes/               Express routers (auth, blogs, comments, votes, reports, users)
  middleware/
    authMiddleware.js   requireAuth, requireAdmin, rateLimiter
public/
  index.html            Landing page
  register.html         Registration form
  login.html            Login form
  explore.html          Browse / search / tag-filter posts
  post.html             Single post with votes and comments
  editor.html           Write / edit blog posts (draft or publish)
  profile.html          User profile and post list
  admin.html            Admin moderation panel
  shared.js             Shared API helper, session, DOM utilities
  style.css             Shared stylesheet
```

## Installation

### Prerequisites

- Node.js ≥ 18
- MongoDB running locally (or a MongoDB Atlas connection string)

### Steps

```bash
# 1. Clone
git clone https://github.com/Nivedck/Blogger.git
cd Blogger

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env   # or create .env manually
# Edit .env:
#   PORT=5000
#   MONGO_URI=mongodb://127.0.0.1:27017/bloggr
#   SESSION_SECRET=<generate with: openssl rand -hex 32>

# 4. Create the admin account (run once)
node scripts/seedAdmin.js

# 5. Start
npm run dev       # development (auto-restart on changes)
npm start         # production
```

Open **http://localhost:5000** in your browser.

## Environment variables

| Variable         | Required | Description                                           |
|------------------|----------|-------------------------------------------------------|
| `PORT`           | No       | Server port (default: 5000)                           |
| `MONGO_URI`      | Yes      | MongoDB connection string                             |
| `SESSION_SECRET` | Yes      | Long random string for signing session cookies        |
| `NODE_ENV`       | No       | Set to `production` to enable secure cookies          |

> **Never commit `.env`.** It is listed in `.gitignore`.

## Admin account

There is exactly **one administrator account**. It is created by running:

```bash
node scripts/seedAdmin.js
```

The script prompts for email, password and display name, or reads them from `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` environment variables. If an admin already exists the script exits safely.

Public registration always creates normal user accounts regardless of any `role` field in the request body.

## API reference

All endpoints use `Content-Type: application/json`. Authentication uses `credentials: "same-origin"` session cookies (set by login/register).

### Auth — `/api/auth`

| Method | Path        | Auth | Description                  |
|--------|-------------|------|------------------------------|
| POST   | `/register` | —    | Create user account          |
| POST   | `/login`    | —    | Log in, establish session    |
| POST   | `/logout`   | ✓    | Destroy session              |
| GET    | `/me`       | ✓    | Current user info            |

### Blogs — `/api/blogs`

| Method | Path          | Auth     | Description                               |
|--------|---------------|----------|-------------------------------------------|
| GET    | `/`           | —        | List published blogs (search, tag, page)  |
| GET    | `/:id`        | —        | Get single blog (author/admin see drafts) |
| GET    | `/me/blogs`   | ✓        | Current user's blogs (including drafts)   |
| POST   | `/`           | ✓        | Create blog                               |
| PUT    | `/:id`        | ✓ owner  | Update blog                               |
| DELETE | `/:id`        | ✓ owner  | Delete blog (cascades comments/votes)     |

### Comments — `/api/comments`

| Method | Path                   | Auth     | Description                          |
|--------|------------------------|----------|--------------------------------------|
| GET    | `/:blogId`             | —        | Get comments (with replies)          |
| POST   | `/:blogId`             | ✓        | Post comment or reply                |
| DELETE | `/:blogId/:commentId`  | ✓ owner  | Delete comment (cascades replies)    |

### Votes — `/api/votes`

| Method | Path       | Auth | Description                            |
|--------|------------|------|----------------------------------------|
| POST   | `/:blogId` | ✓    | Cast or toggle vote (`value`: 1 or -1) |

### Reports — `/api/reports`

| Method | Path          | Auth  | Description                        |
|--------|---------------|-------|------------------------------------|
| POST   | `/`           | ✓     | Submit report (rate limited)       |
| GET    | `/`           | admin | List reports (filterable by status)|
| PATCH  | `/:id/status` | admin | Update report status               |

### Users — `/api/users`

| Method | Path  | Auth      | Description                       |
|--------|-------|-----------|-----------------------------------|
| GET    | `/`   | admin     | List all users                    |
| GET    | `/:id`| —         | Public profile + published posts  |
| PATCH  | `/:id`| ✓ self    | Update name/bio                   |
| DELETE | `/:id`| ✓ self/admin | Delete account (cascades content)|

## Security

- Passwords hashed with bcrypt (10 rounds)
- Sessions stored server-side; cookies are `httpOnly`, `sameSite=lax`, `secure` in production
- `SESSION_SECRET` from environment, never hardcoded
- Role is set server-side only; client cannot escalate to admin via registration
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`
- Rate limiting on auth (30 req/15 min per IP) and report endpoints (10 req/hour per IP)
- XSS prevention: all dynamic content rendered with `escHtml()` via safe DOM APIs; no `innerHTML` with user data

## Deletion policy

| Entity  | What happens on delete |
|---------|------------------------|
| Blog    | Comments, votes and reports against that blog are deleted |
| Comment | Its replies and reports against that comment are deleted |
| User    | All their blogs, comments on those blogs, votes on those blogs, own comments elsewhere, own votes, and own reports are deleted |

## Development

```bash
npm run dev   # Node.js built-in watch mode (no extra dependencies)
```

Database is a local MongoDB instance. Use MongoDB Compass or `mongosh` to inspect data.

## Team

A four-member college Web Application Development project.
