# ShifaCare

**ShifaCare** is a full-stack Hospital Management System built for healthcare delivery in Bangladesh. It covers patient self-service (appointment booking, prescriptions, payments), role-aware staff dashboards (doctor queue management, admin analytics), and a public-facing website — all in one monorepo.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [User Roles](#user-roles)
- [Tech Stack Overview](#tech-stack-overview)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Data Flow](#data-flow)
- [Payment Integration](#payment-integration)
- [Security Highlights](#security-highlights)
- [Known Limitations & TODOs](#known-limitations--todos)
- [Detailed Documentation](#detailed-documentation)

---

## Features

### Public Website
- **Home page** with live doctor listing, services overview, FAQ accordion, and patient testimonials.
- **Doctors page** with real-time search by name/specialization and filters by department and availability.
- **Doctor detail page** with live 30-minute time slot availability and inline appointment booking.
- **Departments page** listing all medical departments with their available doctors.
- **About** and **Contact** pages.

### Patient Portal
- Register / login / logout with JWT-based session (cookie + bearer token).
- Forgot password → reset via email link (10-minute expiry) with safe fallback for dev environments.
- Book appointments with any available doctor on any available slot.
- **Reschedule** appointments to a new date/slot with real-time conflict checking.
- View upcoming and past appointments with status tracking.
- Pay consultation fees via **SSLCommerz** (bKash, Nagad, Rocket, Visa, MasterCard).
- **Download/Print Payment Receipts** for successful transactions.
- **Request Refunds** for paid appointments (subject to admin review).
- View digital prescriptions issued by doctors.
- Update profile (name, phone, address, avatar) and change password.

### Doctor Dashboard
- View today's patient queue sorted by slot time.
- Confirm pending appointments (check-in).
- Issue digital prescriptions (diagnosis + dynamic medicine list + advice + follow-up date), which auto-completes the appointment.
- **My Earnings Dashboard** — Track total revenue, monthly trends, and patient history.
- Toggle personal availability to stop new bookings.
- View full appointment history.

### Admin Dashboard
- **Advanced System Analytics**: Real-time charts for monthly revenue, top-performing doctors, and appointment status breakdown.
- **All Appointments Management**: Centralized view of every appointment in the system with advanced filters (date, status, search).
- **Refund Management**: Review, approve, or reject patient refund requests with automated appointment cancellation.
- User management: list all users with role/search filters, activate/deactivate accounts.
- Create doctor accounts with a default or specified password.
- Manual payment confirmation for offline/pending transactions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│  ┌─────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │ Public Site │  │  Auth Pages      │  │ Role Dashboards  │   │
│  │ (Navbar/    │  │ (Login/Register/ │  │ (Admin / Doctor  │   │
│  │  Footer)    │  │  Forgot/Reset)   │  │  / Patient)      │   │
│  └─────────────┘  └──────────────────┘  └──────────────────┘   │
│                           │  axios (withCredentials)             │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/HTTPS
┌───────────────────────────▼─────────────────────────────────────┐
│                    Express API Server (:5000)                    │
│                                                                  │
│  Routes (/api/v1/*)   Controllers   Middleware                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ auth · departments · doctors · appointments              │   │
│  │ prescriptions · payments · admin                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│  ┌────────────────────────▼──────────────────────────────┐      │
│  │              Mongoose ODM                              │      │
│  │  User · Doctor · Department · Appointment             │      │
│  │  Prescription · Payment                               │      │
│  └────────────────────────┬──────────────────────────────┘      │
└───────────────────────────┼─────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
   ┌────────▼───┐  ┌───────▼──────┐  ┌─────▼────────┐
   │  MongoDB   │  │  Cloudinary  │  │  SSLCommerz  │
   │  Atlas     │  │  (Images)    │  │  (Payments)  │
   └────────────┘  └──────────────┘  └──────────────┘
```

---

## Repository Structure

```
shifacare/
├── backend/                    # Node.js + Express REST API
│   ├── README.md               # Backend-specific documentation
│   ├── index.js
│   ├── .env.example
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .gitignore
├── .env.example
├── README.md
├── SHIFACARE_SETUP_GUIDE.md
├── HOW_TO_RUN.md
└── GIT_COLLABORATION_GUIDE.md
```

---

## User Roles

| Role      | Registration  | Key Capabilities                                                       |
|-----------|---------------|------------------------------------------------------------------------|
| `patient` | Self-register | Book appointments, pay fees, view prescriptions                        |
| `doctor`  | Admin creates | View queue, confirm appointments, issue prescriptions, toggle availability |
| `admin`   | Admin creates | Everything above + analytics, user management, doctor/department management |

> Public registration always creates a `patient`. Doctor and admin accounts are created exclusively by an existing admin via `POST /api/v1/auth/create-staff`.

---

## Tech Stack Overview

| Layer         | Technology                                                      |
|---------------|-----------------------------------------------------------------|
| Frontend      | React 18, Vite 7, React Router 6                                |
| Styling       | Tailwind CSS 3, Framer Motion (transitions), Lucide (icons)     |
| Forms         | react-hook-form + Zod validation                                |
| HTTP Client   | Axios (pre-configured with base URL and credentials)            |
| Toasts        | Sonner                                                          |
| Backend       | Node.js (ES Modules), Express 4                                 |
| Database      | MongoDB via Mongoose 8                                          |
| Auth          | JWT (httpOnly cookie + Bearer header), bcrypt (10 rounds)       |
| Image Storage | Cloudinary (memory stream, face-crop transform, 400×400)        |
| Payments      | SSLCommerz (sandbox/live via env flag)                          |
| Dev Tooling   | nodemon, Vite HMR                                               |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas URI (or local MongoDB)
- Cloudinary account (free tier works)
- SSLCommerz sandbox credentials (for payment testing)

### 1. Clone & Install

```bash
cd shifacare

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your actual values (see Environment Setup below)
```

### 3. Optional: Seed Demo Data

```bash
cd backend
npm run seed
```

### 4. Run Both Servers

Open two terminals:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Setup

All environment variables go in `backend/.env`. The frontend uses Vite's proxy to forward `/api` requests to the backend in development.

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/shifacare

# Authentication
JWT_SECRET=super_secret_minimum_32_character_string
JWT_EXPIRE=30d
COOKIE_EXPIRE=30

# CORS
CLIENT_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SSLCommerz
SSL_STORE_ID=your_store_id
SSL_STORE_PASS=your_store_password
SSL_IS_LIVE=false           # true for production
```

**Frontend environment** (optional, `frontend/.env`):

```env
VITE_API_URL=/api/v1        # default; override for production deployments
```

---

## Data Flow

### Appointment Booking Flow

```
Patient selects doctor
        │
        ▼
GET /doctors/:id/slots?date=YYYY-MM-DD
        │ Returns available[] and booked[]
        ▼
Patient selects slot + enters symptoms
        │
        ▼
POST /appointments
  ├── Validates doctor exists + available
  ├── Checks slot not already taken
  ├── Checks patient doesn't have same doctor same day
  ├── Rejects past dates
  └── Assigns serial number (queue position)
        │
        ▼
Appointment created (status: pending, paymentStatus: unpaid)
```

### Appointment Lifecycle

```
pending ──► confirmed ──► completed
   │             │
   └─────────────┴──► cancelled
```

Transitions:
- `pending → confirmed`: by doctor or admin (check-in).
- `confirmed → completed`: by doctor (when issuing a prescription, auto-completed).
- Any non-completed → `cancelled`: by patient (own), or admin.

### Prescription Issuance

```
Doctor clicks "Prescribe" on a confirmed appointment
        │
        ▼
POST /prescriptions
  ├── Verifies doctor owns the appointment
  ├── Checks no prescription already exists for that appointment
  ├── Creates prescription record
  └── Marks appointment status → "completed"
```

---

## Payment Integration

ShifaCare integrates **SSLCommerz** for online payment processing (popular in Bangladesh).

### Payment Flow

```
Patient clicks "Pay ৳{amount}"
        │
POST /payments/init/:appointmentId
  ├── Creates pending Payment record (transactionId = PS-{timestamp}-{userId})
  └── Calls SSLCommerz API → returns GatewayPageURL
        │
Browser redirects to SSLCommerz payment page
        │
User completes payment (bKash / Nagad / Card / etc.)
        │
SSLCommerz POSTs to one of:
  ├── /payments/success/:tran_id → marks Payment successful, Appointment paid → redirect frontend
  ├── /payments/fail/:tran_id   → marks Payment failed → redirect frontend
  └── /payments/cancel/:tran_id → marks Payment cancelled → redirect frontend
        │
Frontend reads ?payment= query param on AppointmentsDashboard load → shows toast
```

### Sandbox vs Production

- `SSL_IS_LIVE=false` uses `https://sandbox.sslcommerz.com`.
- `SSL_IS_LIVE=true` uses `https://securepay.sslcommerz.com`.

> **Important for Local Testing**: For the **IPN (Instant Payment Notification)** to work locally, you must use **ngrok** to provide a public URL for your backend. Set `BACKEND_URL` to your ngrok URL in `.env`.

---

## Security Highlights

| Concern                    | Implementation                                                   |
|----------------------------|------------------------------------------------------------------|
| Password storage           | bcrypt with 10 salt rounds via Mongoose pre-save hook           |
| JWT transport              | httpOnly cookie (CSRF-resistant) + Authorization header support  |
| Role escalation prevention | Public register always sets `role: 'patient'`; staff created by admin only |
| Account deactivation       | `isActive` flag; deactivated users receive 403 on login         |
| Password reset tokens      | Raw token sent to user; only SHA-256 hash stored in DB; 10-min expiry |
| Password reset disclosure  | API always returns 200 even if email not found (prevents enumeration) |
| Admin self-protection      | Admin cannot deactivate their own account                        |
| File upload safety         | Multer limits: images only, 2 MB max                            |
| Appointment ownership      | Patients can only view/cancel their own appointments            |
| Prescription authorization | Doctors can only prescribe for their own appointments           |
| CORS                       | Restricted to `CLIENT_URL` env variable                         |
| Production cookies         | `secure: true` + `sameSite: 'none'` enabled in production mode  |

---

## Known Limitations & TODOs

- **Email**: `nodemailer` is wired but email sending is not implemented in production. In `NODE_ENV=development`, the reset URL is returned in the API response as a dev helper.
- **SSLCommerz validation**: The `paymentSuccess` handler does not validate `val_id` with SSLCommerz's validation API (noted in the code). This must be implemented before going live.
- **Register page role selector**: The frontend `RegisterPage` has a role dropdown, but the backend ignores it for security. This should be removed from the UI.
- **PDF download**: The "Download PDF" button on `PrescriptionsPage` has no backend endpoint wired yet.
- **Contact form**: The Contact page form has no backend endpoint connected.

---

## Detailed Documentation

- [Backend README →](./backend/README.md) — Full API reference, model schemas, controller logic, middleware details.
- [Setup Guide →](./SHIFACARE_SETUP_GUIDE.md) — Setup, environment, seeding, and run instructions.
- [Quick Run →](./HOW_TO_RUN.md) — Fast local startup commands.
- [Git Collaboration Guide →](./GIT_COLLABORATION_GUIDE.md) — Branching strategy and contributor scope.
