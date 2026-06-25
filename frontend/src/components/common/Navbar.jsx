import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Activity, ChevronRight, LayoutDashboard, LogOut } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home',        path: '/' },
  { label: 'Doctors',     path: '/doctors' },
  { label: 'Departments', path: '/departments' },
  { label: 'About',       path: '/about' },
  { label: 'Contact',     path: '/contact' },
];

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open,    setOpen]    = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const handleLogout = async () => { await logout(); navigate('/'); };
  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-40 bg-surface transition-shadow duration-200 ${
        scrolled ? 'shadow-nav' : 'border-b border-border'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-heading leading-none">ShifaCare</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  isActive(path)
                    ? 'text-primary bg-primary-light'
                    : 'text-muted hover:text-body hover:bg-background'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn-outline py-2 px-4 text-sm flex items-center gap-1.5">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost py-2 px-3 text-sm text-danger hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline py-2 px-4 text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm flex items-center gap-1.5">
                  Get Started <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-muted hover:bg-background hover:text-body transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-surface">
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(path)
                      ? 'text-primary bg-primary-light'
                      : 'text-muted hover:text-body hover:bg-background'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-border mt-2 space-y-1.5">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="flex w-full btn-primary justify-center py-2.5 text-sm">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="w-full text-center text-sm text-danger py-2 hover:bg-red-50 rounded-lg transition-colors">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login"    className="flex w-full btn-outline justify-center py-2.5 text-sm">Sign In</Link>
                    <Link to="/register" className="flex w-full btn-primary justify-center py-2.5 text-sm">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;
