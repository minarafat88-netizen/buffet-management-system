// components/ui/StatCard.tsx
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  isPositive?: boolean;
  icon: ReactNode;
  colorTheme?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export function StatCard({ 
  title, 
  value, 
  unit = 'ج.م', 
  change, 
  isPositive = true, 
  icon, 
  colorTheme = 'blue' 
}: StatCardProps) {
  
  const themes = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400 group-hover:border-blue-500/50',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:border-emerald-500/50',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/50',
    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400 group-hover:border-purple-500/50',
    rose: 'border-rose-500/20 bg-rose-500/10 text-rose-400 group-hover:border-rose-500/50',
  };

  return (
    <div className="glass-card p-6 rounded-3xl shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
      <div className="absolute -left-6 -bottom-6 w-28 h-28 bg-current opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-all pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 tracking-wide">{title}</span>
        <div className={`p-3 rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${themes[colorTheme]}`}>
          {icon}
        </div>
      </div>

      <div className="text-3xl font-black text-white tracking-tight tabular-nums">
        {value} <span className="text-sm font-medium text-slate-400">{unit}</span>
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {change}
          </span>
          <span className="text-[11px] text-slate-500">مقارنة بالفترة السابقة</span>
        </div>
      )}
    </div>
  );
}