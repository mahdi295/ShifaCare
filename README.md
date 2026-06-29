# ShifaCare

**ShifaCare** is a full-stack Hospital Management System built for healthcare delivery in Bangladesh. It covers patient self-service (appointment booking, prescriptions, payments), role-aware staff dashboards (doctor queue management, admin analytics), AI chatbot assistance, video consultations, and a public-facing website — all in one monorepo.

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
- **Home page** with hero image carousel (auto-rotate 3s), live stats strip (doctors/patients/appointments/departments), 6 service cards, featured doctors, department grid, infinite-scroll testimonials carousel, FAQ accordion, and CTA banner.
- **Doctors page** with real-time search by name/specialization and filters by department and availability.
- **Doctor detail page** with live 30-minute time slot availability and inline appointment booking.
- **Departments page** listing all medical departments with their available doctors.
- **About** page with mission, vision, values, and leadership sections.
- **Contact** page with address, phone, email, working hours, and contact form (frontend-only).
- **AI Chatbot** (floating widget, bottom-right) powered by Groq API (Llama 3.3 70B) — answers platform questions, triages symptoms, and suggests real departments/doctors from the database.
- **Bengali/English language toggle** — full i18n for Navbar, Footer, About, Login, Register pages.

### Patient Portal
- Register / login / logout with JWT-based session (httpOnly cookie + Bearer token).
- Forgot password & reset via email link (10-minute expiry, SHA-256 token, safe dev fallback).
- Browse and book appointments with any available doctor on any available slot.
- **Reschedule** appointments to a new date/slot with real-time slot fetching and conflict checking.
- View upcoming and past appointments with status tracking.
- Pay consultation fees via **SSLCommerz** (bKash, Nagad, Rocket, Visa, MasterCard).
- **Download/Print Payment Receipts** for successful transactions (jsPDF, styled).
- **Request Refunds** for paid appointments (subject to admin review).
- View digital prescriptions issued by doctors.
- Update profile (name, phone, address, avatar via Cloudinary) and change password.
- **Video Consultation** — Join a free Jitsi Meet room with the doctor for confirmed appointments (no sign-up, no API key).

### Doctor Dashboard
- View today's patient queue sorted by slot time.
- Confirm pending appointments (check-in).
- Issue digital prescriptions (diagnosis + dynamic medicine list + advice + follow-up date), which auto-completes the appointment.
- **My Earnings Dashboard** — Track total revenue, this month, last month, growth %, monthly area chart, recent payments table.
- Toggle personal availability to stop new bookings.
- View full appointment history.
- Join video calls with patients via Jitsi.

### Admin Dashboard
- **System Analytics** — Real-time counts for doctors/patients/appointments/departments, today's appointments, monthly revenue.
- **All Appointments Management** — Centralized view of every appointment with advanced filters (status, date, doctor/patient search).
- **Revenue & Analytics Charts** — Monthly revenue area chart (12 months), top 5 doctors bar chart, appointment status breakdown pie chart, CSV export.
- **Refund Management** — Review, approve, or reject patient refund requests with automated appointment cancellation.
- **CSV Export** — Export data from All Appointments, Users, and Revenue pages.
- User management: list all users with role/search filters, activate/deactivate accounts.
- Create doctor accounts (creates User + Doctor profile).
- Manage departments (CRUD, blocked if doctors assigned).
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
                            │ HTTP/HTTPS (Vite proxy in dev)
