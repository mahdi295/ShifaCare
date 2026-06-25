import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public pages
import HomePage          from './pages/HomePage';
import AboutPage         from './pages/AboutPage';
import DepartmentsPage   from './pages/DepartmentsPage';
import DoctorsPage       from './pages/DoctorsPage';
import DoctorDetailsPage from './pages/DoctorDetailsPage';
import ContactPage       from './pages/ContactPage';

// Auth pages
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';

// Dashboard pages
import OverviewDashboard     from './pages/dashboard/OverviewDashboard';
import AppointmentsDashboard from './pages/AppointmentsDashboard';
import PrescriptionsPage     from './pages/PrescriptionsPage';
import PaymentsPage          from './pages/PaymentsPage';
import ProfilePage           from './pages/ProfilePage';
import DoctorEarningsPage    from './pages/dashboard/DoctorEarningsPage';

// Admin pages
import AdminDoctorsPage       from './pages/admin/AdminDoctorsPage';
import AdminDepartmentsPage   from './pages/admin/AdminDepartmentsPage';
import AdminUsersPage         from './pages/admin/AdminUsersPage';
import AdminAppointmentsPage  from './pages/admin/AdminAppointmentsPage';
import AdminRevenueChartPage  from './pages/admin/AdminRevenueChartPage';
import AdminRefundsPage       from './pages/admin/AdminRefundsPage';

// Layout + guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute  from './components/ProtectedRoute';

const ErrorPage = ({ code, message }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="text-center">
      <p className="text-8xl font-bold text-accent/10 select-none">{code}</p>
      <h2 className="text-2xl font-bold mt-2">{code === 404 ? 'Page Not Found' : 'Access Denied'}</h2>
      <p className="text-muted text-sm mt-2">{message}</p>
      <Link to="/" className="inline-block mt-6 text-accent font-semibold hover:underline text-sm">← Go Home</Link>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<HomePage />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/departments"     element={<DepartmentsPage />} />
        <Route path="/departments/:id" element={<DepartmentsPage />} />
        <Route path="/doctors"         element={<DoctorsPage />} />
        <Route path="/doctors/:id"     element={<DoctorDetailsPage />} />
        <Route path="/contact"         element={<ContactPage />} />

        {/* Auth */}
        <Route path="/login"                      element={<LoginPage />} />
        <Route path="/register"                   element={<RegisterPage />} />
        <Route path="/forgot-password"            element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />

        {/* Protected dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout><OverviewDashboard /></DashboardLayout>} />
          <Route path="/dashboard/appointments" element={<DashboardLayout><AppointmentsDashboard /></DashboardLayout>} />
          <Route path="/dashboard/prescriptions" element={<DashboardLayout><PrescriptionsPage /></DashboardLayout>} />
          <Route path="/dashboard/payments" element={<DashboardLayout><PaymentsPage /></DashboardLayout>} />
          <Route path="/dashboard/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
          <Route path="/dashboard/earnings" element={<DashboardLayout><DoctorEarningsPage /></DashboardLayout>} />

          {/* Admin-only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/dashboard/doctors"      element={<DashboardLayout><AdminDoctorsPage /></DashboardLayout>} />
            <Route path="/dashboard/departments"  element={<DashboardLayout><AdminDepartmentsPage /></DashboardLayout>} />
            <Route path="/dashboard/users"        element={<DashboardLayout><AdminUsersPage /></DashboardLayout>} />
            <Route path="/dashboard/all-appointments" element={<DashboardLayout><AdminAppointmentsPage /></DashboardLayout>} />
            <Route path="/dashboard/revenue"      element={<DashboardLayout><AdminRevenueChartPage /></DashboardLayout>} />
            <Route path="/dashboard/refunds"      element={<DashboardLayout><AdminRefundsPage /></DashboardLayout>} />
          </Route>
        </Route>

        {/* Error pages */}
        <Route path="/unauthorized" element={<ErrorPage code={403} message="You don't have permission to access this page." />} />
        <Route path="*"             element={<ErrorPage code={404} message="The page you're looking for doesn't exist." />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
