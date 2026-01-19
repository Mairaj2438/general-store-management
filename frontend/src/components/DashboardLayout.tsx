"use client";

import { Sidebar } from '@/components/Sidebar';
import LoadingScreen from '@/components/LoadingScreen';
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

    if (loading) return <LoadingScreen />;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            {/* Mobile: pt-24 (96px) = h-20 header (80px) + 16px clearance */}
            <main className="lg:ml-64 pt-24 lg:pt-0 min-h-screen">
                <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </div>

                <footer className="mt-12 py-6 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 opacity-50 hover:opacity-100 transition-opacity">
                        <p className="text-xs text-gray-500 font-medium text-center sm:text-left">
                            © 2026 Al-Abbas General Store. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">System by</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-[10px] font-black italic text-white shadow-sm">M</div>
                                <span className="text-xs font-black tracking-tight text-gray-700">MAIRAJ'S <span className="text-emerald-600">TECH</span></span>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
}
