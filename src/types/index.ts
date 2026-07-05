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

export interface DashboardSummary {
    totalInvoices: number;
    paidInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    totalRevenue: number;
    pendingAmount: number;
    recentInvoices: Invoice[];
}

export interface AuthResponse {
    token: string;
    fullName: string;
    email: string;
    plan: string;
}
