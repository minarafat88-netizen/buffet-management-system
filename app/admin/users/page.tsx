// app/admin/users/page.tsx
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { createUser, toggleUserStatus } from '@/app/actions/users';
import { getSessionUser } from '@/services/session';

export default async function AdminUsersPage() {
  const user = await getSessionUser();

  if (user?.role !== 'ADMIN') {
    return <div className="p-8 text-center text-red-600 font-bold">عفواً، هذه الصفحة مخصصة لمدير النظام (Admin) فقط.</div>;
  }

  const allUsers = await db.select().from(users).orderBy(sql`${users.createdAt} DESC`);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إدارة المستخدمين والصلاحيات</h1>
          <p className="text-sm text-slate-500">إضافة مستخدمين جدد، التحكم بحالة الحسابات، وتحديد الأدوار</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      {/* نموذج إضافة مستخدم جديد */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">إضافة مستخدم جديد</h3>
        <form action={async (formData: FormData) => {
          'use server';
          const username = formData.get('username') as string;
          const password = formData.get('password') as string;
          const role = formData.get('role') as string;

          if (!username || !password) return;
          await createUser({ username, password, role });
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">اسم المستخدم</label>
            <input type="text" name="username" required placeholder="اسم الدخول" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">كلمة المرور</label>
            <input type="password" name="password" required placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">الدور / الصلاحية</label>
            <select name="role" className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
              <option value="USER">مستخدم عادي (User)</option>
              <option value="ADMIN">مدير النظام (Admin)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition shadow-sm">
              حفظ وإنشاء الحساب
            </button>
          </div>
        </form>
      </div>

      {/* جدول عرض المستخدمين */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">قائمة مستخدمي النظام</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">اسم المستخدم</th>
                <th className="p-4">الدور</th>
                <th className="p-4">حالة الحساب</th>
                <th className="p-4">تاريخ الإنشاء</th>
                <th className="p-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{u.username}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                      {u.role === 'ADMIN' ? 'مدير النظام' : 'مستخدم عادي'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'نشط (Active)' : 'معطل (Disabled)'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                  <td className="p-4">
                    <form action={async () => {
                      'use server';
                      await toggleUserStatus(u.id, !u.isActive);
                    }}>
                      <button type="submit" className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${u.isActive ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'}`}>
                        {u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}