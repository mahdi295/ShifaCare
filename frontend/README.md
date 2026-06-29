# ShifaCare Frontend

React 18 + Vite 8 + Tailwind CSS 3 frontend for the ShifaCare Hospital Management System.

## Tech Stack

- **Framework:** React 18, React Router DOM 6 (nested layouts, protected routes)
- **Build:** Vite 8 (ES modules, chunk splitting via manualChunks function)
- **Styling:** Tailwind CSS 3 (custom medical-blue palette, custom shadows, Plus Jakarta Sans + DM Sans fonts)
- **Animation:** Framer Motion 11 (page transitions, UI animations)
- **Icons:** Lucide React (30+ icons used across the app)
- **Forms:** react-hook-form + Zod (schema validation)
- **HTTP Client:** Axios (pre-configured with Bearer token + withCredentials)
- **Server State:** @tanstack/react-query (5-min stale time, auto-retry)
- **Charts:** Recharts 2.12.7 (Area, Bar, Pie/Donut charts)
- **PDF:** jsPDF + jspdf-autotable (payment receipts)
- **i18n:** i18next + react-i18next (English + Bengali — 254 translation keys each)
- **Toasts:** Sonner (rich colored notifications)
- **Utilities:** clsx, tailwind-merge

## Project Structure

```
frontend/src/
├── App.jsx                    # Route definitions (public, auth, dashboard, admin)
├── main.jsx                   # React root, BrowserRouter, QueryClient, Toaster, i18n
├── i18n.js                    # i18next config (en + bn, localstorage language detection)
├── context/
│   └── AuthContext.jsx        # JWT auth state (login, logout, user, loading)
├── layouts/
│   ├── PublicLayout.jsx       # Navbar + Footer wrapper (unused route — Navbar/Footer are per-page)
│   └── DashboardLayout.jsx    # Sidebar + topbar + role-aware nav links
├── components/
│   ├── common/
│   │   ├── Navbar.jsx         # Responsive nav, language toggle, auth state
│   │   └── Footer.jsx         # i18n footer with links, address, services
│   ├── ui/
│   │   ├── ChatbotWidget.jsx  # Floating AI chatbot (Groq API, localStorage history)
│   │   ├── DoctorCard.jsx     # Doctor listing card
│   │   ├── HeroSlider.jsx     # Auto-rotating hero carousel (3s)
│   │   ├── NeumorphicBox.jsx  # Neumorphic container
│   │   ├── PageTransition.jsx # Framer Motion page wrapper
│   │   └── SkeletonLoader.jsx # Loading placeholder
│   ├── PrescriptionForm.jsx   # Dynamic medicine list form
│   └── ProtectedRoute.jsx     # Role-based route guard
├── pages/
│   ├── HomePage.jsx           # Hero, stats, services, featured docs, departments, testimonials, FAQ, CTA
│   ├── AboutPage.jsx          # Mission, vision, values, leadership, achievements
│   ├── ContactPage.jsx        # Contact form, info cards (frontend-only)
│   ├── DepartmentsPage.jsx    # All departments + single dept view with doctors
│   ├── DoctorsPage.jsx        # Search + filter by department/availability
│   ├── DoctorDetailsPage.jsx  # Full profile, slot picker, inline booking
│   ├── LoginPage.jsx          # Zod-validated, show/hide password, i18n
│   ├── RegisterPage.jsx       # Patient self-registration, i18n
│   ├── ForgotPasswordPage.jsx # Email input, dev-mode clickable reset link
│   ├── ResetPasswordPage.jsx  # Token form, expired link screen with retry
│   ├── AppointmentsDashboard.jsx  # Full lifecycle: book, pay, reschedule, refund, receipt, video call
│   ├── PaymentsPage.jsx       # 4 stat cards, history, receipt, refund, status badges
│   ├── PrescriptionsPage.jsx  # View digital prescriptions
│   ├── ProfilePage.jsx        # Update profile, avatar, change password
│   ├── dashboard/
│   │   ├── OverviewDashboard.jsx    # Role-based overview
│   │   ├── PatientDashboard.jsx     # Patient-specific widgets
│   │   ├── DoctorDashboard.jsx      # Today's queue, stats
│   │   ├── DoctorEarningsPage.jsx   # Revenue stats + monthly chart
│   │   └── AdminDashboard.jsx       # System analytics summary
│   └── admin/
│       ├── AdminDoctorsPage.jsx      # CRUD doctors
│       ├── AdminDepartmentsPage.jsx  # CRUD departments (delete blocked if assigned)
│       ├── AdminUsersPage.jsx       # List, search, activate/deactivate, CSV export
│       ├── AdminAppointmentsPage.jsx # All appointments with filters + CSV export
│       ├── AdminRevenueChartPage.jsx # Area/Bar/Pie charts + CSV export
│       └── AdminRefundsPage.jsx     # Approve/reject refunds
├── styles/
│   └── index.css              # Tailwind directives
├── utils/
│   ├── axios.js               # Axios instance with interceptors
│   └── exportCsv.js           # Zero-dependency CSV export utility
└── locales/
    ├── en.json                # English (254 keys — nav, auth, home, about, contact, depts, doctors, chatbot, footer, appointments)
    └── bn.json                # Bengali translation (same structure)
```

