"use client";

import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar />
            <main className="ml-64 p-8 min-h-screen relative flex flex-col">
                <div className="max-w-7xl mx-auto space-y-6 flex-1">
                    {children}
                </div>

                <footer className="mt-12 py-6 border-t border-gray-100 flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-gray-400 font-medium">© 2026 Al-Abbas General Store. All rights reserved.</p>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">System by</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 bg-gray-200 rounded flex items-center justify-center text-[8px] font-black italic text-gray-500">M</div>
                            <span className="text-[10px] font-black tracking-tighter text-gray-600">MAIRAJ'S <span className="text-emerald-600">TECH</span></span>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
