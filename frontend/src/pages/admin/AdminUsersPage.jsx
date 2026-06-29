import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { exportToCsv } from '../../utils/exportCsv';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { Users, Search, Loader2, CheckCircle, XCircle, Shield, Download } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_STYLE = {
  admin:        'text-purple-600 bg-purple-50',
  doctor:       'text-blue-600   bg-blue-50',
  patient:      'text-green-600  bg-green-50',

};

const AdminUsersPage = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role)   params.append('role',   role);
    if (search) params.append('search', search);
    api.get(`/admin/users?${params.toString()}`)
      .then((r) => setUsers(r.data.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [role]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleToggle = async (user) => {
    if (!window.confirm(`${user.isActive ? 'Deactivate' : 'Activate'} ${user.name}?`)) return;
    try {
      await api.put(`/admin/users/${user._id}/toggle`);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Action failed');
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">User Management</h3>
            <p className="text-muted text-sm mt-1">{users.length} users shown</p>
          </div>
          <button
            onClick={() => {
              if (users.length === 0) { toast.error('Nothing to export'); return; }
              exportToCsv(
                `users_${new Date().toISOString().slice(0, 10)}.csv`,
                [
                  { key: 'name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'role', label: 'Role' },
                  { key: 'isActive', label: 'Active' },
                  { key: 'createdAt', label: 'Joined' },
                ],
                users.map((u) => ({ ...u, createdAt: new Date(u.createdAt).toLocaleDateString('en-GB') }))
              );
              toast.success('CSV exported');
            }}
            className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search by name..."
                className="nm-input w-full pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="nm-button-accent px-5 text-sm">Search</button>
          </form>

          {/* Role filter */}
          <select
            className="nm-input bg-background text-sm sm:w-44"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* User list */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary" size={36} /></div>
        ) : users.length === 0 ? (
          <NeumorphicBox className="p-14 text-center">
            <Users className="mx-auto text-muted mb-4" size={36} />
            <p className="font-semibold">No users found</p>
          </NeumorphicBox>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <NeumorphicBox key={u._id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Left — avatar + info */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-background rounded-lg border border-border overflow-hidden p-0.5 shrink-0">
                      <img
                        src={
                          !u.avatar || u.avatar === 'no-photo.jpg'
                            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6C63FF&color=fff&size=80`
                            : u.avatar
                        }
                        className="w-full h-full object-cover rounded-lg"
                        alt={u.name}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{u.name}</p>
                        {u.role === 'admin' && <Shield size={13} className="text-purple-500" />}
                      </div>
                      <p className="text-xs text-muted">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${ROLE_STYLE[u.role]}`}>
                          {u.role}
                        </span>
                        {u.phone && <span className="text-xs text-muted">{u.phone}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right — status + toggle */}
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
                      u.isActive ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                    }`}>
                      {u.isActive
                        ? <><CheckCircle size={12} /> Active</>
                        : <><XCircle size={12} /> Inactive</>
                      }
                    </span>

                    {/* Don't show toggle for admin accounts */}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggle(u)}
                        className={`text-xs nm-button py-2 px-4 font-semibold transition-colors ${
                          u.isActive ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              </NeumorphicBox>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default AdminUsersPage;
