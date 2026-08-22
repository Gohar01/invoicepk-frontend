import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, HelpCircle, Mail, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/invoices', icon: FileText, label: 'Invoices' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-gray-100">
                    <span className="text-xl font-bold text-gray-900">
                        Invoice<span className="text-primary">PK</span>
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/dashboard'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}

                    <button
                        onClick={() => setIsSupportOpen(true)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors text-left"
                    >
                        <HelpCircle size={18} />
                        Help &amp; Support
                    </button>
                </nav>

                {/* User + Logout */}
                <div className="p-3 border-t border-gray-100">
                    <div className="px-3 py-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Help & Support Modal */}
            {isSupportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 relative overflow-hidden">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                    <HelpCircle size={22} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Help &amp; Support</h3>
                                    <p className="text-xs text-gray-500">We're here to help your business grow</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsSupportOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Support Options List */}
                        <div className="space-y-3">
                            {/* Email Support Row */}
                            <a 
                                href="mailto:support@invoicepk.online"
                                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-emerald-50/60 hover:border-emerald-200 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">Email Support</p>
                                        <p className="text-xs text-gray-500 font-medium">support@invoicepk.online</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                            </a>

                            {/* LinkedIn Row */}
                            <a 
                                href="https://www.linkedin.com/company/invoicepk" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-[#0077B5]/5 hover:border-[#0077B5]/30 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#0077B5] shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 1.0 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#0077B5] transition-colors">LinkedIn Community</p>
                                        <p className="text-xs text-gray-500 font-medium">Follow for product updates &amp; news</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-[#0077B5] transition-colors" />
                            </a>

                            {/* Facebook Row */}
                            <a 
                                href="https://www.facebook.com/invoicepk.online" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-[#1877F2]/5 hover:border-[#1877F2]/30 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-gray-200/80 flex items-center justify-center text-[#1877F2] shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0 0 22 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 group-hover:text-[#1877F2] transition-colors">Facebook Page</p>
                                        <p className="text-xs text-gray-500 font-medium">Join our Facebook community</p>
                                    </div>
                                </div>
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-[#1877F2] transition-colors" />
                            </a>
                        </div>

                        {/* Footer text */}
                        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                            <p className="text-[11px] text-gray-400 font-medium">InvoicePK Support Team • Response within 24h</p>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}
