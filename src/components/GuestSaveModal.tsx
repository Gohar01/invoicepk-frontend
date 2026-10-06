import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, CheckCircle2, Lock, ArrowRight, LogIn } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PhoneInput from './PhoneInput';

interface GuestSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPostDownload?: boolean;
  guestData: {
    businessName: string;
    fullName?: string;
    phone?: string;
    email?: string;
    address?: string;
    ntn?: string;
    logoUrl?: string;
    client: {
      name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    invoice: {
      currency: string;
      issueDate: string;
      dueDate: string;
      gstPercent: number;
      notes?: string;
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    };
  };
}

export default function GuestSaveModal({ isOpen, onClose, isPostDownload = false, guestData }: GuestSaveModalProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [fullName, setFullName] = useState(guestData.fullName || guestData.businessName || '');
  const [businessName, setBusinessName] = useState(guestData.businessName || '');
  const [email, setEmail] = useState(guestData.email || '');
  const [phone, setPhone] = useState(guestData.phone || '');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let authToken = '';

      if (mode === 'register') {
        if (!password || password.length < 6) {
          setError('Password must be at least 6 characters.');
          setSubmitting(false);
          return;
        }

        // 1. Register new user
        const regRes = await api.post('/auth/register', {
          fullName: fullName.trim() || businessName.trim() || 'Business Owner',
          email: email.trim(),
          password,
          businessName: businessName.trim() || 'My Business',
          phone: phone.trim()
        });
        authToken = regRes.data.token;

        // 2. Fetch user profile
        const profileRes = await api.get('/profile', {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        // 3. Update address and NTN if provided
        if (guestData.address || guestData.ntn) {
          try {
            await api.put('/profile', {
              fullName: fullName.trim() || businessName.trim(),
              businessName: businessName.trim(),
              phone: phone.trim(),
              address: guestData.address || '',
              ntn: guestData.ntn || ''
            }, {
              headers: { Authorization: `Bearer ${authToken}` }
            });
          } catch (e) {
            console.warn('Profile details update skipped:', e);
          }
        }

        login(authToken, profileRes.data);
      } else {
        // Sign in existing user
        const loginRes = await api.post('/auth/login', {
          email: email.trim(),
          password
        });
        authToken = loginRes.data.token;

        const profileRes = await api.get('/profile', {
          headers: { Authorization: `Bearer ${authToken}` }
        });

        login(authToken, profileRes.data);
      }

      // 4. Create the client under this user's account
      const clientRes = await api.post('/clients', {
        name: guestData.client.name.trim() || 'Walk-in Client',
        email: guestData.client.email?.trim() || null,
        phone: guestData.client.phone?.trim() || null,
        address: guestData.client.address?.trim() || null
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const createdClient = clientRes.data;

      // 5. Create the invoice
      const invoiceRes = await api.post('/invoices', {
        clientId: createdClient.id,
        issueDate: guestData.invoice.issueDate,
        dueDate: guestData.invoice.dueDate,
        currency: guestData.invoice.currency,
        gstPercent: guestData.invoice.gstPercent,
        notes: guestData.invoice.notes,
        items: guestData.invoice.items
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      toast.success(
        mode === 'register'
          ? 'Account created and invoice saved to your dashboard!'
          : 'Invoice saved to your account!'
      );

      onClose();
      navigate(`/invoices/${invoiceRes.data.id}`);
    } catch (err: any) {
      console.error('Failed to save guest invoice:', err);
      const errMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors && Object.values(err.response.data.errors)[0] as string) ||
        'Failed to save invoice. Please try again.';
      setError(typeof errMsg === 'string' ? errMsg : 'Failed to save invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2">
            <Sparkles size={12} />
            <span>{isPostDownload ? '🎉 Invoice Downloaded Successfully!' : '1-Click Save & Manage'}</span>
          </div>

          <h3 className="text-xl font-bold tracking-tight">
            {isPostDownload
              ? (mode === 'register' ? 'Save Invoice & Track Payment' : 'Sign In to Save Downloaded Invoice')
              : (mode === 'register' ? 'Save Invoice to Dashboard' : 'Sign In to Save Invoice')}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isPostDownload
              ? (mode === 'register'
                  ? 'Your PDF was downloaded! Create a free account in 10 seconds to track when this client pays and avoid retyping details next time.'
                  : 'Sign in to link this downloaded invoice and client directly to your account.')
              : (mode === 'register'
                  ? 'Create a free account to track payments, re-send PDFs, and manage your clients seamlessly.'
                  : 'Sign in to automatically link this invoice and client to your account.')}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200 text-xs font-bold text-center bg-slate-50">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-3 transition-colors ${
              mode === 'register'
                ? 'bg-white text-slate-900 border-b-2 border-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            New to InvoicePK? Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-3 transition-colors ${
              mode === 'login'
                ? 'bg-white text-slate-900 border-b-2 border-primary shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Already Have an Account? Log In
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3">
              {error}
            </div>
          )}

          {mode === 'register' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Business Name *</label>
                  <input
                    type="text"
                    required
                    className="input text-xs"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Logistics"
                  />
                </div>
                <div>
                  <label className="label text-xs">Your Name *</label>
                  <input
                    type="text"
                    required
                    className="input text-xs"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="input text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label className="label text-xs">Phone Number</label>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs flex items-center justify-between">
                  <span>Create Password *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Min. 6 characters</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="input text-xs pl-8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  What happens next:
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Your business profile is created, this invoice & client are automatically stored, and you gain access to live payment status tracking, PDF re-downloads, and WhatsApp sharing.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="label text-xs">Your Account Email *</label>
                <input
                  type="email"
                  required
                  className="input text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="label text-xs">Password *</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    className="input text-xs pl-8"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Logging in will add "{guestData.client.name || 'Client'}" and this {guestData.invoice.currency} invoice directly to your existing account.
              </p>
            </>
          )}

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2.5 px-4"
              disabled={submitting}
            >
              {isPostDownload ? 'Maybe Later' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Saving Invoice...
                </>
              ) : mode === 'register' ? (
                <>
                  Create Account & Save Invoice <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <LogIn size={14} /> Log In & Save Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
