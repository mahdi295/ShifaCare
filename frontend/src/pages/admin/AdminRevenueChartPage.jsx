import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { exportToCsv } from '../../utils/exportCsv';
import NeumorphicBox from '../../components/ui/NeumorphicBox';
import PageTransition from '../../components/ui/PageTransition';
import { TrendingUp, DollarSign, Loader2, AlertCircle, BarChart2, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS = { pending:'#F59E0B', confirmed:'#10B981', completed:'#3B82F6', cancelled:'#EF4444' };
const BAR_COLORS = ['#1A6BCC','#10B981','#F59E0B','#8B5CF6','#EF4444'];

const AdminRevenueChartPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/revenue-chart')
      .then((r) => setData(r.data.data))
      .catch(() => toast.error('Failed to load revenue data'))
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
      <p className="text-muted">Could not load data.</p>
    </NeumorphicBox>
  );

  const { monthlyRevenue, topDoctors, statusBreakdown } = data;

  const revenueChart = monthlyRevenue.map((m) => ({
    name: `${MONTHS[m._id.month - 1]} '${String(m._id.year).slice(2)}`,
    revenue: m.total,
    appointments: m.count,
  }));

  const pieData = statusBreakdown.map((s) => ({
    name: s._id,
    value: s.count,
    color: PIE_COLORS[s._id] || '#94A3B8',
  }));

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.total, 0);

  // Helper for currency formatting on axis
  const axisFormatter = (v) => {
    if (v === 0) return '0';
    if (v >= 1000) return `৳${(v/1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
    return `৳${v}`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Revenue & Analytics</h3>
            <p className="text-muted text-sm mt-0.5">Financial insights and appointment metrics</p>
          </div>
          <button
            onClick={() => {
              exportToCsv(
                `revenue_${new Date().toISOString().slice(0, 10)}.csv`,
                [
                  { key: 'name', label: 'Month' },
                  { key: 'revenue', label: 'Revenue (BDT)' },
                  { key: 'appointments', label: 'Appointments' },
                ],
                revenueChart
              );
              toast.success('CSV exported');
            }}
            className="nm-button flex items-center gap-2 text-sm text-muted hover:text-primary px-4 py-2"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Revenue (Last 12 Mo)', value: `৳${totalRevenue.toLocaleString()}`, color: 'text-primary' },
            { label: 'Highest Revenue Month', value: revenueChart.length ? (revenueChart.reduce((a,b)=>a.revenue>b.revenue?a:b).revenue > 0 ? revenueChart.reduce((a,b)=>a.revenue>b.revenue?a:b).name : '—') : '—', color: 'text-green-600' },
            { label: 'Top Doctor (All Time)', value: topDoctors[0]?.name ? `Dr. ${topDoctors[0].name}` : '—', color: 'text-amber-500' },
          ].map(({ label, value, color }) => (
            <NeumorphicBox key={label} className="p-5 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted mt-1">{label}</p>
            </NeumorphicBox>
          ))}
        </div>

        {/* Monthly Revenue Area Chart */}
        <NeumorphicBox className="p-6">
          <h4 className="font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={17} className="text-primary" />
            Monthly Revenue Trends (Last 12 Months)
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1A6BCC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A6BCC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} tickFormatter={axisFormatter} />
              <Tooltip
                formatter={(v, n) => [n === 'Revenue' ? `৳${v.toLocaleString()}` : v, n]}
                contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1A6BCC" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={1.5} fill="none" strokeDasharray="4 2" name="Appointments" />
            </AreaChart>
          </ResponsiveContainer>
        </NeumorphicBox>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Doctors Bar Chart */}
          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2">
              <BarChart2 size={17} className="text-primary" />
              Top Doctors (All Time Revenue)
            </h4>
            {topDoctors.length === 0 ? (
              <p className="text-muted text-sm text-center py-12">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topDoctors.map((d) => ({ name: `Dr. ${d.name}`, revenue: d.total, patients: d.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--color-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-muted)' }} tickFormatter={axisFormatter} />
                  <Tooltip
                    formatter={(v, n) => [n === 'revenue' ? `৳${v.toLocaleString()}` : v, n === 'revenue' ? 'Revenue' : 'Patients']}
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="revenue" radius={[4,4,0,0]}>
                    {topDoctors.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </NeumorphicBox>

          {/* Appointment Status Pie */}
          <NeumorphicBox className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2">
              <DollarSign size={17} className="text-primary" />
              Appointment Status Breakdown
            </h4>
            {pieData.length === 0 ? (
              <p className="text-muted text-sm text-center py-12">No data yet</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [v, n]}
                      contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="capitalize text-muted">{d.name}</span>
                      <span className="font-semibold">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </NeumorphicBox>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminRevenueChartPage;
