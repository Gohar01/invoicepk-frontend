import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Eye, 
  Sparkles, 
  Plus, 
  Trash2, 
  Upload, 
  ShieldCheck, 
  Check, 
  Save, 
  Truck, 
  Store, 
  Briefcase, 
  Building2
} from 'lucide-react';
import api from '../services/api';
import { CURRENCY_OPTIONS, CURRENCY_SYMBOLS } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PhoneInput from '../components/PhoneInput';
import PdfPreviewModal from '../components/PdfPreviewModal';
import GuestSaveModal from '../components/GuestSaveModal';

interface LineItem {
  description: string;
  amount: number;
  customValues?: Record<string, string>;
}

const TAX_RATE_OPTIONS = [
  { label: 'No Tax (0%)',                      value: 0 },
  { label: 'Federal GST — Standard (18%)',     value: 18 },
  { label: 'Federal GST — Reduced (5%)',       value: 5 },
  { label: 'Sindh SRB — Services (13%)',       value: 13 },
  { label: 'Punjab PRA — Services (16%)',      value: 16 },
  { label: 'KPK KPRA — Services (15%)',        value: 15 },
  { label: 'Balochistan BRA — Services (15%)', value: 15 },
  { label: 'Custom rate',                      value: 'custom' },
];

export default function QuickInvoicePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sender Details
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [senderAddress, setSenderAddress] = useState(user?.address || '');
  const [senderNTN, setSenderNTN] = useState(user?.ntn || '');
  const [logoUrl, setLogoUrl] = useState<string | null>(user?.logoUrl || null);

  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Invoice Meta
  const [currency, setCurrency] = useState('PKR');
  const [taxSelection, setTaxSelection] = useState<string>('18');
  const [customRate, setCustomRate] = useState<number>(0);
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const due = new Date();
    due.setDate(due.getDate() + 30);
    return due.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Payment is due within 30 days. Thank you for your business!');

  // Custom Columns & Items
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [newColName, setNewColName] = useState('');
  const [showColInput, setShowColInput] = useState(false);
  const [items, setItems] = useState<LineItem[]>([
    { description: 'Professional Consulting / Services', amount: 15000, customValues: {} }
  ]);
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});

  // UI state
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [savingDirectly, setSavingDirectly] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Sync user info if logged in
  useEffect(() => {
    if (user) {
      if (!businessName && user.businessName) setBusinessName(user.businessName);
      if (!fullName && user.fullName) setFullName(user.fullName);
      if (!senderPhone && user.phone) setSenderPhone(user.phone);
      if (!senderEmail && user.email) setSenderEmail(user.email);
      if (!senderAddress && user.address) setSenderAddress(user.address);
      if (!senderNTN && user.ntn) setSenderNTN(user.ntn);
      if (!logoUrl && user.logoUrl) setLogoUrl(user.logoUrl);
    }
  }, [user]);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (newCurrency !== 'PKR') {
      setTaxSelection('0');
    } else {
      setTaxSelection('18');
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or WEBP image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo image must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(reader.result as string);
      toast.success('Logo added!');
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addCustomColumn = (colName: string) => {
    const trimmed = colName.trim();
    if (!trimmed || customColumns.includes(trimmed)) return;
    if (customColumns.length >= 8) {
      toast.warning('Maximum 8 custom columns allowed to preserve print formatting.');
      return;
    }
    setCustomColumns(cols => [...cols, trimmed]);
    setNewColName('');
    setShowColInput(false);
  };

  const removeCustomColumn = (colName: string) => {
    setCustomColumns(cols => cols.filter(c => c !== colName));
    setItems(itemsList => itemsList.map(item => {
      const copy = { ...(item.customValues || {}) };
      delete copy[colName];
      return { ...item, customValues: copy };
    }));
  };

  const moveColumnLeft = (idx: number) => {
    if (idx <= 0) return;
    setCustomColumns(cols => {
      const arr = [...cols];
      const temp = arr[idx - 1];
      arr[idx - 1] = arr[idx];
      arr[idx] = temp;
      return arr;
    });
  };

  const moveColumnRight = (idx: number) => {
    setCustomColumns(cols => {
      if (idx >= cols.length - 1) return cols;
      const arr = [...cols];
      const temp = arr[idx + 1];
      arr[idx + 1] = arr[idx];
      arr[idx] = temp;
      return arr;
    });
  };

  const applyPresetColumns = (preset: 'transport' | 'retail' | 'contractor' | 'services') => {
    if (preset === 'transport') {
      setIncludeDescription(false);
      setCustomColumns(['Bilty No.', 'Vehicle No.', 'Station', 'Capacity']);
      if (items.length === 1 && !items[0].description) {
        setItems([{
          description: '',
          amount: 45000,
          customValues: {
            'Bilty No.': 'BL-8921',
            'Vehicle No.': 'TK-4821',
            'Station': 'Karachi to Lahore',
            'Capacity': '20 Tons'
          }
        }]);
      }
      toast.info('Applied Transport preset with Bilty & Vehicle fields!');
    } else if (preset === 'retail') {
      setIncludeDescription(true);
      setCustomColumns(['Batch No.', 'Expiry Date', 'SKU']);
      toast.info('Applied Retail & Wholesale preset!');
    } else if (preset === 'contractor') {
      setIncludeDescription(true);
      setCustomColumns(['PO Number', 'Site Location']);
      toast.info('Applied Contractor preset!');
    } else if (preset === 'services') {
      setIncludeDescription(true);
      setCustomColumns(['Qty', 'Unit Price']);
      toast.info('Applied Qty & Unit Price preset!');
    }
  };

  const addItem = () =>
    setItems(i => [...i, { description: '', amount: 0, customValues: {} }]);

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(i => i.filter((_, j) => j !== idx));
    setItemErrors(errs => {
      const copy = { ...errs };
      delete copy[idx];
      return copy;
    });
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(i => {
      const updated = i.map((item, j) => j === idx ? { ...item, [field]: value } : item);
      if (includeDescription && !updated[idx].description.trim()) {
        setItemErrors(errs => ({ ...errs, [idx]: 'Description is required' }));
      } else {
        setItemErrors(errs => {
          const copy = { ...errs };
          delete copy[idx];
          return copy;
        });
      }
      return updated;
    });
  };

  const updateCustomFieldValue = (itemIdx: number, colName: string, value: string) => {
    setItems(i => i.map((item, j) => {
      if (j !== itemIdx) return item;
      const updatedCustomValues = {
        ...(item.customValues || {}),
        [colName]: value
      };

      let updatedAmount = item.amount;
      const qCol = customColumns.find(c => /^(qty|quantity)$/i.test(c.trim()));
      const pCol = customColumns.find(c => /^(price|unit\s*price|rate)$/i.test(c.trim()));
      if (qCol && pCol && (colName === qCol || colName === pCol)) {
        const qVal = parseFloat(updatedCustomValues[qCol] || '0') || 0;
        const pVal = parseFloat(updatedCustomValues[pCol] || '0') || 0;
        if (qVal > 0 && pVal > 0) {
          updatedAmount = qVal * pVal;
        }
      }

      return {
        ...item,
        amount: updatedAmount,
        customValues: updatedCustomValues
      };
    }));
  };

  const gstPercent = taxSelection === 'custom' ? customRate : parseFloat(taxSelection);
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const subTotal = items.reduce((s, i) => s + Math.max(i.amount || 0, 0), 0);
  const gstAmount = Math.round(subTotal * (gstPercent / 100) * 100) / 100;
  const total = subTotal + gstAmount;

  // Build the payload required for both guest preview and save
  const buildInvoicePayload = () => {
    const activeCols = [
      ...(includeDescription ? ['Description'] : []),
      ...customColumns
    ];

    const preparedItems = items.map(i => {
      const mainDesc = includeDescription
        ? (i.description.trim() || 'Item')
        : (customColumns.length > 0 && i.customValues?.[customColumns[0]] ? i.customValues[customColumns[0]] : 'Item');

      const colDetails = activeCols.map(col => {
        if (col === 'Description') return `Description: ${i.description.trim() || '-'}`;
        const val = i.customValues?.[col]?.trim();
        return `${col}: ${val && val.length > 0 ? val : '-'}`;
      }).join(' | ');

      const finalDesc = `${mainDesc}\n[COLS:${activeCols.join('|')}]\n[VALS:${colDetails}]`;

      const qCol = customColumns.find(c => /^(qty|quantity)$/i.test(c.trim()));
      const pCol = customColumns.find(c => /^(price|unit\s*price|rate)$/i.test(c.trim()));
      let q = 1;
      let p = Math.max(i.amount || 0, 0);

      if (qCol && pCol) {
        const parsedQ = parseFloat(i.customValues?.[qCol] || '0');
        const parsedP = parseFloat(i.customValues?.[pCol] || '0');
        if (parsedQ > 0) q = parsedQ;
        if (parsedP > 0) p = parsedP;
      }

      if (q <= 0) q = 1;
      if (p <= 0 && i.amount > 0) p = i.amount;
      if (p <= 0) p = 0.01;

      return {
        description: finalDesc,
        quantity: q,
        unitPrice: p,
      };
    });

    return {
      businessName: businessName.trim() || 'Your Business',
      senderAddress: senderAddress.trim() || null,
      senderPhone: senderPhone.trim() || null,
      senderEmail: senderEmail.trim() || null,
      senderNTN: senderNTN.trim() || null,
      logoUrl: logoUrl || null,

      clientName: clientName.trim() || 'Valued Client',
      clientAddress: clientAddress.trim() || null,
      clientPhone: clientPhone.trim() || null,
      clientEmail: clientEmail.trim() || null,

      currency: currency,
      issueDate: issueDate,
      dueDate: dueDate,
      gstPercent: gstPercent,
      notes: notes.trim() || null,
      items: preparedItems
    };
  };

  const validateBasicForm = (): boolean => {
    if (!businessName.trim()) {
      toast.warning('Please enter your Business or Company Name.');
      return false;
    }
    if (!clientName.trim()) {
      toast.warning('Please enter your Client / Customer Name.');
      return false;
    }
    if (includeDescription && items.some(i => !i.description.trim())) {
      toast.warning('Please fill in descriptions for all line items.');
      return false;
    }
    if (items.some(i => i.amount === undefined || i.amount < 0)) {
      toast.warning('Line item amounts cannot be negative.');
      return false;
    }
    return true;
  };

  const handlePreviewPdf = async () => {
    if (!validateBasicForm()) return;

    setGeneratingPdf(true);
    try {
      const payload = buildInvoicePayload();
      const res = await api.post('/invoices/preview-guest', payload, {
        responseType: 'blob'
      });

      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
      setShowPdfModal(true);
    } catch (err: any) {
      console.error('Failed to preview invoice:', err);
      toast.error('Could not generate PDF preview. Please check your inputs.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!validateBasicForm()) return;

    setDownloadingPdf(true);
    try {
      const payload = buildInvoicePayload();
      const res = await api.post('/invoices/preview-guest', payload, {
        responseType: 'blob'
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (businessName || 'Invoice').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `Invoice_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Invoice PDF downloaded!');
    } catch (err: any) {
      console.error('Failed to download invoice:', err);
      toast.error('Could not download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (!validateBasicForm()) return;

    // If user is already authenticated, save directly into their account!
    if (isAuthenticated) {
      setSavingDirectly(true);
      try {
        const payload = buildInvoicePayload();
        // 1. Create client
        const clientRes = await api.post('/clients', {
          name: payload.clientName,
          email: payload.clientEmail,
          phone: payload.clientPhone,
          address: payload.clientAddress
        });
        // 2. Create invoice
        const invRes = await api.post('/invoices', {
          clientId: clientRes.data.id,
          issueDate: payload.issueDate,
          dueDate: payload.dueDate,
          currency: payload.currency,
          gstPercent: payload.gstPercent,
          notes: payload.notes,
          items: payload.items
        });
        toast.success('Invoice saved to your dashboard!');
        navigate(`/invoices/${invRes.data.id}`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to save invoice.');
      } finally {
        setSavingDirectly(false);
      }
      return;
    }

    // Otherwise, show the high-converting guest save modal
    setShowSaveModal(true);
  };

  const guestDataForModal = {
    businessName: businessName.trim() || 'My Business',
    fullName: fullName.trim() || businessName.trim(),
    phone: senderPhone.trim() || undefined,
    email: senderEmail.trim() || undefined,
    address: senderAddress.trim() || undefined,
    ntn: senderNTN.trim() || undefined,
    logoUrl: logoUrl || undefined,
    client: {
      name: clientName.trim() || 'Valued Client',
      email: clientEmail.trim() || undefined,
      phone: clientPhone.trim() || undefined,
      address: clientAddress.trim() || undefined
    },
    invoice: {
      currency,
      issueDate,
      dueDate,
      gstPercent,
      notes: notes.trim() || undefined,
      items: buildInvoicePayload().items
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-28">
      {/* Top Header */}
      <header className="bg-slate-950 text-white border-b border-white/10 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              Invoice<span className="text-primary">PK</span>
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles size={12} />
              <span>Instant Invoice Generator • 100% Free</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Go to Dashboard
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/login?signup=true"
                  className="text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white px-3 sm:px-4 py-1.5 rounded-lg border border-white/15 transition-all"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Announcement Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white py-6 px-4 border-b border-white/5 shadow-inner">
        <div className="max-w-5xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 rounded-full px-3.5 py-1 text-xs font-bold">
            <span>⚡ No Credit Card • No Signup Required to Download PDF</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create & Download Your Professional Invoice in Seconds
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
            Fill in your details below, preview your A4 print-ready invoice, and download clean PDFs with provincial GST, Bilty transport presets, and multi-currency billing.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Top Info Cards: Sender + Client */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Your Business (Sender) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-bold text-slate-900 text-base">Your Business Details</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Sender / From</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-xs">Business or Company Name *</label>
                <input
                  type="text"
                  required
                  className="input text-xs"
                  placeholder="e.g. Apex Logistics, Khan Studio, Alpha Tech"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Your Name / Contact Person</label>
                  <input
                    type="text"
                    className="input text-xs"
                    placeholder="e.g. Tariq Mehmood"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-xs">Phone Number</label>
                  <PhoneInput
                    value={senderPhone}
                    onChange={(val) => setSenderPhone(val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Business Email</label>
                  <input
                    type="email"
                    className="input text-xs"
                    placeholder="billing@yourdomain.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-xs">NTN / STRN (Tax ID)</label>
                  <input
                    type="text"
                    className="input text-xs"
                    placeholder="e.g. 1234567-8"
                    value={senderNTN}
                    onChange={(e) => setSenderNTN(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Business Address</label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Office #, Street, City (e.g. I.I. Chundrigar Rd, Karachi)"
                  value={senderAddress}
                  onChange={(e) => setSenderAddress(e.target.value)}
                />
              </div>

              {/* Logo Upload Box */}
              <div>
                <label className="label text-xs">Business Logo (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                {logoUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg border bg-white p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">Logo attached</p>
                      <p className="text-[10px] text-slate-400">Will render on top of the PDF</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold p-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-300 hover:border-primary text-slate-600 hover:text-primary py-2.5 px-3 rounded-xl text-xs font-semibold transition-colors bg-slate-50/50"
                  >
                    <Upload size={14} /> Upload Logo (PNG/JPG)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Client Details (Bill To) */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-bold text-slate-900 text-base">Client Details</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">Bill To</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label text-xs">Client or Customer Name *</label>
                <input
                  type="text"
                  required
                  className="input text-xs"
                  placeholder="e.g. Al-Rehman Enterprises, John Doe, Global Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Client Email</label>
                  <input
                    type="email"
                    className="input text-xs"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-xs">Client Phone</label>
                  <input
                    type="text"
                    className="input text-xs"
                    placeholder="0300-1234567"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Client Billing Address</label>
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Industrial Area, Phase 2, Lahore"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                />
              </div>

              <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-500">
                💡 <strong>Tip:</strong> Client details entered here will automatically be saved to your client directory when you create a free account or save your invoice.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Invoice Details & Tax Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Invoice Details & Tax Settings</h2>
                <p className="text-[11px] text-slate-500">Configure issue schedule, billing currency, and provincial sales tax.</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Invoice Settings</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label text-xs">Issue Date *</label>
              <input
                type="date"
                className="input text-xs"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-xs">Due Date *</label>
              <input
                type="date"
                className="input text-xs"
                min={issueDate}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label text-xs">Billing Currency</label>
              <select
                className="input text-xs"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">GST / Tax Rate</label>
              <select
                className="input text-xs"
                value={taxSelection}
                onChange={(e) => setTaxSelection(e.target.value)}
              >
                {TAX_RATE_OPTIONS.map(opt => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {taxSelection === 'custom' && (
            <div className="pt-2 border-t border-slate-100 max-w-xs">
              <label className="label text-xs">Custom Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                className="input text-xs"
                placeholder="e.g. 15"
                value={customRate || ''}
                onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {currency !== 'PKR' && (
            <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-xl p-3 flex items-start gap-2">
              <span className="text-sm">ℹ️</span>
              <p className="text-[11px] leading-relaxed">
                <strong>Export Billing Notice:</strong> For foreign currency invoices ({currency}), GST defaults to 0% as services exported outside Pakistan are zero-rated under provincial (SRB/PRA/KPRA) and federal sales tax regulations.
              </p>
            </div>
          )}
        </div>

        {/* Card 4: Line Items & Column Presets */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h2 className="font-bold text-slate-900 text-base">Invoice Line Items & Custom Columns</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize columns for Goods Transport (Bilty #, Vehicle #), Retail (Batch, SKU), or Contractor POs.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary-dark hover:bg-primary hover:text-slate-950 font-bold px-3.5 py-2 rounded-xl transition-all"
            >
              <Plus size={14} /> Add Row
            </button>
          </div>

          {/* Preset Buttons Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-500" />
                Industry Column Presets:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetColumns('transport')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-xs flex items-center gap-1"
                >
                  <Truck size={12} className="text-emerald-600" />
                  Goods Transport
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('retail')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-xs flex items-center gap-1"
                >
                  <Store size={12} className="text-blue-600" />
                  Wholesale / Retail
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('contractor')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-xs flex items-center gap-1"
                >
                  <Building2 size={12} className="text-amber-600" />
                  Contractor / Civil
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('services')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-xs flex items-center gap-1"
                >
                  <Briefcase size={12} className="text-indigo-600" />
                  Services (Qty + Price)
                </button>
              </div>
            </div>

            {/* Active Columns List */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
              <span className="font-semibold text-slate-500 mr-1">Active Columns:</span>
              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded-md">
                <span>Sr. #</span>
                <span className="text-[10px] text-slate-500 font-normal">(Auto)</span>
              </span>

              <button
                type="button"
                onClick={() => setIncludeDescription(!includeDescription)}
                className={`inline-flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-md border transition-all ${
                  includeDescription
                    ? 'bg-primary/10 text-primary-dark border-primary/30'
                    : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Description column"
              >
                <span>Description</span>
                <span className="text-[10px]">{includeDescription ? '✓ ON' : '+ OFF'}</span>
              </button>

              {customColumns.map((col, idx) => (
                <span
                  key={col}
                  className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark border border-primary/20 font-bold px-2.5 py-1 rounded-md shadow-xs"
                >
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveColumnLeft(idx)}
                      className="text-slate-400 hover:text-slate-900 font-extrabold text-xs"
                      title="Move Column Left"
                    >
                      ←
                    </button>
                  )}
                  <span>{col}</span>
                  {idx < customColumns.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveColumnRight(idx)}
                      className="text-slate-400 hover:text-slate-900 font-extrabold text-xs"
                      title="Move Column Right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCustomColumn(col)}
                    className="hover:text-red-500 font-extrabold text-sm ml-0.5 text-slate-400"
                    title="Remove column"
                  >
                    ×
                  </button>
                </span>
              ))}

              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 font-bold px-2 py-1 rounded-md">
                <span>Amount</span>
                <span className="text-[10px] text-slate-500 font-normal">({currencySymbol})</span>
              </span>

              {!showColInput ? (
                <button
                  type="button"
                  onClick={() => setShowColInput(true)}
                  className="bg-white border border-dashed border-slate-300 text-slate-600 hover:text-primary hover:border-primary px-2.5 py-1 rounded-md font-medium transition-colors"
                >
                  + Add Custom Column
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Bilty No."
                    className="px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary w-28"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomColumn(newColName);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => addCustomColumn(newColName)}
                    className="bg-primary text-slate-950 px-2 py-1 rounded-md font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColInput(false)}
                    className="text-slate-400 hover:text-slate-600 px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold whitespace-nowrap">
                  <th className="py-2.5 px-3 text-center w-12">Sr. #</th>
                  {includeDescription && (
                    <th className="py-2.5 px-3 text-left">Description</th>
                  )}
                  {customColumns.map(col => (
                    <th key={col} className="py-2.5 px-3 text-left">{col}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-32">Amount ({currencySymbol})</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    {includeDescription && (
                      <td className="py-2.5 px-3">
                        <input
                          className={`input text-xs py-1.5 px-2.5 ${itemErrors[idx] ? 'border-red-400' : ''}`}
                          placeholder="e.g. Goods delivery / Software Development"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        />
                      </td>
                    )}

                    {customColumns.map(col => {
                      const isQty = /^(qty|quantity|hours)$/i.test(col.trim());
                      const isPrice = /^(price|unit\s*price|rate)$/i.test(col.trim());
                      const isNumeric = isQty || isPrice;
                      return (
                        <td key={col} className="py-2.5 px-3">
                          <input
                            type={isNumeric ? 'number' : 'text'}
                            step={isNumeric ? 'any' : undefined}
                            min={isNumeric ? '0.01' : undefined}
                            className="input text-xs py-1.5 px-2.5"
                            placeholder={`Enter ${col}`}
                            value={item.customValues?.[col] || ''}
                            onChange={(e) => updateCustomFieldValue(idx, col, e.target.value)}
                          />
                        </td>
                      );
                    })}

                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        className="input text-xs py-1.5 px-2.5 text-right font-semibold"
                        value={item.amount !== undefined && item.amount !== 0 ? item.amount : (item.amount === 0 ? '' : item.amount)}
                        onChange={(e) => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                      />
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Totals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="label text-xs">Invoice Notes & Bank Account Information</label>
              <textarea
                rows={4}
                maxLength={500}
                className="input text-xs py-2"
                placeholder="Bank Name: Habib Bank Limited&#10;Account Title: ...&#10;IBAN / Account Number: PK..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Tip: Include your IBAN, EasyPaisa, or JazzCash details here so clients can pay you quickly.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 flex flex-col justify-center">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{currencySymbol} {subTotal.toLocaleString()}</span>
              </div>
              {gstPercent > 0 && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Sales Tax / GST ({gstPercent}%):</span>
                  <span className="font-semibold">{currencySymbol} {gstAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
                <span>Grand Total:</span>
                <span className="text-emerald-700">{currencySymbol} {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights / Trust Footer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold">
              <Check size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-800">100% Free Forever</h4>
            <p className="text-[11px] text-slate-500">No hidden watermark, no page limits, and zero credit card required.</p>
          </div>
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 mx-auto flex items-center justify-center font-bold">
              <FileText size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Standard A4 Print Ready</h4>
            <p className="text-[11px] text-slate-500">Formatted cleanly for office printing, PDF email attachments, and WhatsApp sharing.</p>
          </div>
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-bold">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Pakistan Tax Ready</h4>
            <p className="text-[11px] text-slate-500">Supports FBR 18% GST, Sindh SRB, Punjab PRA, KPK KPRA, and 0% export rates.</p>
          </div>
        </div>

      </main>

      {/* Floating Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl py-3 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-xs">
              <span className="text-slate-500">Total Invoice Amount: </span>
              <span className="font-extrabold text-sm text-slate-900">{currencySymbol} {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Preview PDF */}
            <button
              type="button"
              onClick={handlePreviewPdf}
              disabled={generatingPdf}
              className="flex-1 sm:flex-initial btn-secondary text-xs py-2.5 px-4 flex items-center justify-center gap-1.5"
            >
              {generatingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Eye size={15} />
              )}
              <span>Preview PDF</span>
            </button>

            {/* Instant Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {downloadingPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download size={15} />
              )}
              <span>Download PDF</span>
            </button>

            {/* Save & Manage / 1-Click Register */}
            <button
              type="button"
              onClick={handleSaveAndSend}
              disabled={savingDirectly}
              className="flex-1 sm:flex-initial btn-primary text-xs py-2.5 px-5 flex items-center justify-center gap-1.5 shadow-md shadow-primary/20"
            >
              {savingDirectly ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              <span>{isAuthenticated ? 'Save to Dashboard' : 'Save & Send ⚡'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        invoiceNumber="PREVIEW"
        customBlobUrl={previewBlobUrl}
      />

      {/* Guest Save & Convert Modal */}
      <GuestSaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        guestData={guestDataForModal}
      />
    </div>
  );
}
