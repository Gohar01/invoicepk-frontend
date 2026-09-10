import { useEffect, useState } from 'react';
import { X, Download, ExternalLink, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number | string | null;
  invoiceNumber: string;
}

export default function PdfPreviewModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
}: PdfPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPdf = async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError(null);

    // Clean previous object URL if any
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }

    try {
      const res = await api.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (err: any) {
      console.error('Failed to load PDF preview:', err);
      setError('Unable to load invoice PDF preview. Please check your connection or download directly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchPdf();
    } else {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
      setError(null);
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [isOpen, invoiceId]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${invoiceNumber || 'invoice'}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleOpenNewTab = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full max-w-5xl h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                Invoice #{invoiceNumber}
              </h3>
              <p className="text-xs text-slate-500 hidden sm:block">PDF Document Preview</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {pdfUrl && (
              <>
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  title="Open in new browser tab"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">New Tab</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download PDF to computer"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors shadow-xs"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Download</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-600">Generating invoice preview...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-3 max-w-md p-6 text-center bg-white rounded-xl shadow-sm border border-red-100 mx-4">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Preview Generation Failed</p>
                <p className="text-xs text-slate-500 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={fetchPdf}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 border border-primary/20 rounded-lg transition-colors"
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          )}

          {!loading && !error && pdfUrl && (
            <iframe
              src={`${pdfUrl}#toolbar=1&view=FitH`}
              title={`Invoice ${invoiceNumber} Preview`}
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
