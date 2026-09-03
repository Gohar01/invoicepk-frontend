import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Client, CURRENCY_OPTIONS, CURRENCY_SYMBOLS } from '../types';

interface LineItem { 
  description: string; 
  quantity: number; 
  unitPrice: number; 
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
  const [clients, setClients]     = useState<Client[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [currency, setCurrency]   = useState('PKR');
  const [taxSelection, setTaxSelection] = useState<string>('18');
  const [customRate, setCustomRate]     = useState<number>(0);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [newColName, setNewColName]       = useState('');
  const [showColInput, setShowColInput]   = useState(false);
  const [form, setForm] = useState({
    clientId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
  });
  const [items, setItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0, customValues: {} }
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

  const applyPresetColumns = (preset: 'transport' | 'retail' | 'contractor') => {
    if (preset === 'transport') {
      setCustomColumns(['Bilty No.', 'Vehicle No.', 'Station', 'Capacity']);
    } else if (preset === 'retail') {
      setCustomColumns(['Batch No.', 'Expiry Date', 'SKU / Barcode']);
    } else if (preset === 'contractor') {
      setCustomColumns(['PO Number', 'Location', 'Unit / Rate']);
    }
  };

  const addItem = () =>
    setItems(i => [...i, { description: '', quantity: 1, unitPrice: 0, customValues: {} }]);

  const removeItem = (idx: number) => {
    setItems(i => i.filter((_, j) => j !== idx));
    setItemErrors(errs => {
      const copy = { ...errs };
      delete copy[idx];
      return copy;
    });
  };

  const validateItem = (item: LineItem): string | null => {
    if (item.quantity <= 0) return 'Quantity must be greater than 0';
    if (item.unitPrice <= 0) return 'Unit price must be greater than 0';
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
      return {
        ...item,
        customValues: {
          ...(item.customValues || {}),
          [colName]: value
        }
      };
    }));
  };

  const gstPercent = taxSelection === 'custom' ? customRate : parseFloat(taxSelection);
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const subTotal  = items.reduce((s, i) => s + Math.max(i.quantity, 0) * Math.max(i.unitPrice, 0), 0);
  const gstAmount = Math.round(subTotal * (gstPercent / 100) * 100) / 100;
  const total     = subTotal + gstAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.clientId) { setError('Please select a client.'); return; }
    if (items.some(i => !i.description.trim())) {
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
      setError('Please fix the highlighted line items — quantity and unit price must be greater than 0.');
      return;
    }

    if (taxSelection === 'custom' && (customRate < 0 || customRate > 100)) {
      setError('Custom tax rate must be between 0 and 100.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post('/invoices', {
        clientId:   parseInt(form.clientId),
        issueDate:  form.issueDate,
        dueDate:    form.dueDate,
        currency:   currency,
        gstPercent: gstPercent,
        notes:      form.notes,
        items:      items.map(i => {
          let finalDesc = i.description;
          if (customColumns.length > 0 && i.customValues) {
            const details = customColumns
              .map(col => i.customValues?.[col] ? `${col}: ${i.customValues[col]}` : '')
              .filter(Boolean)
              .join(' | ');
            if (details) {
              finalDesc = `${i.description}\n[${details}]`;
            }
          }
          return {
            description: finalDesc,
            quantity:    i.quantity,
            unitPrice:   i.unitPrice,
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Invoice Details */}
        <div className="card p-6 space-y-4">
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
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="card p-6">
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
                  🚚 Goods Transport (Bilty, Vehicle #, Route, Capacity)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('retail')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  🏬 Retail / Wholesale (Batch #, Expiry, SKU)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetColumns('contractor')}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  🏗️ Contractor / Services (PO #, Location, Unit)
                </button>
              </div>
            </div>

            {/* Custom Column Badges & Add Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200">
              <span className="text-xs font-semibold text-slate-500 mr-1">Active Columns:</span>
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

          <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-gray-400 uppercase px-1">
            <div className="col-span-5">Description</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Unit Price</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-200/80 space-y-3">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      className="input" placeholder="Service or product description"
                      value={item.description}
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className={`input text-center ${itemErrors[idx] ? 'border-red-400' : ''}`}
                      type="number" min="1" step="1"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className={`input text-right ${itemErrors[idx] ? 'border-red-400' : ''}`}
                      type="number" min="1" step="1"
                      placeholder="0"
                      value={item.unitPrice || ''}
                      onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2 text-right text-sm font-bold text-gray-800">
                    {(Math.max(item.quantity, 0) * Math.max(item.unitPrice, 0)).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button
                        type="button" onClick={() => removeItem(idx)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Render Dynamic Custom Column Input Fields for each row */}
                {customColumns.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200/60 bg-white/80 p-2.5 rounded-lg">
                    {customColumns.map(col => (
                      <div key={col}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">{col}</label>
                        <input
                          type="text"
                          className="input py-1 text-xs"
                          placeholder={`Enter ${col}`}
                          value={item.customValues?.[col] || ''}
                          onChange={e => updateCustomFieldValue(idx, col, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {itemErrors[idx] && (
                  <p className="text-xs text-red-500 mt-0.5 ml-1">{itemErrors[idx]}</p>
                )}
              </div>
            ))}
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
