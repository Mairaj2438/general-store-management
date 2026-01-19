"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { cn } from '@/lib/utils';
import { ShoppingBag, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';

export default function LoginPage() {
    const { login } = useAuth();
    const { error: showError, success } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', {
                email: email.trim(),
                password
            });
            success('Login successful! Welcome back.');
            login(data.token, data.user);
        } catch (err: any) {
            showError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-6 relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

            <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-2 border-white/50 animate-scale-in overflow-hidden">
                {/* Decorative gradient bar */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>

                <div className="p-10 sm:p-14">
                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-12 animate-slide-up">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl shadow-2xl">
                                <ShoppingBag className="w-14 h-14 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-center mb-3">
                            Al-Abbas General Store
                        </h1>
                        <p className="text-xl font-bold text-gray-700 mb-2">Shahjamal</p>
                        <p className="text-base text-gray-500 font-medium">Sign in to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Email Field */}
                        <div className="animate-slide-in-left stagger-1 space-y-4">
                            <label className="block text-lg font-black text-gray-800">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-6 pr-16 py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-lg font-semibold hover:border-gray-300 hover:bg-white"
                                    placeholder="Enter your email"
                                    required
                                />
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                            </div>
                        </div>


                        {/* Password Field */}
                        <div className="animate-slide-in-left stagger-2 space-y-4">
                            <label className="block text-lg font-black text-gray-800">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-6 pr-24 py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 text-lg font-semibold hover:border-gray-300 hover:bg-white"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                </button>
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                                    <Lock className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-6 px-8 text-white text-xl font-black bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 rounded-2xl shadow-2xl hover:shadow-3xl transition-all active:scale-[0.98] animate-slide-up stagger-3 mt-10",
                                loading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-4">
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-10 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-center gap-3 text-gray-400 mb-4">
                            <div className="h-px bg-gray-300 w-20"></div>
                            <span className="text-xs uppercase tracking-widest font-bold">Powered by</span>
                            <div className="h-px bg-gray-300 w-20"></div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-sm font-black italic text-white shadow-lg">M</div>
                            <span className="text-lg font-black tracking-tight text-gray-800">MAIRAJ'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">TECH</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