## Pages & Features

### Public (no login required)
| Page | Path | Features |
|------|------|----------|
| Home | `/` | Hero slider (3 images, auto-rotate), stats strip (4 counters), 6 service cards, featured doctors, departments grid, testimonial carousel, FAQ accordion, CTA banner |
| About | `/about` | Mission, vision, values, leadership team, achievement stats |
| Departments | `/departments` | All departments grid; `/departments/:id` shows doctors in that department |
| Doctors | `/doctors` | Search by name/specialization, filter by department/availability |
| Doctor Detail | `/doctors/:id` | Full profile, schedule, 30-min slot picker, inline booking |
| Contact | `/contact` | Info cards (phone/email/address/hours), contact form (frontend-only) |

### Auth
| Page | Path | Features |
|------|------|----------|
| Login | `/login` | Zod-validated, show/hide password, dev login hint, i18n |
| Register | `/register` | Self-registration (always patient role), i18n |
| Forgot Password | `/forgot-password` | Dev mode: clickable reset link button |
| Reset Password | `/reset-password/:token` | Expired token screen with "Request New Link" button |

### Patient Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ Role-specific overview |
| Appointments | `/dashboard/appointments` | ✅ Book, Pay, Cancel, **Reschedule** (live slots), **Receipt** (print/PDF), **Refund Request**, **Video Call** (Jitsi) |
| Payments | `/dashboard/payments` | ✅ 4 stat cards, filterable history, receipt, refund request, status badges |
| Prescriptions | `/dashboard/prescriptions` | ✅ View prescriptions from doctors |
| Profile | `/dashboard/profile` | ✅ Update name/phone/address, upload/delete avatar (Cloudinary), change password |

### Doctor Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ Today's queue + stats |
| Appointments | `/dashboard/appointments` | ✅ Confirm, Prescribe (auto-completes), join video call |
| **My Earnings** | `/dashboard/earnings` | ✅ 4 stat cards (total/this month/last month/patients), growth %, monthly area chart, recent payments |
| Prescriptions | `/dashboard/prescriptions` | ✅ View own prescribed records |
| Profile | `/dashboard/profile` | ✅ Update profile, toggle availability from doctor detail |

### Admin Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ Analytics counts + recent activity |
| **All Appointments** | `/dashboard/all-appointments` | ✅ Filter by status/date, search patient/doctor, Confirm/Complete/Cancel, **CSV Export** |
| **Revenue Charts** | `/dashboard/revenue` | ✅ Monthly area chart (12mo), top doctors bar chart, status pie chart, **CSV Export** |
| **Refund Requests** | `/dashboard/refunds` | ✅ Pending/Processed sections, Approve with one click |
| Manage Doctors | `/dashboard/doctors` | ✅ CRUD with department/specialization/schedule/fees |
| Manage Departments | `/dashboard/departments` | ✅ CRUD (delete blocked if doctors assigned) |
| Manage Users | `/dashboard/users` | ✅ Search, filter by role, activate/deactivate, **CSV Export** |
| Payments | `/dashboard/payments` | ✅ View all payments, receipt, manual confirm |
| Profile | `/dashboard/profile` | ✅ Update profile |

## Build Configuration

The Vite config (`vite.config.js`) splits vendor chunks for optimal caching:

| Chunk Name | Libraries |
|------------|-----------|
| `react-vendor` | react, react-dom, react-router-dom |
| `ui-vendor` | framer-motion, lucide-react, sonner |
| `form-vendor` | react-hook-form, @hookform/resolvers, zod |
| `query-vendor` | @tanstack/react-query |
| `pdf-vendor` | jspdf |

## Special Features

- **AI Chatbot (ChatbotWidget):** Floating bottom-right, multi-turn conversation with Groq API, localStorage history, "Browse all doctors" quick link, graceful error handling for missing API key
- **Video Consultation:** Free Jitsi Meet rooms (meet.jit.si/ShifaCare-Consult-{appointmentId}), no sign-up or API key needed, accessible from both patient and doctor appointment cards
- **CSV Export:** Zero-dependency utility (`exportCsv.js`), triggers browser download, available on admin pages
- **Language Toggle:** EN / বাং button in Navbar, persists choice in localStorage, Navbar/Footer/About/Login/Register fully translated (254 keys each language)
- **Skeleton Loaders:** Loading placeholders on data-fetching pages
- **Page Transitions:** Framer Motion fade/slide effects between routes
- **Responsive Design:** Mobile hamburger menu with language toggle, touch-friendly layouts
- **Hero Slider:** 3-image auto-rotating carousel (3s interval)

## Running Locally

```bash
npm install
npm run dev      # → http://localhost:5173 (proxies /api to :5000)
npm run build    # → dist/ (production build, ~2880 modules)
npm run preview  # → serve built dist/
```

Optional: create `frontend/.env` to override API URL:
```env
VITE_API_URL=/api/v1
```

## Deployment

The project includes `frontend/vercel.json` for Vercel deployment:
- SPA rewrites: all unmatched routes → `/index.html`
- Asset caching: 1 year immutable for `/assets/*`
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
