# ShifaCare — Git Collaboration Guide (Complete Project)

## 1. Repository Structure

```
shifacare/
├── backend/          ← Express + MongoDB API
├── frontend/         ← React + Vite + Tailwind
├── .gitignore
├── .env.example
├── SHIFACARE_SETUP_GUIDE.md
└── README.md
```

---

## 2. Work Split for 3 Contributors

This split is designed for the **complete** version of ShifaCare, ensuring each person handles a logical flow of the application from frontend to backend.

### Person A: Public Experience & Access Control
**Scope:** The face of the hospital and the gateway for all users.

**Frontend Files:**
- `src/pages/HomePage.jsx`
- `src/pages/AboutPage.jsx`
- `src/pages/ContactPage.jsx`
- `src/pages/DepartmentsPage.jsx`
- `src/pages/DoctorsPage.jsx`
- `src/pages/DoctorDetailsPage.jsx`
- `src/pages/LoginPage.jsx`
- `src/pages/RegisterPage.jsx`
- `src/pages/ForgotPasswordPage.jsx`
- `src/pages/ResetPasswordPage.jsx`
- `src/pages/ProfilePage.jsx`
- `src/components/common/` (Navbar, Footer)
- `src/components/ui/` (DoctorCard, HeroSlider, etc.)

**Backend Files:**
- `controllers/authController.js` (Login, Register, Password Reset)
- `routes/authRoutes.js`
- `middleware/auth.js`
- `middleware/upload.js`

---

### Person B: Enterprise Management & Analytics
**Scope:** Managing the hospital's staff, data, and financial overview.

**Frontend Files (Admin Suite):**
- `src/pages/dashboard/AdminDashboard.jsx`
- `src/pages/admin/AdminUsersPage.jsx`
- `src/pages/admin/AdminDoctorsPage.jsx`
- `src/pages/admin/AdminDepartmentsPage.jsx`
- `src/pages/admin/AdminAppointmentsPage.jsx`
- `src/pages/admin/AdminRevenueChartPage.jsx`
- `src/pages/admin/AdminRefundsPage.jsx`
- `src/layouts/DashboardLayout.jsx`

**Backend Files:**
- `controllers/adminController.js`
- `controllers/departmentController.js`
- `controllers/doctorController.js`
- `routes/adminRoutes.js`, `routes/departmentRoutes.js`
- `models/User.js`, `models/Doctor.js`, `models/Department.js`

---

### Person C: Clinical Journey & Financial Portal
**Scope:** The heart of the app—booking, prescriptions, payments, and earnings.

**Frontend Files:**
- `src/pages/dashboard/PatientDashboard.jsx`
- `src/pages/dashboard/DoctorDashboard.jsx`
- `src/pages/dashboard/DoctorEarningsPage.jsx`
- `src/pages/AppointmentsDashboard.jsx` (Reschedule & Receipt logic)
- `src/pages/PaymentsPage.jsx` (Refund Request logic)
- `src/pages/PrescriptionsPage.jsx`
- `src/components/PrescriptionForm.jsx`
- `src/context/AuthContext.jsx`

**Backend Files:**
- `controllers/appointmentController.js`
- `controllers/paymentController.js`
- `controllers/prescriptionController.js`
- `controllers/slotController.js`
- `utils/slotGenerator.js`
- `models/Appointment.js`, `models/Payment.js`, `models/Prescription.js`

---

## 3. Git Workflow & Setup

### Initial Setup (once, by lead)
```bash
git init
git add .
git commit -m "chore: initial project setup"
git remote add origin <repo-url>
git push -u origin main
```

### Contributor Workflow
1. **Clone:** `git clone <repo-url>`
2. **Branch:** `git checkout -b feature/your-feature-name`
3. **Commit often:** Use prefixes like `feat:`, `fix:`, `ui:`, `docs:`.
4. **Push:** `git push origin feature/your-feature-name`
5. **PR:** Open a Pull Request on GitHub to the `main` branch.

### Deployment
- **Backend:** Render (`render.yaml`)
- **Frontend:** Vercel (`vercel.json`)
- **Database:** MongoDB Atlas
