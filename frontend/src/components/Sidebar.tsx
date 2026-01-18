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
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/sales', icon: ShoppingCart, label: 'Sales Limit' }, // Sales Point
    { href: '/customers', icon: Users, label: 'Customers' },
    { href: '/owner', icon: Settings, label: 'Owner Profile' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();

    return (
        <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Al-Abbas General Store
                </h2>
                <p className="text-xs text-slate-500">Shahjamal</p>
                {user && (
                    <p className="text-xs text-slate-400 mt-2">
                        Logged in as <span className="text-emerald-400">{user.name}</span>
                    </p>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
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
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors mb-4"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>
                <div className="flex flex-col items-center justify-center opacity-30 group hover:opacity-100 transition-opacity pt-2">
                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mb-1">Developed by</p>
                    <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                        <div className="w-5 h-5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-[10px] font-black italic text-white shadow-sm">M</div>
                        <span className="text-[11px] font-black tracking-tighter text-slate-300">MAIRAJ'S <span className="text-emerald-500">TECH</span></span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
