// components/DashboardCharts.tsx
'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartProps {
  data: { date: string; revenue: number; expenses: number }[];
}

export default function DashboardCharts({ data }: ChartProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
      <h3 className="text-lg font-bold text-slate-800 mb-4">حركة الإيرادات والمصروفات (آخر 7 أيام)</h3>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip />
            <Bar dataKey="revenue" name="الإيرادات" fill="#2563eb" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="المصروفات" fill="#dc2626" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}