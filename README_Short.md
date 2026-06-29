# ShifaCare — Hospital Management System

A full-stack hospital management platform built with React 18 + Vite 8 + Express + MongoDB.

## Features

### Patient
- Register, login, forgot/reset password (token-based email flow, safe dev fallback)
- Browse doctors by department and specialization
- Book appointments with slot selection
- **Reschedule** appointments to a new date/slot with real-time conflict checking
- Pay via SSLCommerz (bKash, Nagad, Rocket, Visa, MasterCard)
- Download/print **payment receipts** (jsPDF)
- **Request refunds** for paid appointments (admin-reviewed)
- View digital prescriptions
- **AI Assistant chatbot** — ask platform questions, describe symptoms, get a department/doctor suggestion (not a diagnosis)
- **Video Consultation** — Join Jitsi Meet with doctor (free, no sign-up)
- Bengali/English language toggle

### Doctor
- View and manage personal appointments (confirm, complete)
- Issue prescriptions per appointment (auto-completes appointment)
- **My Earnings** — monthly income chart + patient history
- Toggle personal availability
- Join video calls with patients

### Admin
- Full **All Appointments** view with status/date/search filters
- Manage doctors, departments, and users
- Confirm or deactivate users
- **Revenue & Analytics Charts** — monthly trend area chart, top doctors bar chart, status pie chart
- **CSV Export** for appointments, users, and revenue data
- **Refund management** — review and approve patient refund requests
- Manual payment confirmation

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 8, Tailwind CSS 3, Framer Motion, Lucide |
| Forms | react-hook-form + Zod |
| Charts | Recharts 2.12.7 |
| PDF | jsPDF + jspdf-autotable |
| i18n | i18next + react-i18next (EN/BN) |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB Atlas (Mongoose 8) |
| Auth | JWT (httpOnly cookie + Bearer) |
| Payments | SSLCommerz |
| Images | Cloudinary |
| AI Chatbot | Groq API (Llama 3.3 70B) |
| Email | Nodemailer (SMTP, dev fallback) |
| Video | Jitsi Meet (free, no API key) |

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

**Demo credentials** (after seeding):
- Admin: `admin@shifacare.com` / `Admin@2024`
- Patient: `rahim@gmail.com` / `Admin@2024`
- Doctor: `arafat@shifacare.com` / `Admin@2024`

## Repository Structure

```
shifacare/
├── backend/
│   ├── controllers/     # Business logic (9 files)
│   ├── models/          # Mongoose schemas (6 models)
│   ├── routes/          # Express routers (8 groups)
│   ├── middleware/       # Auth, upload, error
│   ├── utils/           # Helpers, slot gen, clinic knowledge
│   └── seed.js          # Demo data seeder
├── frontend/
│   └── src/
│       ├── pages/       # 18 route-level components
│       │   ├── admin/   # 6 admin-only pages
│       │   └── dashboard/
│       ├── components/  # Navbar, Footer, HeroSlider, DoctorCard, ChatbotWidget, etc.
│       ├── layouts/     # DashboardLayout, PublicLayout
│       ├── context/     # AuthContext (JWT)
│       ├── locales/     # en.json, bn.json
│       └── utils/       # Axios instance, CSV export
├── .gitignore
├── .env.example
├── render.yaml          # Render.com backend deploy
└── vercel.json          # Vercel frontend deploy (in frontend/)
```

## User Roles

| Role | How to obtain |
|------|--------------|
| `patient` | Self-register at `/register` |
| `doctor` | Admin creates from Admin Dashboard → Doctors |
| `admin` | Manually set `role: "admin"` in MongoDB Atlas |

## Deployment

Backend deploys to Render (`render.yaml`). Frontend deploys to Vercel (`frontend/vercel.json` with SPA rewrites). See `SHIFACARE_SETUP_GUIDE.md` for full setup instructions.
