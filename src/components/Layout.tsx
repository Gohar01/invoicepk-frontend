import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
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
                </nav>

                {/* Support & Social Links */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                    <p className="text-[11px] font-semibold text-gray-700 uppercase tracking-wider mb-1">Support & Contact</p>
                    <a 
                        href="mailto:support@invoicepk.online" 
                        className="block text-xs font-semibold text-primary hover:underline truncate mb-2"
                    >
                        support@invoicepk.online
                    </a>
                    <div className="flex items-center gap-3 text-xs">
                        <a 
                            href="https://www.linkedin.com/company/invoicepk" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-600 hover:text-primary font-medium transition-colors"
                        >
                            LinkedIn
                        </a>
                        <span className="text-gray-300">•</span>
                        <a 
                            href="https://www.facebook.com/invoicepk" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-600 hover:text-primary font-medium transition-colors"
                        >
                            Facebook
                        </a>
                    </div>
                </div>

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
        </div>
    );
}
