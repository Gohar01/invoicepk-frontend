import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '', email: '', password: '', businessName: '', phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const payload = isLogin
                ? { email: form.email, password: form.password }
                : form;

            const { data } = await api.post(endpoint, payload);

            // Fetch profile to get full user object
            const profileRes = await api.get('/auth/profile', {
                headers: { Authorization: `Bearer ${data.token}` }
            });

            login(data.token, profileRes.data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message ?? 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Invoice<span className="text-primary">PK</span>
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Professional invoicing for Pakistani businesses
                    </p>
                </div>

                <div className="card p-8">
                    <h2 className="text-xl font-semibold mb-6">
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="label">Full Name</label>
                                    <input className="input" name="fullName" placeholder="Gohar Rehman"
                                        value={form.fullName} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="label">Business Name</label>
                                    <input className="input" name="businessName" placeholder="Gohar Dev Studio"
                                        value={form.businessName} onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input className="input" name="phone" placeholder="0315-5972494"
                                        value={form.phone} onChange={handleChange} />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="label">Email</label>
                            <input className="input" name="email" type="email" placeholder="you@example.com"
                                value={form.email} onChange={handleChange} required />
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <input className="input" name="password" type="password" placeholder="••••••••"
                                value={form.password} onChange={handleChange} required />
                        </div>

                        <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
                            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-primary font-medium hover:underline"
                        >
                            {isLogin ? 'Sign up free' : 'Login'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
