import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Client, CURRENCY_OPTIONS, CURRENCY_SYMBOLS } from '../types';
import { useToast } from '../context/ToastContext';

interface LineItem { 
  description: string; 
  amount: number; 
  customValues?: Record<string, string>;
}

const TAX_RATE_OPTIONS = [
  { label: 'No Tax (0%)',                          value: 0    },
  { label: 'Federal GST — Standard (18%)',         value: 18   },
  { label: 'Federal GST — Reduced (5%)',           value: 5    },
  { label: 'Sindh SRB — Services (13%)',           value: 13   },
  { label: 'Punjab PRA — Services (16%)',          value: 16   },
  { label: 'KPK KPRA — Services (15%)',            value: 15   },
  { label: 'Balochistan BRA — Services (15%)',     value: 15   },
  { label: 'Custom rate',                          value: 'custom' },
];

export default function CreateInvoicePage() {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const [clients, setClients]     = useState<Client[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [currency, setCurrency]   = useState('PKR');
  const [taxSelection, setTaxSelection] = useState<string>('18');
  const [customRate, setCustomRate]     = useState<number>(0);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [newColName, setNewColName]       = useState('');
  const [showColInput, setShowColInput]   = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });
  const [items, setItems] = useState<LineItem[]>([
    { description: '', amount: 0, customValues: {} }
  ]);

  useEffect(() => {
    api.get('/clients').then(r => setClients(r.data));
    const due = new Date();
    due.setDate(due.getDate() + 30);
    setForm(f => ({ ...f, dueDate: due.toISOString().split('T')[0] }));
  }, []);

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    if (newCurrency !== 'PKR') {
      setTaxSelection('0');
    } else {
      setTaxSelection('18');
    }
  };

  const addCustomColumn = (colName: string) => {
    const trimmed = colName.trim();
    if (!trimmed || customColumns.includes(trimmed)) return;
    if (customColumns.length >= 8) {
      toast.warning('Maximum 8 custom columns allowed to preserve printability and PDF formatting.');
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
    } else if (preset === 'retail') {
      setIncludeDescription(true);
      setCustomColumns(['Batch No.', 'Expiry Date', 'SKU']);
    } else if (preset === 'contractor') {
      setIncludeDescription(true);
      setCustomColumns(['PO Number', 'Location']);
    } else if (preset === 'services') {
      setIncludeDescription(true);
      setCustomColumns(['Qty', 'Unit Price']);
    }
  };

  const addItem = () =>
    setItems(i => [...i, { description: '', amount: 0, customValues: {} }]);

  const removeItem = (idx: number) => {
    setItems(i => i.filter((_, j) => j !== idx));
    setItemErrors(errs => {
      const copy = { ...errs };
      delete copy[idx];
      return copy;
    });
  };

  const validateItem = (item: LineItem): string | null => {
    if (includeDescription && !item.description.trim()) {
      return 'Description is required';
    }
    if (item.amount === undefined || item.amount < 0) {
      return 'Amount cannot be negative';
    }
    return null;
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(i => {
      const updated = i.map((item, j) => j === idx ? { ...item, [field]: value } : item);
      const err = validateItem(updated[idx]);
      setItemErrors(errs => ({ ...errs, [idx]: err ?? '' }));
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

  const subTotal  = items.reduce((s, i) => s + Math.max(i.amount || 0, 0), 0);
  const gstAmount = Math.round(subTotal * (gstPercent / 100) * 100) / 100;
  const total     = subTotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientId) { setError('Please select a client.'); return; }
    if (includeDescription && items.some(i => !i.description.trim())) {
      setError('All items need a description.');
      return;
    }

    const errors: Record<number, string> = {};
    items.forEach((item, idx) => {
      const err = validateItem(item);
      if (err) errors[idx] = err;
    });
    setItemErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the highlighted line items.');
      return;
    }

    if (taxSelection === 'custom' && (customRate < 0 || customRate > 100)) {
      setError('Custom tax rate must be between 0 and 100.');
      return;
    }

    setSaving(true);
    try {
      const activeCols = [
        ...(includeDescription ? ['Description'] : []),
        ...customColumns
      ];

      const { data } = await api.post('/invoices', {
        clientId:   parseInt(form.clientId),
        issueDate:  form.issueDate,
        dueDate:    form.dueDate,
        currency:   currency,
        gstPercent: gstPercent,
        notes:      form.notes,
        items: items.map(i => {
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

          return {
            description: finalDesc,
            quantity: q,
            unitPrice: p,
          };
        }),
      });
      navigate(`/invoices/${data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to create invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl lg:max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Soft Paywall & Watermark Trigger */}
        <div 
          onClick={() => navigate('/pricing')}
          className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-white border border-amber-300 rounded-2xl cursor-pointer hover:border-amber-400 transition-all shadow-xs flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              👑
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                Remove InvoicePK watermark &amp; upload HD logo
              </p>
              <p className="text-xs text-slate-500">
                Upgrade to Pro (Rs. 2,999 Lifetime) for 100% white-label invoices with your verified company stamp.
              </p>
            </div>
          </div>

          <div className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 border-transparent bg-slate-300 transition-colors">
            <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow translate-x-0" />
          </div>
        </div>

        {/* Invoice Details */}
        <div className="card p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label">Client *</label>
              <button
                type="button"
                onClick={() => navigate('/clients')}
                className="text-xs text-primary hover:underline font-medium"
              >
                + New Client
              </button>
            </div>
            <select
              className="input"
              value={form.clientId}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              required
            >
              <option value="">Select a client...</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {clients.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No clients yet. <button type="button" onClick={() => navigate('/clients')} className="text-primary hover:underline">Add one first</button>.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Issue Date *</label>
              <input
                type="date" className="input"
                value={form.issueDate}
                onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input
                type="date" className="input"
                value={form.dueDate}
                min={form.issueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select
                className="input"
                value={currency}
                onChange={e => handleCurrencyChange(e.target.value)}
              >
                {CURRENCY_OPTIONS.map(opt => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tax Rate</label>
              <select
                className="input"
                value={taxSelection}
                onChange={e => setTaxSelection(e.target.value)}
              >
                {TAX_RATE_OPTIONS.map(opt => (
                  <option key={opt.label} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {currency !== 'PKR' && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs rounded-lg px-3 py-2">
              This looks like an export/international invoice — tax defaulted to 0%,
              since GST typically doesn't apply to services billed in foreign currency.
              Your foreign income is instead taxed separately when it's remitted into
              your Pakistani bank account (0.25% for PSEB-registered freelancers, 1%
              otherwise). You can still override the tax rate above if needed.
            </div>
          )}

          {taxSelection === 'custom' && (
            <div>
              <label className="label">Custom Tax %</label>
              <input
                className="input" type="number" min="0" max="100" step="0.5"
                placeholder="e.g. 15"
                value={customRate || ''}
                onChange={e => setCustomRate(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          <div>
            <label className="label">Notes</label>
            <input
              className="input" placeholder="Payment terms, bank details..."
              maxLength={500}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Line Items & Custom Columns</h2>
              <p className="text-xs text-gray-400">Add custom fields like Bilty No., Vehicle No., Station, PO #, or Batch No.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button" onClick={addItem}
                className="flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          {/* Quick Presets & Custom Column Manager Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-slate-700">Quick Column Presets:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPresetColumns('transport')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  🚚 Goods Transport
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('retail')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  🏬 Retail / Wholesale
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('contractor')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  🏗️ Contractor
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('services')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  💼 IT / Freelancer (Qty + Price)
                </button>
              </div>
            </div>

            {/* Custom Column Badges & Add Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 mr-1">Active Columns:</span>
              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 text-xs font-bold px-2 py-1 rounded-md">
                <span>Sr. #</span>
                <span className="text-[10px] text-slate-500 font-normal">(Auto)</span>
              </span>

              <button
                type="button"
                onClick={() => setIncludeDescription(!includeDescription)}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border transition-all ${
                  includeDescription ? 'bg-primary/10 text-primary-dark border-primary/30' : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Description column"
              >
                <span>Description</span>
                <span className="text-[10px]">{includeDescription ? '✓ ON' : '+ OFF'}</span>
              </button>

              {customColumns.map((col, idx) => (
                <span key={col} className="inline-flex items-center gap-1.5 bg-primary/10 text-primary-dark border border-primary/20 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => moveColumnLeft(idx)}
                      className="text-slate-400 hover:text-slate-900 font-extrabold text-xs transition-colors"
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
                      className="text-slate-400 hover:text-slate-900 font-extrabold text-xs transition-colors"
                      title="Move Column Right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCustomColumn(col)}
                    className="hover:text-red-500 font-extrabold text-sm ml-0.5 text-slate-400 transition-colors"
                    title="Remove column"
                  >
                    ×
                  </button>
                </span>
              ))}

              <span className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 text-xs font-bold px-2 py-1 rounded-md">
                <span>Amount</span>
                <span className="text-[10px] text-slate-500 font-normal">(Mandatory)</span>
              </span>

              {!showColInput ? (
                <button
                  type="button"
                  onClick={() => setShowColInput(true)}
                  className="text-xs bg-white border border-dashed border-slate-300 text-slate-600 hover:text-primary hover:border-primary px-2.5 py-1 rounded-md font-medium transition-colors"
                >
                  + Add Custom Column
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Bilty No."
                    className="px-2 py-1 text-xs border border-slate-300 rounded-md focus:outline-none focus:border-primary w-32"
                    value={newColName}
                    onChange={e => setNewColName(e.target.value)}
                    onKeyDown={e => {
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
                    className="bg-primary text-slate-950 px-2.5 py-1 rounded-md text-xs font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowColInput(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 px-1"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-900 text-white font-semibold whitespace-nowrap">
                  <th className="py-2.5 px-2 text-center rounded-tl-lg w-12 whitespace-nowrap">Sr. #</th>
                  {includeDescription && (
                    <th className="py-2.5 px-2 text-left whitespace-nowrap">Description</th>
                  )}
                  {customColumns.map(col => (
                    <th key={col} className="py-2.5 px-2 text-left whitespace-nowrap">{col}</th>
                  ))}
                  <th className="py-2.5 px-2 text-right w-28 whitespace-nowrap">Amount</th>
                  <th className="py-2.5 px-1.5 text-center rounded-tr-lg w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className="py-2 px-2 text-center font-bold text-gray-500 whitespace-nowrap">
                      {idx + 1}
                    </td>

                    {includeDescription && (
                      <td className="py-2 px-2">
                        <input
                          className={`input text-xs py-1 px-2 ${itemErrors[idx] ? 'border-red-400' : ''}`}
                          placeholder="Service / Product Description"
                          maxLength={1000}
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          required={includeDescription}
                        />
                      </td>
                    )}

                    {customColumns.map(col => {
                      const isQty = /^(qty|quantity|hours)$/i.test(col.trim());
                      const isPrice = /^(price|unit\s*price|rate)$/i.test(col.trim());
                      const isNumeric = isQty || isPrice;
                      return (
                        <td key={col} className="py-2 px-2">
                          <input
                            type={isNumeric ? "number" : "text"}
                            step={isNumeric ? "any" : undefined}
                            min={isNumeric ? "0.01" : undefined}
                            className="input text-xs py-1 px-2"
                            placeholder={`Enter ${col}`}
                            value={item.customValues?.[col] || ''}
                            onChange={e => updateCustomFieldValue(idx, col, e.target.value)}
                          />
                        </td>
                      );
                    })}

                    <td className="py-2 px-2 text-right">
                      <input
                        className={`input text-xs py-1 px-2 text-right font-medium ${itemErrors[idx] ? 'border-red-400' : ''}`}
                        type="number"
                        min="0"
                        step="any"
                        placeholder="0.00"
                        value={item.amount !== undefined && item.amount !== 0 ? item.amount : (item.amount === 0 ? '' : item.amount)}
                        onChange={e => updateItem(idx, 'amount', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </td>

                    <td className="py-2 px-1.5 text-center">
                      {items.length > 1 && (
                        <button
                          type="button" onClick={() => removeItem(idx)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          title="Remove row"
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

          {/* Totals */}
          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{currencySymbol} {subTotal.toLocaleString()}</span>
            </div>
            {gstPercent > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax ({gstPercent}%)</span>
                <span>{currencySymbol} {gstAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-primary">{currencySymbol} {total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/invoices')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary px-8" disabled={saving}>
            {saving ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
}
