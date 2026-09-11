# Scheduled Email System

A full-stack, production-quality web application built with **Node.js, Express, MongoDB, Redis, BullMQ, React (Vite), and Nodemailer (Ethereal Email)**.

---

## 🌐 Live Demo & Deployment Links

- 🚀 **Live Web Application (Vercel Frontend)**: [https://out-box-scheduled-email-system.vercel.app](https://out-box-scheduled-email-system.vercel.app)
- ⚙️ **Live Backend API Service (Render)**: [https://outbox-scheduled-email-system.onrender.com/api](https://outbox-scheduled-email-system.onrender.com/api)
- 🏥 **API Health Check**: [https://outbox-scheduled-email-system.onrender.com/api/health](https://outbox-scheduled-email-system.onrender.com/api/health)

---

## Architecture Overview

The system follows a decoupled, queue-driven backend architecture to handle asynchronous delayed job processing:

```
[ Frontend: React + Vite ]
         │ (HTTP REST API / Bearer JWT)
         ▼
[ Backend API: Express.js ]
    ├── Persistent Storage ──► [ MongoDB ] (Primary Source of Truth)
    └── Delayed Job Enqueue ──► [ Redis + BullMQ Queue ]
                                       │
                                       ▼
                       [ Worker Process: emailWorker.js ]
                          (Concurrency: 5, Retries: 3)
                                       │
                                       ▼
                         [ SMTP: Ethereal Email ]
```

---

## Key Features

- **User Authentication**: Secure JWT registration and login with bcrypt password hashing (7-day token expiry).
- **Email Scheduling**: Schedule emails with specific recipient, subject, body, date, and time using BullMQ delayed jobs.
- **Restart Persistence (`restoreScheduledEmails`)**: Automatically restores pending scheduled jobs from MongoDB into BullMQ upon server startup, guaranteeing zero lost emails during server restarts.
- **Worker Concurrency & Reliability**: Dedicated BullMQ worker running with `concurrency: 5`, automatically retrying failed jobs up to 3 times with exponential backoff.
- **Rate Limiting**: Express rate limiting protecting `POST /api/emails/schedule` (10 requests/min per IP) and general API protection against spam/abuse.
- **Ethereal Email Integration**: Real test email delivery using Nodemailer and Ethereal SMTP with clickable preview links.
- **Modern UI**: Clean, glassmorphic dark interface built with React & Vanilla CSS featuring stats cards, live table auto-refresh, confirmation modals, and loading states.

---

## Project Structure

```
scheduled-email-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB Mongoose connection
│   │   │   ├── redis.js       # Redis ioredis setup
│   │   │   └── mail.js        # Nodemailer transport & Ethereal setup
│   │   ├── controllers/
│   │   │   ├── authController.js  # Register & Login logic
│   │   │   └── emailController.js # Schedule, list, & cancel email endpoints
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verification middleware
│   │   │   ├── rateLimiter.js  # express-rate-limit protection
│   │   │   └── errorHandler.js # Centralized Express error handler
│   │   ├── models/
│   │   │   ├── User.js        # User schema with password hashing
│   │   │   └── Email.js       # Email schema (scheduled, processing, sent, failed, cancelled)
│   │   ├── queues/
│   │   │   └── emailQueue.js  # BullMQ Queue instance
│   │   ├── routes/
│   │   │   ├── authRoutes.js  # Auth API endpoints
│   │   │   └── emailRoutes.js # Email API endpoints
│   │   ├── services/
│   │   │   ├── emailService.js     # Nodemailer email sender
│   │   │   └── schedulerService.js # BullMQ enqueuer & restart restorer
│   │   ├── worker/
│   │   │   └── emailWorker.js # BullMQ worker process (concurrency 5)
│   │   └── server.js          # Express app entry point
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Sticky header with user profile & logout
│   │   │   ├── ProtectedRoute.jsx # JWT auth guard
│   │   │   ├── EmailTable.jsx     # Reusable scheduled & sent email tables
│   │   │   └── Loading.jsx        # Spinner component
│   │   ├── pages/
│   │   │   ├── Login.jsx     # User login form
│   │   │   ├── Register.jsx  # User registration form
│   │   │   ├── Dashboard.jsx # Metrics stats & email list management
│   │   │   └── Compose.jsx   # Email scheduling form
│   │   ├── services/
│   │   │   └── api.js        # Axios instance with Bearer interceptor & 401 handler
│   │   ├── App.jsx           # App routing
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Glassmorphism Vanilla CSS design system
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── README.md
├── .gitignore
└── docker-compose.yml
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance running on `mongodb://127.0.0.1:27017` OR via Docker)
- **Redis** (Local instance running on `127.0.0.1:6379` OR via Docker)
- **Docker & Docker Compose** (Optional, for running MongoDB and Redis easily)

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scheduled_email
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=super_secret_jwt_key_scheduled_email_2026

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Scheduled Email System <no-reply@example.com>"
```

*Note: If `SMTP_USER` and `SMTP_PASS` are left empty, the application will automatically create a temporary Ethereal test account dynamically on startup and log credentials to the backend console.*

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Start & Installation

### 1. Start Infrastructure (MongoDB & Redis)

If you have Docker installed, start Redis and MongoDB in one command:

```bash
docker compose up -d
```

*Alternatively, ensure local MongoDB (`mongodb://127.0.0.1:27017`) and local Redis (`127.0.0.1:6379`) are running.*

### 2. Install & Run Backend Server

Open Terminal 1:

```bash
cd backend
npm install
npm run dev
```

### 3. Run BullMQ Email Worker

Open Terminal 2:

```bash
cd backend
npm run worker
```

### 4. Install & Run Frontend

Open Terminal 3:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Ethereal Email Setup

1. Open [https://ethereal.email](https://ethereal.email).
2. Click **Create Ethereal Account**.
3. Copy your generated Username (`SMTP_USER`) and Password (`SMTP_PASS`).
4. Paste them into `backend/.env`.
5. Restart your backend and worker.
6. When an email is sent, the worker logs a direct clickable **Ethereal Preview URL** in the console where you can inspect the rendered test email.

---

## API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/emails/schedule` | Private (Rate limited 10/min) | Schedule a new email |
| `GET` | `/api/emails/scheduled` | Private | Retrieve all pending scheduled emails |
| `GET` | `/api/emails/sent` | Private | Retrieve all sent, failed, & cancelled emails |
| `DELETE`| `/api/emails/:id` | Private | Cancel a scheduled email |

---

## Core Technical Deep Dive

### 1. Scheduling Architecture (BullMQ Delayed Jobs)
When a user schedules an email:
1. The backend validates that `scheduledAt` is in the future.
2. An `Email` document is created in MongoDB with `status: "scheduled"`.
3. The remaining delay in milliseconds (`scheduledAt - Date.now()`) is computed.
4. A delayed job is added to BullMQ (`emailQueue`) with `jobId = email._id.toString()`.

Using `jobId = email._id.toString()` ensures job deduplication and atomic status mapping between MongoDB and Redis.

### 2. Restart Persistence (`restoreScheduledEmails`)
When the Express server restarts:
1. Server connects to MongoDB.
2. `restoreScheduledEmails()` queries MongoDB for all documents matching:
   `status: "scheduled"` and `scheduledAt >= currentDate`.
3. For each email, it checks if the corresponding job exists in BullMQ. If missing, it calculates the remaining delay and enqueues the delayed job.
4. Outputs: `"[Scheduler] X scheduled emails restored"`.

### 3. Worker Concurrency & Failover
- Worker runs with `concurrency: 5`, allowing up to 5 email deliveries concurrently.
- Configured with 3 retry attempts and exponential backoff (`delay: 2000ms`).
- If an email status is changed to `cancelled` in MongoDB, the worker safely skips processing.

### 4. Rate Limiting
- `POST /api/emails/schedule` is restricted to **10 requests per minute per IP** via `express-rate-limit`.
- Exceeding the limit returns an HTTP `429 Too Many Requests` response:
  ```json
  { "message": "Too many email requests. Try again later." }
  ```

---

## Demo Sequence (5-Minute Walkthrough)

1. **Register/Login**: Register a new user on `/register` or login on `/login`.
2. **View Dashboard**: Observe empty stats cards (Scheduled: 0, Sent: 0, Failed: 0).
3. **Compose Email**: Click **Compose Email** and schedule an email for 2 minutes in the future.
4. **Scheduled Table**: Confirm the email appears in the **Scheduled Emails** table with status `scheduled`.
5. **Demonstrate Restart Persistence**:
   - Stop the Express backend server (Terminal 1 `Ctrl+C`).
   - Keep MongoDB, Redis, and Worker running.
   - Restart the Express backend (`npm run dev`).
   - Observe backend log: `"[Scheduler] 1 scheduled emails restored"`.
6. **Automatic Worker Delivery**:
   - Wait for the scheduled time.
   - Observe Worker Terminal logs: `"[Worker] Email marked as processing"` -> `"[Worker Success] Email sent"` with Ethereal preview link.
7. **Sent Table**: Observe the email automatically move from **Scheduled Emails** to **Sent & Processed Emails** table with status `sent`.
8. **Cancel Email**: Compose another email for 10 minutes in the future, then click **Cancel** on the dashboard to remove it from queue.

---

## Technical Trade-offs & Assumptions

- **Timezones**: Dates are stored in UTC format in MongoDB and converted to the client's local timezone using browser `toLocaleString()`.
- **In-Memory vs Redis Queues**: Delayed jobs are backed by Redis data structures (`ZSET`), allowing jobs to persist even when Node.js worker nodes restart.
- **Database Source of Truth**: MongoDB is the primary source of truth. Redis acts as the ephemeral execution queue.

---

## Live Cloud Deployment Guide

Follow this guide to host the full-stack system live for free using **MongoDB Atlas, Upstash Redis, Render, and Vercel**.

### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. Create a Database User and set Network Access to `0.0.0.0/0` (Allow access from anywhere).
3. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/scheduled_email`.

### 2. Redis Setup (Upstash Redis)
1. Go to [Upstash](https://upstash.com/) and create a free serverless Redis database.
2. Copy your Redis host endpoint, port (`6379`), and password.

### 3. Backend API & Worker Deployment (Render Free Web Service - $0.00)
1. Go to [Render](https://render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `scheduled-email-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `MONGO_URI`: `mongodb+srv://yluv7896_db_user:s1wdWlYan6MLYUqw@cluster0.n1grdjz.mongodb.net/scheduled_email?retryWrites=true&w=majority&appName=Cluster0`
   - `REDIS_HOST`: `your-upstash-endpoint.upstash.io`
   - `REDIS_PORT`: `6379`
   - `REDIS_PASSWORD`: `your_upstash_password`
   - `JWT_SECRET`: `super_secret_jwt_key_scheduled_email_2026`
5. Click **Create Web Service**.
*(Note: `server.js` automatically runs both the Express API and BullMQ Worker in this single free Web Service, so you do NOT need a paid Background Worker service!)*

### 4. Frontend Deployment (Vercel - $0.00)
1. Go to [Vercel](https://vercel.com/) and click **Add New** ➔ **Project**.
2. Import your GitHub repository.
3. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://scheduled-email-backend.onrender.com/api` *(Your Render Web Service URL)*
5. Click **Deploy**.
6. Access your live website URL (e.g. `https://scheduled-email-system.vercel.app`)!

---

## Troubleshooting

Include common issues:
- MongoDB not connected
- Redis not connected
- Ethereal credentials invalid
- Port already in use
- worker not running
