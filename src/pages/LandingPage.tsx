import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Globe, 
  FileText,
  Users,
  Settings,
  Mail
} from 'lucide-react';
import dashboardMockup from '../assets/dashboard_mockup.png';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'sme' | 'freelancer'>('sme');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden selection:bg-primary selection:text-black scroll-smooth">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            Invoice<span className="text-primary">PK</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
          <a href="#dashboard-preview" className="hover:text-white transition-colors">Preview</a>
          <a href="#contact" className="hover:text-primary transition-colors font-semibold">Contact Us</a>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-semibold hover:text-primary transition-colors px-4 py-2"
          >
            Log In
          </button>
          <button 
            onClick={() => navigate('/login?signup=true')} 
            className="bg-primary text-slate-950 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Create Free Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Pakistan's Simplest Professional Invoicing Tool
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
          Create, Manage, and Print Professional Invoices in <span className="text-primary">30 Seconds</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Easily generate clean PDF invoices, track paid or unpaid balances by currency, and manage your client directory—built for local and global freelancers, agencies, and small businesses.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button 
            onClick={() => navigate('/login?signup=true')} 
            className="w-full sm:w-auto bg-primary text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-primary-dark hover:scale-[1.03] shadow-[0_0_30px_rgba(0,193,106,0.3)] transition-all flex items-center justify-center gap-2"
          >
            Start Invoicing Free <ArrowRight size={18} />
          </button>
          <a 
            href="#solutions" 
            className="w-full sm:w-auto bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            Explore Solutions
          </a>
        </div>

        {/* Dashboard Mockup */}
        <div id="dashboard-preview" className="scroll-mt-28 relative max-w-5xl mx-auto rounded-2xl border border-white/10 bg-slate-900/50 p-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
          <img 
            src={dashboardMockup} 
            alt="InvoicePK Dashboard User Interface Mockup" 
            className="w-full h-auto rounded-xl object-cover filter brightness-[0.9]"
          />
        </div>
      </section>

      {/* Target Audience Solutions Section */}
      <section id="solutions" className="scroll-mt-24 relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for Your Business Structure</h2>
          <p className="text-slate-400">Manage your transactions seamlessly, whether you are billing local customers in PKR or global clients in foreign currencies.</p>
        </div>

        {/* Segment Tabs Switcher */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-slate-900/80 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('sme')}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'sme' 
                  ? 'bg-primary text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} />
              Small Businesses & Retailers
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 ${
                activeTab === 'freelancer' 
                  ? 'bg-primary text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe size={16} />
              Freelancers & Agencies
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center bg-slate-900/30 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
          {activeTab === 'sme' ? (
            <>
              <div className="space-y-6">
                <div className="inline-flex bg-primary-light/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  Local Business Focus
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Organize Your Billing with Custom Taxes & Discounts
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Ditch messy registers and hand-written receipts. InvoicePK lets you generate clean, printable invoices with itemized calculations.
                </p>
                <ul className="space-y-3.5">
                  {[
                    "Itemized billing layouts with automatically calculated totals",
                    "Add custom tax rates (e.g., GST) or application discounts per invoice",
                    "Print bills directly from your browser in a clean, readable layout",
                    "Include customizable payment notes (bank account, EasyPaisa, or Raast details)"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle className="text-primary mt-0.5 shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Professional Invoice Layout</span>
                </div>
                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <h4 className="font-bold text-sm">INVOICE #INV-0024</h4>
                      <p className="text-[10px] text-slate-500">Date: August 11, 2026</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-sm text-primary">InvoicePK</h4>
                      <p className="text-[10px] text-slate-500">Lahore, Pakistan</p>
                    </div>
                  </div>
                  <div className="border-b border-white/10 my-2" />
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Bill To:</div>
                  <div className="text-white">Al-Rahman Enterprise</div>
                  <div className="border-b border-white/10 my-2" />
                  <div className="flex justify-between"><span>Web Design Services</span><span>PKR 45,000</span></div>
                  <div className="flex justify-between text-slate-400"><span>Taxes / GST (16%)</span><span>PKR 7,200</span></div>
                  <div className="flex justify-between text-slate-400"><span>Discount (5%)</span><span>- PKR 2,250</span></div>
                  <div className="border-b border-white/10 my-2" />
                  <div className="flex justify-between font-bold text-sm text-white"><span>TOTAL AMOUNT</span><span>PKR 49,950</span></div>
                  <div className="border-b border-white/10 my-2" />
                  <div className="text-[10px] text-slate-500">Payment Info: Send to Raast ID or Bank Account listed in invoice footer.</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="inline-flex bg-primary-light/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  Freelancer & Remote Focus
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Track Multi-Currency Billings in One Place
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Manage both local and international clients easily. Create invoices in different currencies and track their payment statuses.
                </p>
                <ul className="space-y-3.5">
                  {[
                    "Supports multiple currencies (PKR, USD, EUR, GBP, and more)",
                    "Maintain a client directory with client billing addresses and details",
                    "Track active balances separately per currency on your dashboard",
                    "Add custom digital signatures and company branding to your exported PDFs"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle className="text-primary mt-0.5 shrink-0" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Client Balance Details</span>
                  <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full">SENT</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold">Vertex Tech Solutions</h4>
                      <p className="text-xs text-slate-500">Due: August 25, 2026</p>
                    </div>
                    <span className="text-sm font-bold text-white">$1,500.00</span>
                  </div>
                  <div className="bg-slate-950/80 border border-white/5 p-3.5 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-slate-400">Invoice Number:</span><span className="text-white font-mono">INV-2026-092</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Currency Code:</span><span className="text-primary font-bold">USD ($)</span></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <span className="text-xs text-slate-500">Client Contact:</span>
                    <span className="text-xs text-slate-300 font-mono">billing@vertextech.com</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Core Platform Features Section */}
      <section id="features" className="scroll-mt-24 relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-slate-950">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold">Simplify Your Business Admin</h2>
          <p className="text-slate-400 text-sm mt-2">Everything you need to keep your billing neat and professional without complex software learning curves.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <FileText size={22} />
            </div>
            <h3 className="font-bold text-base mb-1">Custom PDF Generation</h3>
            <p className="text-xs text-slate-400">Export clean, professionally structured invoice PDFs with your signature and logo ready for download or printing.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Users size={22} />
            </div>
            <h3 className="font-bold text-base mb-1">Client Directory</h3>
            <p className="text-xs text-slate-400">Keep full client contact logs, addresses, and details saved in your workspace for easy autocomplete when invoicing.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-primary/50 transition-colors">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Settings size={22} />
            </div>
            <h3 className="font-bold text-base mb-1">Dynamic Settings</h3>
            <p className="text-xs text-slate-400">Configure your business name, address, email, phone, logo, signature, and default tax rates for instant loading.</p>
          </div>
        </div>
      </section>

      {/* Trust & Status Tracker Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold">
              <ShieldCheck size={14} /> Tracking Made Easy
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Monitor Your Receivables in Real-Time</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track the exact lifecycles of your bills. Categorize every invoice as **Draft**, **Sent**, **Paid**, or **Overdue** to easily see who owes you and keep cash flow running smoothly.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-center">
              <div className="text-xl font-bold text-primary">Paid</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Status Tracking</div>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-center">
              <div className="text-xl font-bold text-red-500">Overdue</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">Alerts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Footer Banner */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 text-center border-t border-white/5">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
          Ready to Clean Up Your Business Admin?
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
          Create free invoices, keep client records organized, and monitor your income cleanly. No credit card required.
        </p>
        <button 
          onClick={() => navigate('/login?signup=true')} 
          className="bg-primary text-slate-950 font-bold px-8 py-4 rounded-xl hover:bg-primary-dark hover:scale-[1.03] shadow-[0_0_30px_rgba(0,193,106,0.3)] transition-all inline-flex items-center gap-2"
        >
          Create Free Account <ArrowRight size={18} />
        </button>
      </section>

      {/* Dedicated Contact Us Section */}
      <section id="contact" className="scroll-mt-24 relative max-w-7xl mx-auto px-6 py-20 border-t border-white/5 bg-slate-950">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3.5 py-1 text-xs font-semibold mb-4">
            <Mail size={14} /> Direct Support &amp; Community
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">
            Have Questions or Need Help?
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            Our support team is dedicated to supporting Pakistani freelancers, software houses, agencies, and small businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Direct Email Support Card */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mail size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Have inquiries, technical feedback, or feature requests? Drop us an email anytime and we'll reply promptly.
              </p>
            </div>
            <a 
              href="mailto:support@invoicepk.online"
              className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-slate-950 border border-primary/30 font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              support@invoicepk.online <ArrowRight size={16} />
            </a>
          </div>

          {/* Social Communities Card */}
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Follow Our Channels</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Stay updated with platform features, invoicing guides, compliance tips for IT exporters, and Pakistani fintech news.
              </p>
            </div>
            {/* Inspiration 1: Sleek Brand Pills */}
            <div className="flex items-center gap-3">
              <a 
                href="https://www.linkedin.com/company/invoicepk" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-3.5 px-4 bg-[#0077B5]/10 hover:bg-[#0077B5] border border-[#0077B5]/30 text-[#0077B5] hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs hover:shadow-[0_0_20px_rgba(0,119,181,0.4)] hover:scale-[1.02] active:scale-95 group/li"
              >
                <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                </svg>
                <span>LinkedIn</span>
              </a>
              <a 
                href="https://www.facebook.com/invoicepk.online" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 py-3.5 px-4 bg-[#1877F2]/10 hover:bg-[#1877F2] border border-[#1877F2]/30 text-[#1877F2] hover:text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 text-xs hover:shadow-[0_0_20px_rgba(24,119,242,0.4)] hover:scale-[1.02] active:scale-95 group/fb"
              >
                <svg className="w-4 h-4 fill-current transition-colors" viewBox="0 0 24 24">
                  <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-slate-950 py-10 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              Invoice<span className="text-primary">PK</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Pakistan's Digital Billing Engine</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} InvoicePK. All Rights Reserved. • Designed &amp; Developed in Pakistan 🇵🇰
          </div>
        </div>
      </footer>

    </div>
  );
}
