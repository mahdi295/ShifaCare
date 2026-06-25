import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import {
  TrendingUp, DollarSign, Users, Calendar,
  Loader2, AlertCircle, ArrowUp, ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const DoctorEarningsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctors/me/earnings')
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Failed to load earnings'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-24">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  if (!data) return (
    <NeumorphicBox className="p-16 text-center">
      <AlertCircle className="mx-auto text-muted mb-3" size={32} />
      <p className="text-muted">Could not load earnings data.</p>
    </NeumorphicBox>
  );

  const { totalEarnings, thisMonthEarnings, lastMonthEarnings, totalPatients, recentPayments, monthlyRevenue } = data;

  const growth = lastMonthEarnings > 0
    ? (((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100).toFixed(1)
    : null;

  const chartData = monthlyRevenue.map((m) => ({
    name: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    revenue: m.total,
    patients: m.count,
  }));

  const STATS = [
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `৳${totalEarnings.toLocaleString()}`,
      color: 'text-primary',
      sub: 'All time',
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: `৳${thisMonthEarnings.toLocaleString()}`,
      color: 'text-green-600',
      sub: growth !== null
        ? (growth >= 0 ? `+${growth}%` : `${growth}%`) + ' vs last month'
        : 'First month',
      growthPositive: growth === null ? null : growth >= 0,
    },
    {
      icon: Calendar,
      label: 'Last Month',
      value: `৳${lastMonthEarnings.toLocaleString()}`,
      color: 'text-blue-500',
      sub: 'Previous month',
    },
    {
      icon: Users,
      label: 'Patients Served',
      value: totalPatients,
      color: 'text-amber-500',
      sub: 'Completed appointments',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold">My Earnings</h3>
          <p className="text-muted text-sm mt-0.5">Track your income and patient history</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, label, value, color, sub, growthPositive }) => (
            <NeumorphicBox key={label} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-background rounded-lg border border-border flex items-center justify-center">
                  <Icon size={18} className={color} />
                </div>
                {growthPositive !== null && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${growthPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {growthPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    {Math.abs(growth)}%
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
              {sub && <p className="text-xs text-muted/70 mt-0.5">{sub}</p>}
            </NeumorphicBox>
          ))}
        </div>

        {/* Revenue chart */}
        {chartData.length > 0 && (
          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2">
              <TrendingUp size={17} className="text-primary" />
              Monthly Revenue
            </h4>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A6BCC" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1A6BCC" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={(v) => `৳${v.toLocaleString()}`} />
                <Tooltip
                  formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#1A6BCC" strokeWidth={2} fill="url(#earningsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </NeumorphicBox>
        )}

        {/* Recent payments table */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-5 flex items-center gap-2">
            <DollarSign size={17} className="text-primary" />
            Recent Payments
          </h4>
          {recentPayments.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No payments yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 text-xs font-semibold text-muted px-3 pb-2 border-b border-border">
                <span>Patient</span>
                <span>Date</span>
                <span>Method</span>
                <span className="text-right">Amount</span>
              </div>
              {recentPayments.map((p) => (
                <div key={p._id} className="grid grid-cols-4 items-center px-3 py-2.5 rounded-lg hover:bg-background transition-colors">
                  <span className="text-sm font-medium">{p.patient?.name || '—'}</span>
                  <span className="text-xs text-muted">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <span className="text-xs text-muted capitalize">{p.method || 'online'}</span>
                  <span className="text-right font-bold text-primary text-sm">৳{p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </NeumorphicBox>
      </div>
    </PageTransition>
  );
};

export default DoctorEarningsPage;
