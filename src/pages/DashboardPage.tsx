import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';
import { DashboardSummary, Invoice } from '../types';
import { useAuth } from '../context/AuthContext';

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        Draft: 'badge-draft', Sent: 'badge-sent',
        Paid: 'badge-paid', Overdue: 'badge-overdue'
    };
    return map[status] ?? 'badge-draft';
};

export default function DashboardPage() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/dashboard/summary')
            .then(r => setSummary(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const cards = [
        {
            label: 'Total Revenue',
            value: `PKR ${(summary?.totalRevenue ?? 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-primary bg-primary-light',
        },
        {
            label: 'Pending Amount',
            value: `PKR ${(summary?.pendingAmount ?? 0).toLocaleString()}`,
            icon: Clock,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            label: 'Overdue',
            value: summary?.overdueInvoices ?? 0,
            icon: AlertCircle,
            color: 'text-red-600 bg-red-50',
        },
        {
            label: 'Total Invoices',
            value: summary?.totalInvoices ?? 0,
            icon: FileText,
            color: 'text-gray-600 bg-gray-100',
        },
    ];

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                    Good day, {user?.fullName?.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Here's what's happening with your business
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="card p-5">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                            <Icon size={20} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Invoice stats row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Paid', value: summary?.paidInvoices, color: 'text-primary' },
                    { label: 'Unpaid', value: summary?.unpaidInvoices, color: 'text-blue-600' },
                    { label: 'Overdue', value: summary?.overdueInvoices, color: 'text-red-500' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card p-4 text-center">
                        <p className={`text-3xl font-bold ${color}`}>{value}</p>
                        <p className="text-sm text-gray-500 mt-1">{label} Invoices</p>
                    </div>
                ))}
            </div>

            {/* Recent Invoices */}
            <div className="card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                    <button
                        onClick={() => navigate('/invoices')}
                        className="text-sm text-primary hover:underline font-medium"
                    >
                        View all
                    </button>
                </div>

                {!summary?.recentInvoices?.length ? (
                    <div className="text-center py-12 text-gray-400">
                        <FileText size={40} className="mx-auto mb-3 opacity-30" />
                        <p>No invoices yet</p>
                        <button
                            onClick={() => navigate('/invoices/new')}
                            className="btn-primary mt-4 text-sm"
                        >
                            Create your first invoice
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-gray-400 uppercase border-b border-gray-50">
                                <th className="text-left px-6 py-3">Invoice</th>
                                <th className="text-left px-6 py-3">Client</th>
                                <th className="text-left px-6 py-3">Due Date</th>
                                <th className="text-right px-6 py-3">Amount</th>
                                <th className="text-right px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {summary.recentInvoices.map((inv: Invoice) => (
                                <tr
                                    key={inv.id}
                                    onClick={() => navigate(`/invoices/${inv.id}`)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 text-sm font-medium text-primary">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{inv.clientName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{inv.dueDate}</td>
                                    <td className="px-6 py-4 text-sm text-right font-medium">
                                        PKR {inv.totalAmount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={statusBadge(inv.status)}>{inv.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
