// components/DashboardCharts.tsx
'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartProps {
  data: { date: string; revenue: number; expenses: number }[];
}

export default function DashboardCharts({ data }: ChartProps) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <span className="text-xs font-semibold text-[var(--color-teal)]">الأداء المالي</span>
          <h3 className="text-lg font-bold text-slate-900 mt-1">الإيرادات والمصروفات</h3>
        </div>
        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">آخر 7 أيام</span>
      </div>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf1f4" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e2e8f0', fontFamily: 'Cairo' }} />
            <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="#176b87" strokeWidth={3} dot={{ r: 3, fill: '#176b87' }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expenses" name="المصروفات" stroke="#c2413b" strokeWidth={2.5} dot={{ r: 3, fill: '#c2413b' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}