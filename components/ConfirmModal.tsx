// components/ConfirmModal.tsx
'use client';

import { useState } from 'react';

interface ConfirmProps {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  triggerText: string;
  buttonClassName?: string;
}

export default function ConfirmModal({ title, message, onConfirm, triggerText, buttonClassName = "bg-red-600 text-white" }: ConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${buttonClassName}`}>
        {triggerText}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 mb-6">{message}</p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsOpen(false)} 
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={handleAction} 
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
              >
                {isLoading ? 'جاري التنفيذ...' : 'تأكيد التنفيذ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}