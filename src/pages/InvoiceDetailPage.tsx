import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Send, Bell, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { InvoiceDetail } from '../types';

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        Draft: 'badge-draft', Sent: 'badge-sent',
        Paid: 'badge-paid', Overdue: 'badge-overdue'
    };
    return map[status] ?? 'badge-draft';
};

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);

    const load = () => {
        api.get(`/invoices/${id}`)
            .then(r => setInvoice(r.data))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [id]);

    const downloadPdf = async () => {
        if (!invoice) return;
        setWorking(true);
        try {
            const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = `${invoice.invoiceNumber}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } finally { setWorking(false); }
    };

    const sendInvoice = async () => {
        if (!confirm('Send this invoice to the client?')) return;
        setWorking(true);
        try {
            await api.post(`/invoices/${id}/send`);
            alert('Invoice sent!');
            load();
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Failed to send.');
        } finally { setWorking(false); }
    };

    const sendReminder = async () => {
        if (!confirm('Send a payment reminder?')) return;
        setWorking(true);
        try {
            await api.post(`/invoices/${id}/remind`);
            alert('Reminder sent!');
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Failed.');
        } finally { setWorking(false); }
    };

    const markPaid = async () => {
        if (!confirm('Mark this invoice as Paid?')) return;
        setWorking(true);
        try {
            await api.put(`/invoices/${id}/status`, { status: 'Paid' });
            load();
        } finally { setWorking(false); }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!invoice) return <div className="p-6 text-gray-500">Invoice not found.</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {/* Back + Actions */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate('/invoices')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
                >
                    <ArrowLeft size={16} /> Back to Invoices
                </button>
                <div className="flex gap-2">
                    <button onClick={downloadPdf} disabled={working} className="btn-secondary flex items-center gap-2 text-sm">
                        <Download size={15} /> PDF
                    </button>
                    {invoice.status !== 'Paid' && (
                        <button onClick={sendInvoice} disabled={working} className="btn-secondary flex items-center gap-2 text-sm">
                            <Send size={15} /> Send
                        </button>
                    )}
                    {(invoice.status === 'Sent' || invoice.status === 'Overdue') && (
                        <button onClick={sendReminder} disabled={working} className="btn-secondary flex items-center gap-2 text-sm">
                            <Bell size={15} /> Remind
                        </button>
                    )}
                    {invoice.status !== 'Paid' && (
                        <button onClick={markPaid} disabled={working} className="btn-primary flex items-center gap-2 text-sm">
                            <CheckCircle size={15} /> Mark Paid
                        </button>
                    )}
                </div>
            </div>

            {/* Invoice Card */}
            <div className="card p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                        <p className="text-primary font-semibold text-lg mt-1">#{invoice.invoiceNumber}</p>
                    </div>
                    <span className={`${statusBadge(invoice.status)} text-sm px-3 py-1`}>
                        {invoice.status}
                    </span>
                </div>

                {/* Client + Dates */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-medium mb-2">Bill To</p>
                        <p className="font-semibold text-gray-900">{invoice.client.name}</p>
                        {invoice.client.email && <p className="text-sm text-gray-500">{invoice.client.email}</p>}
                        {invoice.client.phone && <p className="text-sm text-gray-500">{invoice.client.phone}</p>}
                        {invoice.client.address && <p className="text-sm text-gray-500">{invoice.client.address}</p>}
                    </div>
                    <div className="text-right">
                        <div className="space-y-1">
                            <div className="flex justify-between gap-8">
                                <span className="text-sm text-gray-500">Issue Date</span>
                                <span className="text-sm font-medium">{invoice.issueDate}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                                <span className="text-sm text-gray-500">Due Date</span>
                                <span className="text-sm font-medium">{invoice.dueDate}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-6">
                    <thead>
                        <tr className="bg-gray-900 text-white text-sm">
                            <th className="text-left px-4 py-3 rounded-tl-lg">Description</th>
                            <th className="text-center px-4 py-3">Qty</th>
                            <th className="text-right px-4 py-3">Unit Price</th>
                            <th className="text-right px-4 py-3 rounded-tr-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoice.items.map((item, i) => (
                            <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-3 text-sm">{item.description}</td>
                                <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-right">PKR {item.unitPrice.toLocaleString()}</td>
                                <td className="px-4 py-3 text-sm text-right font-medium">PKR {item.subTotal.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>PKR {invoice.subTotal.toLocaleString()}</span>
                        </div>
                        {invoice.gstPercent > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>GST ({invoice.gstPercent}%)</span>
                                <span>PKR {invoice.gstAmount.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-white bg-primary px-4 py-3 rounded-lg">
                            <span>TOTAL</span>
                            <span>PKR {invoice.totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 uppercase font-medium mb-1">Notes</p>
                        <p className="text-sm text-gray-600">{invoice.notes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
