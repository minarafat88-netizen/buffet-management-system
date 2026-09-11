// app/audit-logs/page.tsx
import { db } from '@/db';
import { auditLogs, users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function AuditLogsPage() {
  const sessionCookie = cookies().get('buffet_session_token');
  const user = sessionCookie ? JSON.parse(sessionCookie.value) : null;

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">غير مصرح لك بالوصول</h2>
          <p className="text-slate-500 mb-4">سجل العمليات مخصص لمدير النظام (Admin) فقط.</p>
          <Link href="/" className="bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-semibold">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  // جلب أحدث العمليات المسجلة في الـ Audit Log مع اسم المستخدم
  const logsList = await db.select({
    id: auditLogs.id,
    action: auditLogs.action,
    tableName: auditLogs.tableName,
    recordId: auditLogs.recordId,
    newValues: auditLogs.newValues,
    createdAt: auditLogs.createdAt,
    username: users.username,
  })
  .from(auditLogs)
  .leftJoin(users, eq(auditLogs.userId, users.id))
  .orderBy(sql`${auditLogs.createdAt} DESC`)
  .limit(50);

  return (
    <div className="flex-1 bg-slate-100 p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">سجل العمليات والرقابة (Audit Logs)</h1>
          <p className="text-sm text-slate-500">الصندوق الأسود لتتبع كافة التعديلات والعمليات الحساسة في النظام</p>
        </div>
        <Link href="/" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition">
          الرئيسية
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">العمليات الأخيرة المسجلة</h3>
          <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">إجمالي السجلات المعروضة: {logsList.length}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4">المستخدم</th>
                <th className="p-4">العملية / الإجراء</th>
                <th className="p-4">الجدول المستهدف</th>
                <th className="p-4">رقم العنصر</th>
                <th className="p-4">البيانات الجديدة (JSON)</th>
                <th className="p-4">التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {logsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">لا توجد عمليات مسجلة حتى الآن</td>
                </tr>
              ) : (
                logsList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-800">{log.username || 'مستخدم غير معروف'}</td>
                    <td className="p-4">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-xs">{log.tableName}</td>
                    <td className="p-4 text-slate-600">#{log.recordId}</td>
                    <td className="p-4 font-mono text-xs text-slate-500 max-w-xs truncate" title={JSON.stringify(log.newValues)}>
                      {log.newValues ? JSON.stringify(log.newValues) : '---'}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleString('ar-EG')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}