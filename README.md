# 📧 Scheduled Email System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.19-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.5-green.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v5.4-red.svg)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-v5.1-orange.svg)](https://docs.bullmq.io/)
[![React](https://img.shields.io/badge/React-v18.3-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v5.3-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A high-performance, full-stack scheduled email application built with **Node.js, Express, MongoDB, Redis, BullMQ, React (Vite), and Nodemailer (Ethereal Email)**. The platform enables users to schedule emails for future delivery, track queue execution status in real-time, cancel scheduled messages, and handle node server restarts without job loss.

---

## 🌐 Live Demo & Deployment Links

- 🚀 **Live Web Application (Vercel)**: [https://out-box-scheduled-email-system.vercel.app](https://out-box-scheduled-email-system.vercel.app)
- ⚙️ **Live Backend API Service (Render)**: [https://outbox-scheduled-email-system.onrender.com/api](https://outbox-scheduled-email-system.onrender.com/api)
- 🏥 **API Health Check**: [https://outbox-scheduled-email-system.onrender.com/api/health](https://outbox-scheduled-email-system.onrender.com/api/health)

---

## 🏗 Architecture Overview

The system follows a decoupled, asynchronous queue architecture powered by **Redis & BullMQ** to manage delayed email jobs independently from the main HTTP API thread.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│       Glassmorphic Dashboard, Compose Form, Auth Flow       │
└──────────────────────────────┬──────────────────────────────┘
                               │ (HTTP REST API / JWT Bearer)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend Server (Express)                  │
│       Auth, Input Validation, Rate Limiter, REST API        │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    ┌────────────────────┐          ┌───────────────────┐
    │  MongoDB Database  │          │    Redis Store    │
    │  (Primary Source   │          │ (Delayed Queue ZSET│
    │   of Truth Data)   │          │  & BullMQ State)  │
    └────────────────────┘          └─────────┬─────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │   BullMQ Worker Process  │
                                │ (Concurrency: 5, Retries)│
                                └─────────────┬────────────┘
                                              │
                                              ▼
                                ┌──────────────────────────┐
                                │ Nodemailer / SMTP Engine │
                                │ (Ethereal Preview URL)   │
                                └──────────────────────────┘
```

---

## ✨ Key Features

- 🔐 **User Authentication & Authorization**: Secure JWT authentication, password hashing with `bcryptjs`, and protected React routes.
- 🕒 **Precision Email Scheduling**: Pick specific future date and time for delayed execution down to the minute.
- 🔄 **Restart Persistence (`restoreScheduledEmails`)**: Automatically queries MongoDB on server boot and re-queues pending jobs into BullMQ, ensuring zero job loss across server restarts.
- ⚡ **High-Throughput BullMQ Worker**: Dedicated background worker handling delayed jobs with configurable concurrency (`concurrency: 5`) and automatic retry policies with exponential backoff.
- 📊 **Interactive Glassmorphic UI**: Real-time stats cards (Scheduled, Sent, Failed, Total), responsive data tables with auto-refresh, confirmation modals, loading indicators, and toast alerts.
- 📧 **Ethereal Test Email Integration**: Instant preview URLs printed to server logs for verifying formatted HTML email delivery without sending real spam.
- 🛡️ **Production-Ready Middleware**: CORS enabled, centralized error handling, custom health check endpoint (`/api/health`), and environment variable isolation.

---

## 📂 Project Structure

```
scheduled-email-system/
│
├── backend/                        # Node.js + Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js               # Mongoose MongoDB connection
│   │   │   ├── redis.js            # ioredis client configuration
│   │   │   └── mail.js             # Nodemailer transporter & Ethereal setup
│   │   ├── controllers/
│   │   │   ├── authController.js   # User registration & login handlers
│   │   │   └── emailController.js  # Email scheduling, fetching & cancellation handlers
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT verification middleware
│   │   │   ├── rateLimiter.js      # Express rate-limiting middleware
│   │   │   └── errorHandler.js     # Centralized error & 404 handlers
│   │   ├── models/
│   │   │   ├── User.js             # User schema with password hashing hooks
│   │   │   └── Email.js            # Email schema (scheduled, processing, sent, failed, cancelled)
│   │   ├── queues/
│   │   │   └── emailQueue.js       # BullMQ Queue instance
│   │   ├── routes/
│   │   │   ├── authRoutes.js       # Authentication routes (/api/auth)
│   │   │   └── emailRoutes.js      # Email management routes (/api/emails)
│   │   ├── services/
│   │   │   ├── emailService.js     # Nodemailer email dispatcher
│   │   │   └── schedulerService.js # Enqueueing & startup restorer service
│   │   ├── worker/
│   │   │   └── emailWorker.js      # BullMQ worker process
│   │   └── server.js               # Express application entry point
│   ├── .env                        # Backend environment configuration
│   ├── dump.rdb                     # Local Redis snapshot (if generated)
│   ├── package.json                # Node dependencies & npm scripts
│   └── package-lock.json
│
├── frontend/                       # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation bar with user details & logout
│   │   │   ├── ProtectedRoute.jsx  # Auth guard component
│   │   │   ├── EmailTable.jsx      # Scheduled & Sent emails data table
│   │   │   └── Loading.jsx         # Custom spinner component
│   │   ├── pages/
│   │   │   ├── Login.jsx          # Login form view
│   │   │   ├── Register.jsx       # Registration form view
│   │   │   ├── Dashboard.jsx      # Metrics overview & management view
│   │   │   └── Compose.jsx        # Email scheduling form view
│   │   ├── services/
│   │   │   └── api.js             # Axios instance with Bearer token interceptor
│   │   ├── App.jsx                # React Router navigation layout
│   │   ├── main.jsx               # Client application entry point
│   │   └── index.css              # Glassmorphism design system & CSS variables
│   ├── index.html                 # HTML template
│   ├── vite.config.js             # Vite configuration (port 3000)
│   ├── .env                       # Frontend environment configuration
│   ├── package.json               # Node dependencies & scripts
│   └── package-lock.json
│
├── docker-compose.yml              # Local infrastructure container orchestration
├── .gitignore                      # Git ignore patterns
└── README.md                       # Project documentation
```

---

## 💻 Technical Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Queue / Cache**: Redis + BullMQ (ioredis)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Mailing**: Nodemailer + Ethereal Mail

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: Modern Vanilla CSS (Glassmorphism, Dark Theme, Custom Variables)

---

## 📋 Prerequisites

Before running the application, make sure you have installed:
- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v9.x` or higher (bundled with Node)
- **Docker & Docker Compose** *(Recommended for Redis & MongoDB)* OR standalone local installations:
  - MongoDB running on `mongodb://127.0.0.1:27017`
  - Redis running on `127.0.0.1:6379`

---

## ⚙️ Environment Configuration

### 1. Backend Environment Variables (`backend/.env`)

Create or modify `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scheduled_email
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
JWT_SECRET=super_secret_jwt_key_scheduled_email_2026

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Scheduled Email System <no-reply@example.com>"
```

> 💡 **Automatic Ethereal Credentials**: If `SMTP_USER` and `SMTP_PASS` are left empty, Nodemailer will automatically request temporary test credentials from Ethereal on startup and print preview links to the console!

### 2. Frontend Environment Variables (`frontend/.env`)

Create or modify `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Start & Installation

### Step 1: Start Infrastructure (MongoDB & Redis)

#### Option A: Using Docker Compose (Recommended)
From the root directory, run:

```bash
docker compose up -d
```

This starts:
- MongoDB container on port `27017`
- Redis container on port `6379`

#### Option B: Using Local Installations
- Ensure MongoDB server is running on `mongodb://127.0.0.1:27017`.
- Ensure Redis server is running on `127.0.0.1:6379`.

---

### Step 2: Set Up & Start Backend

Open a terminal window and execute:

```bash
cd backend
npm install
npm run dev
```

The backend server will start at `http://localhost:5000`. You will see startup logs:
```
==================================================
[Server] Express server running on port 5000
[Server] Environment: development
==================================================
[Database] MongoDB connected successfully
[Scheduler] 0 scheduled emails restored
```

---

### Step 3: Start BullMQ Worker (Optional Separate Process)

> ℹ️ *Note: `server.js` automatically imports and initializes `emailWorker.js` so it runs concurrently inside the server process. If you want to run dedicated worker processes for scale, run:*

Open a second terminal window:

```bash
cd backend
npm run worker
```

---

### Step 4: Set Up & Start Frontend

Open a third terminal window:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will launch at: `http://localhost:3000`

---

## 🛰️ API Reference & Documentation

### Base URL: `http://localhost:5000/api`

### Health Check
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Returns service status and timestamp |

### Auth Endpoints
| Method | Endpoint | Access | Request Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | `{ "name", "email", "password" }` | Register new user account |
| `POST` | `/auth/login` | Public | `{ "email", "password" }` | Authenticate user & return JWT |

#### Register Request Example:
```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

---

### Email Management Endpoints
> 🔑 **All `/api/emails` endpoints require `Authorization: Bearer <JWT_TOKEN>` header.**

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/emails/schedule` | Private | Schedule a new email (`to`, `subject`, `body`, `scheduledAt`) |
| `GET` | `/emails/scheduled` | Private | Get pending scheduled emails for logged-in user |
| `GET` | `/emails/sent` | Private | Get sent, failed, or cancelled emails for logged-in user |
| `DELETE` | `/emails/:id` | Private | Cancel a scheduled email before delivery |

#### Schedule Email Request Example:
```json
POST /api/emails/schedule
Headers: { "Authorization": "Bearer <YOUR_JWT_TOKEN>" }
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Project Status Update",
  "body": "<p>Hello team, here is the weekly update.</p>",
  "scheduledAt": "2026-09-12T12:00:00.000Z"
}
```

---

## 🔍 Core Technical Deep Dive

### 1. How Scheduling Works (Delayed Jobs in BullMQ)
1. When a user submits an email schedule request via `POST /api/emails/schedule`, the server validates the timestamp.
2. A document is created in MongoDB with status `"scheduled"`.
3. The server computes `delay = scheduledAt.getTime() - Date.now()`.
4. A job is added to BullMQ (`emailQueue`) with `jobId = email._id.toString()` and `{ delay }`.
5. Using `jobId = email._id.toString()` guarantees **strict atomic deduplication** between MongoDB and Redis.

### 2. Zero Job-Loss on Server Restarts (`restoreScheduledEmails`)
If the server or node process crashes or restarts:
1. Upon `server.js` startup, `restoreScheduledEmails()` executes after MongoDB connects.
2. It fetches all database records matching `status: "scheduled"` where `scheduledAt >= now`.
3. It checks if the corresponding job ID exists in Redis. If missing, it automatically calculates the remaining delay and re-enqueues the job into BullMQ.
4. Output log: `[Scheduler] X scheduled emails restored`.

### 3. Worker Execution & Failover
- Worker processes up to 5 jobs simultaneously (`concurrency: 5`).
- Updates MongoDB status to `"processing"` prior to dispatching SMTP traffic.
- On delivery success: updates MongoDB status to `"sent"`, records `sentAt` timestamp, and logs Ethereal preview link.
- On failure: catches error, updates MongoDB status to `"failed"`, stores `error` trace, and triggers retry flow.

---

## 🧪 Step-by-Step 5-Minute Walkthrough Test

1. **Register**: Go to `http://localhost:3000/register` and sign up.
2. **Dashboard**: Navigate to `/dashboard` to see empty counters (0 Scheduled, 0 Sent).
3. **Schedule an Email**: Click **Compose Email** (`/compose`), enter recipient email, subject, body, and set a time **2 minutes from now**. Click **Schedule Email**.
4. **Verify Queue**: Observe the new entry in the **Scheduled Emails** table.
5. **Test Server Restart Resilience**:
   - In your backend terminal, press `Ctrl+C` to kill the backend server.
   - Restart the server with `npm run dev`.
   - Watch the startup log print: `[Scheduler] 1 scheduled emails restored`.
6. **Delivery Verification**:
   - Wait until the scheduled timestamp arrives.
   - Watch the backend console print:
     ```text
     [Worker] Email <ID> marked as 'processing'
     [Worker Success] Email <ID> successfully sent to recipient@example.com
     [Worker Ethereal URL] https://ethereal.email/message/...
     ```
7. **Inspect Sent Table**: Refresh or observe auto-update moving the item to **Sent & Processed Emails**. Click the Ethereal preview link to view the rendered message!

---

## ☁️ Live Cloud Deployment Guide

### Deploy Backend to Render & Database to MongoDB Atlas / Upstash

1. **MongoDB Atlas**:
   - Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Get connection URI and whitelist IP access `0.0.0.0/0`.
2. **Upstash Redis**:
   - Create a free serverless Redis instance on [Upstash](https://upstash.com/).
   - Copy `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD`.
3. **Render (Backend)**:
   - Create a new **Web Service** on [Render](https://render.com/).
   - Root directory: `backend`.
   - Build Command: `npm install`.
   - Start Command: `npm start`.
   - Add environment variables (`MONGO_URI`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `JWT_SECRET`).
4. **Vercel (Frontend)**:
   - Import repository on [Vercel](https://vercel.com/).
   - Root directory: `frontend`.
   - Environment Variable: `VITE_API_URL` = `https://<YOUR_RENDER_APP>.onrender.com/api`.

---

## 🛠️ Troubleshooting & FAQ

### Q: "Redis connection error / ECONNREFUSED"
**Solution**: Ensure Redis is running locally (`redis-server` or `docker compose up -d`). Check `REDIS_HOST` and `REDIS_PORT` in `backend/.env`.

### Q: "MongoDB connection timed out"
**Solution**: Verify MongoDB service status or Atlas IP Whitelist (`0.0.0.0/0`).

### Q: "Emails are stuck in scheduled status"
**Solution**: Ensure worker process is active. Check terminal logs for worker errors or Redis connection drops.

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
