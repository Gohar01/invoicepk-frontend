import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  X, 
  Building2, 
  MessageCircle, 
  Copy, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [billingCycle, setBillingCycle] = useState<'lifetime' | 'monthly'>('lifetime');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [senderName, setSenderName] = useState(user?.businessName || user?.fullName || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proofSubmitted, setProofSubmitted] = useState(false);

  useEffect(() => {
    document.title = "Pricing & Pro Plans — InvoicePK";
  }, []);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenUpgrade = () => {
    setShowPaymentModal(true);
  };

  const handleWhatsAppDirect = () => {
    const planText = billingCycle === 'lifetime' ? 'Lifetime Early Adopter Deal (Rs. 2,999)' : 'Pro Monthly Plan (Rs. 999/mo)';
    const text = encodeURIComponent(
      `Assalam-o-Alaikum! I want to activate InvoicePK ${planText} for my business: "${senderName || 'My Business'}". Please assist me with activation.`
    );
    window.open(`https://wa.me/923000000000?text=${text}`, '_blank');
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.warning('Please enter your Transaction ID / Reference Number.');
      return;
    }
    setSubmittingProof(true);
    // Simulate activation submission
    setTimeout(() => {
      setSubmittingProof(false);
      setProofSubmitted(true);
      toast.success('Payment proof received! Our team will verify and activate your Pro status within 2 hours.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-primary selection:text-black">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            Invoice<span className="text-primary">PK</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-0.5 rounded-full text-xs font-semibold">
            <Sparkles size={12} /> Pro Access
          </span>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link to="/quick-invoice" className="text-slate-300 hover:text-white transition-colors">
            Quick Generator
          </Link>
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-slate-950 font-bold px-4 py-2 rounded-lg hover:bg-primary-dark transition-all text-xs sm:text-sm"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-slate-300 hover:text-white transition-colors px-3 py-2 text-xs sm:text-sm"
            >
              Log In
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold mb-6">
          <Sparkles size={14} />
          <span>Simple, Transparent Pricing For Pakistani Businesses</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Upgrade Your Business to <span className="text-primary">InvoicePK Pro</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10">
          Remove software watermarks, upload high-definition logos, unlock unlimited invoices, and track client payments in real time.
        </p>

        {/* Billing Switcher */}
        <div className="inline-flex items-center bg-slate-900 border border-white/10 rounded-full p-1.5 mb-12 shadow-inner">
          <button
            type="button"
            onClick={() => setBillingCycle('lifetime')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              billingCycle === 'lifetime'
                ? 'bg-primary text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🔥 Early Bird Lifetime Deal</span>
            <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black tracking-wider">
              Limited (First 50)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-primary text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Plan
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          {/* Card 1: Free Starter */}
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 flex flex-col justify-between">
            <div>
              <div className="inline-block bg-white/5 border border-white/10 text-slate-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                Starter Plan
              </div>
              <h3 className="text-2xl font-bold mb-2">Free Forever</h3>
              <p className="text-slate-400 text-xs mb-6">
                Perfect for freelancers and sole proprietors sending occasional bills.
              </p>

              <div className="text-4xl font-extrabold mb-8">
                Rs. 0 <span className="text-xs text-slate-400 font-normal">/ forever</span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300 mb-8 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Up to 5 invoices per month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Save up to 3 clients in directory</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Standard A4 print-ready PDF export</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-primary flex-shrink-0" />
                  <span>Federal 18% GST and provincial tax presets</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 line-through">
                  <X size={16} className="flex-shrink-0 text-slate-600" />
                  <span>Remove "InvoicePK" watermark</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 line-through">
                  <X size={16} className="flex-shrink-0 text-slate-600" />
                  <span>Custom company logo & stamp</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 line-through">
                  <X size={16} className="flex-shrink-0 text-slate-600" />
                  <span>Real-time payment tracking & audit</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/quick-invoice')}
              className="w-full py-3.5 rounded-xl border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-colors text-center"
            >
              Use Free Generator
            </button>
          </div>

          {/* Card 2: Pro Tier */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-primary rounded-3xl p-8 relative flex flex-col justify-between shadow-[0_0_40px_rgba(0,193,106,0.15)]">
            <div className="absolute -top-3.5 right-6 bg-primary text-slate-950 text-[11px] font-black uppercase px-3.5 py-1 rounded-full shadow-md">
              Most Popular
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">
                <Sparkles size={12} /> Pro Business
              </div>
              <h3 className="text-2xl font-bold mb-2">InvoicePK Pro</h3>
              <p className="text-slate-400 text-xs mb-6">
                Complete billing automation for agencies, traders, and growing businesses.
              </p>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl font-extrabold text-white">
                  {billingCycle === 'lifetime' ? 'Rs. 2,999' : 'Rs. 999'}
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  {billingCycle === 'lifetime' ? 'one-time lifetime access' : '/ month'}
                </span>
              </div>
              {billingCycle === 'lifetime' && (
                <p className="text-[11px] text-emerald-400 font-semibold mb-6">
                  Pay once, use forever. No monthly subscriptions, ever.
                </p>
              )}

              <div className="space-y-3.5 text-xs text-slate-200 mb-8 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>Unlimited Invoices</strong> with zero monthly caps</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>Unlimited Clients</strong> with automatic transaction histories</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>100% White-Label:</strong> Zero InvoicePK watermark on PDFs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>Custom Brand Logo & Signature/Stamp</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>Multi-Currency:</strong> PKR, USD, GBP, EUR, AED, SAR</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>Live Payment Tracking:</strong> Paid, Pending, & Overdue analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    <Check size={12} />
                  </div>
                  <span><strong>VIP WhatsApp Support</strong> with our founding engineering team</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenUpgrade}
              className="w-full py-4 rounded-xl bg-primary hover:bg-primary-dark text-slate-950 font-extrabold text-sm transition-all shadow-[0_0_30px_rgba(0,193,106,0.3)] flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              <span>Claim Pro Access Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="max-w-4xl mx-auto px-6 py-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
            <Building2 size={20} />
          </div>
          <h4 className="font-bold text-sm">Pakistani Banking Ready</h4>
          <p className="text-xs text-slate-400">Pay via Raast, NayaPay, JazzCash, EasyPaisa, or any Pakistani commercial bank.</p>
        </div>
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
            <ShieldCheck size={20} />
          </div>
          <h4 className="font-bold text-sm">FBR Tax Audit Compliant</h4>
          <p className="text-xs text-slate-400">Standardized sales tax calculations compliant with FBR, PRA, and SRB guidelines.</p>
        </div>
        <div className="space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center font-bold">
            <MessageCircle size={20} />
          </div>
          <h4 className="font-bold text-sm">Dedicated WhatsApp Onboarding</h4>
          <p className="text-xs text-slate-400">Need help migrating your client list? Our team assists you directly on WhatsApp.</p>
        </div>
      </section>

      {/* Payment / Upgrade Modal */}
      {showPaymentModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 border-b border-white/10 relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>

              <div className="inline-flex items-center gap-1.5 bg-primary/20 text-primary px-3 py-0.5 rounded-full text-xs font-bold mb-2">
                <Sparkles size={12} /> Instant Activation
              </div>
              <h3 className="text-xl font-bold">
                Activate {billingCycle === 'lifetime' ? 'Lifetime Pro (Rs. 2,999)' : 'Pro Monthly (Rs. 999)'}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Transfer via Raast or any Pakistani bank account, then share your proof for immediate activation.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {proofSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-primary mx-auto flex items-center justify-center font-bold">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-white">Payment Proof Submitted!</h4>
                  <p className="text-slate-300 max-w-sm mx-auto">
                    Thank you! Our team is reviewing your transaction. Your account will be upgraded to <strong>InvoicePK Pro</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setShowPaymentModal(false); navigate('/dashboard'); }}
                    className="btn-primary py-2.5 px-6 font-bold text-xs"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {/* Bank Account Details Card */}
                  <div className="bg-slate-950 border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400 font-medium">Bank / EMI:</span>
                      <span className="font-bold text-white">NayaPay / Raast Instant Transfer</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400 font-medium">Account Title:</span>
                      <span className="font-bold text-white">GOHAR REHMAN</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400 font-medium">Raast ID / Mobile:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">03135118742</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('03135118742', 'Raast ID')}
                          className="text-slate-400 hover:text-white"
                          title="Copy Raast ID"
                        >
                          {copiedField === 'Raast ID' ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Amount Due:</span>
                      <span className="font-bold text-primary text-sm">
                        {billingCycle === 'lifetime' ? 'PKR 2,999' : 'PKR 999'}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click WhatsApp Shortcut */}
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-emerald-200">Prefer WhatsApp Activation?</p>
                      <p className="text-[11px] text-emerald-400/80">Send your screenshot directly to our support line for instant setup.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleWhatsAppDirect}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle size={14} /> WhatsApp Us
                    </button>
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleProofSubmit} className="space-y-3 pt-2">
                    <p className="font-bold text-white text-xs uppercase tracking-wider">Or submit transaction details here:</p>
                    
                    <div>
                      <label className="label text-[11px]">Your Business Name or Account Email *</label>
                      <input
                        type="text"
                        required
                        className="input text-xs bg-slate-950 border-white/10"
                        placeholder="e.g. Apex Traders / you@company.com"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label text-[11px]">WhatsApp or Phone Number</label>
                      <input
                        type="text"
                        className="input text-xs bg-slate-950 border-white/10"
                        placeholder="e.g. 0300 1234567"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="label text-[11px]">Transaction ID / Reference Number *</label>
                      <input
                        type="text"
                        required
                        className="input text-xs bg-slate-950 border-white/10"
                        placeholder="e.g. 613511 or Bank Trx Ref"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(false)}
                        className="btn-secondary text-xs py-2.5 px-4"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingProof}
                        className="btn-primary text-xs py-2.5 px-5 flex items-center gap-1.5 font-bold"
                      >
                        {submittingProof ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <span>Submit Proof & Activate</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
