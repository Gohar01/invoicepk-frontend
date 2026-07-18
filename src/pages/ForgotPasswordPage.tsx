import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SUPPORT_EMAIL = 'gohar7260@gmail.com'; // change to your support email later

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Invoice<span className="text-primary">PK</span>
                    </h1>
                </div>

                <div className="card p-8">
                    <h2 className="text-xl font-semibold mb-2">Forgot your password?</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Enter your email and we'll send you a reset link.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    {sent ? (
                        <div className="space-y-4">
                            <div className="bg-primary-light border border-primary text-primary-dark text-sm rounded-lg px-4 py-3">
                                ✓ If that email is registered, a reset link has been sent. Please check your inbox
                                (and spam folder).
                            </div>

                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
                                <p className="font-medium mb-1">Didn't get the email?</p>
                                <p>
                                    Double check the email address you registered with. If you're still stuck,
                                    contact us at{' '}
                                    <a href={`mailto:${SUPPORT_EMAIL}`} className="underline font-medium">
                                        {SUPPORT_EMAIL}
                                    </a>{' '}
                                    and we'll help you regain access.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Email</label>
                                <input
                                    className="input" type="email" placeholder="you@example.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-500 mt-6">
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Back to Login
                        </Link>
                    </p>

                    {!sent && (
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Trouble resetting your password?{' '}
                            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                                Contact support
                            </a>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
