import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="card p-8 max-w-md text-center">
                    <p className="text-red-600 font-medium">Invalid or missing reset link.</p>
                    <Link to="/forgot-password" className="text-primary hover:underline text-sm mt-3 inline-block">
                        Request a new one
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Invoice<span className="text-primary">PK</span>
                    </h1>
                </div>

                <div className="card p-8">
                    <h2 className="text-xl font-semibold mb-6">Set a new password</h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="bg-primary-light border border-primary text-primary-dark text-sm rounded-lg px-4 py-3">
                            ✓ Password reset successfully! Redirecting to login...
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">New Password</label>
                                <input
                                    className="input" type="password" placeholder="At least 6 characters"
                                    value={password} onChange={e => setPassword(e.target.value)} required
                                />
                            </div>
                            <div>
                                <label className="label">Confirm Password</label>
                                <input
                                    className="input" type="password" placeholder="Re-enter password"
                                    value={confirm} onChange={e => setConfirm(e.target.value)} required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
