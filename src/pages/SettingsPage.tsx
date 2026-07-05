import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        fullName: '', businessName: '', phone: '', address: '', ntn: ''
    });

    useEffect(() => {
        if (user) setForm({
            fullName: user.fullName ?? '',
            businessName: user.businessName ?? '',
            phone: user.phone ?? '',
            address: user.address ?? '',
            ntn: user.ntn ?? '',
        });
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await api.put('/auth/profile', form);
            // Refresh user in context
            const { data } = await api.get('/auth/profile');
            const token = localStorage.getItem('token')!;
            login(token, data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm mt-1">
                    This info appears on your invoices and emails
                </p>
            </div>

            {success && (
                <div className="bg-primary-light border border-primary text-primary-dark text-sm rounded-lg px-4 py-3 mb-4">
                    ✓ Profile updated successfully!
                </div>
            )}

            <div className="card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Business Profile</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input className="input" value={form.fullName}
                                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Business Name</label>
                            <input className="input" placeholder="Your company name"
                                value={form.businessName}
                                onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">Phone</label>
                            <input className="input" placeholder="0315-5972494"
                                value={form.phone}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="label">NTN Number</label>
                            <input className="input" placeholder="1234567-8"
                                value={form.ntn}
                                onChange={e => setForm(f => ({ ...f, ntn: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Business Address</label>
                        <input className="input" placeholder="Office #1, Main Street, Karachi"
                            value={form.address}
                            onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Plan Info */}
            <div className="card p-6 mt-4">
                <h2 className="font-semibold text-gray-900 mb-3">Your Plan</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-lg font-bold text-primary">{user?.plan}</span>
                        {user?.planExpiresAt && (
                            <p className="text-sm text-gray-500 mt-1">
                                Expires: {new Date(user.planExpiresAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {user?.plan !== 'Pro' && (
                        <button className="btn-primary text-sm">Upgrade to Pro</button>
                    )}
                </div>
            </div>
        </div>
    );
}
