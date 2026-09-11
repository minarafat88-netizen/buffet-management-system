'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md border border-slate-200 p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">حدث خطأ</h2>
        <p className="text-sm text-slate-600 mb-4">
          {error.message || 'فشل في تحميل الصفحة، يرجى المحاولة مرة أخرى.'}
        </p>
        <button
          onClick={() => reset()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
