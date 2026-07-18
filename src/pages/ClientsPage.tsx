import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Users, Mail, Phone } from 'lucide-react';
import api from '../services/api';
import { Client } from '../types';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const load = () => {
        api.get('/clients').then(r => setClients(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEditForm = (client: Client) => {
        setEditingId(client.id);
        setForm({
            name: client.name,
            email: client.email ?? '',
            phone: client.phone ?? '',
            address: client.address ?? '',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/clients/${editingId}`, form);
            } else {
                await api.post('/clients', form);
            }
            closeForm();
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this client?')) return;
        try {
            await api.delete(`/clients/${id}`);
            setClients(c => c.filter(x => x.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message ?? 'Cannot delete client.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
                    <p className="text-gray-500 text-sm mt-1">{clients.length} total clients</p>
                </div>
                <button onClick={openAddForm} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> Add Client
                </button>
            </div>

            {/* Add / Edit Client Form */}
            {showForm && (
                <div className="card p-6 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-4">
                        {editingId ? 'Edit Client' : 'New Client'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Name *</label>
                            <input className="input" placeholder="e.g. ABC Traders"
                                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input className="input" type="email" placeholder="client@email.com"
                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input className="input" placeholder="0321-1234567"
                                value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Address</label>
                            <input className="input" placeholder="Karachi, Pakistan"
                                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div className="col-span-2 flex gap-3 justify-end">
                            <button type="button" onClick={closeForm} className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : editingId ? 'Update Client' : 'Save Client'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Clients List */}
            {!clients.length ? (
                <div className="card text-center py-16 text-gray-400">
                    <Users size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="font-medium">No clients yet</p>
                    <p className="text-sm mt-1">Add your first client to get started</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {clients.map(client => (
                        <div key={client.id} className="card p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-light text-primary-dark font-semibold flex items-center justify-center text-sm">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{client.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        {client.email && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Mail size={12} /> {client.email}
                                            </span>
                                        )}
                                        {client.phone && (
                                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                                <Phone size={12} /> {client.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">
                                    {client.totalInvoices} invoice{client.totalInvoices !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => openEditForm(client)}
                                    className="text-gray-400 hover:text-primary transition-colors"
                                    title="Edit client"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(client.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete client"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
