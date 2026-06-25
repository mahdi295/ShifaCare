# ShifaCare — Hospital Management System

A full-stack hospital management platform built with React + Express + MongoDB.

## Features

### Patient
- Register, login, forgot/reset password (token-based email flow)
- Browse doctors by department and specialization
- Book appointments with slot selection
- **Reschedule** appointments to a new date/slot
- Pay via SSLCommerz (online payment gateway)
- Download/print **payment receipts**
- **Request refunds** for paid appointments (admin-reviewed)
- View prescriptions issued by doctors

### Doctor
- View and manage personal appointments (confirm, complete)
- Issue prescriptions per appointment
- **My Earnings** — monthly income chart + patient history
- Toggle personal availability

### Admin
- Full **All Appointments** view with status/date/search filters
- Manage doctors, departments, and users
- Confirm or deactivate users
- **Revenue & Analytics Charts** — monthly trend, top doctors, status pie
- **Refund management** — review and approve patient refund requests
- Manual payment confirmation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (HTTP-only cookie) |
| Payments | SSLCommerz |
| Images | Cloudinary |
| Email | Nodemailer (SMTP) |

## Quick Start

```bash
# Clone and setup
git clone <repo-url> shifacare
cd shifacare

# Backend
cd backend
cp .env.example .env    # fill in credentials
npm install
npm run seed            # optional demo data
npm run dev             # → http://localhost:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # → http://localhost:5173
```

## Repository Structure

```
shifacare/
├── backend/
│   ├── controllers/     # Business logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── middleware/       # Auth, upload, error
│   ├── utils/           # Helpers
│   └── seed.js          # Demo data seeder
├── frontend/
│   └── src/
│       ├── pages/       # Route-level components
│       │   ├── admin/   # Admin-only pages
│       │   └── dashboard/
│       ├── components/  # Reusable UI
│       ├── layouts/     # DashboardLayout, PublicLayout
│       ├── context/     # AuthContext
│       └── utils/       # axios instance
├── .gitignore
├── .env.example
└── render.yaml          # Render.com deployment config
```

## User Roles

| Role | How to obtain |
|------|--------------|
| `patient` | Self-register at `/register` |
| `doctor` | Admin creates from Admin Dashboard → Doctors |
| `admin` | Manually set `role: "admin"` in MongoDB Atlas |

## Deployment

See `SHIFACARE_SETUP_GUIDE.md` for full setup instructions and `render.yaml` for Render.com backend deployment. Frontend deploys to Vercel (see `vercel.json`).
