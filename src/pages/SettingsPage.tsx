import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ImageOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function SettingsPage() {
    const { user, login } = useAuth();
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const refreshUser = async () => {
        const { data } = await api.get('/auth/profile');
        const token = localStorage.getItem('token')!;
        login(token, data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await api.put('/auth/profile', form);
            await refreshUser();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoError('');

        // Basic client-side checks (backend re-validates too)
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setLogoError('Please upload a PNG, JPG, or WEBP image.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setLogoError('Logo must be smaller than 2MB.');
            return;
        }

        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await api.post('/auth/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await refreshUser();
        } catch (err: any) {
            setLogoError(err.response?.data?.message ?? 'Failed to upload logo.');
        } finally {
            setUploadingLogo(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveLogo = async () => {
        if (!confirm('Remove your business logo?')) return;
        setUploadingLogo(true);
        try {
            await api.delete('/auth/logo');
            await refreshUser();
        } finally {
            setUploadingLogo(false);
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

            {/* Logo Upload */}
            <div className="card p-6 mb-4">
                <h2 className="font-semibold text-gray-900 mb-1">Business Logo</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Appears on your invoice PDFs. PNG, JPG, or WEBP — max 2MB.
                </p>

                {logoError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
                        {logoError}
                    </div>
                )}

                <div className="flex items-center gap-5">
                    {/* Preview */}
                    <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                        {user?.logoUrl ? (
                            <img src={user.logoUrl} alt="Business logo" className="w-full h-full object-contain" />
                        ) : (
                            <ImageOff size={24} className="text-gray-300" />
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingLogo}
                            className="btn-secondary flex items-center gap-2 text-sm"
                        >
                            <Upload size={14} />
                            {uploadingLogo ? 'Uploading...' : user?.logoUrl ? 'Replace Logo' : 'Upload Logo'}
                        </button>
                        {user?.logoUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveLogo}
                                disabled={uploadingLogo}
                                className="btn-secondary flex items-center gap-2 text-sm text-red-500 hover:bg-red-50"
                            >
                                <Trash2 size={14} /> Remove
                            </button>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        className="hidden"
                        onChange={handleLogoSelect}
                    />
                </div>
            </div>

            {/* Business Profile */}
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
