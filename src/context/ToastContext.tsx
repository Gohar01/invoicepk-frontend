import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration?: number) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      const autoDismissTime = duration ?? (type === 'error' ? 4500 : type === 'warning' ? 4000 : 3500);
      setTimeout(() => {
        removeToast(id);
      }, autoDismissTime);
    },
    [removeToast]
  );

  const toast = {
    success: (msg: string, d?: number) => showToast(msg, 'success', d),
    error: (msg: string, d?: number) => showToast(msg, 'error', d),
    warning: (msg: string, d?: number) => showToast(msg, 'warning', d),
    info: (msg: string, d?: number) => showToast(msg, 'info', d),
  };

  return (
    <ToastContext.Provider value={{ showToast, toast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="assertive"
        className="fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col gap-2.5 max-w-sm w-full px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : t.type === 'error'
                ? 'bg-red-50/95 border-red-200 text-red-900 shadow-red-500/10'
                : t.type === 'warning'
                ? 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-500/10'
                : 'bg-blue-50/95 border-blue-200 text-blue-900 shadow-blue-500/10'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>

            <p className="text-sm font-medium leading-snug flex-1 pr-1 break-words">{t.message}</p>

            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors p-0.5 rounded-md hover:bg-black/5"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
