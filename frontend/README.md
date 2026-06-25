# ShifaCare Frontend

React + Vite + Tailwind CSS frontend for the ShifaCare Hospital Management System.

## Tech Stack

- React 18, React Router v6
- Vite (build tool)
- Tailwind CSS (utility styling)
- Lucide React (icons)
- Recharts (charts & analytics)
- jspdf & jspdf-autotable (receipt generation)
- React Hook Form + Zod (form validation)
- Sonner (toast notifications)
- Axios (API client)

## Pages & Features

### Public (no login required)
| Page | Path | Status |
|------|------|--------|
| Home | `/` | ✅ Complete |
| About | `/about` | ✅ Complete |
| Departments | `/departments` | ✅ Complete |
| Doctors | `/doctors` | ✅ Complete |
| Doctor Detail | `/doctors/:id` | ✅ Complete |
| Contact | `/contact` | ✅ Complete (frontend-only form) |

### Auth
| Page | Path | Status |
|------|------|--------|
| Login | `/login` | ✅ Complete |
| Register | `/register` | ✅ Complete |
| Forgot Password | `/forgot-password` | ✅ Complete |
| Reset Password | `/reset-password/:token` | ✅ Complete |

### Patient Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ |
| Appointments | `/dashboard/appointments` | ✅ Book, Cancel, **Reschedule**, Pay |
| Payments | `/dashboard/payments` | ✅ History, **Receipt**, **Refund Request** |
| Prescriptions | `/dashboard/prescriptions` | ✅ |
| Profile | `/dashboard/profile` | ✅ |

### Doctor Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ |
| Appointments | `/dashboard/appointments` | ✅ Confirm, Complete, Prescribe |
| **My Earnings** | `/dashboard/earnings` | ✅ New — income chart + history |
| Prescriptions | `/dashboard/prescriptions` | ✅ |
| Profile | `/dashboard/profile` | ✅ |

### Admin Dashboard
| Feature | Path | Status |
|---------|------|--------|
| Overview | `/dashboard` | ✅ Stats + recent activity |
| **All Appointments** | `/dashboard/all-appointments` | ✅ New — filter, search, manage all |
| **Revenue Charts** | `/dashboard/revenue` | ✅ New — area chart, top doctors, status pie |
| **Refund Requests** | `/dashboard/refunds` | ✅ New — approve/reject refunds |
| Manage Doctors | `/dashboard/doctors` | ✅ |
| Manage Departments | `/dashboard/departments` | ✅ |
| Manage Users | `/dashboard/users` | ✅ |
| Payments | `/dashboard/payments` | ✅ |
| Profile | `/dashboard/profile` | ✅ |

## Running Locally

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

Optional: create `frontend/.env` to override API URL:
```env
VITE_API_URL=/api/v1
```
