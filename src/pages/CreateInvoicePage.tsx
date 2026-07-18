import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Client } from '../types';

interface LineItem { description: string; quantity: number; unitPrice: number; }

// Pakistan tax rates — federal GST + provincial services sales tax.
// Rates change periodically, so "Custom" is always available as a fallback.
const TAX_RATE_OPTIONS = [
    { label: 'No Tax (0%)', value: 0 },
    { label: 'Federal GST — Standard (18%)', value: 18 },
    { label: 'Federal GST — Reduced (5%)', value: 5 },
    { label: 'Sindh SRB — Services (13%)', value: 13 },
    { label: 'Punjab PRA — Services (16%)', value: 16 },
    { label: 'KPK KPRA — Services (15%)', value: 15 },
    { label: 'Balochistan BRA — Services (15%)', value: 15 },
    { label: 'Custom rate', value: 'custom' },
];

export default function CreateInvoicePage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [taxSelection, setTaxSelection] = useState<string>('18'); // default to standard GST
    const [customRate, setCustomRate] = useState<number>(0);
    const [form, setForm] = useState({
        clientId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
    });
    const [items, setItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unitPrice: 0 }
    ]);

    useEffect(() => {
        api.get('/clients').then(r => setClients(r.data));
        const due = new Date();
        due.setDate(due.getDate() + 30);
        setForm(f => ({ ...f, dueDate: due.toISOString().split('T')[0] }));
    }, []);

    const addItem = () =>
        setItems(i => [...i, { description: '', quantity: 1, unitPrice: 0 }]);

    const removeItem = (idx: number) =>
        setItems(i => i.filter((_, j) => j !== idx));

    const updateItem = (idx: number, field: keyof LineItem, value: string | number) =>
        setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: value } : item));

    // Resolve actual GST % being used
    const gstPercent = taxSelection === 'custom' ? customRate : parseFloat(taxSelection);

    // Totals
    const subTotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const gstAmount = Math.round(subTotal * (gstPercent / 100) * 100) / 100;
    const total = subTotal + gstAmount;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.clientId) { setError('Please select a client.'); return; }
        if (items.some(i => !i.description)) { setError('All items need a description.'); return; }
        setError('');
        setSaving(true);
        try {
            const { data } = await api.post('/invoices', {
                clientId: parseInt(form.clientId),
                issueDate: form.issueDate,
                dueDate: form.dueDate,
                gstPercent: gstPercent,
                notes: form.notes,
                items: items.map(i => ({
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                })),
            });
            navigate(`/invoices/${data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Failed to create invoice.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
                <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Client + Dates */}
                <div className="card p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900">Invoice Details</h2>
                    <div>
                        <label className="label">Client *</label>
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
                        {!clients.length && (
                            <p className="text-xs text-amber-600 mt-1">
                                No clients yet.{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/clients')}
                                    className="underline"
                                >
                                    Add a client first
                                </button>
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
                                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                            <p className="text-xs text-gray-400 mt-1">
                                Rates shown are federal GST + common provincial services tax rates.
                                Always confirm the exact rate for your service type on FBR / your
                                provincial revenue authority's website, as rates change periodically.
                            </p>
                        </div>
                        {taxSelection === 'custom' ? (
                            <div>
                                <label className="label">Custom Tax %</label>
                                <input
                                    className="input" type="number" min="0" max="100" step="0.5"
                                    placeholder="e.g. 15"
                                    value={customRate || ''}
                                    onChange={e => setCustomRate(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="label">Notes</label>
                                <input
                                    className="input" placeholder="Payment terms, bank details..."
                                    value={form.notes}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                />
                            </div>
                        )}
                    </div>

                    {taxSelection === 'custom' && (
                        <div>
                            <label className="label">Notes</label>
                            <input
                                className="input" placeholder="Payment terms, bank details..."
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                            />
                        </div>
                    )}
                </div>

                {/* Line Items */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Line Items</h2>
                        <button
                            type="button" onClick={addItem}
                            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
                        >
                            <Plus size={14} /> Add Item
                        </button>
                    </div>

                    <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-gray-400 uppercase px-1">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Unit Price</div>
                        <div className="col-span-2 text-right">Total</div>
                    </div>

                    <div className="space-y-2">
                        {items.map((item, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-6">
                                    <input
                                        className="input" placeholder="Service or product description"
                                        value={item.description}
                                        onChange={e => updateItem(idx, 'description', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        className="input text-center" type="number" min="0.01" step="0.01"
                                        value={item.quantity}
                                        onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        className="input text-right" type="number" min="0" step="1"
                                        placeholder="0"
                                        value={item.unitPrice || ''}
                                        onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                                    {(item.quantity * item.unitPrice).toLocaleString()}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    {items.length > 1 && (
                                        <button
                                            type="button" onClick={() => removeItem(idx)}
                                            className="text-gray-300 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>PKR {subTotal.toLocaleString()}</span>
                        </div>
                        {gstPercent > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Tax ({gstPercent}%)</span>
                                <span>PKR {gstAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-100 pt-2">
                            <span>Total</span>
                            <span className="text-primary">PKR {total.toLocaleString()}</span>
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
