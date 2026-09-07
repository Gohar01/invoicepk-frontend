import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, CheckCircle, Send, X, Loader2 } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'primary' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmVariant;
  confirmIcon?: React.ReactNode;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  confirmIcon,
  isLoading = false,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          defaultIcon: <Trash2 className="w-5 h-5 text-red-600" />,
          btnClass: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          defaultIcon: <Send className="w-5 h-5 text-blue-600" />,
          btnClass: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
        };
      case 'primary':
      default:
        return {
          iconBg: 'bg-emerald-100',
          defaultIcon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
          btnClass: 'bg-primary hover:bg-primary-dark text-white shadow-sm',
        };
    }
  };

  const { iconBg, defaultIcon, btnClass } = getVariantStyles();

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-200"
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Close X Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
            {confirmIcon ?? defaultIcon}
          </div>
          <h3 className="text-lg font-bold text-gray-900 pr-6 leading-tight">{title}</h3>
        </div>

        {/* Body Message */}
        <div className="text-sm text-gray-600 leading-relaxed pl-0.5">{message}</div>

        {/* Footer Actions */}
        <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
