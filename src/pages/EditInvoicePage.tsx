import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import { Client, CURRENCY_OPTIONS, CURRENCY_SYMBOLS, InvoiceDetail } from '../types';

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

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clients, setClients]         = useState<Client[]>([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError]             = useState('');
  const [itemErrors, setItemErrors]   = useState<Record<number, string>>({});
  const [currency, setCurrency]       = useState('PKR');
  const [taxSelection, setTaxSelection] = useState<string>('18');
  const [customRate, setCustomRate]     = useState<number>(0);
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [includeDescription, setIncludeDescription] = useState(true);
  const [newColName, setNewColName]       = useState('');
  const [showColInput, setShowColInput]   = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [savedInvoiceNumber, setSavedInvoiceNumber] = useState('');
  const [clientEmail, setClientEmail]     = useState('');
  const [initialSnapshot, setInitialSnapshot] = useState('');

  const [form, setForm] = useState({
    clientId: '',
    issueDate: '',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState<LineItem[]>([]);

  const serializeState = (
    f: { clientId: string; issueDate: string; dueDate: string; notes: string },
    curr: string,
    taxSel: string,
    cRate: number,
    cols: string[],
    lineItems: LineItem[]
  ) => {
    return JSON.stringify({
      clientId: f.clientId ? f.clientId.trim() : '',
      issueDate: f.issueDate ? f.issueDate.trim() : '',
      dueDate: f.dueDate ? f.dueDate.trim() : '',
      notes: f.notes ? f.notes.trim() : '',
      currency: curr ? curr.trim() : 'PKR',
      taxSelection: taxSel ? taxSel.trim() : '18',
      customRate: Number(cRate) || 0,
      customColumns: cols.map(c => c.trim()).filter(Boolean),
      items: lineItems.map(item => {
        const customVals: Record<string, string> = {};
        cols.forEach(col => {
          const val = item.customValues?.[col]?.trim();
          customVals[col] = val || '';
        });
        return {
          description: item.description ? item.description.trim() : '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          customValues: customVals,
        };
      })
    });
  };

  useEffect(() => {
    Promise.all([
      api.get('/clients'),
      api.get(`/invoices/${id}`)
    ]).then(([clientsRes, invoiceRes]) => {
      setClients(clientsRes.data);
      const inv: InvoiceDetail = invoiceRes.data;

      if (inv.status === 'Paid' || inv.status === 'Cancelled') {
        alert(`Cannot edit a ${inv.status.toLowerCase()} invoice.`);
        navigate(`/invoices/${id}`);
        return;
      }

      setSavedInvoiceNumber(inv.invoiceNumber);
      setClientEmail(inv.client.email || '');

      const loadedForm = {
        clientId: inv.client.id.toString(),
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        notes: inv.notes || '',
      };
      setForm(loadedForm);
      setCurrency(inv.currency);

      const gst = inv.gstPercent;
      const matchedTax = TAX_RATE_OPTIONS.find(t => typeof t.value === 'number' && t.value === gst);
      let loadedTaxSel = '18';
      let loadedCustomRate = 0;
      if (matchedTax) {
        loadedTaxSel = gst.toString();
        setTaxSelection(loadedTaxSel);
      } else {
        loadedTaxSel = 'custom';
        loadedCustomRate = gst;
        setTaxSelection('custom');
        setCustomRate(gst);
      }

      // Parse custom fields if stored in item description
      const parsedColumnsSet = new Set<string>();
      let detectedHasDescription = true;

      const parsedItems: LineItem[] = inv.items.map(item => {
        let desc = item.description;
        const customVals: Record<string, string> = {};

        if (desc.includes('\n[COLS:')) {
          const parts = desc.split('\n[COLS:');
          desc = parts[0];
          const colsStr = parts[1].split(']\n[VALS:')[0];
          const valsStr = parts[1].split(']\n[VALS:')[1]?.replace(']', '') || '';
          const cList = colsStr.split('|');
          const vList = valsStr.split(' | ');

          detectedHasDescription = cList.includes('Description');

          cList.forEach((col, cIdx) => {
            if (col !== 'Description') {
              parsedColumnsSet.add(col);
              const rawVal = vList[cIdx] || '';
              const pairVal = rawVal.includes(': ') ? rawVal.split(': ')[1] : rawVal;
              if (pairVal && pairVal !== '-') {
                customVals[col] = pairVal;
              }
            }
          });
        } else if (desc.includes('\n[')) {
          const parts = desc.split('\n[');
          desc = parts[0];
          const detailsStr = parts[1].replace(']', '');
          detailsStr.split(' | ').forEach(pair => {
            const colonIdx = pair.indexOf(': ');
            if (colonIdx !== -1) {
              const k = pair.substring(0, colonIdx).trim();
              const v = pair.substring(colonIdx + 2).trim();
              if (k) {
                parsedColumnsSet.add(k);
                if (v !== '-') {
                  customVals[k] = v;
                }
              }
            }
          });
        }

        return {
          description: desc,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          customValues: customVals,
        };
      });

      const loadedCols = Array.from(parsedColumnsSet);
      const finalItems = parsedItems.length > 0 ? parsedItems : [{ description: '', quantity: 1, unitPrice: 0, customValues: {} }];

      setIncludeDescription(detectedHasDescription);
      setCustomColumns(loadedCols);
      setItems(finalItems);

      // Save deterministic initial snapshot for dirty checking (Scenario 1)
      const initialStr = serializeState(
        loadedForm,
        inv.currency,
        loadedTaxSel,
        loadedCustomRate,
        loadedCols,
        finalItems
      );
      setInitialSnapshot(initialStr);
    }).catch(err => {
      setError(err.response?.data?.message ?? 'Failed to load invoice details.');
    }).finally(() => {
      setLoading(false);
    });
  }, [id, navigate]);

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

  const currentSnapshot = serializeState(
    form,
    currency,
    taxSelection,
    customRate,
    customColumns,
    items
  );

  const isDirty = initialSnapshot !== '' && currentSnapshot !== initialSnapshot;

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
      setError('Please fix the highlighted line items.');
      return;
    }

    setSaving(true);
    try {
      const activeCols = [
        ...(includeDescription ? ['Description'] : []),
        ...customColumns
      ];

      await api.put(`/invoices/${id}`, {
        clientId:   parseInt(form.clientId),
        issueDate:  form.issueDate,
        dueDate:    form.dueDate,
        currency:   currency,
        gstPercent: gstPercent,
        notes:      form.notes,
        items:      items.map(i => {
          const mainDesc = includeDescription ? (i.description.trim() || 'Item') : (customColumns.length > 0 && i.customValues?.[customColumns[0]] ? i.customValues[customColumns[0]] : 'Item');

          const colDetails = activeCols.map(col => {
            if (col === 'Description') return `Description: ${i.description.trim() || '-'}`;
            const val = i.customValues?.[col]?.trim();
            return `${col}: ${val && val.length > 0 ? val : '-'}`;
          }).join(' | ');

          const finalDesc = `${mainDesc}\n[COLS:${activeCols.join('|')}]\n[VALS:${colDetails}]`;

          return {
            description: finalDesc,
            quantity:    Math.max(i.quantity, 1),
            unitPrice:   Math.max(i.unitPrice, 0),
          };
        }),
      });

      // Prompt to email client if email exists
      if (clientEmail) {
        setShowSendModal(true);
      } else {
        navigate(`/invoices/${id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to update invoice.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailPrompt = async () => {
    setSendingEmail(true);
    try {
      await api.post(`/invoices/${id}/send`);
      alert('Updated invoice sent to client!');
      navigate(`/invoices/${id}`);
    } catch (err: any) {
      alert(err.response?.data?.message ?? 'Failed to send email.');
    } finally {
      setSendingEmail(false);
      setShowSendModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/invoices/${id}`)}
            className="text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Invoice #{savedInvoiceNumber}</h1>
        </div>
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
            <label className="label">Client *</label>
            <select
              className="input"
              value={form.clientId}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
              required
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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

        {/* Line Items & Custom Columns */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Line Items & Custom Columns</h2>
              <p className="text-xs text-gray-400">Add custom fields like Bilty No., Vehicle No., Station, PO #, or Batch No.</p>
            </div>
            <button
              type="button" onClick={addItem}
              className="flex items-center gap-1 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-all"
            >
              <Plus size={14} /> Add Item
            </button>
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
                  🏗️ Contractor / Services
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
                <span className="text-[10px] text-slate-500 font-normal">(Auto)</span>
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
                <tr className="bg-gray-900 text-white font-semibold">
                  <th className="py-2.5 px-3 text-center rounded-tl-lg w-12">Sr. #</th>
                  {includeDescription && (
                    <th className="py-2.5 px-3 text-left">Description</th>
                  )}
                  {customColumns.map(col => (
                    <th key={col} className="py-2.5 px-3 text-left">{col}</th>
                  ))}
                  <th className="py-2.5 px-3 text-right w-28">Qty</th>
                  <th className="py-2.5 px-3 text-right w-32">Unit Price</th>
                  <th className="py-2.5 px-3 text-right w-32">Amount</th>
                  <th className="py-2.5 px-2 text-center rounded-tr-lg w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-500">
                      {idx + 1}
                    </td>

                    {includeDescription && (
                      <td className="py-2.5 px-3">
                        <input
                          className="input text-xs py-1.5"
                          placeholder="Service / Product Description"
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          required={includeDescription}
                        />
                      </td>
                    )}

                    {customColumns.map(col => (
                      <td key={col} className="py-2.5 px-3">
                        <input
                          type="text"
                          className="input text-xs py-1.5"
                          placeholder={`Enter ${col}`}
                          value={item.customValues?.[col] || ''}
                          onChange={e => updateCustomFieldValue(idx, col, e.target.value)}
                        />
                      </td>
                    ))}

                    <td className="py-2.5 px-3 text-right">
                      <input
                        className={`input text-xs py-1.5 text-center ${itemErrors[idx] ? 'border-red-400' : ''}`}
                        type="number" min="1" step="1"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <input
                        className={`input text-xs py-1.5 text-right ${itemErrors[idx] ? 'border-red-400' : ''}`}
                        type="number" min="0" step="1"
                        placeholder="0"
                        value={item.unitPrice || ''}
                        onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right font-bold text-gray-900">
                      {currencySymbol} {(Math.max(item.quantity, 0) * Math.max(item.unitPrice, 0)).toLocaleString()}
                    </td>

                    <td className="py-2.5 px-2 text-center">
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
          <button type="button" onClick={() => navigate(`/invoices/${id}`)} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            className={`btn-primary px-8 transition-all ${!isDirty ? 'opacity-50 cursor-not-allowed bg-slate-400 border-slate-400 text-slate-200 hover:bg-slate-400' : ''}`}
            disabled={saving || !isDirty}
          >
            {saving ? 'Saving...' : !isDirty ? 'No Changes' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Post-Edit Send Email Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Send Updated Copy to Client?</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Invoice <strong>#{savedInvoiceNumber}</strong> has been updated. Would you like to email the updated invoice PDF copy to <strong>{clientEmail}</strong> now?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => navigate(`/invoices/${id}`)}
                className="btn-secondary text-sm"
              >
                No, Just Save
              </button>
              <button
                type="button"
                onClick={handleSendEmailPrompt}
                disabled={sendingEmail}
                className="btn-primary text-sm flex items-center gap-1.5 font-bold"
              >
                <Send size={15} /> {sendingEmail ? 'Sending...' : 'Yes, Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
