import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Calendar, UserCircle, LogOut,
  FileText, CreditCard, Users, Stethoscope,
  Menu, X, Building2, Globe, Activity,
  BarChart2, RotateCcw, DollarSign, ClipboardList,
} from 'lucide-react';

const ALL_MENU = [
  { name: 'Overview',          path: '/dashboard',                  icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
  { name: 'Appointments',      path: '/dashboard/appointments',     icon: Calendar,        roles: ['admin', 'doctor', 'patient'] },
  { name: 'All Appointments',  path: '/dashboard/all-appointments', icon: ClipboardList,   roles: ['admin'] },
  { name: 'Prescriptions',     path: '/dashboard/prescriptions',    icon: FileText,        roles: ['doctor', 'patient'] },
  { name: 'Payments',          path: '/dashboard/payments',         icon: CreditCard,      roles: ['patient', 'admin'] },
  { name: 'Refund Requests',   path: '/dashboard/refunds',          icon: RotateCcw,       roles: ['admin'] },
  { name: 'Revenue Charts',    path: '/dashboard/revenue',          icon: BarChart2,       roles: ['admin'] },
  { name: 'My Earnings',       path: '/dashboard/earnings',         icon: DollarSign,      roles: ['doctor'] },
  { name: 'Doctors',           path: '/dashboard/doctors',          icon: Stethoscope,     roles: ['admin'] },
  { name: 'Departments',       path: '/dashboard/departments',      icon: Building2,       roles: ['admin'] },
  { name: 'Users',             path: '/dashboard/users',            icon: Users,           roles: ['admin'] },
  { name: 'Profile',           path: '/dashboard/profile',          icon: UserCircle,      roles: ['admin', 'doctor', 'patient'] },
];

const ROLE_COLOR = {
  admin:   'bg-purple-100 text-purple-700',
  doctor:  'bg-teal-100 text-teal-700',
  patient: 'bg-blue-100 text-blue-700',
};

const SidebarContent = ({ menu, location, onLogout, user, onClose }) => (
  <div className="flex flex-col h-full">
    {/* Brand */}
    <div className="px-5 h-16 flex items-center justify-between border-b border-border shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
          <Activity size={14} className="text-white" />
        </div>
        <span className="font-bold text-base text-heading">ShifaCare</span>
      </div>
      {onClose && (
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-background text-muted transition-colors">
          <X size={16} />
        </button>
      )}
    </div>

    {/* User info */}
    <div className="px-4 py-4 border-b border-border shrink-0">
      <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
        <img
          src={
            !user?.avatar || user.avatar === 'no-photo.jpg'
              ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=1A6BCC&color=fff&size=80`
              : user.avatar
          }
          className="w-9 h-9 rounded-lg object-cover shrink-0"
          alt={user?.name}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-heading truncate">{user?.name}</p>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize mt-0.5 ${ROLE_COLOR[user?.role] || 'bg-background text-gray-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
      {menu.map(({ name, path, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted hover:bg-background hover:text-heading'
            }`}
          >
            <Icon size={16} className={active ? 'text-white' : 'text-muted'} />
            {name}
          </Link>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="px-3 pb-4 pt-2 border-t border-border shrink-0 space-y-0.5">
      <Link
        to="/"
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-background hover:text-heading transition-all"
      >
        <Globe size={16} /> Public Site
      </Link>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  </div>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location   = useLocation();
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);

  const menu = ALL_MENU.filter((m) => m.roles.includes(user?.role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-border shrink-0">
        <SidebarContent menu={menu} location={location} onLogout={handleLogout} user={user} />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface border-r border-border z-50">
            <SidebarContent menu={menu} location={location} onLogout={handleLogout} user={user} onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden h-14 bg-surface border-b border-border flex items-center gap-3 px-4 shrink-0">
          <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-background text-muted">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Activity size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm">ShifaCare</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
