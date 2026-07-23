export interface User {
    id: number;
    fullName: string;
    email: string;
    businessName?: string;
    phone?: string;
    address?: string;
    ntn?: string;
    logoUrl?: string;
    plan: string;
    planExpiresAt?: string;
}

export interface Client {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
    totalInvoices: number;
}

export interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

export interface Invoice {
    id: number;
    invoiceNumber: string;
    clientName: string;
    currency: string;
    issueDate: string;
    dueDate: string;
    totalAmount: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
    createdAt: string;
}

export interface InvoiceDetail {
    id: number;
    invoiceNumber: string;
    client: Client;
    currency: string;
    issueDate: string;
    dueDate: string;
    gstPercent: number;
    subTotal: number;
    gstAmount: number;
    totalAmount: number;
    status: string;
    notes?: string;
    items: InvoiceItem[];
    createdAt: string;
}

export interface CurrencyBreakdown {
    currency: string;
    totalRevenue: number;
    pendingAmount: number;
    invoiceCount: number;
}

export interface DashboardSummary {
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    breakdown: CurrencyBreakdown[];
    recentInvoices: Invoice[];
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
    PKR: 'Rs.',
    USD: '$',
    SAR: 'SR',
    AED: 'AED',
    GBP: '£',
    EUR: '€',
};

export const CURRENCY_OPTIONS = [
    { code: 'PKR', label: 'PKR — Pakistani Rupee' },
    { code: 'USD', label: 'USD — US Dollar' },
    { code: 'SAR', label: 'SAR — Saudi Riyal' },
    { code: 'AED', label: 'AED — UAE Dirham' },
    { code: 'GBP', label: 'GBP — British Pound' },
    { code: 'EUR', label: 'EUR — Euro' },
];

export interface AuthResponse {
    token: string;
    fullName: string;
    email: string;
    plan: string;
}
