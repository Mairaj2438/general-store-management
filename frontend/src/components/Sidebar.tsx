"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/sales', icon: ShoppingCart, label: 'Sales' },
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/owner', icon: Settings, label: 'Owner Profile' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-50 shadow-lg">
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

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                )}
                            >
                                <Icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => {
                            logout();
                            closeMobileMenu();
                        }}
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
        </>
    );
}
