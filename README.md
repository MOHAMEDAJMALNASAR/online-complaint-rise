# Online Product Complaint Management System

A production-ready MERN stack application split into three independent projects: a customer **client**, a separate **admin** dashboard, and a shared Express + MongoDB **server**.
 ### Drive Link For My Reports
- https://drive.google.com/drive/folders/1NEyYWa-cL0FpjJs-pri1vH_DSkEfW6Ll

## Tech Stack

- **Client & Admin:** React 18 + Vite, Tailwind CSS, Lucide React, Axios, React Router
- **Server:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Image Upload:** Multer (stored in `server/uploads`)

## Features

- Customer complaint registration form with multi-image upload & live preview
- Auto-generated unique complaint IDs (e.g. `CMP-1A2B3C4D`)
- Form validation, toast notifications, loading states
- No admin access inside the customer application (fully separated)
- Standalone Admin dashboard (JWT auth, default admin auto-created)
- Overview page with clickable stat cards (Total, Pending, In Progress, Resolved, Rejected) that open filtered complaint lists
- Recent Complaints section showing the newest complaints first
- Manage Complaints page with search, status filters, sort, pagination, and CSV export
- Bulk actions: select multiple complaints to update status or delete at once
- Complaint detail view with single-click status changes, admin notes, status history timeline, image lightbox, and delete

## Project Structure

```
project/
  client/         Standalone customer application (port 5173)
    src/
      api/          Axios client
      components/   Reusable UI components
      context/      Toast provider
      layouts/      Customer layout
      pages/        Home, Success
      services/     API service functions
      utils/        helpers, validation
  admin/          Standalone admin application (port 5174)
    src/
      api/          Axios client with auth interceptor
      components/   Reusable UI components
      context/      Auth & Toast providers
      hooks/        useFetch
      layouts/      Admin layout
      pages/        Login, Dashboard, Complaints, ComplaintDetail
      services/     API service functions
      utils/        helpers, formatting
  server/         Shared Express + MongoDB backend (port 5000)
    config/         DB connection
    controllers/    Complaint & Admin controllers
    middleware/     Auth, Multer upload, error handling
    models/         Complaint, Admin
    routes/         Public complaint, admin, auth routes
    uploads/        Uploaded product images
    utils/          AppError, asyncHandler, complaint ID generator, JWT
    server.js       Express app entry
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- A MongoDB database:
  - **MongoDB Atlas (recommended)** — managed cloud database, see setup below, or
  - Local MongoDB instance

#### MongoDB Atlas setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. In **Database Access**, create a database user and note the username/password.
3. In **Network Access**, allow your IP (or `0.0.0.0/0` for testing).
4. Click **Connect → Drivers**, copy the connection string (looks like `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/`).
5. Replace the `<DB_USER>`, `<DB_PASSWORD>` and `<CLUSTER>` in `server/.env` with your values. Optionally change the database name from `complaint_system`.

### 2. Server (shared backend)

```bash
cd server
npm install
# edit .env if needed (MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD)
npm run dev
```

Server runs on `http://localhost:5000`.

Default admin login (created automatically on first start):

- Email: `admin@complaints.com`
- Password: `admin123`

### 3. Client (customer application)

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to the server.

### 4. Admin (admin dashboard application)

```bash
cd admin
npm install
npm run dev
```

Runs on `http://localhost:5174`. The Vite dev server proxies `/api` and `/uploads` to the server. Sign in with the admin credentials above.

### 5. API Endpoints

| Method | Endpoint                  | Auth  | Description               |
| ------ | ------------------------- | ----- | ------------------------- |
| POST   | `/api/complaints`         | —     | Submit complaint (+images)|
| GET    | `/api/complaints/:id`     | —     | Public complaint lookup   |
| POST   | `/api/auth/login`         | —     | Admin login               |
| GET    | `/api/admin/stats`        | JWT   | Complaint status counts   |
| GET    | `/api/admin`              | JWT   | List/filter/search (paginated, newest first by default) |
| POST   | `/api/admin/bulk-status`  | JWT   | Update status of many complaints    |
| POST   | `/api/admin/bulk-delete`  | JWT   | Delete many complaints at once      |
| GET    | `/api/admin/:id`          | JWT   | Single complaint                    |
| PUT    | `/api/admin/:id`          | JWT   | Update status / note                |
| DELETE | `/api/admin/:id`          | JWT   | Delete complaint                    |

## Notes

- Change `JWT_SECRET` and the default admin credentials in `server/.env` before deploying.
- Both applications run independently; the server is shared.
- Uploaded images are served statically from `/uploads`. For production, configure a cloud storage bucket.
-
