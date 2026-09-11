// components/PrintButton.tsx
'use client';

export default function PrintButton({ label = 'طباعة / حفظ PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm flex items-center gap-2"
    >
      🖨️ {label}
    </button>
  );
}