┌───────────────────────────▼─────────────────────────────────────┐
│                    Express API Server (:5000)                    │
│                                                                  │
│  Routes (/api/v1/*)   Controllers   Middleware   Utils           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ auth · departments · doctors · appointments              │   │
│  │ prescriptions · payments · admin · chatbot               │   │
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
   └────────────┘  └──────────────┘  └──────┬────────┘
                                            │ Groq API
                                            │ (Chatbot)
                                            ▼
                                       Llama 3.3 70B
```

---

## Repository Structure

```
shifacare/
├── backend/                    # Node.js + Express REST API
│   ├── README.md               # Backend-specific documentation
│   ├── index.js                # Entry point (helmet, CORS, rate-limit, routes)
│   ├── .env.example
│   ├── seed.js                 # Demo data seeder
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/            # Business logic (9 files)
│   ├── middleware/              # Auth, upload, error handler
│   ├── models/                 # Mongoose schemas (6 models)
│   ├── routes/                 # Express routers (8 route groups)
│   └── utils/                  # Helpers (slotGenerator, clinicKnowledge, errors)
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # Route definitions
│   │   ├── main.jsx            # React root, QueryClient, i18n
│   │   ├── i18n.js             # i18next config (en + bn)
│   │   ├── context/            # AuthContext (JWT auth state)
│   │   ├── layouts/            # PublicLayout, DashboardLayout
│   │   ├── components/         # Navbar, Footer, HeroSlider, DoctorCard,
│   │   │                       # ChatbotWidget, PrescriptionForm, etc.
│   │   ├── pages/              # 18 route-level page components
│   │   │   ├── admin/          # 6 admin-only pages
│   │   │   └── dashboard/      # 5 role-aware dashboard pages
│   │   ├── styles/             # Tailwind entry
│   │   ├── utils/              # Axios instance, CSV export
│   │   └── locales/            # en.json, bn.json (i18n)
│   ├── public/images/hero/     # Hero slider images
│   ├── index.html
│   ├── vite.config.js          # Vite 8, proxy, manualChunks
│   └── tailwind.config.js      # Custom design system
│
├── .gitignore
├── .env.example
├── render.yaml                 # Render.com backend deployment
├── vercel.json (in frontend/)  # Vercel SPA deployment
├── README.md
├── SHIFACARE_SETUP_GUIDE.md
├── HOW_TO_RUN.md
├── GIT_COLLABORATION_GUIDE.md
├── TESTING_INSTRUCTIONS.md
└── test_audit.md
```

---

## User Roles

| Role      | Registration  | Key Capabilities                                                       |
|-----------|---------------|------------------------------------------------------------------------|
| `patient` | Self-register | Book/reschedule appointments, pay fees, request refunds, view prescriptions, join video calls |
| `doctor`  | Admin creates | View queue, confirm appointments, issue prescriptions, toggle availability, view earnings |
| `admin`   | Manually set  | Everything above + analytics, user/doctor/department management, refund approval, CSV export |

> Public registration always creates a `patient`. Doctor accounts are created by an admin via the Admin Dashboard. Admins must be set directly in MongoDB Atlas.

---

## Tech Stack Overview

| Layer         | Technology                                                      |
|---------------|-----------------------------------------------------------------|
| Frontend      | React 18, Vite 8, React Router 6                                |
| Styling       | Tailwind CSS 3 (custom medical-blue palette), Framer Motion 11, Lucide React icons |
| Forms         | react-hook-form + Zod validation                                |
| HTTP Client   | Axios (pre-configured with base URL and credentials)            |
| Server State  | @tanstack/react-query (5-min stale time, auto-retry)           |
| Charts        | Recharts 2.12.7 (Area, Bar, Pie charts)                        |
| PDF           | jsPDF + jspdf-autotable (receipts)                             |
| Toasts        | Sonner                                                          |
| i18n          | i18next + react-i18next (English + Bengali)                    |
| Utilities     | clsx, tailwind-merge                                            |
| Backend       | Node.js (ES Modules), Express 4                                 |
| Database      | MongoDB via Mongoose 8                                          |
| Auth          | JWT (httpOnly cookie + Bearer header), bcrypt (10 rounds)       |
| Image Storage | Cloudinary (memory stream, face-crop transform, 400×400)        |
| Payments      | SSLCommerz (sandbox/live via env flag)                          |
| AI Chatbot    | Groq API (Llama 3.3 70B, function-calling for DB lookups)      |
| Email         | Nodemailer (SMTP, dev fallback returns reset URL in API)        |
| Security      | Helmet, CORS, express-rate-limit (200 req/min, 20/min chatbot)  |
| File Upload   | Multer (images only, 2MB max)                                   |
| Dev Tooling   | nodemon, Vite HMR                                               |
| Deploy        | Render (backend), Vercel (frontend)                             |

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas URI (or local MongoDB)
- Cloudinary account (free tier works)
- SSLCommerz sandbox credentials (for payment testing)
- Groq API key (free at https://console.groq.com — for AI chatbot)

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

This creates 15 departments, 15 doctors, 5 patients, 1 admin, 3 appointments, 2 payments, and 1 prescription.

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

**Demo credentials (after seeding):**
- Admin: `admin@shifacare.com` / `Admin@2024`
- Patient: `rahim@gmail.com` / `Admin@2024`
- Doctor: `arafat@shifacare.com` / `Admin@2024`

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

# Email (optional — dev fallback returns reset URL in API response)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
FROM_EMAIL=your@email.com
FROM_NAME=ShifaCare

# AI Chatbot (Groq)
GROQ_API_KEY=gsk_your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

**Frontend environment** (optional, `frontend/.env`):

```env
VITE_API_URL=/api/v1        # default; override for production deployments
```

> **Important for Local Testing**: For SSLCommerz IPN (Instant Payment Notification) to work locally, use **ngrok** to provide a public URL for your backend. Set `BACKEND_URL` to your ngrok URL in `.env`.

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
- Paid cannot be cancelled directly — must use refund flow.

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
  ├── /payments/success/:tran_id → validates via SSLCommerz API → marks Payment successful + Appointment paid → redirect frontend
  ├── /payments/fail/:tran_id   → marks Payment failed → redirect frontend
  └── /payments/cancel/:tran_id → marks Payment cancelled → redirect frontend
        │
Frontend reads ?payment= query param on AppointmentsDashboard load → shows toast
```

### Payment Status Flow

```
pending → successful → refund_requested → refunded
       ↘ failed
       ↘ cancelled
```

### Refund Flow

```
Patient clicks "Request Refund" on paid appointment
        │
POST /payments/:id/refund (body: { refundReason })
        │ Payment status → refund_requested
        ▼
Admin reviews in Admin Dashboard → Refund Requests
        │
POST /payments/:id/refund (same endpoint, admin context)
        │ Payment status → refunded
        │ Appointment status → cancelled
        ▼
Completed
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
| Paid cancel protection     | Paid appointments cannot be cancelled directly — must use refund flow |
| IPN validation             | IPN endpoint re-validates `val_id` with SSLCommerz before marking successful |
| CORS                       | Restricted to `CLIENT_URL` env variable + common dev ports + sslcommerz.com |
| Production cookies         | `secure: true` + `sameSite: 'none'` enabled in production mode  |
| Rate limiting              | 200 req/min general API, 20 req/min chatbot                      |

---

## Known Limitations & TODOs

- **Email**: `nodemailer` is wired but email sending is not fully production-tested. In `NODE_ENV=development`, the reset URL is returned in the API response as a dev helper.
- **Register page role selector**: The frontend `RegisterPage` has a role dropdown, but the backend ignores it for security. This should be removed from the UI.
- **PDF download**: The "Download PDF" button on `PrescriptionsPage` has no backend endpoint wired yet.
- **Contact form**: The Contact page form has no backend endpoint connected.
- **Chatbot**: Hallucination guard is implemented but may occasionally need refinement.
- **Testing**: No automated test framework is set up — all testing is manual (see `test_audit.md`).

---

## Detailed Documentation

- [Backend README →](./backend/README.md) — Full API reference, model schemas, controller logic, middleware details.
- [Frontend README →](./frontend/README.md) — Pages, features, tech stack.
- [Setup Guide →](./SHIFACARE_SETUP_GUIDE.md) — Setup, environment, seeding, and run instructions.
- [Quick Run →](./HOW_TO_RUN.md) — Fast local startup commands.
- [Git Collaboration Guide →](./GIT_COLLABORATION_GUIDE.md) — Branching strategy and contributor scope.
- [Testing Instructions →](./TESTING_INSTRUCTIONS.md) — Step-by-step testing guide.
- [Test Audit →](./test_audit.md) — Comprehensive test case list.
- [Full Analysis →](./FULL_ANALYSIS.md) — Historical development log and change tracking.
