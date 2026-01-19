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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578916171728-66684e1c9978?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-5" />

            <div className="relative w-full max-w-lg p-8 sm:p-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-100 animate-scale-in">
                <div className="flex flex-col items-center mb-10 animate-slide-up">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl mb-6 animate-bounce">
                        <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-2">Al-Abbas General Store</h1>
                    <p className="text-base text-gray-600">Shahjamal</p>
                    <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 text-sm font-medium text-red-700 bg-red-50 border-2 border-red-200 rounded-xl animate-slide-in-left shadow-sm">
                            {error}
                        </div>
                    )}

                    <div className="animate-slide-in-left stagger-1">
                        <label className="block text-base font-semibold text-gray-700 mb-3">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-base font-medium hover:border-gray-300"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="animate-slide-in-left stagger-2">
                        <label className="block text-base font-semibold text-gray-700 mb-3">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-base font-medium hover:border-gray-300"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "w-full py-4 sm:py-5 px-6 text-white text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] animate-slide-up stagger-3 mt-8",
                            loading && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="h-px bg-gray-200 w-16"></div>
                        <span className="text-xs uppercase tracking-wider">Powered by</span>
                        <div className="h-px bg-gray-200 w-16"></div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="w-6 h-6 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded flex items-center justify-center text-xs font-black italic text-white shadow-sm">M</div>
                        <span className="text-sm font-black tracking-tight text-gray-700">MAIRAJ'S <span className="text-emerald-600">TECH</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
