"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/auth/login', {
                email: email.trim(),
                password
            });
            login(data.token, data.user);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 bg-[url('https://images.unsplash.com/photo-1578916171728-66684e1c9978?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <div className="relative w-full max-w-md p-6 sm:p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 animate-scale-in">
                <div className="flex flex-col items-center mb-6 sm:mb-8 animate-slide-up">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg mb-4 animate-bounce">
                        <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">Al-Abbas General Store</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg animate-slide-in-left">
                            {error}
                        </div>
                    )}

                    <div className="animate-slide-in-left stagger-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-base"
                            placeholder="admin@store.com"
                            required
                        />
                    </div>

                    <div className="animate-slide-in-left stagger-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 sm:py-3 bg-white/50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-base"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-3 sm:py-3.5 px-4 text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all active:scale-[0.98] animate-slide-up stagger-3",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs sm:text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <p className="bg-gray-50 p-2 rounded-lg">Demo Admin: <span className="font-medium text-gray-700">admin@store.com</span> / <span className="font-medium text-gray-700">admin123</span></p>
                </div>
            </div>
        </div>
    );
}
