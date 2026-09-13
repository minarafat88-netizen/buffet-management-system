// app/login/page.tsx (Updated Modern UI)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineLockClosed, HiOutlineUser, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل تسجيل الدخول');

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#f5f7fa] text-slate-800">
      {/* القسم الجمالي والترحيب */}
      <div className="lg:col-span-7 bg-[var(--color-primary)] p-8 md:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-l border-slate-700 relative overflow-hidden">
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full border border-cyan-300/10 pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full border border-cyan-300/10 pointer-events-none"></div>
        
        <div className="flex items-center gap-3 z-10">
          <div className="h-12 w-12 bg-[var(--color-teal)] rounded-xl flex items-center justify-center font-black text-xl text-white shadow-xl shadow-slate-950/20">
            ب
          </div>
          <span className="text-lg font-extrabold text-white">نظام إدارة البوفيه</span>
        </div>

        <div className="my-auto py-12 z-10 max-w-xl">
          <span className="px-3 py-1 bg-cyan-300/10 border border-cyan-200/20 text-cyan-200 text-xs font-bold rounded-full inline-block mb-4">
            منصة الإدارة الذكية
          </span>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            تحكم كامل في مبيعاتك، مخزونك، وأرباحك بدقة متناهية.
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            صُمم النظام خصيصاً لتسهيل العمليات اليومية، تتبع الديون، وإدارة الجرد بكل سلاسة واحترافية.
          </p>
        </div>

        <div className="text-xs text-slate-400 z-10">
          جميع الحقوق محفوظة © 2026 Buffet Management System
        </div>
      </div>

      {/* نموذج تسجيل الدخول */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 md:p-8 lg:p-12">
        <div className="max-w-md w-full bg-white border border-slate-200 p-7 md:p-8 rounded-xl shadow-[0_16px_40px_rgba(24,50,74,0.08)]">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">مرحبًا بعودتك</h2>
            <p className="text-sm text-slate-500">أدخل بيانات الحساب للمتابعة إلى لوحة التحكم</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-lg text-sm mb-6 text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">اسم المستخدم</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <HiOutlineUser className="text-xl" />
                </span>
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full bg-slate-50 border border-slate-200 pr-11 pl-4 py-3.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <HiOutlineLockClosed className="text-xl" />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 pr-11 pl-12 py-3.5 rounded-lg text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition text-slate-800 placeholder:text-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                  aria-label="إظهار/إخفاء كلمة المرور"
                >
                  {showPassword ? <HiOutlineEyeOff className="text-xl" /> : <HiOutlineEye className="text-xl" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white p-4 rounded-lg text-sm font-bold transition duration-200 shadow-lg shadow-slate-900/15 disabled:opacity-50 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'جاري التحقق...' : 'دخول إلى النظام'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}