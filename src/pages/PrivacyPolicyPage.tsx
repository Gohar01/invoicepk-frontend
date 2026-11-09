import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, ExternalLink, Sparkles, Building2, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy — InvoicePK";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary selection:text-slate-950 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight">
              Invoice<span className="text-primary">PK</span>
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/quick-invoice" className="text-slate-400 hover:text-white transition-colors hidden sm:inline">
              Free Generator
            </Link>
            <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link
              to="/login"
              className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-lg font-bold transition-all"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Hero Title */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3.5 py-1.5 rounded-full mb-4">
            <ShieldCheck size={14} /> Official Policy &amp; Security Standards
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-sm">
            Last Updated &amp; Effective: <span className="text-slate-200 font-medium">November 9, 2026</span>
          </p>
        </div>

        {/* Executive Summary Box */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/10 rounded-2xl p-6 md:p-8 mb-12 shadow-xl">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Sparkles size={18} className="text-primary" /> Key Commitments to Your Business
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            <div className="flex items-start gap-2.5">
              <Lock size={16} className="text-primary shrink-0 mt-0.5" />
              <span><strong>Zero Data Selling:</strong> We never sell, rent, or monetize your client data, bills, or contact records to any third party.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText size={16} className="text-primary shrink-0 mt-0.5" />
              <span><strong>Your Data Stays Yours:</strong> All client names, prices, and invoice details remain strictly confidential to your business.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <UserCheck size={16} className="text-primary shrink-0 mt-0.5" />
              <span><strong>Google OAuth Protection:</strong> Google sign-in data is used exclusively to authenticate your identity; no data is shared with AI models.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Building2 size={16} className="text-primary shrink-0 mt-0.5" />
              <span><strong>Pakistani Business Compliance:</strong> Data storage follows modern encryption standards with support for FBR NTN/STRN transparency.</span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">1.</span> Introduction &amp; Scope
            </h3>
            <p>
              Welcome to <strong>InvoicePK</strong> (accessible at <a href="https://invoicepk.online" className="text-primary hover:underline">https://invoicepk.online</a>). InvoicePK is a billing automation and invoice management platform engineered for Pakistani businesses, agencies, freelancers, contractors, and enterprises.
            </p>
            <p>
              This Privacy Policy explains how we collect, use, disclose, and safeguard your personal and business data when you visit our website, use our instant PDF invoice generator, register an account, or upgrade to our Pro plans.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">2.</span> Information We Collect
            </h3>
            <p>We collect information in the following ways depending on how you use InvoicePK:</p>
            
            <div className="space-y-4 pl-2">
              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">A. Account &amp; Profile Information</h4>
                <p className="text-xs text-slate-400">
                  When you sign up or complete your profile, we collect your Full Name, Business/Trading Name, Business Email Address, Phone Number, Business Physical Address, National Tax Number (NTN), Sales Tax Registration Number (STRN), and uploaded company logo.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">B. Google Account Data (Google Sign-In)</h4>
                <p className="text-xs text-slate-400">
                  If you choose to sign in using Google 1-Tap or "Continue with Google", we receive your basic profile data (Full Name, verified Email Address, and profile avatar URL) from Google Identity Services. We do not access your Google Drive, contacts, private emails, or calendar.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">C. Invoicing &amp; Customer Records</h4>
                <p className="text-xs text-slate-400">
                  When you draft, save, or download invoices, you provide information regarding your customers (Customer/Client Name, Client Phone, Email, Address), itemized line item descriptions, quantities, unit prices, custom industry fields (such as Bilty No, Vehicle No, PO Number, Site Location, Batch No, Expiry Date), and applicable tax rates (FBR 18% GST or provincial sales tax).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-1">D. Subscription &amp; Payment Proofs</h4>
                <p className="text-xs text-slate-400">
                  For InvoicePK Pro activations via Raast or bank transfers, we collect your submitted Transaction ID / Reference Number, sender account name, and contact phone number to manually verify the transaction and activate your subscription. We do not collect or store full credit card numbers or banking passwords on our servers.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">3.</span> How We Use Your Information
            </h3>
            <p>We use the information collected strictly for legitimate business and platform operations, including:</p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li>Generating high-resolution, print-ready A4 PDF invoices and receipts.</li>
              <li>Maintaining your client directory and invoice history so you can track Paid, Pending, and Overdue balances.</li>
              <li>Sending transactional system emails (invoice delivery to clients, overdue payment reminders, password reset links) via our email delivery infrastructure.</li>
              <li>Authenticating your login sessions securely using encrypted JSON Web Tokens (JWT).</li>
              <li>Providing dedicated customer support via WhatsApp and email.</li>
              <li>Diagnosing technical issues, preventing fraud, and ensuring platform reliability.</li>
            </ul>
          </section>

          {/* Section 4 - Crucial for Google OAuth approval */}
          <section className="space-y-3 bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 md:p-6">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">4.</span> Google API Services User Data Policy Compliance
            </h3>
            <p className="text-xs leading-relaxed text-slate-300">
              InvoicePK's use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">Google API Services User Data Policy <ExternalLink size={12} /></a>, including the Limited Use requirements.
            </p>
            <p className="text-xs leading-relaxed text-slate-300">
              Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 pl-2">
              <li>We only request the minimum required scopes (<code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400">openid</code>, <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400">email</code>, <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400">profile</code>) to authenticate your user account.</li>
              <li>We <strong>do NOT</strong> sell your Google user data to advertisers, data brokers, or third parties.</li>
              <li>We <strong>do NOT</strong> use or transfer Google user data for serving personalized, re-targeted, or interest-based advertising.</li>
              <li>We <strong>do NOT</strong> use Google user data to train generalized AI or machine learning models.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">5.</span> Data Storage, Retention &amp; Security
            </h3>
            <p>
              We implement industry-standard administrative, technical, and physical safeguards to protect your personal and business records. All network communications are encrypted in transit using Transport Layer Security (TLS 1.2 / 1.3 / HTTPS). Passwords are never stored in plaintext and are hashed using bcrypt with cryptographically secure salt factors.
            </p>
            <p className="text-xs text-slate-400">
              Your invoice and client records are retained as long as your account remains active or as required by tax and corporate record-keeping regulations. You may delete individual invoices, clients, or request full account termination at any time.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">6.</span> Third-Party Service Providers
            </h3>
            <p>
              We partner with trusted third-party cloud infrastructure providers who adhere to strict data privacy and security standards:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5">
                <p className="font-bold text-white">Google Identity Services</p>
                <p className="text-slate-400 mt-1">Powers secure 1-Tap OAuth authentication without password storage.</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5">
                <p className="font-bold text-white">Resend API</p>
                <p className="text-slate-400 mt-1">Delivers outgoing transactional invoices and payment reminder emails.</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5">
                <p className="font-bold text-white">Vercel &amp; Railway</p>
                <p className="text-slate-400 mt-1">Provides global edge hosting for our React web app and scalable ASP.NET Core API.</p>
              </div>
              <div className="bg-slate-900 border border-white/5 rounded-xl p-3.5">
                <p className="font-bold text-white">PostgreSQL Cloud Database</p>
                <p className="text-slate-400 mt-1">Stores encrypted user and invoice relational records with automated backups.</p>
              </div>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">7.</span> Your Rights &amp; Data Deletion Requests
            </h3>
            <p>
              Regardless of your location, you have complete sovereignty over your data on InvoicePK:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-400 pl-2">
              <li><strong>Access &amp; Export:</strong> You can download all your invoices as PDF files at any time.</li>
              <li><strong>Rectification:</strong> You can edit your company details, tax registration numbers, and client records directly from the Settings and Clients dashboards.</li>
              <li><strong>Account Deletion:</strong> If you wish to delete your account and all associated invoice and customer data permanently, you can submit a deletion request to <a href="mailto:support@invoicepk.online" className="text-primary hover:underline">support@invoicepk.online</a>. We will process and purge your records within 72 hours.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">8.</span> Cookies &amp; Local Storage
            </h3>
            <p className="text-xs text-slate-400">
              We use browser Local Storage and essential session cookies strictly to keep you authenticated and remember your generator preferences (such as custom columns and currency symbols). We do not use intrusive third-party cross-site advertising cookies.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">9.</span> Changes to this Privacy Policy
            </h3>
            <p className="text-xs text-slate-400">
              We may update this Privacy Policy from time to time to reflect enhancements to our platform or changes in Pakistani tax and regulatory frameworks. Material changes will be indicated by an updated "Last Updated" date at the top of this page.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-3 pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-primary">10.</span> Contact Us
            </h3>
            <p className="text-xs text-slate-400">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your data privacy on InvoicePK, please contact our support desk:
            </p>

            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 space-y-2 text-xs max-w-md">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={14} className="text-primary shrink-0" />
                <span>Email: <a href="mailto:support@invoicepk.online" className="text-white font-bold hover:text-primary">support@invoicepk.online</a></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Building2 size={14} className="text-primary shrink-0" />
                <span>Headquarters: Lahore, Pakistan</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck size={14} className="text-primary shrink-0" />
                <span>Platform: <a href="https://invoicepk.online" className="text-primary hover:underline">https://invoicepk.online</a></span>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-10 text-slate-500 text-xs mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              Invoice<span className="text-primary">PK</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Pakistan's Digital Billing Engine</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/quick-invoice" className="hover:text-white transition-colors">Invoice Generator</Link>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
          </div>

          <div>
            &copy; {new Date().getFullYear()} InvoicePK. All Rights Reserved. • Made in Pakistan 🇵🇰
          </div>
        </div>
      </footer>
    </div>
  );
}
