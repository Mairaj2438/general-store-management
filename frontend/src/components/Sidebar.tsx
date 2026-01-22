"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Home,
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useConfirm } from '@/context/ConfirmContext';
import { useToast } from '@/context/ToastContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const menuItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/sales', icon: ShoppingCart, label: 'Sales' },
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/owner', icon: Settings, label: 'Owner Profile' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { confirm } = useConfirm();
    const { success } = useToast();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    const handleLogout = () => {
        confirm({
            title: 'Sign Out',
            message: 'Are you sure you want to sign out? Any unsaved changes will be lost.',
            confirmText: 'Sign Out',
            cancelText: 'Cancel',
            type: 'warning',
            onConfirm: () => {
                logout();
                success('You have been signed out successfully.');
                closeMobileMenu();
            }
        });
    };

    return (
        <>
            {/* Mobile Header - Increased height for better visibility */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 text-white flex items-center justify-between px-6 z-50 shadow-xl">
                <div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Al-Abbas Store
                    </h2>
                    <p className="text-[10px] text-slate-500">Shahjamal</p>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={closeMobileMenu}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out",
                "lg:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Desktop Header */}
                <div className="p-6 border-b border-slate-800 hidden lg:block">
                    <Link href="/dashboard" className="block hover:opacity-80 transition-opacity">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            Al-Abbas General Store
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Shahjamal</p>
                    </Link>
                    {user && (
                        <div className="mt-6 flex items-center gap-4 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                            <div
                                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 cursor-pointer hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
                                onClick={() => user.image && setIsLightboxOpen(true)}
                            >
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Logged in as</p>
                                <p className="text-sm text-white font-bold tracking-wide">{user.name}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Header Inside Sidebar */}
                <div className="p-6 border-b border-slate-800 lg:hidden">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Al-Abbas General Store
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Shahjamal</p>
                    {user && (
                        <div className="mt-3 p-2 bg-slate-800/50 rounded-lg">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Logged in as</p>
                            <p className="text-sm text-emerald-400 font-medium">{user.name}</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 px-4 py-8 space-y-20 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-6 rounded-3xl text-xl font-black transition-all duration-300 border border-transparent group tracking-wide relative overflow-hidden",
                                    isActive
                                        ? "bg-slate-800/80 border-emerald-500/50 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] scale-[1.02]"
                                        : "hover:bg-slate-800/50 hover:border-slate-700 hover:scale-[1.02] active:scale-95"
                                )}
                            >
                                {/* Active State Background Gradient Indicator */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent rounded-3xl" />
                                )}

                                <div className={cn(
                                    "p-2 rounded-xl transition-all duration-300",
                                    isActive ? "bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20" : "bg-slate-800 group-hover:bg-slate-700"
                                )}>
                                    <Icon size={24} className={cn(
                                        "transition-colors duration-300",
                                        isActive ? "text-slate-900" : "text-emerald-500 group-hover:text-emerald-400"
                                    )} />
                                </div>

                                <span className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r transition-all duration-300",
                                    isActive
                                        ? "from-emerald-400 via-emerald-200 to-cyan-400 font-black tracking-wider"
                                        : "from-slate-300 to-slate-400 group-hover:from-emerald-200 group-hover:to-cyan-200"
                                )}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors mb-4"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                    <div className="flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity pt-2">
                        <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mb-1">Developed by</p>
                        <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-[10px] font-black italic text-white shadow-sm">M</div>
                            <span className="text-[11px] font-black tracking-tighter text-slate-300">MAIRAJ'S <span className="text-emerald-500">TECH</span></span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Lightbox for Profile Picture */}
            {isLightboxOpen && user?.image && (
                <div
                    className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <div className="relative max-w-4xl w-full flex flex-col items-center animate-scale-in">
                        <button
                            className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X size={40} />
                        </button>
                        <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-slate-900"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <h3 className="mt-6 text-2xl text-white font-bold tracking-widest uppercase">{user.name}</h3>
                        <p className="text-emerald-400 font-medium">Owner Profile</p>
                    </div>
                </div>
            )}
        </>
    );
}
