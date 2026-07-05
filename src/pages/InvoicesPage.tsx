import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Download, Send, Bell } from 'lucide-react';
import api from '../services/api';
import { Invoice } from '../types';

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        Draft: 'badge-draft', Sent: 'badge-sent',
        Paid: 'badge-paid', Overdue: 'badge-overdue'
    };
    return map[status] ?? 'badge-draft';
};

const FILTERS = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<number | null>(null);
    const navigate = useNavigate();

    const load = (status?: string) => {
        setLoading(true);
        const params = status && status !== 'All' ? `?status=${status}` : '';
        api.get(`/invoices${params}`)
            .then(r => setInvoices(r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(filter); }, [filter]);

    const downloadPdf = async (id: number, invoiceNumber: string) => {
        setActionId(id);
        try {
            const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoiceNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setActionId(null);
        }
    };

    const sendInvoice = async (id: number) => {
        if (!confirm('Send this invoice to the client?')) return;
        setActionId(id);
        try {
            await api.post(`/invoices/${id}/send`);
            alert('Invoice sent successfully!');
            load(filter);
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Failed to send.');
        } finally {
            setActionId(null);
        }
    };

    const sendReminder = async (id: number) => {
        if (!confirm('Send a payment reminder to the client?')) return;
        setActionId(id);
        try {
            await api.post(`/invoices/${id}/remind`);
            alert('Reminder sent!');
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Failed to send reminder.');
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500 text-sm mt-1">{invoices.length} invoices</p>
                </div>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={16} /> New Invoice
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6">
                {FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f
                                ? 'bg-primary text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : !invoices.length ? (
                <div className="card text-center py-16 text-gray-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No invoices found</p>
                    <button onClick={() => navigate('/invoices/new')} className="btn-primary mt-4 text-sm">
                        Create Invoice
                    </button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-6 py-3">Invoice #</th>
                                <th className="text-left px-6 py-3">Client</th>
                                <th className="text-left px-6 py-3">Issue Date</th>
                                <th className="text-left px-6 py-3">Due Date</th>
                                <th className="text-right px-6 py-3">Amount</th>
                                <th className="text-center px-6 py-3">Status</th>
                                <th className="text-right px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td
                                        className="px-6 py-4 text-sm font-medium text-primary cursor-pointer hover:underline"
                                        onClick={() => navigate(`/invoices/${inv.id}`)}
                                    >
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{inv.clientName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{inv.issueDate}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{inv.dueDate}</td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold">
                                        PKR {inv.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={statusBadge(inv.status)}>{inv.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Download PDF */}
                                            <button
                                                onClick={() => downloadPdf(inv.id, inv.invoiceNumber)}
                                                disabled={actionId === inv.id}
                                                title="Download PDF"
                                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-colors"
                                            >
                                                <Download size={15} />
                                            </button>
                                            {/* Send Invoice */}
                                            {inv.status !== 'Paid' && (
                                                <button
                                                    onClick={() => sendInvoice(inv.id)}
                                                    disabled={actionId === inv.id}
                                                    title="Send Invoice"
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Send size={15} />
                                                </button>
                                            )}
                                            {/* Send Reminder */}
                                            {(inv.status === 'Sent' || inv.status === 'Overdue') && (
                                                <button
                                                    onClick={() => sendReminder(inv.id)}
                                                    disabled={actionId === inv.id}
                                                    title="Send Reminder"
                                                    className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                                                >
                                                    <Bell size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
